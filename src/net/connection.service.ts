import { ServerAddress } from "./address";
import { PacketHandler, PBpacket } from "net-socket-packet";

export interface ConnectionService {
    startConnect(addr: ServerAddress, keepalive?: boolean): void;

    closeConnect(): void;

    clearHeartBeat();

    addPacketListener(listener: PacketHandler): void;
    removePacketListener(listener: PacketHandler): void;
    clearPacketListeners(): void;

    send(packet: PBpacket): void;
}
