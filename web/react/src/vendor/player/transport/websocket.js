import {getTagged} from '../deps/bp_logger.js';
import {JSEncrypt} from '../deps/jsencrypt.js';
import {BaseTransport} from "../core/base_transport.js";
import {CPU_CORES} from "../core/util/browser.js";

const LOG_TAG = "transport:ws";
const Log = getTagged(LOG_TAG);
const WORKER_COUNT = CPU_CORES;

export default class WebsocketTransport extends BaseTransport {
    constructor(endpoint, stream_type, options={
        socket:`${location.protocol.replace('http', 'ws')}//${location.host}/ws/`,
        workers: 1
    }) {
        super(endpoint, stream_type);
        this.proxies = [];
        this.currentProxy = 0;
        this.workers = 1;
        this.socket_url = options.socket;
        this.ready = this.connect();
    }

    destroy() {
        return this.disconnect().then(()=>{
            return super.destroy();
        });

    }

    static canTransfer(stream_type) {
        return WebsocketTransport.streamTypes().includes(stream_type);
    }

    static streamTypes() {
        return ['hls', 'rtsp'];
    }

    connect() {
        return this.disconnect().then(()=>{
            let promises = [];
            // TODO: get mirror list
            for (let i=0; i<this.workers; ++i) {
                let proxy = new WebSocketProxy(this.socket_url, this.endpoint, this.stream_type);

                proxy.set_disconnect_handler((e)=> {
                    this.eventSource.dispatchEvent('disconnected', {code: e.code, reason: e.reason});
                    // TODO: only reconnect on demand
                    if ([1000, 1006, 1013, 1011].includes(e.code)) {
                        setTimeout(()=> {
                            if (this.ready && this.ready.reject) {
                                this.ready.reject();
                            }
                            this.ready = this.connect();
                        }, 3000);
                    }
                });

                proxy.set_data_handler((data)=> {
                    this.dataQueue.push(new Uint8Array(data));
                    this.eventSource.dispatchEvent('data');
                });

                promises.push(proxy.connect().then(()=> {
                    this.eventSource.dispatchEvent('connected');
                }).catch((e)=> {
                    this.eventSource.dispatchEvent('error');
                    throw new Error(e);
                }));
                this.proxies.push(proxy);
            }
            return Promise.all(promises);
        });
    }

    disconnect() {
        let promises = [];
        for (let i=0; i<this.proxies.length; ++i) {
            promises.push(this.proxies[i].close());
        }
        this.proxies= [];
        if (this.proxies.length) {
            return Promise.all(promises);
        } else {
            return Promise.resolve();
        }
    }

    socket() {
        return this.proxies[(this.currentProxy++)%this.proxies.length];
    }

    send(_data, fn) {
        let res = this.socket().send(_data);
        if (fn) {
            fn(res.seq);
        }
        return res.promise;
    }
}

class WSPProtocol {
    static get PROTO() {return  'WSP';}

    static get V1_1() {return '1.1';}

    static get CMD_INIT() {return 'INIT';}
    static get CMD_JOIN() {return  'JOIN';}
    static get CMD_WRAP() {return  'WRAP';}


    constructor(ver){
        this.ver = ver;
    }

    build(cmd, data, payload=''){
        let data_str='';
        if (!data.seq) {
            data.seq = ++WSPProtocol.seq;
        }
        for (let k in data) {
            data_str += `${k}: ${data[k]}\r\n`;
        }
        return `${WSPProtocol.PROTO}/${this.ver} ${cmd}\r\n${data_str}\r\n${payload}`;
    }

    static parse(data) {
        let payIdx = data.indexOf('\r\n\r\n');
        let lines = data.substr(0, payIdx).split('\r\n');
        let hdr = lines.shift().match(new RegExp(`${WSPProtocol.PROTO}/${WSPProtocol.V1_1}\\s+(\\d+)\\s+(.+)`));
        if (hdr) {
            let res = {
                code: Number(hdr[1]),
                msg:  hdr[2],
                data: {},
                payload: ''
            };
            while (lines.length) {
                let line = lines.shift();
                if (line) {
                    let [k,v] = line.split(':');
                    res.data[k.trim()] = v.trim();
                } else {
                    break;
                }
            }
            res.payload = data.substr(payIdx+4);
            return res;
        }
        return null;
    }
}
WSPProtocol.seq = 0;

class WebSocketProxy {
    static get CHN_CONTROL() {return 'control';}
    static get CHN_DATA() {return  'data';}

    constructor(wsurl, endpoint, stream_type) {
        this.url = wsurl;
        this.stream_type = stream_type;
        this.endpoint = endpoint;
        this.data_handler = ()=>{};
        this.disconnect_handler = ()=>{};
        this.builder = new WSPProtocol(WSPProtocol.V1_1);
        this.awaitingPromises = {};
        this.seq = 0;
        this.encryptor = new JSEncrypt();
    }

    set_data_handler(handler) {
        this.data_handler = handler;
    }

    set_disconnect_handler(handler) {
        this.disconnect_handler = handler;
    }

