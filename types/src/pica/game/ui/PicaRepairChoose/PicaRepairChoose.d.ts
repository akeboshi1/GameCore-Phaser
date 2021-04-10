import { BasicModel, Game } from "gamecore";
import { ConnectionService } from "lib/net/connection.service";
import { op_def } from "pixelpai_proto";
export declare class PicaRepairChoose extends BasicModel {
    private mSceneType;
    private categoryType;
    constructor(game: Game, sceneType: op_def.SceneTypeEnum);
    register(): void;
    unregister(): void;
    queryChange(element_id: number, target_type: string): void;
    private onRetRescasteResult;
    get connection(): ConnectionService;
}
