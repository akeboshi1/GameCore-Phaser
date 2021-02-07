import { BaseConfigData } from "gamecore";
import { IMarketCommodity, IShopBase } from "picaStructure";
export class ShopConfig extends BaseConfigData {

    excludes = ["id", "name", "icon", "category", "subcategory", "source", "className", "price"];
    public subMap: Map<string, IShopBase[]> = new Map();
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
        const subCap = [];
        for (const temp of json) {
            this[temp.id] = temp;
            subCap.push(temp.subcategory);
            if (this.subMap.has(temp.subcategory)) {
                const arr = this.subMap.get(temp.subcategory);
                arr.push(temp);
            } else {
                this.subMap.set(temp.subcategory, [temp]);
            }
        }
        this["subcategory"] = subCap;
    }
}
