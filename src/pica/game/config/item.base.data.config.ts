import { BaseConfigData } from "gamecore";
import { ICountablePackageItem } from "picaStructure";
import { Logger } from "utils";

export class ItemBaseDataConfig extends BaseConfigData {
    public excludes = ["count"];
    public snMap: Map<string, ICountablePackageItem> = new Map<string, ICountablePackageItem>();
    getSerialize(id: string): boolean {
        if (this.hasOwnProperty(id)) {
            const item = this[id];
            return item.serialize;
        }
        return true;
    }

    public getByID(id: string): ICountablePackageItem {
        if (this.hasOwnProperty(id)) {
            return this[id];
        } else {
            if (id !== "DISPLAY0000000") Logger.getInstance().error(`道具表未配置ID为:${id}的道具数据`);
            return undefined;
        }
    }

    public getBySN(sn: string): ICountablePackageItem {
        if (this.snMap.has(sn)) {
            return this.snMap.get(sn);
        } else {
            Logger.getInstance().error(`道具表未配置sn为:${sn}的道具数据`);
            return undefined;
        }
    }

    public getCoinType(id: string) {
        if (id === "IV0000001")
            return 3;
        else if (id === "IV0000002")
            return 4;
        else if (id === "IV0000023")
            return 5;
    }

    parseJson(json) {
        super.parseJson(json);
        const regPos = /^\d+(\.\d+)?$/; // 非负浮点数
        if (!this.snMap) this.snMap = new Map<string, ICountablePackageItem>();
        for (const jsonKey in json) {
            const data = json[jsonKey];
            if (regPos.test(data.source)) {
                data.source = "PKT_MARKET_TAG_SOURCE_" + data.source;
            }
            if (regPos.test(data.category)) {
                data.category = "PKT_PACKAGE_CATEGORY_" + data.category;
            }
            if (regPos.test(data.subcategory)) {
                data.subcategory = "PKT_MARKET_TAG_" + data.subcategory;
            }
            this.snMap.set(data.sn, data);
        }

    }

    private consoleCategoryJson() {
        const map = new Map();
        for (const key in this) {
            if (Object.prototype.hasOwnProperty.call(this, key)) {
                const element = this[key];
                const category = element["category"];
                const subcategory = element["subcategory"];
                if (category === undefined) continue;
                if (map.has(category)) {
                    const arr = map.get(category);
                    if (arr.indexOf(subcategory) === -1) {
                        arr.push(subcategory);
                    }
                } else {
                    const arr = [subcategory];
                    map.set(category, arr);
                }
            }
        }
        const obj = Object.create(null);
        map.forEach((value, key) => {
            obj[key] = value;
        });
        Logger.getInstance().error(JSON.stringify(obj));
    }

    private consoleClassNameJson() {
        const map = new Map();
        for (const key in this) {
            if (Object.prototype.hasOwnProperty.call(this, key)) {
                const element = this[key];
                const category = element["className"];
                const subcategory = element["subcategory"];
                if (category === undefined) continue;
                if (map.has(category)) {
                    const arr = map.get(category);
                    if (arr.indexOf(subcategory) === -1) {
                        arr.push(subcategory);
                    }
                } else {
                    const arr = [subcategory];
                    map.set(category, arr);
                }
            }
        }
        const obj = Object.create(null);
        map.forEach((value, key) => {
            obj[key] = value;
        });
        Logger.getInstance().error(JSON.stringify(obj));
    }
}
