import { BaseConfigData, BaseConfigManager, Game } from "gamecore";
import { ICountablePackageItem, IElement, IExploreChapterData, IExploreLevelData, IExtendCountablePackageItem, IScene } from "picaStructure";
import { IShopBase } from "../../structure/imarketcommodity";
import { ItemCategoryConfig } from "./item.category.config";
import { ShopConfig } from "./shop.config";
import { IJob } from "../../structure/ijob";
import { ICraftSkill } from "src/pica/structure/icraftskill";
import { SceneConfigMap } from "./scene.config";
import { GalleryType } from "./gallery.config";
import { IGalleryCombination, IGalleryLevel } from "src/pica/structure/igallery";
export declare enum BaseDataType {
    i18n_zh = "i18n_zh",
    explore = "explore",
    item = "item",
    element = "element",
    shop = "shop",
    job = "job",
    cardPool = "cardPool",
    skill = "skill",
    level = "level",
    social = "social",
    minescene = "mineScene",
    publicscene = "publicScene",
    quest = "quest",
    guide = "guide",
    furnituregroup = "furnituregroup",
    gallery = "gallery"
}
export declare class BaseDataConfigManager extends BaseConfigManager {
    protected baseDirname: string;
    protected dataMap: Map<string, BaseConfigData>;
    protected sceneMap: SceneConfigMap;
    constructor(game: Game);
    getLocalConfigMap(): {
        itemcategory: {
            template: ItemCategoryConfig;
            data: {
                PKT_PACKAGE_CATEGORY_1: string[];
                PKT_PACKAGE_CATEGORY_2: string[];
                PKT_PACKAGE_CATEGORY_3: string[];
                PKT_PACKAGE_CATEGORY_4: string[];
                PropItem: string[];
                HandheldItem: string[];
                ValueItem: string[];
                AvatarItem: string[];
                FurnitureItem: string[];
            };
        };
    };
    getLocalConfig(key: any): any;
    /**
     * 通过SN获取道具数据
     * @param data
     * @returns
     */
    getItemBaseBySN(data: string): ICountablePackageItem | IExtendCountablePackageItem;
    /**
     * 通过ID 获取道具数据
     * @param data
     * @returns
     */
    getItemBaseByID(data: string): ICountablePackageItem | IExtendCountablePackageItem;
    convertMapToItem(items: any[]): any[];
    /**
     * 批量获取道具数据
     * @param items
     * @returns
     */
    getBatchItemDatas(items: any[]): any[];
    synItemBase(item: any): any;
    /**
     * 获取重铸数据
     * @returns
     */
    getRecastItemBases(): any[];
    /**
     * 获取章节数据
     * @param id
     * @returns
     */
    getChapterData(id: number): IExploreChapterData;
    /**
     * 获取探索关卡数据
     * @param id
     * @returns
     */
    getExploreLevelData(id: number): IExploreLevelData;
    /**
     * 通过ID获取element 数据
     * @param id
     * @returns
     */
    getElementData(id: string): IElement;
    /**
     * 通过SN来获取家具解锁需要到道具
     * @param sn
     * @returns
     */
    getElementSNUnlockMaterials(sns: string[]): Map<string, any>;
    /**
     * 获取商城数据
     * @param id
     * @returns
     */
    getShopBase(id: string): IShopBase;
    /**
     * 获取合成蓝图数据
     * @param id
     * @returns
     */
    getSkill(id: string): ICraftSkill;
    /**
     * 获取工作数据
     * @param id
     * @returns
     */
    getJob(id: string): IJob;
    getBatchShopBase(ids: string[]): any[];
    /**
     * 多语言配置
     * @param id
     * @param tips 加载错误提示
     * @returns
     */
    getI18n(id: string, tips?: any): any;
    getBatchI18n(ids: string[]): any[];
    /**
     * 获取道具分类
     * @param type
     * @returns
     */
    getItemSubCategory(type: number): any;
    /**
     * 动态加载商城数据
     * @param shopName
     * @returns
     */
    checkDynamicShop(shopName: any): Promise<any>;
    convertDynamicCategory(list: any): {
        marketName: string;
        marketCategory: any[];
    };
    /**
     * 获取商城子分类
     * @param shopName
     * @returns
     */
    getShopSubCategory(shopName?: string): any;
    getShopItems(category: string, sub: string, shopName?: string): IShopBase[];
    convertShopItem(shopitem: any, data: ShopConfig): void;
    /**
     * 等级表 各种
     * @param type
     * @param level
     * @returns
     */
    getLevel(type: string, level: number): import("../../structure/ilevel").ILevel;
    /**
     * 卡池表
     * @param id
     * @returns
     */
    getCardPool(id: string): import("../../structure/icardpool").ICardPool;
    getCardPools(): any[];
    getSocails(): import("../../structure").ISocial[];
    /**
     * 场景表
     * @param id
     * @returns
     */
    getScene(id: string): IScene;
    getScenes(type?: string, tag?: number): Map<any, any> | IScene[];
    getQuest(id: string): import("../../structure").IQuest;
    findGuide(id: string): import("../../structure").IGuide;
    updateGuideState(id: string, val?: boolean): void;
    /**
     * 家具鉴定组
     * @param id
     * @returns
     */
    getFurnitureGroup(id: string): any;
    getFurnitureGroupBySN(sn: string): any;
    checkFurnitureGroup(id: string): boolean;
    checkFurnitureGroupBySN(sn: string): boolean;
    /**
     * 家具鉴定
     * @param id
     * @param type
     * @returns
     */
    getGallery(id: number | string, type: GalleryType): IGalleryCombination | IGalleryLevel;
    getGalleryMap(type: GalleryType): Map<string | number, IGalleryCombination> | Map<string | number, IGalleryLevel>;
    protected add(): void;
    protected configUrl(reName: string, tempurl?: string): string;
    private checkItemData;
}
