import { BaseConfigData } from "gamecore";
import { ICountablePackageItem } from "picaStructure";

export class ItemBaseDataConfig extends BaseConfigData {
    excludes = ["count"];
    public get(id: string): ICountablePackageItem {
        if (this.hasOwnProperty(id)) {
            return this[id];
        } else {
            // tslint:disable-next-line:no-console
            console.error(`道具表未配置ID为:${id}的道具数据`);
            return undefined;
        }
    }
}
