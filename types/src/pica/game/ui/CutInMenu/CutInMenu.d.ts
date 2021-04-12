import { BasicModel, Game } from "gamecore";
import { ConnectionService } from "lib/net/connection.service";
export declare class CutInMenu extends BasicModel {
    constructor(game: Game);
    register(): void;
    unregister(): void;
    destroy(): void;
    reqRightButton(uiid: number, btnid: number): void;
    get connection(): ConnectionService;
}
