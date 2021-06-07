import { BaseConfigData } from "gamecore";
import { ILevel } from "../../structure";
import { Logger } from "utils";
export class LevelConfig extends BaseConfigData {
    poolsMap: Map<string, Map<number, ILevel>> = new Map();
    public get(type: string, level: number): ILevel {
        const map = this.poolsMap.get(type);
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
        const map = this.poolsMap.get(type);
        const arr = Array.from(map.values());
        return arr;
    }

    parseJson(json) {
        for (const key in json) {
            if (Object.prototype.hasOwnProperty.call(json, key)) {
                const arr = json[key];
                let map: Map<number, ILevel>;
                if (this.poolsMap.has(key)) {
                    map = this.poolsMap.get(key);
                } else {
                    map = new Map();
                    this.poolsMap.set(key, map);
                }
                for (const data of arr) {
                    map.set(data.level, data);
                }
            }
        }
    }
}
