import { BaseConfigData } from "gamecore";
import { ILevel } from "../../structure";
import { Logger } from "utils";
export class LevelConfig extends BaseConfigData {
    miningLevel: Map<number, ILevel> = new Map();
    playerLevel: Map<number, ILevel> = new Map();
    cabinLevel: Map<number, ILevel> = new Map();
    storeLevel: Map<number, ILevel> = new Map();
    loggingLevel: Map<number, ILevel> = new Map();
    farmingLevel: Map<number, ILevel> = new Map();
    public get(type: string, level: number): ILevel {
        const map = this.getMap(type);
        if (map.has(level)) {

            return map.get(level);
        } else {
            Logger.getInstance().error(`Level表未配置ID为:${level}的数据`);
            return undefined;
        }
    }
    /**
     *  通过类型获取所有等级数据
     */
    public levels(type: string) {
        const map = this.getMap(type);
        const arr = Array.from(this.playerLevel.values());
        return arr;
    }

    parseJson(json) {
        for (const key in json) {
            if (Object.prototype.hasOwnProperty.call(json, key)) {
                const arr = json[key];
                const map = this.getMap(key);
                if (!map) {
                    Logger.getInstance().log(`${key} does not exist!`);
                    continue;
                }
                for (const data of arr) {
                    map.set(data.level, data);
                }
            }
        }
    }

    protected getMap(tag: string) {
        switch (tag) {
            case "miningLevel":
                return this.miningLevel;
            case "playerLevel":
                return this.playerLevel;
            case "cabinLevel":
                return this.cabinLevel;
            case "storeLevel":
                return this.storeLevel;
            case "loggingLevel":
                return this.loggingLevel;
            case "farmingLevel":
                return this.farmingLevel;
        }
    }
}
