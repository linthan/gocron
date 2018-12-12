import {Log} from '../../deps/bp_logger.js';
import {ADTS} from './adts.js';
import {StreamType, PayloadType} from '../../core/defs.js';
import {AACFrame} from '../../core/elementary/AACFrame.js';

export class AACPES {
    constructor() {
        this.aacOverFlow = null;
        this.lastAacPTS = null;
        this.track = {};
        this.config = null;
    }

    parse(pes) {
            let data = pes.data;
            let pts = pes.pts;
            let startOffset = 0;
            let aacOverFlow = this.aacOverFlow;
            let lastAacPTS = this.lastAacPTS;
            var config, frameDuration, frameIndex, offset, stamp, len;

        if (aacOverFlow) {
            var tmp = new Uint8Array(aacOverFlow.byteLength + data.byteLength);
            tmp.set(aacOverFlow, 0);
            tmp.set(data, aacOverFlow.byteLength);
            Log.debug(`AAC: append overflowing ${aacOverFlow.byteLength} bytes to beginning of new PES`);
            data = tmp;
        }

        // look for ADTS header (0xFFFx)
        for (offset = startOffset, len = data.length; offset < len - 1; offset++) {
            if ((data[offset] === 0xff) && (data[offset+1] & 0xf0) === 0xf0) {
                break;
            }
        }
        // if ADTS header does not start straight from the beginning of the PES payload, raise an error
        if (offset) {
            var reason, fatal;
            if (offset < len - 1) {
                reason = `AAC PES did not start with ADTS header,offset:${offset}`;
                fatal = false;
            } else {
                reason = 'no ADTS header found in AAC PES';
                fatal = true;
            }
            Log.error(reason);
            if (fatal) {
                return;
            }
        }

        let hdr = null;
        let res = {units:[], type: StreamType.AUDIO, pay: PayloadType.AAC};
        if (!this.config) {
            hdr = ADTS.parseHeaderConfig(data.subarray(offset));
            this.config = hdr.config;
            res.config = hdr.config;
            hdr.config = null;
            Log.debug(`parsed codec:${this.config.codec},rate:${this.config.samplerate},nb channel:${this.config.channels}`);
        }
        frameIndex = 0;
        frameDuration = 1024 * 90000 / this.config.samplerate;

        // if last AAC frame is overflowing, we should ensure timestamps are contiguous:
        // first sample PTS should be equal to last sample PTS + frameDuration
        if(aacOverFlow && lastAacPTS) {
            var newPTS = lastAacPTS+frameDuration;
            if(Math.abs(newPTS-pts) > 1) {
                Log.debug(`AAC: align PTS for overlapping frames by ${Math.round((newPTS-pts)/90)}`);
                pts=newPTS;
            }
        }

        while ((offset + 5) < len) {
            if (!hdr) {
                hdr = ADTS.parseHeader(data.subarray(offset));
            }
            if ((hdr.size > 0) && ((offset + hdr.offset + hdr.size) <= len)) {
                stamp = pts + frameIndex * frameDuration;
                res.units.push(new AACFrame(data.subarray(offset + hdr.offset, offset + hdr.offset + hdr.size), stamp));
                offset += hdr.offset + hdr.size;
                frameIndex++;
                // look for ADTS header (0xFFFx)
                for ( ; offset < (len - 1); offset++) {
                    if ((data[offset] === 0xff) && ((data[offset + 1] & 0xf0) === 0xf0)) {
                        break;
                    }
                }
            } else {
                break;
            }
            hdr = null;
        }
        if ((offset < len) && (data[offset]==0xff)) {   // TODO: check it
            aacOverFlow = data.subarray(offset, len);
            //logger.log(`AAC: overflow detected:${len-offset}`);
        } else {
            aacOverFlow = null;
        }
        this.aacOverFlow = aacOverFlow;
        this.lastAacPTS = stamp;

        return res;
    }
}