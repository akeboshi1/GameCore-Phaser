import { BaseConfigData } from "gamecore";
import { ILevel } from "../../structure";
import { Logger } from "utils";
export class FrameLevelConfig extends BaseConfigData {
    poolsMap: Map<number, ILevel> = new Map();
    public get(level: number): ILevel {
        const map = this.poolsMap;
        if (map.has(level)) {

            return map.get(level);
        } else {
            Logger.getInstance().error(`Level表未配置ID为:${level}的数据`);
            return undefined;
        }
    }
    parseJson(json) {
        const sheet1 = json["Sheet1"];
        for (const temp of sheet1) {
            this.poolsMap.set(temp.level, temp);
        }
    }
}
