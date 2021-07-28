import { PacketHandler, PBpacket } from "net-socket-packet";
import { ServerAddress } from "./address";
import { SocketConnection } from "./socket";

export interface ConnectionService {
    connect: number;
    pause: boolean;
    socket: SocketConnection;
    startConnect(addr: ServerAddress, keepalive?: boolean);
    closeConnect(callBack?: Function): void;
    setClock(clock: any): void;
    update();
    addPacketListener(listener: PacketHandler): void;
    removePacketListener(listener: PacketHandler): void;
    clearPacketListeners(): void;
    send(packet: PBpacket): void;
    onData(data: ArrayBuffer);
    onFocus();
    onBlur();
}
