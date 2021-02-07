import { BaseConfigData } from "gamecore";

export class ItemCategoryConfig extends BaseConfigData {
    url = "config/itemcategory.json";
    getSubCategory(type: number) {
        const key = this.getClassName(type);
        return this[key];
    }

    getClassName(type: number) {
        if (type === 1) {
            return "FurnitureItem";
        } else if (type === 2) {
            return "AvatarItem";
        } else if (type === 3) {
            return "PropItem";
        } else if (type === 4) {
            return "HandheldItem";
        } else if (type === 5) {
            return "ValueItem";
        }
    }
}
