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
import { IDecorateShop, IMarketCommodity, IShopBase } from "../../structure/imarketcommodity";
import { Logger, ObjectAssign, ResUtils, StringUtils } from "utils";
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
import { ICraftSkill } from "../../structure/icraftskill";
import { SkillConfig } from "./skill.config";
import { LevelConfig } from "./level.config";
import { SocialConfig } from "./social.config";
import { SceneConfig, SceneConfigMap } from "./scene.config";
import { QuestConfig } from "./quest.config";
import { GuideConfig } from "./guide.config";
import { FurnitureGroup } from "./furniture.group";
import { GalleryConfig, GalleryType } from "./gallery.config";
import { IGalleryCombination, IGalleryLevel } from "../../structure/igallery";
import { Lite } from "game-capsule";
import { ElmentPiConfig } from "./element.pi.config";
import { IElementPi } from "../../structure/ielementpi";
import { EventType } from "structure";
import { QuestGroupConfig } from "./quest.group.config";
import { Element2Config } from "./element2.config";
import { FurnitureGradeConfig } from "./furniture.grade.config";
import { RechargeConfig } from "./recharge.config";
import { Setting2Config } from "./settings2.config";
import { FameLevelConfig as FameLevelConfig } from "./fame.level.config";
import { BattlePassConfig } from "./battle.pass.config";
import { BattleLevelConfig } from "./battle.level.config";
import { PermissionConfig } from "./permission.config";
import { IPermission } from "src/pica/structure/ipermission";

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
    roomscene = "roomScene",
    quest = "quest",
    guide = "guide",
    furnituregroup = "furnituregroup",
    gallery = "gallery",
    questGroup = "questGroup",
    dailyQuestGroup = "dailyQuestGroup",
    element2 = "element2",
    elementpi = "elementpi", // 不作为文件名加载文件，只作为类型区分
    furnitureGrade = "furnitureGrade",
    charge = "charge",
    settings2 = "settings2",
    famelevel = "famelevel",
    battlePass = "battlePass",
    battlePassLevel = "battlePassLevel",
    permission = "permission"
    // itemcategory = "itemcategory"
}

