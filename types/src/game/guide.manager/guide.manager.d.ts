import { PacketHandler } from "net-socket-packet";
import { Game } from "../game";
export declare class GuideManager extends PacketHandler {
    protected game: Game;
    constructor(game: Game);
    addPackListener(): void;
    removePackListener(): void;
    stopGuide(id: string): void;
    destroy(): void;
    private onUPDATE_PLAYER_GUIDE;
}
