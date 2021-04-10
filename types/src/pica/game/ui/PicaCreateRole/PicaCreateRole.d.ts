import { BasicModel, Game } from "gamecore";
import { ConnectionService } from "lib/net/connection.service";
import { op_def } from "pixelpai_proto";
export declare class PicaCreateRole extends BasicModel {
    constructor(game: Game);
    register(): void;
    unregister(): void;
    get connection(): ConnectionService;
    onSubmitHandler(gender: op_def.Gender, ids: string[]): void;
}
