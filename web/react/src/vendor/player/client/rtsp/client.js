import {getTagged} from '../../deps/bp_logger.js';
import {StateMachine} from '../../deps/bp_statemachine.js';
import {SDPParser} from '../../core/parsers/sdp.js';
import {RTSPStream} from './stream.js';
import md5 from '../../core/util/md5';
// import {RTP} from './rtp/rtp';
import RTPFactory from './rtp/factory.js';
import {MessageBuilder} from './message.js';
import {RTPPayloadParser} from './rtp/payload/parser.js';
import {BaseClient} from '../../core/base_client.js';
import {PayloadType} from '../../core/defs.js';
import {base64ToArrayBuffer, hexToByteArray} from '../../core/util/binary.js';
import {AACParser} from '../../core/parsers/aac.js';
import {RTSPSession} from "./session";

const LOG_TAG = "client:rtsp";
const Log = getTagged(LOG_TAG);

export class RTPError {
    constructor(message, file, line) {
        //super(message, file, line);
    }
}

export default class RTSPClient extends BaseClient {
    constructor(options={flush: 200}) {
        super(options);
        this.clientSM = new RTSPClientSM(this);
        this.clientSM.ontracks = (tracks) => {
            this.eventSource.dispatchEvent('tracks', tracks);
            this.startStreamFlush();
        };
        this.sampleQueues={};
    }
    
    static streamType() {
        return 'rtsp';
    }

    setSource(url) {
        super.setSource(url);
        this.clientSM.setSource(url);
    }
    attachTransport(transport) {
        super.attachTransport(transport);
        this.clientSM.transport = transport;
    }

    detachTransport() {
        super.detachTransport();
        this.clientSM.transport = null;
    }

    reset() {
        super.reset();
        this.sampleQueues={};
    }

    destroy() {
        this.clientSM.destroy();
        return super.destroy();
    }

    start() {
        super.start();
        if (this.transport) {
            return this.transport.ready.then(() => {
                return this.clientSM.start();
            });
        } else {
            return Promise.reject("no transport attached");
        }
    }

    stop() {
        super.stop();
        return this.clientSM.stop();
    }

    onData(data) {
        this.clientSM.onData(data);
    }

    onConnected() {
        this.clientSM.onConnected();
        super.onConnected();
    }

    onDisconnected() {
        super.onDisconnected();
        this.clientSM.onDisconnected();
    }
}

class AuthError extends Error {
    constructor(msg) {
        super(msg);
    }
}

export class RTSPError extends Error {
    constructor(data) {
        super(data.msg);
        this.data = data;
    }
}

export class RTSPClientSM extends StateMachine {
    static get USER_AGENT() {return 'SFRtsp 0.3';}
    static get STATE_INITIAL() {return  1 << 0;}
    static get STATE_OPTIONS() {return 1 << 1;}
    static get STATE_DESCRIBE () {return  1 << 2;}
    static get STATE_SETUP() {return  1 << 3;}
    static get STATE_STREAMS() {return 1 << 4;}
    static get STATE_TEARDOWN() {return  1 << 5;}
    static get STATE_PLAY() {return  1 << 6;}
    static get STATE_PLAYING() {return  1 << 7;}
    static get STATE_PAUSE() {return  1 << 8;}
    static get STATE_PAUSED() {return  1 << 9;}
    // static STATE_PAUSED = 1 << 6;