export class BaseDataConfigManager extends BaseConfigManager {
    protected baseDirname: string;
    protected dataMap: Map<string, BaseConfigData> = new Map();
    protected sceneMap: SceneConfigMap;
    constructor(game: Game) {
        super(game);
        this.mGame.emitter.on(EventType.QUEST_ELEMENT_PI_DATA, this.checkDynamicElementPI, this);
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
                // Object.setPrototypeOf(item, tempitem);
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
    public getElementData(id: string) {
        const data: ElementDataConfig = this.getConfig(BaseDataType.element);
        const element = data.get(id);
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
        const data: ItemBaseDataConfig = this.getConfig(BaseDataType.item);
        const map: Map<string, any> = new Map();
        for (const sn of sns) {
            const temp = this.getItemBaseBySN(sn);
            if (sns.indexOf(temp.sn) !== -1) {
                if (!StringUtils.isNullOrUndefined(temp.unLockMaterials)) {
                    const unlockstr = JSON.stringify(temp.unLockMaterials);
                    map.set(temp.sn, JSON.parse(unlockstr));
                }
            }
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
                temp["item"] = item;
                temp["find"] = true;
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
        if (!temp["find"]) {
            temp.name = this.getI18n(temp.name);
            temp.des = this.getI18n(temp.des);

            const item = { id: "IV0000001", countRange: temp["coinRange"] };
            temp.rewards = [this.synItemBase(item)];
            if (temp["attrRequirements"]) {
                const targets = this.convertMapToItem([temp["attrRequirements"]]);
                this.getBatchItemDatas(targets);
                temp.requirements = targets;
            } else {
                temp.requirements = [];
            }
            temp["find"] = true;
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
    public checkDynamicShop(shopNames: string[]): Promise<any> {
        return new Promise((resolve, reject) => {
            const tempMaps = new Map();
            for (const name of shopNames) {
                if (!this.dataMap.has(name)) {
                    tempMaps.set(name, new ShopConfig());
                }
            }
            if (tempMaps.size > 0) {
                this.dynamicLoad(tempMaps).then(() => {
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
                const subCategorys: Array<{ key: string, value: string, shopName: string }> = [];
                for (const temp of value) {
                    const tvalue = this.getI18n(temp);
                    subCategorys.push({ key: temp, value: tvalue, shopName });
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
                price: shopitem.price || 0,
                coinType: itemconfig.getCoinType(shopitem.currencyId),
                displayPrecision: 0
            }];
            shopitem["find"] = true;
            shopitem.icon = shopitem.icon === undefined || shopitem.icon === null || shopitem.icon.length === 0 ?
                item.texturePath : shopitem.icon;

            // 临时处理 下次平台更新可删除 20210526
            if (shopitem.category === "PKT_MARKET_CATEGORY_3") {
                shopitem.icon = item.texturePath;
            }

            shopitem["item"] = item;
        }
    }

    public getDecorateShopItems(sub: string, shopName: string = "roomComponentshop") {
        const data: ShopConfig = this.getConfig(shopName);
        const map = data.propMap.get("commoncategory");
        const extend = "extendfind";
        const tempArr = map.get(sub);
        if (tempArr[extend]) {
            return tempArr;
        } else {
            for (const shopitem of tempArr) {
                const ele2: Element2Config = this.getConfig(BaseDataType.element2);
                const tempItem: IDecorateShop = <any>shopitem;
                if (!tempItem["find"]) {
                    const item = ele2.get(tempItem.elementId);
                    tempItem.source = this.getI18n(tempItem.source);
                    tempItem["price"] = [{
                        price: shopitem.price || 0,
                        coinType: this.getCoinType(shopitem.currencyId),
                        displayPrecision: 0
                    }];
                    if (item == null) {
                        Logger.getInstance().error("Element2中有不存在的ID: " + item);
                        continue;
                    }
                    tempItem.name = this.getI18n(item.name);
                    tempItem.icon = this.getSerializePng(item.serializeString);
                    shopitem["find"] = true;
                    shopitem["item"] = item;
                }
            }
            tempArr[extend] = true;
            return tempArr;
        }
    }
    public getCoinType(id: string) {
        if (id === "IV0000001")
            return 3;
        else if (id === "IV0000002")
            return 4;
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
     *  getLevels
     */
    public getLevels(type: string) {
        const data: LevelConfig = this.getConfig(BaseDataType.level);
        return data.levels(type);
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
        const dataTypes = [BaseDataType.minescene, BaseDataType.publicscene, BaseDataType.roomscene];
        for (const dataType of dataTypes) {
            const config: SceneConfig = this.getConfig(dataType);
            const data: IScene = config.get(id);
            if (data) {
                return data;
            }
        }
        return undefined;
    }

    public getScenesByCategory(subtype?: string, tag?: number) {
        if (!this.sceneMap) {
            this.sceneMap = new SceneConfigMap();
            const dataTypes = [BaseDataType.minescene, BaseDataType.publicscene, BaseDataType.roomscene];
            for (const dataType of dataTypes) {
                const config: SceneConfig = this.getConfig(dataType);
                this.sceneMap.setSceneMap(config.sceneMap, this.getI18n.bind(this));
            }
            this.sceneMap.sort();
        }
        return this.sceneMap.getScenes(subtype, tag);
    }
    public getScenes(type: string) {
        const config: SceneConfig = this.getConfig(type);
        const tempArr = Array.from(config.sceneMap.values());
        const arr = [];
        for (const temps of tempArr) {
            for (const temp of temps) {
                if (!temp["find"]) {
                    temp.roomName = this.getI18n(temp.roomName);
                    temp["find"] = true;
                }
                arr.push(temp);
            }
        }
        return arr;
    }
    public getQuest(id: string) {
        const data: QuestConfig = this.getConfig(BaseDataType.quest);
        const quest = data.get(id);
        if (quest && !quest["find"]) {
            quest.name = this.getI18n(quest.name);
            quest.des = this.getI18n(quest.des);
            quest["find"] = true;
        }
        return data.get(id);
    }

    public findGuide(id: string) {
        const data: GuideConfig = this.getConfig(BaseDataType.guide);
        const guide = data.findGuide(id);
        const guideText = guide.guideText;
        if (guideText && !guideText["extends"]) {
            for (let i = 0; i < guideText.length; i++) {
                guideText[i] = this.getI18n(guideText[i]);
            }
            guideText["extends"] = true;
        } else guide.guideText = [];
        return guide;
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
                        this.synItemBase(value);
                    }
                }
                temp["find"] = true;
            }
        } else if (type === GalleryType.dexLevel) {
            if (!temp["find"]) {
                const dex = <IGalleryLevel>temp;
                const rewardItems = [dex.rewardItems];
                if (rewardItems) {
                    for (const value of rewardItems) {
                        this.synItemBase(value);
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
    public getQuestGroupMap(id: string) {
        const dataTypes = [BaseDataType.questGroup, BaseDataType.dailyQuestGroup];
        for (const dataType of dataTypes) {
            const config: QuestGroupConfig = this.getConfig(dataType);
            const group = config.get(id);
            if (group) {
                if (!group["find"]) {
                    group.name = this.getI18n(group.name);
                    group.des = this.getI18n(group.des);
                    group.itemid = "IP1220019";
                    group.reward = this.getItemBaseByID(group.itemid);
                    group["find"] = true;
                }
                return group;
            }
        }

        return undefined;
    }

    public getItemPIDataByID(baseID: string): Promise<IElementPi> {
        const baseData = this.getItemBaseByID(baseID);
        return this.checkDynamicElementPI({ sn: baseData.sn, itemid: baseID, serialize: baseData.serializeString });
    }

    /**
     * 动态加载LementPI数据
     * @param ownerType 请求来源配置
     * @param serialize 请求路径
     * @returns
     */
    public checkDynamicElementPI(data: { sn: string, itemid: string, serialize: string, ownerType?: number }): Promise<IElementPi> {
        return new Promise<IElementPi>((resolve, reject) => {
            const configType: any = BaseDataType.elementpi;
            const ownerType = data.ownerType === 2 ? BaseDataType.element : BaseDataType.item;
            if (!this.dataMap.has(configType)) {
                const tempconfig = new ElmentPiConfig();
                this.dataMap.set(configType, tempconfig);
            }
            const config = <ElmentPiConfig>this.dataMap.get(configType);
            config.url = ResUtils.getResRoot(data.serialize);
            if (config.has(data.sn)) {
                const elepi = config.get(data.sn);
                this.mGame.peer.workerEmitter(EventType.RETURN_ELEMENT_PI_DATA + "_" + data.sn, elepi);
                resolve(elepi);
                return;
            }
            this.dynamicLoad(new Map([[configType, config]])).then(() => {
                const elepi: IElementPi = config.get(data.sn);
                elepi.itemId = data.itemid;
                const item = this.dataMap.get(ownerType);
                item["elepi"] = elepi;
                this.mGame.peer.workerEmitter(EventType.RETURN_ELEMENT_PI_DATA + "_" + data.sn, elepi);
                resolve(elepi);
            }, (reponse) => {
                Logger.getInstance().error("未成功加载配置:" + reponse);
                this.mGame.peer.workerEmitter(EventType.RETURN_ELEMENT_PI_DATA + "_" + data.sn, undefined);
                resolve(undefined);
            });
        });
    }

    /**
     * 通过ID获取element2 数据
     * @param id
     * @returns
     */
    public getElement2Data(id: string): IElement {
        const data: Element2Config = this.getConfig(BaseDataType.element2);
        const element = data.get(id);
        if (element && !element["find"]) {
            const serializeString = element.serializeString;
            if (serializeString) {
                element.texture_path = this.getSerializePng(serializeString);
            }
            element["find"] = true;
        }
        return element;
    }

    public getFurnitureGrade(grade: number) {
        const data: FurnitureGradeConfig = this.getConfig(BaseDataType.furnitureGrade);
        const temp = data.get(grade);
        return temp;
    }
    public getFurnitureGradeMap() {
        const data: FurnitureGradeConfig = this.getConfig(BaseDataType.furnitureGrade);
        const temp = data.gradeMap;
        const obj: any = {};
        temp.forEach((value) => {
            obj[value.grade] = value;
        });
        return obj;
    }
    public getRecharges(type: number, id?: string) {
        const data: RechargeConfig = this.getConfig(BaseDataType.charge);
        const tempArr = data.get(type, id);
        for (const temp of tempArr) {
            if (!temp["find"]) {
                temp.name = temp.nameId = this.getI18n(temp.nameId);
                this.getBatchItemDatas(temp.items);
                this.getBatchItemDatas(temp.firstPurchaseItems);
                temp["find"] = true;
            }
        }
        return tempArr;
    }
    public getReputationCoin() {
        const data: Setting2Config = this.getConfig(BaseDataType.settings2);
        return data.getReputationCoin();
    }
    public getFameLevel(level: number) {
        const data: FameLevelConfig = this.getConfig(BaseDataType.famelevel);
        const temp = data.get(level);
        if (!temp["find"]) {
            this.getBatchItemDatas(temp.rewardItems);
            temp.permission = this.getPermission(temp.permission);
            temp["find"] = true;
        }
        return temp;
    }

    public getFames() {
        const data: FameLevelConfig = this.getConfig(BaseDataType.famelevel);
        const pools = data.getPools();
        if (!data["find"]) {
            for (const pool of pools) {
                this.getBatchItemDatas(pool.rewardItems);
                pool.permission = this.getPermission(pool.permission);
                pool["find"] = true;
            }
            data["find"] = true;
        }
        return pools;
    }
    public getBattlePass(id: string) {
        const data: BattlePassConfig = this.getConfig(BaseDataType.battlePass);
        const temp = data.get(id);
        if (!temp["find"]) {
            this.getBatchItemDatas(temp.maxLevelReward);
            this.getBatchItemDatas(temp.levelUpCost);
            temp["find"] = true;
        }
        return data.get(id);
    }

    public getBattleLevels() {
        const data: BattleLevelConfig = this.getConfig(BaseDataType.battlePassLevel);
        const temps = data.getLevels();
        for (const temp of temps) {
            if (!temp["find"]) {
                this.getBatchItemDatas(temp.deluxeReward);
                this.getBatchItemDatas(temp.elementaryReward);
                temp["find"] = true;
            }
        }
        return data.getLevels();
    }

    public getPermission(id: string) {
        const data: PermissionConfig = this.getConfig(BaseDataType.permission);
        const temp = data.get(id);
        if (!temp["find"]) {
            temp.name = this.getI18n(temp.name);
            temp.des = this.getI18n(temp.des);
            temp["find"] = true;
        }
        return temp;
    }
    public destory() {
        super.destory();
        this.mGame.emitter.off(EventType.QUEST_ELEMENT_PI_DATA, this.checkDynamicElementPI, this);
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
        this.dataMap.set(BaseDataType.roomscene, new SceneConfig());
        this.dataMap.set(BaseDataType.quest, new QuestConfig());
        this.dataMap.set(BaseDataType.guide, new GuideConfig());
        this.dataMap.set(BaseDataType.furnituregroup, new FurnitureGroup());
        this.dataMap.set(BaseDataType.gallery, new GalleryConfig());
        this.dataMap.set(BaseDataType.questGroup, new QuestGroupConfig());
        this.dataMap.set(BaseDataType.dailyQuestGroup, new QuestGroupConfig());
        this.dataMap.set(BaseDataType.element2, new Element2Config());
        this.dataMap.set(BaseDataType.furnitureGrade, new FurnitureGradeConfig());
        this.dataMap.set(BaseDataType.charge, new RechargeConfig());
        this.dataMap.set(BaseDataType.settings2, new Setting2Config());
        this.dataMap.set(BaseDataType.famelevel, new FameLevelConfig());
        this.dataMap.set(BaseDataType.battlePass, new BattlePassConfig());
        this.dataMap.set(BaseDataType.battlePassLevel, new BattleLevelConfig());
        this.dataMap.set(BaseDataType.permission, new PermissionConfig());
    }

    protected configUrl(reName: string, tempurl?: string) {
        if (tempurl) {
            return tempurl;// this.mGame.getGameConfig().locationhref + `resources_v${version}/${tempurl}`;
        }
        const url = this.baseDirname + `client_resource/${reName}.json`;
        return url;
    }
    private checkItemData(item: ICountablePackageItem) {
        if (!item || item["find"]) return;
        const config: ItemBaseDataConfig = this.getConfig(BaseDataType.item);
        item.name = this.getI18n(item.name, { id: item.id, name: item.name });
        item.source = item.source && item.source.length > 0 ? this.getI18n(item.source, { id: item.id, source: item.source }) : "";
        item.des = this.getI18n(item.des, { id: item.id, des: item.source });
        item["exclude"] = config.excludes;
        if (item.texturePath) item["display"] = { texturePath: item.texturePath };
        const serializeString = item.serializeString;
        if (serializeString) {
            item.texturePath = this.getSerializePng(serializeString);
            item["display"] = { texturePath: item.texturePath };
        }
        item["find"] = true;
    }

    private getSerializePng(serializeString: string) {
        const index = serializeString.lastIndexOf(".");
        let texturePath;
        if (index === -1) {
            texturePath = serializeString + "_s";
        } else {
            const path = serializeString.slice(0, index);
            texturePath = path + "_s.png";
        }
        return texturePath;
    }
}
