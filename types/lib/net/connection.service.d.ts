import { PacketHandler, PBpacket } from "net-socket-packet";
import { Clock } from "src/game/loop/clock/clock";
import { ServerAddress } from "./address";
import { SocketConnection } from "./socket";
export interface ConnectionService {
    connect: boolean;
    pause: boolean;
    socket: SocketConnection;
    startConnect(addr: ServerAddress, keepalive?: boolean): any;
    closeConnect(): void;
    setClock(clock: Clock): void;
    update(): any;
    addPacketListener(listener: PacketHandler): void;
    removePacketListener(listener: PacketHandler): void;
    clearPacketListeners(): void;
    send(packet: PBpacket): void;
    onData(data: ArrayBuffer): any;
    onFocus(): any;
    onBlur(): any;
}
