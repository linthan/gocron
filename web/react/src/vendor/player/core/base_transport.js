import {EventEmitter} from "../deps/bp_event.js";

export class BaseRequest {
    constructor(data) {
        this.data = data;
        this.before = (data)=>{return Promise.resolve(data)};
    }

    send() {
        return this.before(this.data);
    }

    before(fn) {
        return Promise.resolve
    }
}

export class BaseTransport {
    constructor(endpoint, stream_type, config={}) {
        this.stream_type = stream_type;
        this.endpoint = endpoint;
        this.eventSource = new EventEmitter();
        this.dataQueue = [];
    }

    static canTransfer(stream_type) {
        return BaseTransport.streamTypes().includes(stream_type);
    }
    
    static streamTypes() {
        return [];
    }

    destroy() {
        this.eventSource.destroy();
    }

    connect() {
        // TO be impemented
    }

    disconnect() {
        // TO be impemented
    }

    reconnect() {
        return this.disconnect().then(()=>{
            return this.connect();
        });
    }

    setEndpoint(endpoint) {
        this.endpoint = endpoint;
        return this.reconnect();
    }

    send(data) {
        // TO be impemented
        // return this.prepare(data).send();
    }

    prepare(data) {
        // TO be impemented
        // return new Request(data);
    }

    // onData(type, data) {
    //     this.eventSource.dispatchEvent(type, data);
    // }
}