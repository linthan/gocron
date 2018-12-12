import {NALUAsm} from "../../../../core/elementary/NALUAsm.js";
import {AACAsm} from "../../../../core/elementary/AACAsm.js";

export class RTPPayloadParser {

    constructor() {
        this.h264parser = new RTPH264Parser();
        this.aacparser = new RTPAACParser();
    }

    parse(rtp) {
        if (rtp.media.type=='video') {
            return this.h264parser.parse(rtp);
        } else if (rtp.media.type == 'audio') {
            return this.aacparser.parse(rtp);
        }
        return null;
    }
}

class RTPH264Parser {
    constructor() {
        this.naluasm = new NALUAsm();
    }

    parse(rtp) {
        return this.naluasm.onNALUFragment(rtp.getPayload(), rtp.getTimestampMS());
    }
}

class RTPAACParser {

    constructor() {
        this.scale = 1;
        this.asm = new AACAsm();
    }

    setConfig(conf) {
        this.asm.config = conf;
    }

    parse(rtp) {
        return this.asm.onAACFragment(rtp);
    }
}