    constructor(parent) {
        super();

        this.parent = parent;
        this.transport = null;
        this.payParser = new RTPPayloadParser();
        this.rtp_channels = new Set();
        this.sessions = {};
        this.ontracks = null;

        this.addState(RTSPClientSM.STATE_INITIAL,{
        }).addState(RTSPClientSM.STATE_OPTIONS, {
            activate: this.sendOptions,
            finishTransition: this.onOptions
        }).addState(RTSPClientSM.STATE_DESCRIBE, {
            activate: this.sendDescribe,
            finishTransition: this.onDescribe
        }).addState(RTSPClientSM.STATE_SETUP, {
            activate: this.sendSetup,
            finishTransition: this.onSetup
        }).addState(RTSPClientSM.STATE_STREAMS, {

        }).addState(RTSPClientSM.STATE_TEARDOWN, {
            activate: ()=>{
                this.started = false;
            },
            finishTransition: ()=>{
                return this.transitionTo(RTSPClientSM.STATE_INITIAL)
            }
        }).addTransition(RTSPClientSM.STATE_INITIAL, RTSPClientSM.STATE_OPTIONS)
            .addTransition(RTSPClientSM.STATE_INITIAL, RTSPClientSM.STATE_TEARDOWN)
            .addTransition(RTSPClientSM.STATE_OPTIONS, RTSPClientSM.STATE_DESCRIBE)
            .addTransition(RTSPClientSM.STATE_DESCRIBE, RTSPClientSM.STATE_SETUP)
            .addTransition(RTSPClientSM.STATE_SETUP, RTSPClientSM.STATE_STREAMS)
            .addTransition(RTSPClientSM.STATE_TEARDOWN, RTSPClientSM.STATE_INITIAL)
            // .addTransition(RTSPClientSM.STATE_STREAMS, RTSPClientSM.STATE_PAUSED)
            // .addTransition(RTSPClientSM.STATE_PAUSED, RTSPClientSM.STATE_STREAMS)
            .addTransition(RTSPClientSM.STATE_STREAMS, RTSPClientSM.STATE_TEARDOWN)
            // .addTransition(RTSPClientSM.STATE_PAUSED, RTSPClientSM.STATE_TEARDOWN)
            .addTransition(RTSPClientSM.STATE_SETUP, RTSPClientSM.STATE_TEARDOWN)
            .addTransition(RTSPClientSM.STATE_DESCRIBE, RTSPClientSM.STATE_TEARDOWN)
            .addTransition(RTSPClientSM.STATE_OPTIONS, RTSPClientSM.STATE_TEARDOWN);

        this.reset();

        this.shouldReconnect = false;

        // TODO: remove listeners
        // this.connection.eventSource.addEventListener('connected', ()=>{
        //     if (this.shouldReconnect) {
        //         this.reconnect();
        //     }
        // });
        // this.connection.eventSource.addEventListener('disconnected', ()=>{
        //     if (this.started) {
        //         this.shouldReconnect = true;
        //     }
        // });
        // this.connection.eventSource.addEventListener('data', (data)=>{
        //     let channel = new DataView(data).getUint8(1);
        //     if (this.rtp_channels.has(channel)) {
        //         this.onRTP({packet: new Uint8Array(data, 4), type: channel});
        //     }
        //
        // });
    }

    destroy() {
        this.parent = null;
    }

    setSource(url) {
        this.reset();
        this.endpoint = url;
        this.url = `${url.protocol}://${url.location}${url.urlpath}`;
    }

    onConnected() {
        if (this.rtpFactory) {
            this.rtpFactory = null;
        }
        if (this.shouldReconnect) {
            this.start();
        }
    }

    async onDisconnected() {
        this.reset();
        this.shouldReconnect = true;
        await this.transitionTo(RTSPClientSM.STATE_TEARDOWN);
        await this.transitionTo(RTSPClientSM.STATE_INITIAL);
    }

    start() {
        if (this.currentState.name !== RTSPClientSM.STATE_STREAMS) {
            return this.transitionTo(RTSPClientSM.STATE_OPTIONS);
        } else {
            // TODO: seekable
            let promises = [];
            for (let session in this.sessions) {
                promises.push(this.sessions[session].sendPlay());
            }
            return Promise.all(promises);
        }
    }

    onData(data) {
        let channel = data[1];
        if (this.rtp_channels.has(channel)) {
            this.onRTP({packet: data.subarray(4), type: channel});
        }
    }

    useRTPChannel(channel) {
        this.rtp_channels.add(channel);
    }

    forgetRTPChannel(channel) {
        this.rtp_channels.delete(channel);
    }

    stop() {
        this.shouldReconnect = false;
        let promises = [];
        for (let session in this.sessions) {
            promises.push(this.sessions[session].sendPause());
        }
        return Promise.all(promises);
        // this.mse = null;
    }

    async reset() {
        this.authenticator = '';
        this.methods = [];
        this.tracks = [];
        this.rtpBuffer={};
        for (let stream in this.streams) {
            this.streams[stream].reset();
        }
        for (let session in this.sessions) {
            this.sessions[session].reset();
        }
        this.streams={};
        this.sessions={};
        this.contentBase = "";
        if (this.currentState) {
            if (this.currentState.name != RTSPClientSM.STATE_INITIAL) {
                await this.transitionTo(RTSPClientSM.STATE_TEARDOWN);
                await this.transitionTo(RTSPClientSM.STATE_INITIAL);
            }
        } else {
            await this.transitionTo(RTSPClientSM.STATE_INITIAL);
        }
        this.sdp = null;
        this.interleaveChannelIndex = 0;
        this.session = null;
        this.timeOffset = {};
        this.lastTimestamp = {};
    }

    async reconnect() {
        //this.parent.eventSource.dispatchEvent('clear');
        await this.reset();
        if (this.currentState.name != RTSPClientSM.STATE_INITIAL) {
            await this.transitionTo(RTSPClientSM.STATE_TEARDOWN);
            return this.transitionTo(RTSPClientSM.STATE_OPTIONS);
        } else {
            return this.transitionTo(RTSPClientSM.STATE_OPTIONS);
        }
    }

    supports(method) {
        return this.methods.includes(method)
    }

