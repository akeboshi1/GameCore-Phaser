import { BasicModel } from "gamecore";
import { ConnectionService } from "lib/net/connection.service";
import { Game } from "src/game/game";
export declare class Dialog extends BasicModel {
    constructor(game: Game);
    register(): void;
    unregister(): void;
    destroy(): void;
    queryNextDialog(uiid: number, comid: number, data: number[]): void;
    get connection(): ConnectionService;
}
