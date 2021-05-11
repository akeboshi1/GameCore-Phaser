import { PacketHandler, PBpacket } from "net-socket-packet";
import { Game } from "../game";
export declare class GuideWorkerManager extends PacketHandler {
    protected game: Game;
    constructor(game: Game);
    addPackListener(): void;
    removePackListener(): void;
    stopGuide(id: string): void;
    onUPDATE_PLAYER_GUIDE(packet: PBpacket): void;
    destroy(): void;
}