    parse(_data) {
        Log.debug(_data.payload);
        let d=_data.payload.split('\r\n\r\n');
        let parsed =  MessageBuilder.parse(d[0]);
        let len = Number(parsed.headers['content-length']);
        if (len) {
            let d=_data.payload.split('\r\n\r\n');
            parsed.body = d[1];
        } else {
            parsed.body="";
        }
        return parsed
    }

    sendRequest(_cmd, _host, _params={}, _payload=null) {
        this.cSeq++;
        Object.assign(_params, {
            CSeq: this.cSeq,
            'User-Agent': RTSPClientSM.USER_AGENT
        });
        if (this.authenticator) {
            _params['Authorization'] = this.authenticator(_cmd);
        }
        return this.send(MessageBuilder.build(_cmd, _host, _params, _payload), _cmd).catch((e)=>{
            if ((e instanceof AuthError) && !_params['Authorization'] ) {
                return this.sendRequest(_cmd, _host, _params, _payload);
            } else {
                throw e;
            }
        });
    }

    async send(_data, _method) {
        if (this.transport) {
            try {
                await this.transport.ready;
            } catch(e) {
                this.onDisconnected();
                throw e;
            }
            Log.debug(_data);
            let response = await this.transport.send(_data);
            let parsed = this.parse(response);
            // TODO: parse status codes
            if (parsed.code == 401 /*&& !this.authenticator */) {
                Log.debug(parsed.headers['www-authenticate']);
                let auth = parsed.headers['www-authenticate'];
                let method = auth.substring(0, auth.indexOf(' '));
                auth = auth.substr(method.length+1);
                let chunks = auth.split(',');

                let ep = this.parent.endpoint;
                if (!ep.user || !ep.pass) {
                    try {
                        await this.parent.queryCredentials.call(this.parent);
                    } catch (e) {
                        throw new AuthError();
                    }
                }

                if (method.toLowerCase() == 'digest') {
                    let parsedChunks = {};
                    for (let chunk of chunks) {
                        let c = chunk.trim();
                        let [k,v] = c.split('=');
                        parsedChunks[k] = v.substr(1, v.length-2);
                    }
                    this.authenticator = (_method)=>{
                        let ep = this.parent.endpoint;
                        let ha1 = md5(`${ep.user}:${parsedChunks.realm}:${ep.pass}`);
                        let ha2 = md5(`${_method}:${this.url}`);
                        let response = md5(`${ha1}:${parsedChunks.nonce}:${ha2}`);
                        let tail=''; // TODO: handle other params
                        return `Digest username="${ep.user}", realm="${parsedChunks.realm}", nonce="${parsedChunks.nonce}", uri="${this.url}", response="${response}"${tail}`;
                    }
                } else {
                    this.authenticator = ()=>{return `Basic ${btoa(this.parent.endpoint.auth)}`;};
                }

                throw new AuthError(parsed);
            }
            if (parsed.code >= 300) {
                Log.error(parsed.statusLine);
                throw new RTSPError({msg: `RTSP error: ${parsed.code} ${parsed.statusLine}`, parsed: parsed});
            }
            return parsed;
        } else {
            return Promise.reject("No transport attached");
        }
    }

    sendOptions() {
        this.reset();
        this.started = true;
        this.cSeq = 0;
        return this.sendRequest('OPTIONS', '*', {});
    }

    onOptions(data) {
        this.methods = data.headers['public'].split(',').map((e)=>e.trim());
        this.transitionTo(RTSPClientSM.STATE_DESCRIBE);
    }

    sendDescribe() {
        return this.sendRequest('DESCRIBE', this.url, {
            'Accept': 'application/sdp'
        }).then((data)=>{
            this.sdp = new SDPParser();
            return this.sdp.parse(data.body).catch(()=>{
                throw new Error("Failed to parse SDP");
            }).then(()=>{return data;});
        });
    }

    onDescribe(data) {
        this.contentBase = data.headers['content-base'] || this.url;// `${this.endpoint.protocol}://${this.endpoint.location}${this.endpoint.urlpath}/`;
        this.tracks = this.sdp.getMediaBlockList();
        this.rtpFactory = new RTPFactory(this.sdp);

        Log.log('SDP contained ' + this.tracks.length + ' track(s). Calling SETUP for each.');

        if (data.headers['session']) {
            this.session = data.headers['session'];
        }

        if (!this.tracks.length) {
            throw new Error("No tracks in SDP");
        }

        this.transitionTo(RTSPClientSM.STATE_SETUP);
    }

