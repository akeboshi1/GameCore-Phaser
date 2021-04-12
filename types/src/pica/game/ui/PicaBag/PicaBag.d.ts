import { BasicModel, Game } from "gamecore";
import { ConnectionService } from "lib/net/connection.service";
import { op_client, op_def } from "pixelpai_proto";
export declare class PicaBag extends BasicModel {
    private mSceneType;
    private categoryType;
    constructor(game: Game, sceneType: op_def.SceneTypeEnum);
    register(): void;
    unregister(): void;
    getCategories(categoryType: number): void;
    queryPackage(key: string, queryString?: string): void;
    queryCommodityResource(id: string): void;
    addFurniToScene(id: string): void;
    enterEditAndSelectedSprite(id: string): void;
    seachPackage(seach: string, category: string): void;
    sellProps(prop: op_client.CountablePackageItem, count: number, category: number): void;
    useProps(itemid: string, count: number): void;
    destroy(): void;
    private onPackageCategoriesHandler;
    private onQueryMarketPackage;
    private onQueryEditPackage;
    private onQueryCommodityResultHandler;
    private queryMarketPackage;
    private queryEditPackage;
    get connection(): ConnectionService;
}
