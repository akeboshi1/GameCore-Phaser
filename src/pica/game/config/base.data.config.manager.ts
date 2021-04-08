import { BaseConfigData, BaseConfigManager, Game } from "gamecore";
import {
    ICountablePackageItem,
    IElement,
    IExploreChapterData,
    IExploreLevelData,
    IExtendCountablePackageItem,
    IFurnitureGroup,
    IScene
} from "picaStructure";
import { IMarketCommodity, IShopBase } from "../../structure/imarketcommodity";
import { Logger, ObjectAssign, StringUtils } from "utils";
import { ElementDataConfig } from "./element.data.config";
import { ExploreDataConfig } from "./explore.data.config";
import { I18nZHDataConfig } from "./i18nzh.config";
import { ItemBaseDataConfig } from "./item.base.data.config";
import { ItemCategoryConfig } from "./item.category.config";
import { ShopConfig } from "./shop.config";
import version from "../../../../version";
import { JobConfig } from "./job.config";
import { IJob } from "../../structure/ijob";
import { CardPoolConfig } from "./cardpool.config";
import { ICraftSkill } from "src/pica/structure/icraftskill";
import { SkillConfig } from "./skill.config";
import { LevelConfig } from "./level.config";
import { SocialConfig } from "./social.config";
import { SceneConfig, SceneConfigMap } from "./scene.config";
import { QuestConfig } from "./quest.config";
import { GuideConfig } from "./guide.config";
import { FurnitureGroup } from "./furniture.group";
import { GalleryConfig, GalleryType } from "./gallery.config";
import { IGalleryCombination, IGalleryLevel } from "src/pica/structure/igallery";

export enum BaseDataType {
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
    // itemcategory = "itemcategory"
}

export class BaseDataConfigManager extends BaseConfigManager {
    protected baseDirname: string;
    protected dataMap: Map<string, BaseConfigData> = new Map();
    protected sceneMap: SceneConfigMap;
    constructor(game: Game) {
        super(game);
    }

    public getLocalConfigMap() {
        return {
            // skill: { template: new SkillConfig(), data: SkillConfig["data"]  },
            itemcategory: { template: new ItemCategoryConfig(), data: ItemCategoryConfig["data"] }
        };
    }

    public getLocalConfig(key) {
        const configMap = this.getLocalConfigMap()[key];
        configMap.template.parseJson(configMap.data);
        return configMap.template;
    }

    /**
     * 通过SN获取道具数据
     * @param data
     * @returns
     */
    public getItemBaseBySN(data: string): ICountablePackageItem | IExtendCountablePackageItem {
        const config: ItemBaseDataConfig = this.getConfig(BaseDataType.item);
        const item = config.getBySN(data);
        this.checkItemData(item);
        return item;
    }

    /**
     * 通过ID 获取道具数据
     * @param data
     * @returns
     */
    public getItemBaseByID(data: string): ICountablePackageItem | IExtendCountablePackageItem {
        const config: ItemBaseDataConfig = this.getConfig(BaseDataType.item);
        const item = config.getByID(data);
        this.checkItemData(item);
        return item;
    }

    public convertMapToItem(items: any[]) {
        const list: any[] = [];
        items.forEach((i) => {
            Object.keys(i).forEach((k) => {
                list.push({
                    id: k,
                    count: i[k]
                });
            });
        });

        return list;
    }
    /**
     * 批量获取道具数据
     * @param items
     * @returns
     */
    public getBatchItemDatas(items: any[]) {
        if (!items) return [];
        for (const item of items) {
            if (!item["find"]) {
                const tempitem = this.getItemBaseByID(item.id);
                ObjectAssign.excludeTagAssign(item, tempitem, "exclude");
                item["find"] = true;
            }
        }
        return items;
    }

    public synItemBase(item: any) {
        if (!item) return undefined;
        const tempitem = this.getItemBaseByID(item.id);
        ObjectAssign.excludeTagAssign(item, tempitem, "exclude");
        return item;
    }

    /**
     * 获取重铸数据
     * @returns
     */
    public getRecastItemBases() {
        const temp = [];
        const data: ItemBaseDataConfig = this.getConfig(BaseDataType.item);
        for (const key in data) {
            if (data.hasOwnProperty(key)) {
                const element = data[key];
                if (element.className === "FurnitureItem" && element.rarity === 1 && element.forge === 1) {
                    const item = this.getItemBaseByID(element.id);
                    if (item)
                        temp.push(item);
                }
            }
        }
        return temp;
    }

