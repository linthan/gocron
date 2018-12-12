import {appendByteArray} from '../util/binary.js';

export class PESAsm {

    constructor() {
        this.fragments = [];
        this.pesLength=0;
        this.pesPkt = null;
    }

    parse(frag) {

        if (this.extPresent) {
            let ext = this.parseExtension(frag);
            ext.data = frag.subarray(ext.offset);
        } else {
            return null;
        }
    }

    parseHeader() {
        let hdr = this.fragments[0];
        let pesPrefix = (hdr[0] << 16) + (hdr[1] << 8) + hdr[2];
        this.extPresent = ![0xbe, 0xbf].includes(hdr[3]);
        if (pesPrefix === 1) {
            let pesLength = (hdr[4] << 8) + hdr[5];
            if (pesLength) {
                this.pesLength = pesLength;
                this.hasLength = true;
            } else {
                this.hasLength = false;
                this.pesPkt = null;
            }
            return true;
        }
        return false;
    }

    static PTSNormalize(value, reference) {

        let offset;
        if (reference === undefined) {
            return value;
        }
        if (reference < value) {
            // - 2^33
            offset = -8589934592;
        } else {
            // + 2^33
            offset = 8589934592;
        }
        /* PTS is 33bit (from 0 to 2^33 -1)
         if diff between value and reference is bigger than half of the amplitude (2^32) then it means that
         PTS looping occured. fill the gap */
        while (Math.abs(value - reference) > 4294967296) {
            value += offset;
        }
        return value;
    }

    parseExtension(frag) {
        let  pesFlags, pesPrefix, pesLen, pesHdrLen, pesPts, pesDts, payloadStartOffset;
            pesFlags = frag[1];
            if (pesFlags & 0xC0) {
                /* PES header described here : http://dvd.sourceforge.net/dvdinfo/pes-hdr.html
                 as PTS / DTS is 33 bit we cannot use bitwise operator in JS,
                 as Bitwise operators treat their operands as a sequence of 32 bits */
                pesPts = (frag[3] & 0x0E) * 536870912 +// 1 << 29
                    (frag[4] & 0xFF) * 4194304 +// 1 << 22
                    (frag[5] & 0xFE) * 16384 +// 1 << 14
                    (frag[6] & 0xFF) * 128 +// 1 << 7
                    (frag[7] & 0xFE) / 2;
                // check if greater than 2^32 -1
                if (pesPts > 4294967295) {
                    // decrement 2^33
                    pesPts -= 8589934592;
                }
                if (pesFlags & 0x40) {
                    pesDts = (frag[8] & 0x0E ) * 536870912 +// 1 << 29
                        (frag[9] & 0xFF ) * 4194304 +// 1 << 22
                        (frag[10] & 0xFE ) * 16384 +// 1 << 14
                        (frag[11] & 0xFF ) * 128 +// 1 << 7
                        (frag[12] & 0xFE ) / 2;
                    // check if greater than 2^32 -1
                    if (pesDts > 4294967295) {
                        // decrement 2^33
                        pesDts -= 8589934592;
                    }
                } else {
                    pesDts = pesPts;
                }

            pesHdrLen = frag[2];
            payloadStartOffset = pesHdrLen + 9;

            // TODO: normalize pts/dts
            return {offset: payloadStartOffset, pts: pesPts, dts: pesDts};
        } else {
            return null;
        }
    }
    
    feed(frag, shouldParse) {

        let res = null;
        if (shouldParse && this.fragments.length) {
            if (!this.parseHeader()) {
                throw new Error("Invalid PES packet");
            }

            let offset = 6;
            let parsed = {};
            if (this.extPresent) {
                // TODO: make sure fragment have necessary length
                parsed = this.parseExtension(this.fragments[0].subarray(6));
                offset = parsed.offset;
            }
            if (!this.pesPkt) {
                this.pesPkt = new Uint8Array(this.pesLength);
            }

            let poffset = 0;
            while (this.pesLength && this.fragments.length) {
                let data = this.fragments.shift();
                if (offset) {
                    if (data.byteLength < offset) {
                        offset -= data.byteLength;
                        continue;
                    } else {
                        data = data.subarray(offset);
                        this.pesLength -= offset - (this.hasLength?6:0);
                        offset = 0;
                    }
                }
                this.pesPkt.set(data, poffset);
                poffset += data.byteLength;
                this.pesLength -= data.byteLength;
            }
            res = {data:this.pesPkt, pts: parsed.pts, dts: parsed.dts};
        } else {
            this.pesPkt = null;
        }
        this.pesLength += frag.byteLength;

        if (this.fragments.length && this.fragments[this.fragments.length-1].byteLength < 6) {
            this.fragments[this.fragments.length-1] = appendByteArray(this.fragments[0], frag);
        } else {
            this.fragments.push(frag);
        }

        return res;
    }
}