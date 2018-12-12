import {BitArray, bitSlice} from '../util/binary.js';

export class AACParser {
    static get SampleRates() {return  [
        96000, 88200,
        64000, 48000,
        44100, 32000,
        24000, 22050,
        16000, 12000,
        11025, 8000,
        7350];}

    // static Profile = [
    //     0: Null
    //     1: AAC Main
    //     2: AAC LC (Low Complexity)
    //     3: AAC SSR (Scalable Sample Rate)
    //     4: AAC LTP (Long Term Prediction)
    //     5: SBR (Spectral Band Replication)
    //     6: AAC Scalable
    // ]

    static parseAudioSpecificConfig(bytesOrBits) {
        let config;
        if (bytesOrBits.byteLength) { // is byteArray
            config = new BitArray(bytesOrBits);
        } else {
            config = bytesOrBits;
        }

        let bitpos = config.bitpos+(config.src.byteOffset+config.bytepos)*8;
        let prof = config.readBits(5);
        this.codec = `mp4a.40.${prof}`;
        let sfi = config.readBits(4);
        if (sfi == 0xf) config.skipBits(24);
        let channels = config.readBits(4);

        return {
            config: bitSlice(new Uint8Array(config.src.buffer), bitpos, bitpos+16),
            codec: `mp4a.40.${prof}`,
            samplerate: AACParser.SampleRates[sfi],
            channels: channels
        }
    }

    static parseStreamMuxConfig(bytes) {
        // ISO_IEC_14496-3 Part 3 Audio. StreamMuxConfig
        let config = new BitArray(bytes);

        if (!config.readBits(1)) {
            config.skipBits(14);
            return AACParser.parseAudioSpecificConfig(config);
        }
    }
}
