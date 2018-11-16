import {IConnectListener} from "./IConnectListener";
import {WS} from "./transport/websocket";

export interface ServerAddress {
    readonly host: string;
    readonly port: number;
}

export class SocketConnectionError extends Error {
    name = "SocketConnectionError";

    constructor(reason: any) {
        super(`SocketConnectionError: ${JSON.stringify(reason)}`);
        this.stack = new Error().stack;
    }
}

export class SocketConnection {
    private mTransport: WS;
    private mServerAddr: ServerAddress = {host: "localhost", port: 80};
    private mConnectListener?: IConnectListener;

    constructor() {
        this.mTransport = new WS();
    }

    public set connectListener(listener: IConnectListener) {
        this.mConnectListener = listener;

        // add connection event to listener
        if (typeof this.mTransport !== "undefined" && typeof this.mConnectListener !== "undefined") {
            let listener: IConnectListener = this.mConnectListener;
            this.mTransport.on("open", () => {
                listener.onConnected(this);
                this.onConnected();
            });
            this.mTransport.on("close", () => {
                listener.onDisConnected(this);
            });
            this.mTransport.on("error", reason => {
                listener.onError(reason);
            });
        }
    }

    protected onConnected() {
        if (typeof this.mTransport !== "undefined") {
            this.mTransport.on("packet", this.onData);
        }
    }

    protected onData(data: any) {
        // TODO
        console.debug(`${data}`);
    }

    startConnect(addr: ServerAddress): void {
        this.mServerAddr = addr;
        this._connect();
    }

    stopConnect(): void {
        if (typeof this.mTransport !== "undefined") {
            this.mTransport.Close();
        }
    }

    private _connect() {
        if (typeof this.mTransport !== "undefined") {
            this.mTransport.Open(this.mServerAddr.host, this.mServerAddr.port);
        }
    }

    send(data: any): void {
        if (typeof this.mTransport !== "undefined") {
            this.mTransport.Send(data);
        }
    }

    //Frees all resources for garbage collection.
    destroy(): void {
        if (typeof this.mTransport !== "undefined") {
            this.mTransport.destroy();
        }
    }
}