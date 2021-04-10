import { BasicModel, Game } from "gamecore";
import { ConnectionService } from "lib/net/connection.service";
import { op_def, op_gameconfig } from "pixelpai_proto";
export declare class PicaAvatar extends BasicModel {
    private mSceneType;
    private categoryType;
    constructor(game: Game, sceneType: op_def.SceneTypeEnum);
    register(): void;
    unregister(): void;
    getCategories(categoryType: number): void;
    queryPackage(key: string, queryString?: string): void;
    queryCommodityResource(id: string): void;
    querySaveAvatar(avatarids: string[]): void;
    queryResetAvatar(avatar: op_gameconfig.Avatar): void;
    queryDressAvatarItemIDs(): void;
    destroy(): void;
    private onPackageCategoriesHandler;
    private onQueryCommodityResultHandler;
    private onQueryResetAvatar;
    private queryMarketPackage;
    private queryEditPackage;
    private onRetDressAvatarItemIDS;
    get connection(): ConnectionService;
}
