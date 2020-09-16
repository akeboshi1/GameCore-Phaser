import { PacketHandler, PBpacket } from "net-socket-packet";
import { ServerAddress } from "./address";

export interface ConnectionService {
    connect: boolean;
    startConnect(addr: ServerAddress, keepalive?: boolean);
    closeConnect(): void;
    addPacketListener(listener: PacketHandler): void;
    removePacketListener(listener: PacketHandler): void;
    clearPacketListeners(): void;
    send(packet: PBpacket): void;
    onData(data: ArrayBuffer);
    onFocus();
    onBlur();
}
