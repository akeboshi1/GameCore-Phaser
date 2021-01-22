import { PacketHandler, PBpacket } from "net-socket-packet";
import { Clock } from "src/game/loop/clock/clock";
import { ServerAddress } from "./address";
import { SocketConnection } from "./socket";

export interface ConnectionService {
    connect: boolean;
    pause: boolean;
    socket: SocketConnection;
    startConnect(addr: ServerAddress, keepalive?: boolean);
    closeConnect(): void;
    setClock(clock: Clock): void;
    update();
    addPacketListener(listener: PacketHandler): void;
    removePacketListener(listener: PacketHandler): void;
    clearPacketListeners(): void;
    send(packet: PBpacket): void;
    onData(data: ArrayBuffer);
    onFocus();
    onBlur();
}
