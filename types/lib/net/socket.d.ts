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
export declare class SocketConnection {
    protected mTransport: WSWrapper;
    protected mServerAddr: ServerAddress;
    protected mConnectListener?: IConnectListener;
    protected isAuto: boolean;
    private isConnect;
    private closeConnectResolver;
    constructor($listener: IConnectListener);
    set state(val: boolean);
    startConnect(addr: ServerAddress): void;
    stopConnect(): Promise<any>;
    send(data: any): void;
    destroy(): void;
    protected onConnected(): void;
    protected onData(data: any): void;
    private doConnect;
}
