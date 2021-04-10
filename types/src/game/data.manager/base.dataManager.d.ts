import { EventDispatcher } from "utils";
import { Game } from "../game";
import { BasePacketHandler } from "./base.packet.handler";
export declare class BaseDataManager extends BasePacketHandler {
    private mSNRequirements;
    private mSNIDConfig;
    constructor(game: Game, event: EventDispatcher);
    clear(): void;
    destroy(): void;
    query_FURNITURE_UNFROZEN_REQUIREMENTS(sns: string[]): void;
    /**
     * 数据配置请求
     * @param id 道具-ID或element-SN
     * @param schema 标记 QueryItems-道具 ,PreviewElementRewards-宝箱
     */
    query_ELEMENT_ITEM_REQUIREMENTS(id: string, schema?: string): void;
    private on_FURNITURE_UNFROZEN_REQUIREMENTS;
    private on_ELEMENT_ITEM_REQUIREMENTS;
    private syncItemBases;
    private syncElementSNUnlockMaterials;
}
