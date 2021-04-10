import { BaseConfigData } from "gamecore";
import { ICountablePackageItem } from "picaStructure";
export declare class ItemBaseDataConfig extends BaseConfigData {
    excludes: string[];
    snMap: Map<string, ICountablePackageItem>;
    getByID(id: string): ICountablePackageItem;
    getBySN(sn: string): ICountablePackageItem;
    getCoinType(id: string): 4 | 3;
    parseJson(json: any): void;
    private consoleCategoryJson;
    private consoleClassNameJson;
}
