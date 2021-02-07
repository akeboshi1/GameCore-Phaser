import { BaseConfigData, BaseConfigManager, Game } from "gamecore";
import { ICountablePackageItem, IElement, IExploreChapterData, IExploreLevelData, IExtendCountablePackageItem } from "picaStructure";
import { IMarketCommodity, IShopBase } from "src/pica/structure/imarketcommodity";
import { loadArr, Logger, ObjectAssign, Url } from "utils";
import { ElementDataConfig } from "./element.data.config";
import { ExploreDataConfig } from "./explore.data.config";
import { I18nZHDataConfig } from "./i18nzh.config";
import { ItemBaseDataConfig } from "./item.base.data.config";
import { ItemCategoryConfig } from "./item.category.config";
import { ShopConfig } from "./shop.config";
import version from "../../../../version";

export enum BaseDataType {
    i18n_zh = "i18n_zh",
    explore = "explore",
    item = "item",
    element = "element",
    shop = "material_shop",
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
                    }
                }
            }
            item["find"] = true;
        }
        return item;
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
    }

    public getRecastItemBases() {
        const temp = [];
        const data: ItemBaseDataConfig = this.getConfig(BaseDataType.item);
        for (const key in data) {
            if (data.hasOwnProperty(key)) {
                const element = data[key];
                if (element.className === "FurnitureItem" && element.rarity === 1) {
                    temp.push(element);
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
                    Object.assign(clue, item);
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

    public getShopBase(id: string): IShopBase {
        const data: ShopConfig = this.getConfig(BaseDataType.shop);
        const temp = data.get(id);
        if (temp && !temp["find"]) {
            const item = this.getItemBase(temp.itemId);
            temp.name = item.name;
            temp.icon = item.texturePath;
            temp.source = item.source;
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

    public getI18n(id: string, tips?: any) {
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

    public getShopSubCategory() {
        const data: ShopConfig = this.getConfig(BaseDataType.shop);
        const extend = "subextend";
        if (data.hasOwnProperty(extend)) {
            return data[extend];
        } else {
            const categorys: Array<{ key: string, value: string }> = [];
            const subs = data["subcategory"];
            for (const sub of subs) {
                const value = this.getI18n(sub);
                categorys.push({ key: sub, value });
            }
            data["subcategory"] = categorys;
            return categorys;
        }
    }
    public getShopItems(sub: string) {
        const data: ShopConfig = this.getConfig(BaseDataType.shop);
        const itemconfig: ItemBaseDataConfig = this.getConfig(BaseDataType.item);
        const arr = data.subMap.get(sub);
        const extend = "subarrextend";
        if (arr[extend]) {
            return arr;
        } else {
            for (const shopitem of arr) {
                const tempItem: IMarketCommodity = <any>shopitem;
                if (!shopitem["find"]) {
                    const item = this.getItemBase(shopitem.itemId);
                    tempItem.name = this.getI18n(shopitem.name);
                    tempItem.source = this.getI18n(shopitem.source);
                    tempItem["des"] = this.getI18n(item.des);
                    // const valueItem = this.getItemBase(shopitem.currencyId);
                    tempItem["price"] = [{
                        price: shopitem.price,
                        coinType: itemconfig.getCoinType(shopitem.currencyId),
                        displayPrecision: 0
                    }];
                    shopitem["find"] = true;
                    ObjectAssign.excludeTagAssign(shopitem, item);
                }
            }
            arr[extend] = true;
        }
    }

    protected add() {
        this.dataMap.set(BaseDataType.i18n_zh, new I18nZHDataConfig());
        this.dataMap.set(BaseDataType.explore, new ExploreDataConfig());
        this.dataMap.set(BaseDataType.item, new ItemBaseDataConfig());
        this.dataMap.set(BaseDataType.element, new ElementDataConfig());
        this.dataMap.set(BaseDataType.shop, new ShopConfig());
    }

    protected configUrl(reName: string, tempurl?: string) {
        if (tempurl) {
            return this.mGame.getGameConfig().locationhref + `resources_v${version}/${tempurl}`;
        }
        const url = this.baseDirname + `client_resource/${reName}.json`;
        return url;
    }
}
