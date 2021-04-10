import { BasicModel, Game } from "gamecore";
import { ConnectionService } from "lib/net/connection.service";
export declare class PicaRecharge extends BasicModel {
    constructor(game: Game);
    register(): void;
    unregister(): void;
    destroy(): void;
    get connection(): ConnectionService;
    query_JOB_LIST(): void;
    query_WORK_ON_JOB(id: string): void;
    private on_JOB_LIST;
}
