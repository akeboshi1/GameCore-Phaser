import BaseSingleton from "../../base/BaseSingleton";
import {ISocketConnection} from "../../interface/ISocketConnection";
import {PacketHandler, PBpacket} from "net-socket-packet";

export class SocketManager extends BaseSingleton {
    private m_SocketConnection: ISocketConnection;
    public constructor() {
        super();
    }

    public setSocketConnection( value: ISocketConnection ) {
        this.m_SocketConnection = value;
    }

    public send( packet: PBpacket ): void {
        this.m_SocketConnection.send(packet);
    }

    public addHandler(handler: PacketHandler): void {
        this.m_SocketConnection.addPacketListener(handler);
    }

    public removeHandler(handler: PacketHandler): void {
        this.m_SocketConnection.rmPacketListener(handler);
    }
}
