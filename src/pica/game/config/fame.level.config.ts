import { BaseConfigData } from "gamecore";
import { IFameLevel } from "../../structure";
import { Logger } from "utils";
export class FameLevelConfig extends BaseConfigData {
    poolsMap: Map<number, IFameLevel> = new Map();
    pools: IFameLevel[];
    public get(level: number): IFameLevel {
        const map = this.poolsMap;
        if (map.has(level)) {

            return map.get(level);
        } else {
            Logger.getInstance().error(`Level表未配置ID为:${level}的数据`);
            return undefined;
        }
    }

    public getPools() {
        return this.pools;
    }
    parseJson(json) {
        this.pools = json["Sheet1"];
        for (const temp of this.pools) {
            this.poolsMap.set(temp.level, temp);
        }
    }
}
