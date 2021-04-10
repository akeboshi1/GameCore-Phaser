import { BaseConfigData } from "gamecore";
import { IMarketCommodity, IShopBase } from "picaStructure";
import { Logger } from "utils";
export class ShopConfig extends BaseConfigData {

    excludes = ["id", "name", "icon", "category", "subcategory", "source", "className", "price"];
    public propMap: Map<string, Map<string, IShopBase[]>> = new Map();
    public categoryMap: Map<string, string[]> = new Map();
    public get(id: string): IShopBase {
        if (this.hasOwnProperty(id)) {
            return this[id];
        } else {
            Logger.getInstance().error(`商城表未配置ID为:${id}的道具数据`);
            return undefined;
        }
    }
    public parseJson(json) {
        for (const temp of json) {
            this[temp.id] = temp;
            this.updateCtegoryMap(temp);
        }

    }

    protected updateCtegoryMap(temp) {
        if (this.categoryMap.has(temp.category)) {
            const arr = this.categoryMap.get(temp.category);
            if (arr.indexOf(temp.subcategory) === -1)
                arr.push(temp.subcategory);
        } else {
            this.categoryMap.set(temp.category, [temp.subcategory]);
        }
        if (this.propMap.has(temp.category)) {
            const subMap = this.propMap.get(temp.category);
            if (subMap.has(temp.subcategory)) {
                const arr = subMap.get(temp.subcategory);
                arr.push(temp);
            } else {
                subMap.set(temp.subcategory, [temp]);
            }
        } else {
            const map = new Map();
            this.propMap.set(temp.category, map);
            map.set(temp.subcategory, [temp]);
        }

    }
}