    /**
     * 获取章节数据
     * @param id
     * @returns
     */
    public getChapterData(id: number): IExploreChapterData {
        const data: ExploreDataConfig = this.getConfig(BaseDataType.explore);
        const chapter = data.getChapter(id);
        if (chapter && !chapter["find"]) {
            chapter.name = this.getI18n(chapter.name);
            chapter.des = this.getI18n(chapter.des);
            chapter["find"] = true;
        }
        return chapter;
    }

    /**
     * 获取探索关卡数据
     * @param id
     * @returns
     */
    public getExploreLevelData(id: number): IExploreLevelData {
        const data: ExploreDataConfig = this.getConfig(BaseDataType.explore);
        const level = data.getLevel(id);
        if (level && !level["find"]) {
            level.name = this.getI18n(level.name);
            if (level.clueItems) {
                for (const clue of level.clueItems) {
                    const item = this.getItemBaseByID(clue.itemId);
                    if (item) Object.assign(clue, item);
                }
            }
            level["find"] = true;
            level["exclude"] = data.excludes;
        }
        return level;
    }

    /**
     * 通过ID获取element 数据
     * @param id
     * @returns
     */
    public getElementData(id: string): Promise<IElement> {
        return new Promise<IElement>((reslove, reject) => {
            const data: ElementDataConfig = this.getConfig(BaseDataType.element);
            const element = data.get(id);
            if (!element.serialize) {
                const path = element.serializeString;
                if (path && path.length > 0) {
                    const responseType = "arraybuffer";
                    this.mGame.httpLoaderManager.startSingleLoader({ path, responseType }).then((req: any) => {
                        element.serialize = true;
                        // todo
                        reslove(element);
                    }).catch(() => {
                        reslove(element);
                    });
                } else {
                    element.serialize = true;
                    // todo
                    reslove(element);
                }
            } else {
                reslove(element);
            }
        });
    }

    /**
     * 通过id获取element需要连载的pi地址
     * @param id
     * @returns
     */
    public getSerializeStr(id: string): string {
        const data: ElementDataConfig = this.getConfig(BaseDataType.element);
        const element = data.get(id);
        return element.serializeString;
    }

    /**
     * 通过SN来获取家具解锁需要到道具
     * @param sn
     * @returns
     */
    public getElementUnlockMaterialsBySN(sns: string[]) {
        const data: ElementDataConfig = this.getConfig(BaseDataType.element);
        const map: Map<string, any> = new Map();
        for (const key in data) {
            if (data.hasOwnProperty(key)) {
                const temp = data[key];
                if (sns.indexOf(temp.sn) !== -1) {
                    if (!StringUtils.isNullOrUndefined(temp.unLockMaterials)) {
                        const unlockstr = JSON.stringify(temp.unLockMaterials);
                        map.set(temp.sn, JSON.parse(unlockstr));
                    }
                }
            }
            if (map.size === sns.length) break;
        }
        return map;
    }

    /**
     * 获取商城数据
     * @param id
     * @returns
     */
    public getShopBase(id: string): IShopBase {
        const data: ShopConfig = this.getConfig(BaseDataType.shop);
        const temp = data.get(id);
        if (temp && !temp["find"]) {
            const item = this.getItemBaseByID(temp.itemId);
            if (item) {
                temp.name = item.name;
                temp.icon = item.texturePath;
                temp.source = item.source;
                temp["find"] = true;
                ObjectAssign.excludeTagAssign(temp, item);
            }
        }
        return temp;
    }

    /**
     * 获取合成蓝图数据
     * @param id
     * @returns
     */
    public getSkill(id: string): ICraftSkill {
        const data: SkillConfig = this.getConfig(BaseDataType.skill);
        const temp = data.get(id);
        // const materials = this.convertMapToItem([temp._materials]);
        // temp.materials = this.getBatchItemDatas(materials);

        temp.materials = this.convertMapToItem([temp._materials]);
        temp.materials.forEach((m) => {
            m.neededCount = m.count;
        });

        // const product = this.convertMapToItem([temp._product]);
        // const list = this.getBatchItemDatas(product);
        temp.product = this.convertMapToItem([temp._product])[0];
        if (temp.product) {
            const item = this.getItemBaseByID(temp.product.id);
            temp.skill.display.texturePath = item.texturePath;
        }
        return temp;
    }

