import { BaseConfigData } from "gamecore";

export class ItemCategoryConfig extends BaseConfigData {
    static data = {
        "PKT_PACKAGE_CATEGORY_1": [
          "PKT_MARKET_TAG_10009",
          "PKT_MARKET_TAG_10004",
          "PKT_MARKET_TAG_10002",
          "PKT_MARKET_TAG_10005",
          "PKT_MARKET_TAG_10011",
          "PKT_MARKET_TAG_10001",
          "PKT_MARKET_TAG_10012",
          "PKT_MARKET_TAG_10003",
          "PKT_MARKET_TAG_10006",
          "PKT_MARKET_TAG_10008",
          "PKT_MARKET_TAG_10010",
          "PKT_MARKET_TAG_10007",
          "PKT_MARKET_TAG_10013",
          "PKT_MARKET_TAG_10014",
          "PKT_MARKET_TAG_10015",
          "PKT_MARKET_TAG_10016",
          "PKT_MARKET_TAG_10018",
          "PKT_MARKET_TAG_10017",
          "PKT_MARKET_TAG_10019"
        ],
        "PKT_PACKAGE_CATEGORY_2": [
          "PKT_MARKET_TAG_20001",
          "PKT_MARKET_TAG_20002",
          "PKT_MARKET_TAG_20003",
          "PKT_MARKET_TAG_20010",
          "PKT_MARKET_TAG_20005",
          "PKT_MARKET_TAG_20009",
          "PKT_MARKET_TAG_20006",
          "PKT_MARKET_TAG_20013",
          "PKT_MARKET_TAG_20007"
        ],
        "PKT_PACKAGE_CATEGORY_3": [
          "PKT_MARKET_TAG_30001",
          "PKT_MARKET_TAG_30000",
          "PKT_MARKET_TAG_30003",
          "PKT_MARKET_TAG_30004",
          "PKT_MARKET_TAG_30009",
          "PKT_MARKET_TAG_30005",
          "PKT_MARKET_TAG_30010",
          "PKT_MARKET_TAG_30007",
          "PKT_MARKET_TAG_30008",
          "PKT_MARKET_TAG_30006",
          "PKT_MARKET_TAG_30011"
        ],
        "PKT_PACKAGE_CATEGORY_4": [
          "PKT_MARKET_TAG_40001",
          "PKT_MARKET_TAG_40002"
        ],
        "PropItem": [
          "PKT_MARKET_TAG_20013",
          "PKT_MARKET_TAG_20009",
          "PKT_MARKET_TAG_20006",
          "PKT_MARKET_TAG_20001",
          "PKT_MARKET_TAG_20002",
          "PKT_MARKET_TAG_20003",
          "PKT_MARKET_TAG_20010",
          "PKT_MARKET_TAG_20005",
        ],
        "HandheldItem": [
          "PKT_MARKET_TAG_20007"
        ],
        "ValueItem": [
          "PKT_MARKET_TAG_40001",
          "PKT_MARKET_TAG_40002"
        ],
        "AvatarItem": [
          "PKT_MARKET_TAG_30001",
          "PKT_MARKET_TAG_30000",
          "PKT_MARKET_TAG_30003",
          "PKT_MARKET_TAG_30004",
          "PKT_MARKET_TAG_30009",
          "PKT_MARKET_TAG_30005",
          "PKT_MARKET_TAG_30010",
          "PKT_MARKET_TAG_30007",
          "PKT_MARKET_TAG_30008",
          "PKT_MARKET_TAG_30006",
          "PKT_MARKET_TAG_30011"
        ],
        "FurnitureItem": [
          "PKT_MARKET_TAG_10009",
          "PKT_MARKET_TAG_10004",
          "PKT_MARKET_TAG_10002",
          "PKT_MARKET_TAG_10005",
          "PKT_MARKET_TAG_10011",
          "PKT_MARKET_TAG_10001",
          "PKT_MARKET_TAG_10012",
          "PKT_MARKET_TAG_10003",
          "PKT_MARKET_TAG_10006",
          "PKT_MARKET_TAG_10008",
          "PKT_MARKET_TAG_10010",
          "PKT_MARKET_TAG_10007",
          "PKT_MARKET_TAG_10013",
          "PKT_MARKET_TAG_10014",
          "PKT_MARKET_TAG_10015",
          "PKT_MARKET_TAG_10016",
          "PKT_MARKET_TAG_10018",
          "PKT_MARKET_TAG_10017",
          "PKT_MARKET_TAG_10019"
        ]
      };

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
