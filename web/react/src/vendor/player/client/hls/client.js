import {getTagged} from '../../deps/bp_logger.js';
import {BaseClient} from '../../core/base_client.js';
import {TSParser, PESType} from '../../core/parsers/ts.js';
import {AVCPES} from '../../client/hls/pes_avc.js';
import {AACPES} from '../../client/hls/pes_aac.js';
import {StreamType} from '../../core/defs.js';
import {M3U8Parser} from '../../core/parsers/m3u8.js';
import {CPU_CORES} from '../../core/util/browser.js';

const LOG_TAG = "client:hls";
const Log = getTagged(LOG_TAG);


export default class HLSClient extends BaseClient {
    static get CHUNKS_TO_LOAD() {return  CPU_CORES;}

    constructor(transport, options) {
        super(transport, options);

        this.parser = new TSParser();
        this.parser.addPesParser(PESType.H264, AVCPES);
        this.parser.addPesParser(PESType.AAC, AACPES);
        this.parser.ontracks = (tracks)=>{
            let duration = 0;
            for (let chunk of this.chunks) {
                duration+=chunk.duration;
            }
            for (let track of tracks) {
                track.duration = duration;
                this.sampleQueues[track.type]=[];
            }

            this.eventSource.dispatchEvent('tracks', tracks);
            this.startStreamFlush();
        };

        this.playlists = [];
        this.chunks = [];
        this.loadedChunks = [];
        this.pendingChunks = new Set();
        this.chunkIdx = 0;
        this.seqMap = new Map();
        this.sampleQueues = {};
        this.chunkSeq = new Map();

        this.eventSource.addEventListener('needData', this.loadChunks.bind(this, HLSClient.CHUNKS_TO_LOAD));
        this.resume = false;

        this.parsing = false;
    }

    static streamType() {
        return 'hls';
    }

    parse(data) {
        let seq = new DataView(data.buffer, data.byteOffset, 4).getUint32(0);
        // console.log(`data for ${seq}`);
        // console.log('begin parse');
        let offset = 4;
        while (offset < data.byteLength) {
            let parsed = this.parser.parse(data.subarray(offset, offset + TSParser.PACKET_LENGTH));
            if (parsed) {
                if (parsed.config) {
                    this.eventSource.dispatchEvent(`${StreamType.map[parsed.type]}_config`, {
                        config: parsed.config,
                        pay: parsed.pay
                    });
                }
                this.sampleQueues[parsed.type].push(parsed.units);
                this.eventSource.dispatchEvent('samples', {pay: parsed.pay});
            }
            offset += TSParser.PACKET_LENGTH;
        }
        // this.eventSource.dispatchEvent('flush');
        // console.log('end parse');
        this.parsing = false;
        if (this.loadedChunks.length) {
            this.onData(this.loadedChunks.shift());
        }
    }

    checkSeq(seq, data) {
        seq = Number(seq);
        if (this.seqMap.has(seq)) {
            // parse data
            let cs = this.chunkSeq.get(seq);
            this.pendingChunks.delete(cs.idx);
            this.chunkSeq.delete(seq);
            this.parse(data?data:this.seqMap.get(seq));
            this.seqMap.delete(seq);
            cs.promise.resolve();
        } else {
            this.seqMap.set(seq, data);
        }
    }

    onData(data) {
        if (this.parsing) {
            this.loadedChunks.push(data);
        } else {
            this.parsing = true;
            let seq = new DataView(data.buffer, data.byteOffset, 4).getUint32(0);
            // TODO: store seq & check if data ready
            this.checkSeq(seq, data);
        }
    }

    onConnected() {
        super.onConnected();
        Log.debug('HLS connected');
        if (!this.paused) {
            this.start();
        }
    }

    onDisconnected() {
        super.onDisconnected();
        Log.debug('HLS disconnected');
        this.parsing = false;
        this.seqMap.clear();
        this.chunkSeq.clear();
        // this.stop();
    }

