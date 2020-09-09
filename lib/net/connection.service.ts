import { ServerAddress } from "./address";
import { PacketHandler, PBpacket } from "net-socket-packet";

export interface ConnectionService {
    startConnect(addr: ServerAddress, keepalive?: boolean): void;
    onFocus();
    onBlur();
    move(point, any);
    closeConnect(): void;
    loadRes(path: string);
    clearHeartBeat();
    isConnect(): boolean;
    addPacketListener(listener: PacketHandler): void;
    removePacketListener(listener: PacketHandler): void;
    clearPacketListeners(): void;

    send(packet: PBpacket): void;
}
