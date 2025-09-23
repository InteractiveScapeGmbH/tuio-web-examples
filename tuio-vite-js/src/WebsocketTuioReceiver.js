import OSC from "osc-js";
import { TuioReceiver } from "tuio-client";

export class WebsocketTuioReceiver extends TuioReceiver {
    _host;
    _port;
    _osc;
    constructor(host, port) {
        super();
        this._host = host;
        this._port = port;
        const plugin = new OSC.WebsocketClientPlugin({host: this._host, port: this._port});
        this._osc = new OSC({plugin: plugin});
        this._osc.on("*", (message) => this.onOscMessage(message));
    }

    connect() {
        this._osc.open();
        this.isConnected = true;
    }

    disconnect() {
        this._osc.close();
        this.isConnected = false;
    }
}

