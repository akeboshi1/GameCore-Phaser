import {ServerAddress} from "./address";
import {WSWrapper} from "./transport/websocket";
import { Logger } from "../utils/log";

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

// 实际工作在Web-Worker内的WebSocket客户端
export class SocketConnection {
    protected mTransport: WSWrapper;
    protected mServerAddr: ServerAddress = {host: "localhost", port: 80};
    protected mConnectListener?: IConnectListener;

    constructor($listener: IConnectListener) {
        this.mTransport = new WSWrapper();
        this.mConnectListener = $listener;

        // add connection event to listener
        if (typeof this.mTransport !== "undefined" && typeof this.mConnectListener !== "undefined") {
            const listener: IConnectListener = this.mConnectListener;
            this.mTransport.on("open", () => {
                Logger.info(`SocketConnection ready.[${this.mServerAddr.host}:${this.mServerAddr.port}]`);
                listener.onConnected(this);
                this.onConnected();
            });
            this.mTransport.on("close", () => {
                Logger.info(`SocketConnection close.`);
                listener.onDisConnected(this);
            });
            this.mTransport.on("error", (reason: SocketConnectionError) => {
                Logger.info(`SocketConnection error.`);
                listener.onError(reason);
            });
        }
    }

    startConnect(addr: ServerAddress): void {
        this.mServerAddr = addr;
        this.doConnect();
    }

    stopConnect(): void {
        // TODO Maybe not necessary.
    }

    send(data: any): void {
        if (!this.mTransport) {
            return Logger.error(`Empty transport.`);
        }
        this.mTransport.Send(data);
    }

    // Frees all resources for garbage collection.
    destroy(): void {
        if (this.mTransport) {
            this.mTransport.destroy();
        }
    }

    protected onConnected() {
        if (!this.mTransport) {
            return Logger.error(`Empty transport.`);
        }
        this.mTransport.on("packet", this.onData);
    }

    protected onData(data: any) {
        // do nothing.
        // override by subclass.
    }

    private doConnect() {
        if (!this.mTransport) {
            return Logger.error(`Empty transport.`);
        }
        if (this.mServerAddr.secure !== undefined) this.mTransport.secure = this.mServerAddr.secure;
        this.mTransport.Open(this.mServerAddr.host, this.mServerAddr.port);
    }
}
