import { BaseConfigData, BaseConfigManager, Game } from "gamecore";
import { ICountablePackageItem, IElement, IExploreChapterData, IExploreLevelData, IExtendCountablePackageItem } from "picaStructure";
import { IMarketCommodity, IShopBase } from "../../../pica/structure/imarketcommodity";
import { Logger, ObjectAssign, StringUtils, Url } from "utils";
import { ElementDataConfig } from "./element.data.config";
import { ExploreDataConfig } from "./explore.data.config";
import { I18nZHDataConfig } from "./i18nzh.config";
import { ItemBaseDataConfig } from "./item.base.data.config";
import { ItemCategoryConfig } from "./item.category.config";
import { ShopConfig } from "./shop.config";
import version from "../../../../version";
import { JobConfig } from "./job.config";
import { IJob } from "../../../pica/structure/ijob";
import { CardPoolConfig } from "./cardpool.config";
import { ICraftSkill } from "src/pica/structure/icraftskill";
import { SkillConfig } from "./skill.config";
import { LevelConfig } from "./level.config";

export enum BaseDataType {
    i18n_zh = "i18n_zh",
    explore = "explore",
    item = "item",
    element = "element",
    shop = "shop",
    job = "job",
    cardPool = "cardPool",
    skill = "skill",
    level = "level"
    // itemcategory = "itemcategory"
}

export class BaseDataConfigManager extends BaseConfigManager {
    protected baseDirname: string;
    protected dataMap: Map<string, BaseConfigData> = new Map();
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

    public getItemBase(id: string): ICountablePackageItem | IExtendCountablePackageItem {
        const data: ItemBaseDataConfig = this.getConfig(BaseDataType.item);
        const item = data.get(id);
        if (item && !item["find"]) {
            item.name = this.getI18n(item.name, { id: item.id, name: "name" });
            item.source = this.getI18n(item.source, { id: item.id, source: "source" });
            item.des = this.getI18n(item.des, { id: item.id, des: "des" });
            item["exclude"] = data.excludes;
            if (item.texturePath) item["display"] = { texturePath: item.texturePath };
            if (item.elementId && item.elementId !== "") {
                const element = this.getElementData(item.elementId);
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

    public getBatchItemDatas(items: any[]) {
        if (!items) return [];
        for (const item of items) {
            if (!item["find"]) {
                const tempitem = this.getItemBase(item.id);
                ObjectAssign.excludeTagAssign(item, tempitem, "exclude");
                item["find"] = true;
            }
        }
        return items;
    }
    public synItemBase(item: any) {
        if (!item) return undefined;
        const tempitem = this.getItemBase(item.id);
        ObjectAssign.excludeTagAssign(item, tempitem, "exclude");
        return item;
    }

    public getRecastItemBases() {
        const temp = [];
        const data: ItemBaseDataConfig = this.getConfig(BaseDataType.item);
        for (const key in data) {
            if (data.hasOwnProperty(key)) {
                const element = data[key];
                if (element.className === "FurnitureItem" && element.rarity === 1) {
                    const item = this.getItemBase(element.id);
                    if (item)
                        temp.push(item);
                }
            }
        }
        return temp;
    }
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

    public getExploreLevelData(id: number): IExploreLevelData {
        const data: ExploreDataConfig = this.getConfig(BaseDataType.explore);
        const level = data.getLevel(id);
        if (level && !level["find"]) {
            level.name = this.getI18n(level.name);
            if (level.clueItems) {
                for (const clue of level.clueItems) {
                    const item = this.getItemBase(clue.itemId);
                    if (item) Object.assign(clue, item);
                }
            }
            level["find"] = true;
            level["exclude"] = data.excludes;
        }
        return level;
    }

    public getElementData(id: string): IElement {
        const data: ElementDataConfig = this.getConfig(BaseDataType.element);
        const element = data.get(id);
        return element;
    }

    public getElementSNUnlockMaterials(sns: string[]) {
        const data: ElementDataConfig = this.getConfig(BaseDataType.element);
        const map: Map<string, any> = new Map();
        for (const key in data) {
            if (data.hasOwnProperty(key)) {
                const temp = data[key];
                if (sns.indexOf(temp.sn) !== -1) {
                    const unlockstri = JSON.stringify(temp.unLockMaterials);
                    map.set(temp.sn, JSON.parse(unlockstri));
                }
            }
            if (map.size === sns.length) break;
        }
        return map;
    }

    public getShopBase(id: string): IShopBase {
        const data: ShopConfig = this.getConfig(BaseDataType.shop);
        const temp = data.get(id);
        if (temp && !temp["find"]) {
            const item = this.getItemBase(temp.itemId);
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

        return temp;
    }

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
        const itemconfig: ItemBaseDataConfig = this.getConfig(BaseDataType.item);
        const map = data.propMap.get(category);
        const extend = "extendfind";
        const tempArr = map.get(sub);
        if (tempArr[extend]) {
            return tempArr;
        } else {
            for (const shopitem of tempArr) {
                const tempItem: IMarketCommodity = <any>shopitem;
                if (!shopitem["find"]) {
                    const item = this.getItemBase(shopitem.itemId);
                    tempItem.name = this.getI18n(shopitem.name);
                    tempItem.source = this.getI18n(shopitem.source);
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
            tempArr[extend] = true;
            return tempArr;
        }
    }

    public getCardPool(id: string) {
        const data: CardPoolConfig = this.getConfig(BaseDataType.cardPool);
        return data.get(id);
    }

    public getCardPools() {
        const data: CardPoolConfig = this.getConfig(BaseDataType.cardPool);
        return data.pools;
    }

    protected add() {
        this.dataMap.set(BaseDataType.i18n_zh, new I18nZHDataConfig());
        this.dataMap.set(BaseDataType.explore, new ExploreDataConfig());
        this.dataMap.set(BaseDataType.item, new ItemBaseDataConfig());
        this.dataMap.set(BaseDataType.element, new ElementDataConfig());
        this.dataMap.set(BaseDataType.shop, new ShopConfig());
        this.dataMap.set(BaseDataType.job, new JobConfig());
        this.dataMap.set(BaseDataType.cardPool, new CardPoolConfig());
        this.dataMap.set(BaseDataType.skill, new SkillConfig());
        this.dataMap.set(BaseDataType.level, new LevelConfig());
    }

    protected configUrl(reName: string, tempurl?: string) {
        if (tempurl) {
            return this.mGame.getGameConfig().locationhref + `resources_v${version}/${tempurl}`;
        }
        const url = this.baseDirname + `client_resource/${reName}.json`;
        return url;
    }
}