    close() {
        Log.log('closing connection');
        return new Promise((resolve)=>{
            this.ctrlChannel.onclose = ()=>{
                if (this.dataChannel) {
                    this.dataChannel.onclose = ()=>{
                        Log.log('closed');
                        resolve();
                    };
                    this.dataChannel.close();
                } else {
                    Log.log('closed');
                    resolve();
                }
            };
            this.ctrlChannel.close();
        });
    }

    onDisconnect(){
        this.ctrlChannel.onclose=null;
        this.ctrlChannel.close();
        if (this.dataChannel) {
            this.dataChannel.onclose = null;
            this.dataChannel.close();
        }
        this.disconnect_handler(this);
    }

    initDataChannel(channel_id) {
        return new Promise((resolve, reject)=>{
            this.dataChannel = new WebSocket(this.url, WebSocketProxy.CHN_DATA);
            this.dataChannel.binaryType = 'arraybuffer';
            this.dataChannel.onopen = ()=>{
                let msg = this.builder.build(WSPProtocol.CMD_JOIN, {
                    channel: channel_id
                });
                Log.debug(msg);
                this.dataChannel.send(msg);
            };
            this.dataChannel.onmessage = (ev)=>{
                Log.debug(`[data]\r\n${ev.data}`);
                let res = WSPProtocol.parse(ev.data);
                if (!res) {
                    return reject();
                }

                this.dataChannel.onmessage=(e)=>{
                    // Log.debug('got data');
                    if (this.data_handler) {
                        this.data_handler(e.data);
                    }
                };
                resolve();
            };
            this.dataChannel.onerror = (e)=>{
                Log.error(`[data] ${e.type}`);
                this.dataChannel.close();
            };
            this.dataChannel.onclose = (e)=>{
                Log.error(`[data] ${e.type}. code: ${e.code}, reason: ${e.reason || 'unknown reason'}`);
                this.onDisconnect(e);
            };
        });
    }

    connect() {
        this.encryptionKey = null;
        return new Promise((resolve, reject)=>{
            this.ctrlChannel = new WebSocket(this.url, WebSocketProxy.CHN_CONTROL);

            this.connected = false;

            this.ctrlChannel.onopen = ()=>{
                let headers = {
                    proto: this.stream_type
                };
                if (this.endpoint.socket) {
                    headers.socket = this.endpoint.socket;
                } else {
                    Object.assign(headers, {
                        host:  this.endpoint.host,
                        port:  this.endpoint.port
                    })
                }
                let msg = this.builder.build(WSPProtocol.CMD_INIT, headers);
                Log.debug(msg);
                this.ctrlChannel.send(msg);
            };

            this.ctrlChannel.onmessage = (ev)=>{
                Log.debug(`[ctrl]\r\n${ev.data}`);

                let res = WSPProtocol.parse(ev.data);
                if (!res) {
                    return reject();
                }

                if (res.code >= 300) {
                    Log.error(`[ctrl]\r\n${res.code}: ${res.msg}`);
                    return reject();
                }
                this.ctrlChannel.onmessage = (e)=> {
                    let res = WSPProtocol.parse(e.data);
                    Log.debug(`[ctrl]\r\n${e.data}`);
                    if (res.data.seq in this.awaitingPromises) {
                        if (res.code < 300) {
                            this.awaitingPromises[res.data.seq].resolve(res);
                        } else {
                            this.awaitingPromises[res.data.seq].reject(res);
                        }
                        delete this.awaitingPromises[res.data.seq];
                    }
                };
                this.encryptionKey = res.data.pubkey || null;
                if (this.encryptionKey) {
                    this.encryptor.setPublicKey(this.encryptionKey);
                    // TODO: check errors
                }
                this.initDataChannel(res.data.channel).then(resolve).catch(reject);
            };

            this.ctrlChannel.onerror = (e)=>{
                Log.error(`[ctrl] ${e.type}`);
                this.ctrlChannel.close();
            };
            this.ctrlChannel.onclose = (e)=>{
                Log.error(`[ctrl] ${e.type}. code: ${e.code} ${e.reason || 'unknown reason'}`);
                this.onDisconnect(e);
            };
        });
    }

    encrypt(msg) {
        if (this.encryptionKey) {
            let crypted = this.encryptor.encrypt(msg);
            if (crypted === false) {
                throw new Error("Encryption failed. Stopping")
            }
            return crypted;
        }
        return msg;
    }

    send(payload) {
        if (this.ctrlChannel.readyState != WebSocket.OPEN) {
            this.close();
            // .then(this.connect.bind(this));
            // return;
            throw new Error('disconnected');
        }
        // Log.debug(payload);
        let data = {
            contentLength: payload.length,
            seq: ++WSPProtocol.seq
        };
        return {
            seq:data.seq,
            promise: new Promise((resolve, reject)=>{
                this.awaitingPromises[data.seq] = {resolve, reject};
                let msg = this.builder.build(WSPProtocol.CMD_WRAP, data, payload);
                Log.debug(msg);
                this.ctrlChannel.send(this.encrypt(msg));
            })};
    }
}