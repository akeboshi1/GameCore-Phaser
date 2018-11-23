import {PacketHandler, PBpacket} from "net-socket-packet";

export interface ISocketSend {
    send(packet: PBpacket);
}

