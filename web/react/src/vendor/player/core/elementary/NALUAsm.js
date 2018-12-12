import {Log} from '../../deps/bp_logger.js';
import {NALU} from './NALU.js';

// TODO: asm.js
export class NALUAsm {

    constructor() {
        this.fragmented_nalu = null;
    }


    static parseNALHeader(hdr) {
        return {
            nri: hdr & 0x60,
            type: hdr & 0x1F
        }
    }

    parseSingleNALUPacket(rawData, header, dts, pts) {
        return new NALU(header.type,  header.nri, rawData.subarray(0), dts, pts);
    }

    parseAggregationPacket(rawData, header, dts, pts) {
        let data = new DataView(rawData.buffer, rawData.byteOffset, rawData.byteLength);
        let nal_start_idx = 0;
        let don = null;
        if (NALU.STAP_B === header.type) {
            don = data.getUint16(nal_start_idx);
            nal_start_idx += 2;
        }
        let ret = [];
        while (nal_start_idx < data.byteLength) {
            let size = data.getUint16(nal_start_idx);
            nal_start_idx += 2;
            let header = NALUAsm.parseNALHeader(data.getInt8(nal_start_idx));
            nal_start_idx++;
            let nalu = this.parseSingleNALUPacket(rawData.subarray(nal_start_idx, nal_start_idx+size), header, dts, pts);
            if (nalu !== null) {
                ret.push(nalu);
            }
            nal_start_idx+=size;
        }
        return ret;
    }

    parseFragmentationUnit(rawData, header, dts, pts) {
        let data = new DataView(rawData.buffer, rawData.byteOffset, rawData.byteLength);
        let nal_start_idx = 0;
        let fu_header = data.getUint8(nal_start_idx);
        let is_start = (fu_header & 0x80) >>> 7;
        let is_end = (fu_header & 0x40) >>> 6;
        let payload_type = fu_header & 0x1F;
        let ret = null;

        nal_start_idx++;
        let don = 0;
        if (NALU.FU_B === header.type) {
            don = data.getUint16(nal_start_idx);
            nal_start_idx += 2;
        }

        if (is_start) {
            this.fragmented_nalu = new NALU(payload_type, header.nri, rawData.subarray(nal_start_idx), dts, pts);
        }
        if (this.fragmented_nalu && this.fragmented_nalu.ntype === payload_type) {
            if (!is_start) {
                this.fragmented_nalu.appendData(rawData.subarray(nal_start_idx));
            }
            if (is_end) {
                ret = this.fragmented_nalu;
                this.fragmented_nalu = null;
                return ret;
            }
        }
        return null;
    }

    onNALUFragment(rawData, dts, pts) {

        let data = new DataView(rawData.buffer, rawData.byteOffset, rawData.byteLength);

        let header = NALUAsm.parseNALHeader(data.getUint8(0));

        let nal_start_idx = 1;

        let unit = null;
        if (header.type > 0 && header.type < 24) {
            unit = this.parseSingleNALUPacket(rawData.subarray(nal_start_idx), header, dts, pts);
        } else if (NALU.FU_A ===  header.type || NALU.FU_B ===  header.type) {
            unit = this.parseFragmentationUnit(rawData.subarray(nal_start_idx), header, dts, pts);
        } else if (NALU.STAP_A === header.type || NALU.STAP_B === header.type) {
            return this.parseAggregationPacket(rawData.subarray(nal_start_idx), header, dts, pts);
        } else {
            /* 30 - 31 is undefined, ignore those (RFC3984). */
            Log.log('Undefined NAL unit, type: ' + header.type);
            return null;
        }
        if (unit) {
            return [unit];
        }
        return null;
    }
}
