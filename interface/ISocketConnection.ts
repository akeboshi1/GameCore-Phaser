import {PacketHandler, PBpacket} from "net-socket-packet";

export interface ISocketConnection {
    send(packet: PBpacket);
    destory();
    addPacketListener(handler: PacketHandler): void;
    rmPacketListener(handler: PacketHandler): void;
}

