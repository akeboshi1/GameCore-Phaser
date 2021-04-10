import { BasicModel, Game } from "gamecore";
import { ConnectionService } from "lib/net/connection.service";
export declare class PicaRoam extends BasicModel {
    constructor(game: Game);
    register(): void;
    unregister(): void;
    destroy(): void;
    get connection(): ConnectionService;
    query_ROAM_LIST(): void;
    query_ROAM_DRAW(id: string): void;
    query_PROGRESS_REWARD(name: string, index: number): void;
    private onRetRoamListResult;
    private onRetRoamDrawResult;
    private on_Draw_PROGRESS;
}
