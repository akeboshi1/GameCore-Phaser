import { BaseConfigData } from "gamecore";
import { IShopBase } from "src/pica/structure/imarketcommodity";

export class ShopConfig extends BaseConfigData {
    public get(id: string): IShopBase {
        if (this.hasOwnProperty(id)) {
            return this[id];
        } else {
            // tslint:disable-next-line:no-console
            console.error(`商城表未配置ID为:${id}的道具数据`);
            return undefined;
        }
    }
    public parseJson(json) {
        for (const temp of json) {
            this[temp.id] = temp;
        }
    }
}
