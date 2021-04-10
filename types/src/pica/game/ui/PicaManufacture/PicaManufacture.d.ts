import { BasicModel, Game } from "gamecore";
import { ConnectionService } from "lib/net/connection.service";
import { op_def } from "pixelpai_proto";
export declare class PicaManufacture extends BasicModel {
    private mSceneType;
    private categoryType;
    constructor(game: Game, sceneType: op_def.SceneTypeEnum);
    register(): void;
    unregister(): void;
    queryFuriCompose(ids: string[]): void;
    queryRecaste(consumedId: string, targetId: string): void;
    queryRecasteList(): void;
    private onRetRescasteResult;
    private onRetRecasteListResult;
    private onRetComposeResult;
    get connection(): ConnectionService;
}
