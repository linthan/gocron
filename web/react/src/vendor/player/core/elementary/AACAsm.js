import {AACFrame} from './AACFrame.js';
import {BitArray} from '../util/binary';
// import {AACParser} from "../parsers/aac.js";
// TODO: asm.js
export class AACAsm {
    constructor() {
        this.config = null;
    }

    onAACFragment(pkt) {
        let rawData = pkt.getPayload();
        if (!pkt.media) {
            return null;
        }
        let data = new DataView(rawData.buffer, rawData.byteOffset, rawData.byteLength);

        let sizeLength = Number(pkt.media.fmtp['sizelength'] || 0);
        let indexLength = Number(pkt.media.fmtp['indexlength'] || 0);
        let indexDeltaLength = Number(pkt.media.fmtp['indexdeltalength'] || 0);
        let CTSDeltaLength = Number(pkt.media.fmtp['ctsdeltalength'] || 0);
        let DTSDeltaLength = Number(pkt.media.fmtp['dtsdeltalength'] || 0);
        let RandomAccessIndication = Number(pkt.media.fmtp['randomaccessindication'] || 0);
        let StreamStateIndication = Number(pkt.media.fmtp['streamstateindication'] || 0);
        let AuxiliaryDataSizeLength = Number(pkt.media.fmtp['auxiliarydatasizelength'] || 0);

        let configHeaderLength =
            sizeLength + Math.max(indexLength, indexDeltaLength) + CTSDeltaLength + DTSDeltaLength +
            RandomAccessIndication + StreamStateIndication + AuxiliaryDataSizeLength;


        let auHeadersLengthPadded = 0;
        let offset = 0;
        let ts = (Math.round(pkt.getTimestampMS()/1024) << 10) * 90000 / this.config.samplerate;
        if (0 !== configHeaderLength) {
            /* The AU header section is not empty, read it from payload */
            let auHeadersLengthInBits = data.getUint16(0); // Always 2 octets, without padding
            auHeadersLengthPadded = 2 + (auHeadersLengthInBits>>>3) + ((auHeadersLengthInBits & 0x7)?1:0); // Add padding

            //this.config = AACParser.parseAudioSpecificConfig(new Uint8Array(rawData, 0 , auHeadersLengthPadded));
            // TODO: parse config
            let frames = [];
            let frameOffset=0;
            let bits = new BitArray(rawData.subarray(2 + offset));
            let cts = 0;
            let dts = 0;
            for (let offset=0; offset<auHeadersLengthInBits;) {
                let size = bits.readBits(sizeLength);
                let idx = bits.readBits(offset?indexDeltaLength:indexLength);
                offset+=sizeLength+(offset?indexDeltaLength:indexLength)/*+2*/;
                if (/*ctsPresent &&*/ CTSDeltaLength) {
                    let ctsPresent = bits.readBits(1);
                    cts = bits.readBits(CTSDeltaLength);
                    offset+=CTSDeltaLength;
                }
                if (/*dtsPresent && */DTSDeltaLength) {
                    let dtsPresent = bits.readBits(1);
                    dts = bits.readBits(DTSDeltaLength);
                    offset+=CTSDeltaLength;
                }
                if (RandomAccessIndication) {
                    bits.skipBits(1);
                    offset+=1;
                }
                if (StreamStateIndication) {
                    bits.skipBits(StreamStateIndication);
                    offset+=StreamStateIndication;
                }
                frames.push(new AACFrame(rawData.subarray(auHeadersLengthPadded + frameOffset, auHeadersLengthPadded + frameOffset + size), ts+dts, ts+cts));
                frameOffset+=size;
            }
            return frames;
        } else {
            let aacData = rawData.subarray(auHeadersLengthPadded);
            while (true) {
                if (aacData[offset] !=255) break;
                ++offset;
            }
            ++offset;
            return [new AACFrame(rawData.subarray(auHeadersLengthPadded+offset), ts)];
        }
    }
}