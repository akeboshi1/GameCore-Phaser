import { BaseConfigData } from "gamecore";
export declare class ItemBaseDataConfig extends BaseConfigData {
    excludes: string[];
    snMap: Map<string, any>;
    getByID(id: string): any;
    getBySN(sn: string): any;
    getCoinType(id: string): 4 | 3;
    parseJson(json: any): void;
    private consoleCategoryJson;
    private consoleClassNameJson;
}
