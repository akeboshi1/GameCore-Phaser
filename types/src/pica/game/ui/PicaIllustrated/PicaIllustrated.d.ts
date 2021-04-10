import { BasicModel, Game } from "gamecore";
import { ConnectionService } from "lib/net/connection.service";
import { op_def } from "pixelpai_proto";
export declare class PicaIllustrated extends BasicModel {
    private mSceneType;
    private categoryType;
    constructor(game: Game, sceneType: op_def.SceneTypeEnum);
    register(): void;
    unregister(): void;
    query_GALLARY_PROGRESS_REWARD(type: number): void;
    query_GALLARY_COLLECTION_REWARD(id: number): void;
    get connection(): ConnectionService;
}
