import { ServerAddress } from "./address";
import { WSWrapper, ReadyState } from "./transport/websocket";
import { Logger } from "../../src/utils/log";
export interface IConnectListener {
    onConnected(connection?: SocketConnection): void;

    // onReconnect(connection?: SocketConnection): void;

    onDisConnected(connection?: SocketConnection): void;

    onError(reason?: SocketConnectionError | undefined): void;
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
    protected mServerAddr: ServerAddress = { host: "localhost", port: 80 };
    protected mConnectListener?: IConnectListener;
    private isConnect: boolean = false;
    constructor($listener: IConnectListener) {
        this.mTransport = new WSWrapper();
        this.mConnectListener = $listener;
        Logger.getInstance().info(`SocketConnection init.`);
        // add connection event to listener
        if (typeof this.mTransport !== "undefined" && typeof this.mConnectListener !== "undefined") {
            const listener: IConnectListener = this.mConnectListener;
            this.mTransport.on("open", () => {
                Logger.getInstance().info(`SocketConnection ready.[${this.mServerAddr.host}:${this.mServerAddr.port}]`);
                listener.onConnected(this);
                this.onConnected();
                this.isConnect = true;
            });
            this.mTransport.on("close", () => {
                Logger.getInstance().info(`SocketConnection close.`);
                listener.onDisConnected(this);
                this.isConnect = false;
            });
            this.mTransport.on("error", (reason: SocketConnectionError) => {
                Logger.getInstance().info(`SocketConnection error.`);
                if (this.isConnect) listener.onError(reason);
            });
        }
    }

    startConnect(addr: ServerAddress): void {
        this.mServerAddr = addr;
        this.doConnect();
    }

    stopConnect(): void {
        if (this.mTransport && this.mTransport.readyState() === ReadyState.OPEN) return this.mTransport.Close();
    }

    send(data: any): void {
        if (!this.mTransport) {
            return Logger.getInstance().error(`Empty transport.`);
        }
        this.mTransport.Send(data);
    }

    // Frees all resources for garbage collection.
    destroy(): void {
        Logger.getInstance().log("socket close");
        if (this.mTransport) {
            this.mTransport.destroy();
        }
    }

    protected onConnected() {
        if (!this.mTransport) {
            return Logger.getInstance().error(`Empty transport.`);
        }
        this.mTransport.on("packet", this.onData);
    }

    protected onData(data: any) {
        // do nothing.
        // override by subclass.
    }

    private doConnect() {
        if (!this.mTransport) {
            return Logger.getInstance().error(`Empty transport.`);
        }
        if (this.mTransport.readyState() === ReadyState.OPEN) return this.mTransport.Close();
        if (this.mServerAddr.secure !== undefined) this.mTransport.secure = this.mServerAddr.secure;
        this.mTransport.Open(this.mServerAddr.host, this.mServerAddr.port);
    }
}
