import { ServerAddress } from "./address";
import { WSWrapper } from "./transport/websocket";
export interface IConnectListener {
    onConnected(isAuto?: boolean): void;
    onRefreshConnect(isAuto?: boolean): void;
    onDisConnected(isAuto?: boolean): void;
    onError(reason?: SocketConnectionError | undefined, isAuto?: boolean): void;
}
export declare class SocketConnectionError extends Error {
    name: string;
    constructor(reason: any);
}
export declare enum SocketState {
    closed = 0,
    closeing = 1,
    link = 2
}
export declare class SocketConnection {
    protected mTransport: WSWrapper;
    protected mServerAddr: ServerAddress;
    protected mConnectListener?: IConnectListener;
    protected isAuto: boolean;
    private mConnectState;
    private mCloseBack;
    constructor($listener: IConnectListener);
    set state(val: boolean);
    /**
     * 0: 已经关闭
     * 1: 正在关闭
     * 2: 链接
     */
    get socketState(): number;
    startConnect(addr: ServerAddress): void;
    stopConnect(closeBack?: any): void;
    send(data: any): void;
    destroy(): void;
    protected onConnected(): void;
    protected onData(data: any): void;
    private doConnect;
}
