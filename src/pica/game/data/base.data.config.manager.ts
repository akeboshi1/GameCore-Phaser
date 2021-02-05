import { BaseConfigData, BaseConfigManager, Game } from "gamecore";
import { ICountablePackageItem, IElement, IExploreChapterData, IExploreLevelData, IExtendCountablePackageItem } from "picaStructure";
import { IShopBase } from "src/pica/structure/imarketcommodity";
import { loadArr, Logger, ObjectAssign } from "utils";
import { ElementDataConfig } from "./element.data.config";
import { ExploreDataConfig } from "./explore.data.config";
import { I18nZHDataConfig } from "./i18nzh.config";
import { ItemBaseDataConfig } from "./item.base.data.config";
import { ShopConfig } from "./shop.config";

export enum BaseDataType {
    i18n_zh = "i18n_zh",
    explore = "explore",
    item = "item",
    element = "element",
    shop = "shop"
}
export class BaseDataConfigManager extends BaseConfigManager {
    protected baseDirname: string;
    protected dataMap: Map<string, BaseConfigData> = new Map();
    constructor(game: Game) {
        super(game);
    }

    public getItemBase(id: string): ICountablePackageItem | IExtendCountablePackageItem {
        const data: ItemBaseDataConfig = this.getConfig(BaseDataType.item);
        const item = data.get(id);
        if (item && !item["find"]) {
            item.name = this.getI18n(item.name, { id: item.id, name: "name" });
            item.source = this.getI18n(item.source, { id: item.id, source: "source" });
            item.des = this.getI18n(item.des, { id: item.id, des: "des" });
            item["exclude"] = data.excludes;
            if (item.elementId && item.elementId !== "") {
                const element = this.getElementData(item.elementId);
                if (element) {
                    item["animations"] = element["AnimationData"];
                    item["animationDisplay"] = { dataPath: element.data_path, texturePath: element.texture_path };
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

    protected add() {
        this.dataMap.set(BaseDataType.i18n_zh, new I18nZHDataConfig());
        this.dataMap.set(BaseDataType.explore, new ExploreDataConfig());
        this.dataMap.set(BaseDataType.item, new ItemBaseDataConfig());
        this.dataMap.set(BaseDataType.element, new ElementDataConfig());
        this.dataMap.set(BaseDataType.shop, new ShopConfig());
    }
    protected configUrl(reName: string) {
        const url = this.baseDirname + `client_resource/${reName}.json`;
        return url;
    }
}
