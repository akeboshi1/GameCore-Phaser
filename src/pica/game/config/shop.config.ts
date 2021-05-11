import { BaseConfigData } from "gamecore";
import { IMarketCommodity, IShopBase } from "../../structure";
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
        temp.category = temp.category || "commoncategory";
        const category = temp.category;
        const subcategory = temp.subcategory;
        if (this.categoryMap.has(category)) {
            const arr = this.categoryMap.get(category);
            if (arr.indexOf(subcategory) === -1)
                arr.push(subcategory);
        } else {
            this.categoryMap.set(category, [subcategory]);
        }
        if (this.propMap.has(category)) {
            const subMap = this.propMap.get(category);
            if (subMap.has(subcategory)) {
                const arr = subMap.get(subcategory);
                arr.push(temp);
            } else {
                subMap.set(subcategory, [temp]);
            }
        } else {
            const map = new Map();
            this.propMap.set(category, map);
            map.set(subcategory, [temp]);
        }

    }
}

export class DecorateShopConfig extends ShopConfig {
    public parseJson(json) {
        const arr = json["Sheet1"];
        for (const temp of arr) {
            this.updateCtegoryMap(temp);
        }
    }
    protected updateCtegoryMap(temp) {
        temp.category = temp.category || "commoncategory";
        temp.subcategory = "PKT_MARKET_TAG_" + temp.subcategory;
        const category = temp.category;
        const subcategory = temp.subcategory;
        if (this.categoryMap.has(category)) {
            const arr = this.categoryMap.get(category);
            if (arr.indexOf(subcategory) === -1)
                arr.push(subcategory);
        } else {
            this.categoryMap.set(category, [subcategory]);
        }
        if (this.propMap.has(category)) {
            const subMap = this.propMap.get(category);
            if (subMap.has(subcategory)) {
                const arr = subMap.get(subcategory);
                arr.push(temp);
            } else {
                subMap.set(subcategory, [temp]);
            }
        } else {
            const map = new Map();
            this.propMap.set(category, map);
            map.set(subcategory, [temp]);
        }

    }
}
