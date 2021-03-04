import {BaseConfigData} from "gamecore";
import {ICountablePackageItem} from "picaStructure";

export class ItemBaseDataConfig extends BaseConfigData {
    excludes = ["count"];
    snMap: Map<string, ICountablePackageItem> = new Map<string, ICountablePackageItem>();

    public getByID(id: string): ICountablePackageItem {
        if (this.hasOwnProperty(id)) {
            return this[id];
        } else {
            // tslint:disable-next-line:no-console
            // console.error(`道具表未配置ID为:${id}的道具数据`);
            return undefined;
        }
    }

    public getBySN(sn: string): ICountablePackageItem {
        if (this.snMap.has(sn)) {
            return this.snMap.get(sn);
        } else {
            // tslint:disable-next-line:no-console
            // console.error(`道具表未配置sn为:${sn}的道具数据`);
            return undefined;
        }
    }

    public getCoinType(id: string) {
        if (id === "IV0000001")
            return 3;
        else if (id === "IV0000002")
            return 4;
    }

    parseJson(json) {
        super.parseJson(json);
        // this.consoleCategoryJson();
        // this.consoleClassNameJson();
        if (!this.snMap) this.snMap = new Map<string, ICountablePackageItem>();
        for (const jsonKey in json) {
            const data = json[jsonKey];
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
        // tslint:disable-next-line:no-console
        console.error(JSON.stringify(obj));
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
        // tslint:disable-next-line:no-console
        console.error(JSON.stringify(obj));
    }
}
