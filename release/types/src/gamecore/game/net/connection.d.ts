import { PacketHandler, PBpacket } from "net-socket-packet";
import { MainPeer } from "../main.peer";
import { SocketConnection, IConnectListener, SocketConnectionError, ConnectionService, ServerAddress } from "structure";
import { Clock } from "../loop/clock/clock";
export declare class GameSocket extends SocketConnection {
    private mainPeer;
    constructor(mainPeer: MainPeer, $listener: IConnectListener);
    set state(val: boolean);
    send(data: any): void;
    protected onData(data: any): void;
}
export declare class ConnListener implements IConnectListener {
    private mainPeer;
    constructor(peer: MainPeer);
    onConnected(isAuto?: boolean): void;
    onDisConnected(isAuto?: boolean): void;
    onRefreshConnect(isAuto?: boolean): void;
    onError(reason: SocketConnectionError | undefined): void;
}
export declare class Connection implements ConnectionService {
    protected mCache: any[];
    /**
     * 客户端向服务端表明的socket session的唯一标识
     */
    protected mUuid: number;
    protected mPacketHandlers: PacketHandler[];
    private mCachedServerAddress;
    private mSocket;
    private isConnectState;
    private isPause;
    private mClock;
    private mPeer;
    private gateway;
    constructor(peer: MainPeer);
    update(): void;
    get pause(): boolean;
    get connect(): number;
    set connect(val: number);
    get socket(): SocketConnection;
    startConnect(addr: ServerAddress, keepalive?: boolean): void;
    closeConnect(callBack?: Function): void;
    closeBack(callBack?: Function): void;
    setClock(clock: Clock): void;
    addPacketListener(listener: PacketHandler): void;
    send(packet: PBpacket): void;
    removePacketListener(listener: PacketHandler): void;
    clearPacketListeners(): void;
    onData(data: ArrayBuffer): void;
    onFocus(): void;
    onBlur(): void;
}
