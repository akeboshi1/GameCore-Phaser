import { BaseConfigData } from "gamecore";
export declare class ItemCategoryConfig extends BaseConfigData {
    static data: {
        PKT_PACKAGE_CATEGORY_1: string[];
        PKT_PACKAGE_CATEGORY_2: string[];
        PKT_PACKAGE_CATEGORY_3: string[];
        PKT_PACKAGE_CATEGORY_4: string[];
        PropItem: string[];
        HandheldItem: string[];
        ValueItem: string[];
        AvatarItem: string[];
        FurnitureItem: string[];
    };
    getSubCategory(type: number): any;
    getClassName(type: number): "FurnitureItem" | "AvatarItem" | "PropItem" | "HandheldItem" | "ValueItem";
}
