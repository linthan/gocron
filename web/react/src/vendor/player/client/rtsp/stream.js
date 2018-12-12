import {getTagged} from '../../deps/bp_logger.js';

import {RTSPClientSM as RTSPClient} from './client.js';
import {Url} from '../../core/util/url.js';
import {RTSPError} from "./client";

const LOG_TAG = "rtsp:stream";
const Log = getTagged(LOG_TAG);

export class RTSPStream {

    constructor(client, track) {
        this.state = null;
        this.client = client;
        this.track = track;
        this.rtpChannel = 1;

        this.stopKeepAlive();
        this.keepaliveInterval = null;
        this.keepaliveTime = 30000;
    }

    reset() {
        this.stopKeepAlive();
        this.client.forgetRTPChannel(this.rtpChannel);
        this.client = null;
        this.track = null;
    }

    start(lastSetupPromise = null) {
        if (lastSetupPromise != null) {
            // if a setup was already made, use the same session
            return lastSetupPromise.then((obj) => this.sendSetup(obj.session))
        } else {
            return this.sendSetup();
        }
    }

    stop() {
        return this.sendTeardown();
    }

    getSetupURL(track) {
        let sessionBlock = this.client.sdp.getSessionBlock();
        if (Url.isAbsolute(track.control)) {
            return track.control;
        } else if (Url.isAbsolute(`${sessionBlock.control}${track.control}`)) {
            return `${sessionBlock.control}${track.control}`;
        } else if (Url.isAbsolute(`${this.client.contentBase}${track.control}`)) {
            /* Should probably check session level control before this */
            return `${this.client.contentBase}${track.control}`;
        }
        else {//need return default
            return track.control;
        }
        Log.error('Can\'t determine track URL from ' +
            'block.control:' + track.control + ', ' +
            'session.control:' + sessionBlock.control + ', and ' +
            'content-base:' + this.client.contentBase);
    }

    getControlURL() {
        let ctrl = this.client.sdp.getSessionBlock().control;
        if (Url.isAbsolute(ctrl)) {
            return ctrl;
        } else if (!ctrl || '*' === ctrl) {
            return this.client.contentBase;
        } else {
            return `${this.client.contentBase}${ctrl}`;
        }
    }

    sendKeepalive() {
        if (this.client.methods.includes('GET_PARAMETER')) {
            return this.client.sendRequest('GET_PARAMETER', this.getSetupURL(this.track), {
                'Session': this.session
            });
        } else {
            return this.client.sendRequest('OPTIONS', '*');
        }
    }

    stopKeepAlive() {
        clearInterval(this.keepaliveInterval);
    }

    startKeepAlive() {
        this.keepaliveInterval = setInterval(() => {
            this.sendKeepalive().catch((e) => {
                Log.error(e);
                if (e instanceof RTSPError) {
                    if (Number(e.data.parsed.code) == 501) {
                        return;
                    }
                }
                this.client.reconnect();
            });
        }, this.keepaliveTime);
    }

    sendRequest(_cmd, _params = {}) {
        let params = {};
        if (this.session) {
            params['Session'] = this.session;
        }
        Object.assign(params, _params);
        return this.client.sendRequest(_cmd, this.getControlURL(), params);
    }

    sendSetup(session = null) {
        this.state = RTSPClient.STATE_SETUP;
        this.rtpChannel = this.client.interleaveChannelIndex;
        let interleavedChannels = this.client.interleaveChannelIndex++ + "-" + this.client.interleaveChannelIndex++;
        let params = {
            'Transport': `RTP/AVP/TCP;unicast;interleaved=${interleavedChannels}`,
            'Date': new Date().toUTCString()
        };
        if(session){
            params.Session = session;
        }
        return this.client.sendRequest('SETUP', this.getSetupURL(this.track), params).then((_data) => {
            this.session = _data.headers['session'];
            let transport = _data.headers['transport'];
            if (transport) {
                let interleaved = transport.match(/interleaved=([0-9]+)-([0-9]+)/)[1];
                if (interleaved) {
                    this.rtpChannel = Number(interleaved);
                }
            }
            let sessionParamsChunks = this.session.split(';').slice(1);
            let sessionParams = {};
            for (let chunk of sessionParamsChunks) {
                let kv = chunk.split('=');
                sessionParams[kv[0]] = kv[1];
            }
            if (sessionParams['timeout']) {
                this.keepaliveInterval = Number(sessionParams['timeout']) * 500; // * 1000 / 2
            }
            /*if (!/RTP\/AVP\/TCP;unicast;interleaved=/.test(_data.headers["transport"])) {
                // TODO: disconnect stream and notify client
                throw new Error("Connection broken");
            }*/
            this.client.useRTPChannel(this.rtpChannel);
            this.startKeepAlive();
            return {track: this.track, data: _data, session: this.session};
        });
    }
}
