import {BitArray} from '../util/binary.js';
import {PESAsm} from './pes.js';
import {PayloadType} from '../defs.js';

export class PESType {
    static get AAC() {return  0x0f;}  // ISO/IEC 13818-7 ADTS AAC (MPEG-2 lower bit-rate audio)
    static get ID3() {return  0x15;}  // Packetized metadata (ID3)
    static get H264() {return  0x1b;}  // ITU-T Rec. H.264 and ISO/IEC 14496-10 (lower bit-rate video)
}

export class TSParser {
    static get PACKET_LENGTH() {return  188;}

    constructor() {
        this.pmtParsed = false;
        this.pesParserTypes = new Map();
        this.pesParsers = new Map();
        this.pesAsms = {};
        this.ontracks = null;
        this.toSkip = 0;
    }

    addPesParser(pesType, constructor) {
        this.pesParserTypes.set(pesType, constructor);
    }

    parse(packet) {
        let bits = new BitArray(packet);
        if (packet[0] === 0x47) {
            bits.skipBits(9);
            let payStart = bits.readBits(1);
            bits.skipBits(1);
            let pid = bits.readBits(13);
            bits.skipBits(2);
            let adaptFlag = bits.readBits(1);
            let payFlag = bits.readBits(1);
            bits.skipBits(4);
            if (adaptFlag) {
                let adaptSize = bits.readBits(8);
                this.toSkip = bits.skipBits(adaptSize*8);
                if (bits.finished()) {
                    return;
                }
            }
            if (!payFlag) return;

            let payload = packet.subarray(bits.bytepos);//bitSlice(packet, bits.bitpos+bits.bytepos*8);

            if (this.pmtParsed && this.pesParsers.has(pid)) {
                let pes = this.pesAsms[pid].feed(payload, payStart);
                if (pes) {
                    return this.pesParsers.get(pid).parse(pes);
                }
            } else {
                if (pid === 0) {
                    this.pmtId = this.parsePAT(payload);
                } else if (pid === this.pmtId) {
                    this.parsePMT(payload);
                    this.pmtParsed = true;
                }
            }
        }
        return null;
    }

    parsePAT(data) {
        let bits = new BitArray(data);
        let ptr = bits.readBits(8);
        bits.skipBits(8*ptr+83);
        return bits.readBits(13);
    }

    parsePMT(data) {
        let bits = new BitArray(data);
        let ptr = bits.readBits(8);
        bits.skipBits(8*ptr + 8);
        bits.skipBits(6);
        let secLen = bits.readBits(10);
        bits.skipBits(62);
        let pil = bits.readBits(10);
        bits.skipBits(pil*8);

        let tracks = new Set();
        let readLen = secLen-13-pil;
        while (readLen>0) {
            let pesType = bits.readBits(8);
            bits.skipBits(3);
            let pid = bits.readBits(13);
            bits.skipBits(6);
            let il = bits.readBits(10);
            bits.skipBits(il*8);
            if ([PESType.AAC, PESType.H264].includes(pesType)) {
                if (this.pesParserTypes.has(pesType) && !this.pesParsers.has(pid)) {
                    this.pesParsers.set(pid, new (this.pesParserTypes.get(pesType)));
                    this.pesAsms[pid] = new PESAsm();
                    switch (pesType) {
                        case PESType.H264: tracks.add({type: PayloadType.H264, offset: 0});break;
                        case PESType.AAC: tracks.add({type: PayloadType.AAC, offset: 0});break;
                    }
                }
            }
            readLen -= 5+il;
        }
        // TODO: notify about tracks
        if (this.ontracks) {
            this.ontracks(tracks);
        }
    }
}