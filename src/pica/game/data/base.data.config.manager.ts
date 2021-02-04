import { BaseConfigData, BaseConfigManager, Game } from "gamecore";
import { ICountablePackageItem, IExploreChapterData, IExploreLevelData } from "picaStructure";
import { loadArr, Logger } from "utils";
import { ExploreDataConfig } from "./explore.data.config";
import { I18nZHDataConfig } from "./i18nzh.config";
import { ItemBaseDataConfig } from "./item.base.data.config";

export enum BaseDataType {
    i18n_zh = "i18n_zh",
    explore = "explore",
    item = "item"
}
export class BaseDataConfigManager extends BaseConfigManager {
    protected baseDirname: string;
    protected dataMap: Map<string, BaseConfigData> = new Map();
    constructor(game: Game) {
        super(game);
    }

    public getItemBase(id: string): ICountablePackageItem {
        const data: ItemBaseDataConfig = this.getConfig(BaseDataType.item);
        const item = data.get(id);
        if (item && !item["find"]) {
            item.name = this.getI18n(item.name);
            item.source = this.getI18n(item.source);
            item.des = this.getI18n(item.des);
            item["find"] = true;
            item["exclude"] = data.excludes;
        }
        return item;
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

    public getI18n(id: string) {
        const data: I18nZHDataConfig = this.getConfig(BaseDataType.i18n_zh);
        return data.text(id);
    }

    protected add() {
        this.dataMap.set(BaseDataType.i18n_zh, new I18nZHDataConfig());
        this.dataMap.set(BaseDataType.explore, new ExploreDataConfig());
        this.dataMap.set(BaseDataType.item, new ItemBaseDataConfig());
    }
    protected configUrl(reName: string) {
        const url = this.baseDirname + `client_resource/${reName}.json`;
        return url;
    }
}
