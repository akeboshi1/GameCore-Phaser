import { ValueResolver } from "../promise";
import { ServerAddress } from "./address";
import { WSWrapper, ReadyState } from "./transport/websocket";
export interface IConnectListener {
    onConnected(isAuto?: boolean): void;

    onRefreshConnect(isAuto?: boolean): void;

    onDisConnected(isAuto?: boolean): void;

    onError(reason?: SocketConnectionError | undefined, isAuto?: boolean): void;
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
    // true是外部断网，false是手动断网
    protected isAuto: boolean = true;
    private isConnect: boolean = false;
    private closeConnectResolver: ValueResolver<any> = null;
    constructor($listener: IConnectListener) {
        this.mTransport = new WSWrapper();
        this.mConnectListener = $listener;
        // tslint:disable-next-line:no-console
        console.info(`SocketConnection init.`);
        // add connection event to listener
        if (typeof this.mTransport !== "undefined" && typeof this.mConnectListener !== "undefined") {
            const listener: IConnectListener = this.mConnectListener;
            this.mTransport.on("open", () => {
                // tslint:disable-next-line:no-console
                console.info(`SocketConnection ready.[${this.mServerAddr.host}:${this.mServerAddr.port}]`);
                listener.onConnected(this.isAuto);
                this.onConnected();
                this.isConnect = true;
                this.isAuto = true;
            });
            this.mTransport.on("close", () => {
                // tslint:disable-next-line:no-console
                console.info(`SocketConnection close.`);
                listener.onDisConnected(this.isAuto);
                this.isConnect = false;
                if (this.closeConnectResolver) {
                    this.closeConnectResolver.resolve(null);
                    this.closeConnectResolver = null;
                }
            });
            this.mTransport.on("error", (reason: SocketConnectionError) => {
                // tslint:disable-next-line:no-console
                console.info(`SocketConnection error.`);
                if (this.isConnect) listener.onError(reason);
            });
        }
    }

    get connectState(): boolean {
        return this.isConnect;
    }

    set state(val: boolean) {
        this.isAuto = val;
    }

    startConnect(addr: ServerAddress): void {
        this.mServerAddr = addr;
        this.doConnect();
    }

    stopConnect(): Promise<any> {
        if (this.closeConnectResolver) {
            this.closeConnectResolver.reject("called <stopConnect> again");
            this.closeConnectResolver = null;
        }
        this.closeConnectResolver = ValueResolver.create<any>();
        return this.closeConnectResolver.promise(() => {
            if (this.mTransport && this.mTransport.readyState() === ReadyState.OPEN) this.mTransport.Close();
        });
    }

    send(data: any): void {
        if (!this.mTransport) {
            // tslint:disable-next-line:no-console
            return console.error(`Empty transport.`);
        }
        this.mTransport.Send(data);
    }

    // Frees all resources for garbage collection.
    destroy(): void {
        // tslint:disable-next-line:no-console
        console.debug("socket close");
        if (this.mTransport) {
            this.mTransport.destroy();
        }
    }

    protected onConnected() {
        if (!this.mTransport) {
            // tslint:disable-next-line:no-console
            return console.error(`Empty transport.`);
        }
        this.mTransport.on("packet", this.onData.bind(this));
    }

    protected onData(data: any) {
        // do nothing.
        // override by subclass.
    }

    private doConnect() {
        if (!this.mTransport) {
            // tslint:disable-next-line:no-console
            return console.error(`Empty transport.`);
        }
        if (this.mTransport.readyState() === ReadyState.OPEN) return this.mTransport.Close();
        if (this.mServerAddr.secure !== undefined) this.mTransport.secure = this.mServerAddr.secure;
        this.mTransport.Open(this.mServerAddr.host, this.mServerAddr.port);
    }
}