    start() {
        super.start();
        if (this.resume) {
            this.eventSource.dispatchEvent('needData');
        } else {
            this.resume = true;
            this.eventSource.dispatchEvent('clear');
            Log.debug('waiting for transport ready');
            this.transport.ready.then(()=> {
                Log.debug('loading playlist');
                this.loadPlaylist();
            }).catch((e)=>{
                Log.debug('reject transport', e);
            });
        }
    }

    stop() {
        super.stop();
    }

    setSource(source) {
        this.resume = false;
        super.setSource(source);
    }

    send(request, beforeSend) {
        try {
            return this.transport.send(request, beforeSend);
        } catch (e) {
            Log.error(e);
            this.onDisconnected();
            this.transport.connect();
            return Promise.reject();
        }
    }

    loadPlaylist(playlist=null) {
        let url = playlist?playlist.url:this.sourceUrl;
        this.send(`GET ${url} HTTP/1.1\r\nHost: ${this.transport.endpoint.host}\r\n\r\n`).then((data)=>{
            let entries = data.payload.split('\r\n\r\n');
            let http = entries[0].split('\r\n');
            let status = http[0].match(new RegExp(`HTTP/\\d\\.\\d\\s+(\\d+)\\s+(\\w+)`));
            if (!status || status[1]>=400) {
                Log.error('bad playlist response');
                return;
            }
            Log.debug(status);
            let baseUrl = url.substr(0, url.lastIndexOf('/'));
            let playlist = M3U8Parser.parse(entries[1], baseUrl);
            if (playlist.chunks.length) {
                this.chunks = playlist.chunks;
                this.resume = true;
                // Load first chunk to detect initial timestamps
                this.loadChunks(1);
            } else if (playlist.playlists) {
                this.playlists = playlist.playlists;
                // TODO: check playlist support
                this.loadPlaylist(this.playlists[0])
            }
            // this.chunks = entries[1].split('\n').map((e)=>{e.replace(/\r/, ''); return e;});
            // this.loadChunk();
        }).catch((e)=>{
            this.resume = false;
        });
    }

    loadChunk(chunk, idx) {
        return new Promise((resolve, reject)=>{
            this.send(`GET ${chunk.url}?${Math.random()} HTTP/1.1\r\nHost: ${this.transport.endpoint.host}\r\n\r\n`, (seq)=>{
                this.chunkSeq.set(seq, {
                    idx: idx,
                    promise: {resolve, reject}
                });
            }).then((res)=>{
                let lines = res.payload.split('\r\n');
                let [version, code, msg] = lines[0].split(' ');
                if (Number(code) >= 300) {
                    throw new Error(`Load error: ${code} ${msg}`);
                }

                // TODO: store seq & check if data ready
                this.checkSeq(res.data.seq, null);
            });
        });
    }

    loadChunks(count) {
        if (this.chunkIdx>= this.chunks.length) return;
        let promises = [];
        if (this.pendingChunks.size) {
            Log.debug(`Reload chunks: ${Array.from(this.pendingChunks)}`);
            for (let i of this.pendingChunks) {
                let chunk = this.chunks[i];
                Log.log(`Loading ${chunk.url} (${i+1} of ${this.chunks.length})`);
                promises.push(this.loadChunk(chunk, i));
            }
        } else {
            for (let i = this.chunkIdx; i < this.chunkIdx+count; ++i) {
                let chunk = this.chunks[i];//.shift();
                Log.log(`Loading ${chunk.url} (${i+1} of ${this.chunks.length})`);
                this.pendingChunks.add(i);

                promises.push(this.loadChunk(chunk, i));
                if (i+1 >= this.chunks.length) return;
            }
        }
        return Promise.all(promises).then(()=>{
            Log.log('chunk loaded');
            // TODO: check queue overflow
            this.chunkIdx+=HLSClient.CHUNKS_TO_LOAD;
            if (!this.paused) {
                this.eventSource.dispatchEvent('needData');
            }
        }).catch((e)=>{
            Log.error(e);
            // this.stop();
        });
    }
}