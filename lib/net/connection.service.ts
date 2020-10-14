import { PacketHandler, PBpacket } from "net-socket-packet";
import { ServerAddress } from "./address";

export interface ConnectionService {
<<<<<<< HEAD:lib/net/connection.service.ts
    connect: boolean;
    pause: boolean;
    startConnect(addr: ServerAddress, keepalive?: boolean);
    closeConnect(): void;
=======
    isConnect: boolean;
    startConnect(addr: ServerAddress, keepalive?: boolean): void;
    onFocus();
    onBlur();
    move(point, any);
    closeConnect(): void;
    loadRes(path: string);
    clearHeartBeat();
>>>>>>> dev:src/net/connection.service.ts
    addPacketListener(listener: PacketHandler): void;
    removePacketListener(listener: PacketHandler): void;
    clearPacketListeners(): void;
    send(packet: PBpacket): void;
    onData(data: ArrayBuffer);
    onFocus();
    onBlur();
}
