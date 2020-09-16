
import { PacketHandler, PBpacket } from "net-socket-packet";
import { Buffer } from "buffer/";
import * as protos from "pixelpai_proto";
import { ConnectionService } from "../../lib/net/connection.service";
import { IConnectListener } from "../../lib/net/socket";
import { ServerAddress } from "../../lib/net/address";
import { WorkerClient } from "./worker.client";

for (const key in protos) {
    PBpacket.addProtocol(protos[key]);
}
// 网络连接器
// 使用webworker启动socket，无webworker时直接启动socket
export default class Connection implements ConnectionService {
    protected mPacketHandlers: PacketHandler[] = [];
    private mCachedServerAddress: ServerAddress | undefined;
    private mSocket: WorkerClient;
    private isConnect: boolean = false;
    private isPause: boolean = false;
    constructor(socket: WorkerClient) {
        this.mSocket = socket;
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

    private reConnect() {
        this.mMainWorker.postMessage({ method: "endHeartBeat" });
        const world: any = this.mPacketHandlers[0];
        world.reconnect();
    }
}