    /**
     * 获取工作数据
     * @param id
     * @returns
     */
    public getJob(id: string): IJob {
        const data: JobConfig = this.getConfig(BaseDataType.job);
        const temp = data.get(id);
        temp.name = this.getI18n(temp.name);
        temp.des = this.getI18n(temp.des);

        const item = { id: "IV0000001", countRange: temp["coinRange"] };
        temp.rewards = [this.synItemBase(item)];

        temp.requirements = [];
        if (temp["attrRequirements"]) {
            const targets = this.convertMapToItem([temp["attrRequirements"]]);
            this.getBatchItemDatas(targets);
            temp.requirements = targets;
        }

        return temp;
    }

    public getBatchShopBase(ids: string[]) {
        const temps = [];
        if (ids) {
            for (const id of ids) {
                temps.push(this.getShopBase(id));
            }
        }
        return temps;
    }
    /**
     * 多语言配置
     * @param id
     * @param tips 加载错误提示
     * @returns
     */
    public getI18n(id: string, tips?: any) {
        if (!StringUtils.isNullOrUndefined(id)) {
            id = id.toUpperCase();
        }
        const data: I18nZHDataConfig = this.getConfig(BaseDataType.i18n_zh);
        return data.text(id, tips);
    }

    public getBatchI18n(ids: string[]) {
        const texts = [];
        if (ids) {
            for (const key of ids) {
                const text = this.getI18n(key);
                texts.push(text);
            }
        }
        return texts;
    }

    /**
     * 获取道具分类
     * @param type
     * @returns
     */
    public getItemSubCategory(type: number) {
        const data: ItemCategoryConfig = this.getLocalConfig("itemcategory") as ItemCategoryConfig;
        const key = data.getClassName(type);
        const extend = key + "extend";
        if (data.hasOwnProperty(extend)) return data[extend];
        else {
            const categorys: Array<{ key: string, value: string }> = [];
            const arr = data[key];
            for (const temp of arr) {
                const value = this.getI18n(temp);
                categorys.push({ key: temp, value });
            }
            this["extend"] = categorys;
            return categorys;
        }
    }

    /**
     * 动态加载商城数据
     * @param shopName
     * @returns
     */
    public checkDynamicShop(shopName): Promise<any> {
        return new Promise((resolve, reject) => {
            if (!this.dataMap.has(shopName)) {
                this.dynamicLoad(new Map([shopName, new ShopConfig()])).then(() => {
                    resolve(true);
                }, (reponse) => {
                    Logger.getInstance().error("未成功加载配置:" + reponse);
                    reject(false);
                });
            } else {
                resolve(true);
            }
        });
    }

    public convertDynamicCategory(list: any) {
        const result = { marketName: "shop", marketCategory: [] };
        const cate = result.marketCategory;
        list.items.forEach((item) => {
            let existing = cate.find((c) => c.category.key === item.category);
            if (existing == null) {
                existing = {
                    category: {
                        key: item.category,
                        value: this.getI18n(item.category)
                    },
                    subcategory: []
                };
                cate.push(existing);
            }
            let existingSub = existing.subcategory.find((s) => s.key === item.subcategory);
            if (existingSub == null) {
                existingSub = {
                    key: item.subcategory,
                    value: this.getI18n(item.subcategory)
                };
                existing.subcategory.push(existingSub);
            }
        });
        return result;
    }

    /**
     * 获取商城子分类
     * @param shopName
     * @returns
     */
    public getShopSubCategory(shopName: string = BaseDataType.shop) {
        const data: ShopConfig = this.getConfig(shopName);
        if (!data.categoryMap["find"]) {
            const extendMap: Map<{ key: string, value: string }, Array<{ key: string, value: string }>> = new Map();
            data.categoryMap.forEach((value, key) => {
                const subCategorys: Array<{ key: string, value: string }> = [];
                for (const temp of value) {
                    const tvalue = this.getI18n(temp);
                    subCategorys.push({ key: temp, value: tvalue });
                }
                const category = { key, value: this.getI18n(key) };
                extendMap.set(category, subCategorys);
            });
            data.categoryMap["find"] = true;
            data.categoryMap["extendMap"] = extendMap;
            return extendMap;
        }
        return data.categoryMap["extendMap"];
    }

    public getShopItems(category: string, sub: string, shopName: string = BaseDataType.shop) {
        const data: ShopConfig = this.getConfig(shopName);
        const map = data.propMap.get(category);
        const extend = "extendfind";
        const tempArr = map.get(sub);
        if (tempArr[extend]) {
            return tempArr;
        } else {
            for (const shopitem of tempArr) {
                this.convertShopItem(shopitem, data);
            }
            tempArr[extend] = true;
            return tempArr;
        }
    }

