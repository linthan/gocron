export class AACFrame {

    constructor(data, dts, pts) {
        this.dts = dts;
        this.pts = pts ? pts : this.dts;

        this.data=data;//.subarray(offset);
    }

    getData() {
        return this.data;
    }

    getSize() {
        return this.data.byteLength;
    }
}