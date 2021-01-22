
import { PacketHandler, PBpacket, Buffer } from "net-socket-packet";
import * as protos from "pixelpai_proto";
import { MainPeer } from "../main.peer";
import { Logger } from "utils";
import { SocketConnection, IConnectListener, SocketConnectionError } from "../../../lib/net/socket";
import { ConnectionService } from "../../../lib/net/connection.service";
import { ServerAddress } from "../../../lib/net/address";
import { Clock } from "../loop/clock/clock";

for (const key in protos) {
    PBpacket.addProtocol(protos[key]);
}

export class GameSocket extends SocketConnection {
    private mainPeer: MainPeer;
    // private socketList: any[];
    // private mTimestamp: number;
    constructor(mainPeer: MainPeer, $listener: IConnectListener) {
        super($listener);
        this.mainPeer = mainPeer;
        // this.socketList = [];
    }

    send(data: any): void {
        super.send(data);
    }
    protected onData(data: any) {
        this.mainPeer.onData(data);
    }
}

export class ConnListener implements IConnectListener {
    private mainPeer: MainPeer;
    constructor(peer: MainPeer) {
        this.mainPeer = peer;
    }
    onConnected(): void {
        this.mainPeer.onConnected();
        Logger.getInstance().info(`MainWorker[已连接]`);
    }

    onDisConnected(): void {
        this.mainPeer.onDisConnected();
        Logger.getInstance().info(`MainWorker[已断开]`);
    }

    onRefreshConnect() {
        this.mainPeer.reconnect();
        Logger.getInstance().info(`MainWorker[正在刷新链接]`);
    }

    // reason: SocketConnectionError | undefined
    onError(reason: SocketConnectionError | undefined): void {
        if (reason) {
            this.mainPeer.onConnectError(reason.message);
            Logger.getInstance().error(`MainWorker[错误]:${reason.message}`);
        } else {
            Logger.getInstance().error(`MainWorker[错误]:${reason}`);
        }
    }
}

// 网络连接器
// 使用webworker启动socket，无webworker时直接启动socket
export class Connection implements ConnectionService {
    // 数据缓存队列
    protected mCache: any[] = [];
    /**
     * 客户端向服务端表明的socket session的唯一标识
     */
    protected mUuid: number = 0;
    protected mPacketHandlers: PacketHandler[] = [];
    private mCachedServerAddress: ServerAddress | undefined;
    private mSocket: GameSocket;
    private isConnect: boolean = false;
    private isPause: boolean = false;
    private mClock: Clock;
    private mPeer: MainPeer;
    constructor(peer: MainPeer) {
        this.mPeer = peer;
    }

    update() {
    }

    get pause(): boolean {
        return this.isPause;
    }

    get connect(): boolean {
        return this.isConnect;
    }

    set connect(val) {
        this.isConnect = val;
    }

    get socket(): SocketConnection {
        return this.mSocket;
    }

    startConnect(addr: ServerAddress, keepalive?: boolean): void {
        this.mCachedServerAddress = addr;
        if (!this.mSocket) {
            this.mSocket = new GameSocket(this.mPeer, new ConnListener(this.mPeer));
        }
        this.mSocket.startConnect(this.mCachedServerAddress);
    }

    closeConnect(): void {
        this.isConnect = false;
        this.mCachedServerAddress = undefined;
        if (this.mSocket) {
            this.mSocket.stopConnect();
            this.mSocket.destroy();
            this.mSocket = null;
        }
        this.clearPacketListeners();
    }

    setClock(clock: Clock) {
        this.mClock = clock;
    }

    addPacketListener(listener: PacketHandler) {
        const idx: number = this.mPacketHandlers.indexOf(listener);
        if (idx !== -1) return;
        this.mPacketHandlers.push(listener);
    }

    send(packet: PBpacket) {
        // if (this.isPause) return;
        packet.header.timestamp = this.mClock ? this.mClock.unixTime : 0;
        packet.header.uuid = this.mUuid || 0;
        this.mSocket.send(packet.Serialization());
        Logger.getInstance().info(`MainWorker[发送] >>> ${packet.toString()}`);
    }

    removePacketListener(listener: PacketHandler) {
        const idx: number = this.mPacketHandlers.indexOf(listener);
        if (idx !== -1) {
            this.mPacketHandlers.splice(idx, 1);
        }
    }

    clearPacketListeners() {
        if (!this.mPacketHandlers || this.mPacketHandlers.length < 1) {
            return;
        }
        const len: number = this.mPacketHandlers.length;
        for (let i: number = 0; i < len; i++) {
            const listener: PacketHandler = this.mPacketHandlers[i];
            if (!listener) continue;
            this.removePacketListener(listener);
            i--;
        }
    }

    onData(data: ArrayBuffer) {
        const protobuf_packet = PBpacket.Create(data);
        this.mUuid = protobuf_packet.header.uuid;
        Logger.getInstance().info(`MainWorker[接收] <<< ${protobuf_packet.toString()} `);
        const handlers = this.mPacketHandlers;
        handlers.forEach((handler: PacketHandler) => {
            handler.onPacketArrived(protobuf_packet);
        });
    }

    onFocus() {
        this.isPause = false;
    }

    onBlur() {
        this.isPause = true;
    }
}