    public convertShopItem(shopitem, data: ShopConfig) {
        const itemconfig: ItemBaseDataConfig = this.getConfig(BaseDataType.item);
        const tempItem: IMarketCommodity = <any>shopitem;
        if (!shopitem["find"]) {
            const item = this.getItemBaseByID(shopitem.itemId);
            if (item == null) {
                Logger.getInstance().error("商城中有不存在的道具ID: " + shopitem.itemId);
                return;
            }
            shopitem.currencyId = shopitem.currencyId || shopitem.currency;

            tempItem.name = item.name;
            tempItem.source = item.source;
            tempItem["des"] = item ? item.des : "";
            tempItem["price"] = [{
                price: shopitem.price,
                coinType: itemconfig.getCoinType(shopitem.currencyId),
                displayPrecision: 0
            }];
            shopitem["find"] = true;
            shopitem["exclude"] = data.excludes;
            if (shopitem.icon === "" || shopitem.icon === undefined)
                shopitem.icon = item ? item.texturePath : undefined;
            ObjectAssign.excludeTagAssign(shopitem, item);
        }
    }

    /**
     * 等级表 各种
     * @param type
     * @param level
     * @returns
     */
    public getLevel(type: string, level: number) {
        const data: LevelConfig = this.getConfig(BaseDataType.level);
        return data.get(type, level);
    }

    /**
     * 卡池表
     * @param id
     * @returns
     */
    public getCardPool(id: string) {
        const data: CardPoolConfig = this.getConfig(BaseDataType.cardPool);
        data.parseJson({});
        return data.get(id);
    }

    public getCardPools() {
        const data: CardPoolConfig = this.getConfig(BaseDataType.cardPool);
        return data.pools;
    }
    public getSocails() {
        const data: SocialConfig = this.getConfig(BaseDataType.social);
        return data.socails;
    }

    /**
     * 场景表
     * @param id
     * @returns
     */
    public getScene(id: string) {
        const dataTypes = [BaseDataType.minescene, BaseDataType.publicscene];
        for (const dataType of dataTypes) {
            const config: SceneConfig = this.getConfig(dataType);
            const data: IScene = config.get(id);
            if (data) {
                return data;
            }
        }
        return undefined;
    }

    public getScenes(type?: string, tag?: number) {
        if (!this.sceneMap) {
            this.sceneMap = new SceneConfigMap();
            const dataTypes = [BaseDataType.minescene, BaseDataType.publicscene];
            for (const dataType of dataTypes) {
                const config: SceneConfig = this.getConfig(dataType);
                this.sceneMap.setSceneMap(config.sceneMap, this.getI18n.bind(this));
            }
            this.sceneMap.sort();
        }
        return this.sceneMap.getScenes(type, tag);
    }
    public getQuest(id: string) {
        const data: QuestConfig = this.getConfig(BaseDataType.quest);
        return data.get(id);
    }

    public findGuide(id: string) {
        const data: GuideConfig = this.getConfig(BaseDataType.guide);
        return data.findGuide(id);
    }

    public updateGuideState(id: string, val: boolean = false) {
        const data: GuideConfig = this.getConfig(BaseDataType.guide);
        const guideData = data.get(id);
        if (!guideData) return;
        guideData.state = val;
    }

    /**
     * 家具鉴定组
     * @param id
     * @returns
     */
    public getFurnitureGroup(id: string) {
        const data: FurnitureGroup = this.getConfig(BaseDataType.furnituregroup);
        const group: IFurnitureGroup = data.get(id);
        if (group) {
            const obj: any = {};
            ObjectAssign.excludeAssign(obj, group);
            for (let i = 0; i < obj.group.length; i++) {
                obj.group[i] = this.getItemBaseByID(obj.group[i]);
            }
            return obj;
        }
        return undefined;

    }

    public getFurnitureGroupBySN(sn: string) {
        const item = this.getItemBaseBySN(sn);
        if (item) {
            return this.getFurnitureGroup(item.id);
        }
        return undefined;
    }
    public checkFurnitureGroup(id: string) {
        const data: FurnitureGroup = this.getConfig(BaseDataType.furnituregroup);
        return data.checkGroup(id);
    }
    public checkFurnitureGroupBySN(sn: string) {
        const item = this.getItemBaseBySN(sn);
        if (item && this.checkFurnitureGroup(item.id)) {
            return true;
        }
        return false;
    }

