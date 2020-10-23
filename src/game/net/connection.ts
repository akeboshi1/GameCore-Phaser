
import { PacketHandler, PBpacket, Buffer } from "net-socket-packet";
import * as protos from "pixelpai_proto";
import { MainPeer } from "../main.peer";
import { Logger } from "utils";
import { SocketConnection, IConnectListener, SocketConnectionError } from "../../../lib/net/socket";
import { ConnectionService } from "../../../lib/net/connection.service";
import { ServerAddress } from "../../../lib/net/address";

for (const key in protos) {
    PBpacket.addProtocol(protos[key]);
}

export class GameSocket extends SocketConnection {
    protected mUuid: number = 0;
    private _pause: boolean = false;
    private mainPeer: MainPeer;
    constructor(mainPeer: MainPeer, $listener: IConnectListener) {
        super($listener);
        this.mainPeer = mainPeer;
    }
    send(data: any): void {
        if (this._pause) return;
        const protobuf_packet: PBpacket = new PBpacket();
        protobuf_packet.Deserialization(new Buffer(data));
        protobuf_packet.header.uuid = this.mUuid || 0;
        super.send(protobuf_packet.Serialization());
        Logger.getInstance().info(`MainWorker[发送] >>> ${protobuf_packet.toString()}`);
    }
    protected onData(data: any) {
        if (this._pause) return;
        const protobuf_packet: PBpacket = new PBpacket();
        protobuf_packet.Deserialization(new Buffer(data));
        this.mUuid = protobuf_packet.header.uuid;
        Logger.getInstance().info(`MainWorker[接收] <<< ${protobuf_packet.toString()} `);
        // Send the packet to parent thread
        const buffer = protobuf_packet.Serialization();
        this.mainPeer.onData(buffer);
    }

    set pause(value: boolean) {
        this._pause = value;
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
    protected mPacketHandlers: PacketHandler[] = [];
    private mCachedServerAddress: ServerAddress | undefined;
    private mSocket: GameSocket;
    private isConnect: boolean = false;
    private isPause: boolean = false;
    constructor(socket: GameSocket) {
        this.mSocket = socket;
    }

    get pause(): boolean {
        return this.isPause;
    }

    get connect(): boolean {
        return this.isConnect;
    }

    startConnect(addr: ServerAddress, keepalive?: boolean): void {
        this.mCachedServerAddress = addr;
        this.mSocket.startConnect(this.mCachedServerAddress);
    }

    closeConnect(): void {
        this.isConnect = false;
        this.mCachedServerAddress = undefined;
        this.mSocket.stopConnect();
        this.clearPacketListeners();
    }

    addPacketListener(listener: PacketHandler) {
        this.mPacketHandlers.push(listener);
    }

    send(packet: PBpacket) {
        this.mSocket.send(packet.Serialization());
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
        const protobufPacket: PBpacket = new PBpacket();
        protobufPacket.Deserialization(new Buffer(data));
        const handlers = this.mPacketHandlers;
        handlers.forEach((handler: PacketHandler) => {
            handler.onPacketArrived(protobufPacket);
        });
    }

    onFocus() {
        this.isPause = false;
    }

    onBlur() {
        this.isPause = true;
    }
}
