import {ServerAddress} from "./address";
import {WSWrapper} from "./transport/websocket";

export interface IConnectListener {
    onConnected(connection?: SocketConnection): void;

    onDisConnected(connection?: SocketConnection): void;

    onError(reason: SocketConnectionError | undefined): void;
}

export class SocketConnectionError extends Error {
    name = "SocketConnectionError";

    constructor(reason: any) {
        super(`SocketConnectionError: ${JSON.stringify(reason)}`);
        this.stack = new Error().stack;
    }
}

export class SocketConnection {
    protected mTransport: WSWrapper;
    protected mServerAddr: ServerAddress = {host: "localhost", port: 80};
    protected mConnectListener?: IConnectListener;

    constructor(listener: IConnectListener) {
        this.mTransport = new WSWrapper();
        this.mConnectListener = listener;

        // add connection event to listener
        if (typeof this.mTransport !== "undefined" && typeof this.mConnectListener !== "undefined") {
            let listener: IConnectListener = this.mConnectListener;
            this.mTransport.on("open", () => {
                console.info(`SocketConnection ready.`);
                listener.onConnected(this);
                this.onConnected();
            });
            this.mTransport.on("close", () => {
                console.info(`SocketConnection close.`);
                listener.onDisConnected(this);
            });
            this.mTransport.on("error", reason => {
                console.info(`SocketConnection error.`);
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
        // do nothing.
    }

    startConnect(addr: ServerAddress): void {
        this.mServerAddr = addr;
        this.doConnect();
    }

    stopConnect(): void {
        if (typeof this.mTransport !== "undefined") {
            this.mTransport.Close();
        }
    }

    private doConnect() {
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
