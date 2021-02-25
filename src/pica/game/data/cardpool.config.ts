import { BaseConfigData } from "gamecore";
import { ICardPool } from "src/pica/structure/icardpool";
import { Logger } from "utils";

export class CardPoolConfig extends BaseConfigData {

    public pools: any[];
    public get(id: string): ICardPool {
        if (this.hasOwnProperty(id)) {
            return this[id];
        } else {
            Logger.getInstance().error(`cardpool表未配置ID为:${id}的数据`);
            return undefined;
        }
    }
    public parseJson(json) {
        this.pools = [];
        for (const key in json) {
            if (Object.prototype.hasOwnProperty.call(json, key)) {
                this[key] = json[key];
                this.pools.push(json[key]);
            }
        }
    }
}
