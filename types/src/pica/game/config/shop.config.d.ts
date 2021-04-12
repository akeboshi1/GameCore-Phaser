import { BaseConfigData } from "gamecore";
import { IShopBase } from "../../structure";
export declare class ShopConfig extends BaseConfigData {
    excludes: string[];
    propMap: Map<string, Map<string, IShopBase[]>>;
    categoryMap: Map<string, string[]>;
    get(id: string): IShopBase;
    parseJson(json: any): void;
    protected updateCtegoryMap(temp: any): void;
}
