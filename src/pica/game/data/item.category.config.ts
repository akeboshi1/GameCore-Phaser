import { BaseConfigData } from "gamecore";

export class ItemCategoryConfig extends BaseConfigData {
    url = "config/itemcategory.json";
    getClassNames() {
        return this["classname"];
    }

    getCategorys() {
        return this["category"];
    }
    getClassNameEnum() {
        return this["enumclass"];
    }

    getCategoryEnum() {
        return this["enumcategory"];
    }
}
