import { ICountablePackageItem } from "./icountablepackageitem";

export interface IMineShowPackage {
    name: string;
    lv: number;
    durability: number;
    maxDurability: number;
    score: number;
    minePick: string;
    subcategory: string;
    icon: string;
    item: ICountablePackageItem;
}
