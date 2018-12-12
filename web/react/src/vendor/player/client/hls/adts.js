import {BitArray} from '../../core/util/binary.js';
import {AACParser} from '../../core/parsers/aac.js';

export class ADTS {

    static parseHeader(data) {
        let bits = new BitArray(data);
        bits.skipBits(15);
        let protectionAbs = bits.readBits(1);
        bits.skipBits(14);
        let len = bits.readBits(13);
        bits.skipBits(11);
        let cnt = bits.readBits(2);
        if (!protectionAbs) {
            bits.skipBits(16);
        }
        return {size: len-bits.bytepos, frameCount: cnt, offset: bits.bytepos}
    }

    static parseHeaderConfig(data) {
        let bits = new BitArray(data);
        bits.skipBits(15);
        let protectionAbs = bits.readBits(1);
        let profile = bits.readBits(2) + 1;
        let freq = bits.readBits(4);
        bits.skipBits(1);
        let channels = bits.readBits(3);
        bits.skipBits(4);
        let len = bits.readBits(13);
        bits.skipBits(11);
        let cnt = bits.readBits(2);
        if (!protectionAbs) {
            bits.skipBits(16);
        }

        let userAgent = navigator.userAgent.toLowerCase();
        let configLen = 4;
        let extSamplingIdx;

        // firefox: freq less than 24kHz = AAC SBR (HE-AAC)
        if (userAgent.indexOf('firefox') !== -1) {
            if (freq >= 6) {
                profile = 5;
                configLen = 4;
                // HE-AAC uses SBR (Spectral Band Replication) , high frequencies are constructed from low frequencies
                // there is a factor 2 between frame sample rate and output sample rate
                // multiply frequency by 2 (see table below, equivalent to substract 3)
                extSamplingIdx = freq - 3;
            } else {
                profile = 2;
                configLen = 2;
                extSamplingIdx = freq;
            }
            // Android : always use AAC
        } else if (userAgent.indexOf('android') !== -1) {
            profile = 2;
            configLen = 2;
            extSamplingIdx = freq;
        } else {
            /*  for other browsers (chrome ...)
             always force audio type to be HE-AAC SBR, as some browsers do not support audio codec switch properly (like Chrome ...)
             */
            profile = 5;
            configLen = 4;
            // if (manifest codec is HE-AAC or HE-AACv2) OR (manifest codec not specified AND frequency less than 24kHz)
            if (freq >= 6) {
                // HE-AAC uses SBR (Spectral Band Replication) , high frequencies are constructed from low frequencies
                // there is a factor 2 between frame sample rate and output sample rate
                // multiply frequency by 2 (see table below, equivalent to substract 3)
                extSamplingIdx = freq - 3;
            } else {
                // if (manifest codec is AAC) AND (frequency less than 24kHz OR nb channel is 1) OR (manifest codec not specified and mono audio)
                // Chrome fails to play back with AAC LC mono when initialized with HE-AAC.  This is not a problem with stereo.
                if (channels === 1) {
                    profile = 2;
                    configLen = 2;
                }
                extSamplingIdx = freq;
            }
        }


        let config = new Uint8Array(configLen);

        config[0] = profile << 3;
        // samplingFrequencyIndex
        config[0] |= (freq & 0x0E) >> 1;
        config[1] |= (freq & 0x01) << 7;
        // channelConfiguration
        config[1] |= channels << 3;
        if (profile === 5) {
            // adtsExtensionSampleingIndex
            config[1] |= (extSamplingIdx & 0x0E) >> 1;
            config[2] = (extSamplingIdx & 0x01) << 7;
            // adtsObjectType (force to 2, chrome is checking that object type is less than 5 ???
            //    https://chromium.googlesource.com/chromium/src.git/+/master/media/formats/mp4/aac.cc
            config[2] |= 2 << 2;
            config[3] = 0;
        }
        return {
            config: {
                config: config,
                codec: `mp4a.40.${profile}`,
                samplerate: AACParser.SampleRates[freq],
                channels: channels,
            },
            size: len-bits.bytepos,
            frameCount: cnt,
            offset: bits.bytepos
        };
    }
}