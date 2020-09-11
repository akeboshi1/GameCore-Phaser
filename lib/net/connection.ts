import { ConnectionService } from "./connection.service";
import { ServerAddress } from "./address";
import { PacketHandler, PBpacket } from "net-socket-packet";
import { IConnectListener } from "./socket";
import { Buffer } from "buffer/";
import * as protos from "pixelpai_proto";

for (const key in protos) {
    PBpacket.addProtocol(protos[key]);
}
// 网络连接器
// 使用webworker启动socket，无webworker时直接启动socket
export default class Connection implements ConnectionService {
    public connect: boolean = false;
    protected mPacketHandlers: PacketHandler[] = [];
    private mListener: IConnectListener;
    private mCachedServerAddress: ServerAddress | undefined;
    private mConnect: boolean = false;
    constructor(listener: IConnectListener) {
        this.mListener = listener;
    }
    startConnect(addr: ServerAddress, keepalive?: boolean): void {
        this.mCachedServerAddress = addr;
        (<any>this.mListener).render.startConnect(this.mCachedServerAddress);
    }

    closeConnect(): void {
        (<any>this.mListener).render.terminate();
        this.mCachedServerAddress = undefined;
        this.clearPacketListeners();
    }

    addPacketListener(listener: PacketHandler) {
        this.mPacketHandlers.push(listener);
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
    send(packet: PBpacket) {
        (<any>this.mListener).render.send(packet);
    }

    onData(data: ArrayBuffer) {
        const protobufPacket: PBpacket = new PBpacket();
        protobufPacket.Deserialization(new Buffer(data));
        const handlers = this.mPacketHandlers;
        handlers.forEach((handler: PacketHandler) => {
            handler.onPacketArrived(protobufPacket);
        });
    }
}