    sendSetup() {
        let streams=[];
        let lastPromise = null;

        // TODO: select first video and first audio tracks
        for (let track_type of this.tracks) {
            Log.log("setup track: "+track_type);
            // if (track_type=='audio') continue;
            // if (track_type=='video') continue;
            let track = this.sdp.getMediaBlock(track_type);
            if (!PayloadType.string_map[track.rtpmap[track.fmt[0]].name]) continue;

            this.streams[track_type] = new RTSPStream(this, track);
            let setupPromise = this.streams[track_type].start(lastPromise);
            lastPromise = setupPromise;
            this.parent.sampleQueues[PayloadType.string_map[track.rtpmap[track.fmt[0]].name]]=[];
            this.rtpBuffer[track.fmt[0]]=[];
            streams.push(setupPromise.then(({track, data})=>{
                let timeOffset = 0;
                this.timeOffset[track.fmt[0]] = 0;
                try {
                    let rtp_info = data.headers["rtp-info"].split(';');
                    for (let chunk of rtp_info) {
                        let [key, val] = chunk.split("=");
                        if (key === "rtptime") {
                            this.timeOffset[track.fmt[0]] = 0;//Number(val);
                        }
                    }
                } catch (e) {
                    // new Date().getTime();
                }
                let params = {
                    timescale: 0,
                    scaleFactor: 0
                };
                if (track.fmtp['sprop-parameter-sets']) {
                    let sps_pps = track.fmtp['sprop-parameter-sets'].split(',');
                    params = {
                        sps:base64ToArrayBuffer(sps_pps[0]),
                        pps:base64ToArrayBuffer(sps_pps[1])
                    };
                } else if (track.fmtp['config']) {
                    let config = track.fmtp['config'];
                    this.has_config = track.fmtp['cpresent']!='0';
                    let generic = track.rtpmap[track.fmt[0]].name == 'MPEG4-GENERIC';
                    if (generic) {
                        params={config:
                            AACParser.parseAudioSpecificConfig(hexToByteArray(config))
                        };
                        this.payParser.aacparser.setConfig(params.config);
                    } else if (config) {
                        // todo: parse audio specific config for mpeg4-generic
                        params={config:
                            AACParser.parseStreamMuxConfig(hexToByteArray(config))
                        };
                        this.payParser.aacparser.setConfig(params.config);
                    }
                }
                params.duration = this.sdp.sessionBlock.range?this.sdp.sessionBlock.range[1]-this.sdp.sessionBlock.range[0]:1;
                this.parent.seekable = (params.duration > 1);
                let res = {
                    track: track,
                    offset: this.timeOffset[track.fmt[0]],
                    type: PayloadType.string_map[track.rtpmap[track.fmt[0]].name],
                    params: params,
                    duration: params.duration
                };
                console.log(res, this.timeOffset);
                let session = data.headers.session.split(';')[0];
                if (!this.sessions[session]) {
                    this.sessions[session] = new RTSPSession(this, session);
                }
                return res;
            }));
        }
        return Promise.all(streams).then((tracks)=>{
            let sessionPromises = [];
            for (let session in this.sessions) {
                sessionPromises.push(this.sessions[session].start());
            }
            return Promise.all(sessionPromises).then(()=>{
                if (this.ontracks) {
                    this.ontracks(tracks);
                }
            })
        }).catch((e)=>{
            console.error(e);
            this.stop();
            this.reset();
        });
    }

    onSetup() {
        this.transitionTo(RTSPClientSM.STATE_STREAMS);
    }

    onRTP(_data) {
        if (!this.rtpFactory) return;

        let rtp = this.rtpFactory.build(_data.packet, this.sdp);
        if (!rtp.type) {
            return;
        }

        if (this.timeOffset[rtp.pt] === undefined) {
            //console.log(rtp.pt, this.timeOffset[rtp.pt]);
            this.rtpBuffer[rtp.pt].push(rtp);
            return;
        }

        if (this.lastTimestamp[rtp.pt] === undefined) {
            this.lastTimestamp[rtp.pt] = rtp.timestamp-this.timeOffset[rtp.pt];
        }

        let queue = this.rtpBuffer[rtp.pt];
        queue.push(rtp);

        while (queue.length) {
            let rtp = queue.shift();

            rtp.timestamp = rtp.timestamp-this.timeOffset[rtp.pt]-this.lastTimestamp[rtp.pt];
            // TODO: overflow
            // if (rtp.timestamp < 0) {
            //     rtp.timestamp = (rtp.timestamp + Number.MAX_SAFE_INTEGER) % 0x7fffffff;
            // }
            if (rtp.media) {
                let pay = this.payParser.parse(rtp);
                if (pay) {
                    // if (typeof pay == typeof []) {
                    this.parent.sampleQueues[rtp.type].push(pay);
                    // } else {
                    //     this.parent.sampleQueues[rtp.type].push([pay]);
                    // }
                } else {
                    this.parent.sampleQueues[rtp.type].push(pay);
                }
            }
        }
        // this.remuxer.feedRTP();
    }
}