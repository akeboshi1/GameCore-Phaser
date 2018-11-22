import {PacketHandler, PBpacket} from "net-socket-packet";

export interface ISocketConnection {
    send(packet: PBpacket);
    addPacketListener(handler: PacketHandler);
}

