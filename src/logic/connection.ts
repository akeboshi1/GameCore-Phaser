// 网络连接器

import { PacketHandler, PBpacket, Buffer } from "net-socket-packet";

// 使用webworker启动socket，无webworker时直接启动socket
export class Connection {
    public isConnect: boolean = false;
    protected mPacketHandlers: PacketHandler[] = [];
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

    onData(data: ArrayBuffer) {
        const protobufPacket: PBpacket = new PBpacket();
        protobufPacket.Deserialization(new Buffer(data));
        const handlers = this.mPacketHandlers;
        handlers.forEach((handler: PacketHandler) => {
            handler.onPacketArrived(protobufPacket);
        });
    }
}