    /**
     * 家具鉴定
     * @param id
     * @param type
     * @returns
     */
    public getGallery(id: number | string, type: GalleryType): IGalleryCombination | IGalleryLevel {
        const data: GalleryConfig = this.getConfig(BaseDataType.gallery);
        const temp = data.get(id, type);
        if (!temp) return undefined;
        if (type === GalleryType.combination) {
            if (!temp["find"]) {
                const combine = <IGalleryCombination>temp;
                combine.name = this.getI18n(combine.name);
                combine.des = this.getI18n(combine.des);
                const requirement = combine.requirement;
                if (requirement) {
                    for (let i = 0; i < requirement.length; i++) {
                        const value = <string>requirement[i];
                        const tempobj: any = {};
                        ObjectAssign.excludeTagAssign(tempobj, this.getItemBaseByID(value));
                        requirement[i] = tempobj;
                    }
                }
                const rewardItems = combine.rewardItems;
                if (rewardItems) {
                    for (const value of rewardItems) {
                        const coutitem = this.getItemBaseByID(value.id);
                        ObjectAssign.excludeAssign(value, coutitem);
                    }
                }
                temp["find"] = true;
            }
        } else if (type === GalleryType.dexLevel) {
            if (!temp["find"]) {
                const dex = <IGalleryLevel>temp;
                const rewardItems = dex.rewardItems;
                if (rewardItems) {
                    for (const value of rewardItems) {
                        const coutitem = this.getItemBaseByID(value.id);
                        ObjectAssign.excludeAssign(value, coutitem);
                    }
                }
                temp["find"] = true;
            }
        }
        return temp;
    }

    public getGalleryMap(type: GalleryType) {
        const data: GalleryConfig = this.getConfig(BaseDataType.gallery);
        const temp = data.getMap(type);
        temp.forEach((value, key) => {
            this.getGallery(key, type);
        });
        return temp;
    }

    protected add() {
        super.add();
        this.dataMap.set(BaseDataType.i18n_zh, new I18nZHDataConfig());
        this.dataMap.set(BaseDataType.explore, new ExploreDataConfig());
        this.dataMap.set(BaseDataType.item, new ItemBaseDataConfig());
        this.dataMap.set(BaseDataType.element, new ElementDataConfig());
        this.dataMap.set(BaseDataType.shop, new ShopConfig());
        this.dataMap.set(BaseDataType.job, new JobConfig());
        this.dataMap.set(BaseDataType.cardPool, new CardPoolConfig());
        this.dataMap.set(BaseDataType.skill, new SkillConfig());
        this.dataMap.set(BaseDataType.level, new LevelConfig());
        this.dataMap.set(BaseDataType.social, new SocialConfig());
        this.dataMap.set(BaseDataType.publicscene, new SceneConfig());
        this.dataMap.set(BaseDataType.minescene, new SceneConfig());
        this.dataMap.set(BaseDataType.quest, new QuestConfig());
        this.dataMap.set(BaseDataType.guide, new GuideConfig());
        this.dataMap.set(BaseDataType.furnituregroup, new FurnitureGroup());
        this.dataMap.set(BaseDataType.gallery, new GalleryConfig());
    }

    protected configUrl(reName: string, tempurl?: string) {
        if (tempurl) {
            return this.mGame.getGameConfig().locationhref + `resources_v${version}/${tempurl}`;
        }
        const url = this.baseDirname + `client_resource/${reName}.json`;
        return url;
    }

    private async checkItemData(item: ICountablePackageItem) {
        if (!item || item["find"]) {
            return;
        }
        const config: ItemBaseDataConfig = this.getConfig(BaseDataType.item);
        item.name = this.getI18n(item.name, { id: item.id, name: "name" });
        item.source = this.getI18n(item.source, { id: item.id, source: "source" });
        item.des = this.getI18n(item.des, { id: item.id, des: "des" });
        item["exclude"] = config.excludes;
        if (item.texturePath) item["display"] = { texturePath: item.texturePath };
        if (item.elementId && item.elementId !== "") {
            const element = await this.getElementData(item.elementId);
            if (element) {
                const texture_path = element.texture_path;
                item["animations"] = element["AnimationData"];
                if (texture_path) {
                    item["animationDisplay"] = { dataPath: element.data_path, texturePath: texture_path };
                    const index = texture_path.lastIndexOf(".");
                    if (index === -1) {
                        item.texturePath = element.texture_path + "_s";
                    } else {
                        const extensions = texture_path.slice(index, texture_path.length);
                        const path = texture_path.slice(0, index);
                        item.texturePath = path + "_s" + extensions;
                    }
                    item["display"] = { texturePath: item.texturePath };
                }
            }
        }
        item["find"] = true;
    }
}
