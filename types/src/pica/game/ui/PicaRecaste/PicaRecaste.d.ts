import { BasicModel, Game } from "gamecore";
import { ConnectionService } from "lib/net/connection.service";
import { op_def } from "pixelpai_proto";
export declare class PicaRecaste extends BasicModel {
    private mSceneType;
    private categoryType;
    constructor(game: Game, sceneType: op_def.SceneTypeEnum);
    register(): void;
    unregister(): void;
    queryRecaste(consumedId: string, targetId: string): void;
    queryRecasteList(): void;
    private onRetRescasteResult;
    private onRetRecasteListResult;
    get connection(): ConnectionService;
}
