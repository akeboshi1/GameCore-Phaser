import { BaseConfigData } from "gamecore";
import { ICardPool } from "src/pica/structure/icardpool";
import { Logger } from "utils";

export class CardPoolConfig extends BaseConfigData {

    public pools: any[];
    public get(id: string): ICardPool {
        if (this.hasOwnProperty(id)) {
            return this[id];
        } else {
            Logger.getInstance().error(`cardpool表未配置ID为:${id}的数据`);
            return undefined;
        }
    }
    public parseJson(json) {
        this.pools = [];
        for (const key in json) {
            if (Object.prototype.hasOwnProperty.call(json, key)) {
                this[key] = json[key];
                this.pools.push(json[key]);
            }
        }
    }

    protected get testData() {
        const temp = {
            "CP0000001": {
                "className": "CardPool",
                "id": "CP0000001",
                "tokenId": "IV0000001",
                "price": 1500,
                "unitPrice": 1500,
                "alterTokenId": "IP1200112",
                "drawTime": 1,
                "freeCycleHours": 8,
                "rewardId": "REWARD1500005",
                "picaStarCount": 1,
                "cardPoolGroup": 1,
                "coverPath": "cover/roan_banner_silver",
                "backPath": "background/roam_topic_silver"
            },
            "CP0000002": {
                "className": "CardPool",
                "id": "CP0000002",
                "tokenId": "IV0000001",
                "price": 15000,
                "unitPrice": 1500,
                "alterTokenId": "IP1200112",
                "drawTime": 10,
                "freeCycleHours": 24,
                "rewardId": "REWARD1500005",
                "rewardIdHigh": "REWARD1500006",
                "rewardHighTime": 1,
                "progressReward": "SETTING0160001",
                "picaStarCount": 10,
                "cardPoolGroup": 1,
                "coverPath": "cover/roan_banner_silver",
                "backPath": "background/roam_topic_silver"
            },
            "CP0000003": {
                "className": "CardPool",
                "id": "CP0000003",
                "tokenId": "IV0000002",
                "price": 120,
                "unitPrice": 120,
                "alterTokenId": "IP1200111",
                "drawTime": 1,
                "rewardId": "REWARD1500119",
                "picaStarCount": 3,
                "cardPoolGroup": 2,
                "coverPath": "cover/roan_banner_diamond",
                "backPath": "background/roam_topic1"
            },
            "CP0000004": {
                "className": "CardPool",
                "id": "CP0000004",
                "tokenId": "IV0000002",
                "price": 1200,
                "unitPrice": 120,
                "alterTokenId": "IP1200111",
                "drawTime": 10,
                "rewardId": "REWARD1500120",
                "rewardIdHigh": "REWARD1500121",
                "rewardHighTime": 1,
                "progressReward": "SETTING0160001",
                "picaStarCount": 30,
                "cardPoolGroup": 2,
                "coverPath": "cover/roan_banner_diamond",
                "backPath": "background/roam_topic1"
            },
            "CP0000005": {
                "className": "CardPool",
                "id": "CP0000005",
                "tokenId": "IV0000002",
                "price": 120,
                "unitPrice": 120,
                "alterTokenId": "IP1200111",
                "drawTime": 1,
                "rewardId": "REWARD1500125",
                "picaStarCount": 3,
                "cardPoolGroup": 3,
                "coverPath": "cover/roan_banner_1",
                "backPath": "background/roam_topic_silver"
            },
            "CP0000006": {
                "className": "CardPool",
                "id": "CP0000006",
                "tokenId": "IV0000002",
                "price": 1200,
                "unitPrice": 120,
                "alterTokenId": "IP1200111",
                "drawTime": 10,
                "rewardId": "REWARD1500125",
                "rewardIdHigh": "REWARD1500125",
                "rewardHighTime": 1,
                "progressReward": "SETTING0160001",
                "picaStarCount": 30,
                "cardPoolGroup": 3,
                "coverPath": "cover/roan_banner_1",
                "backPath": "background/roam_topic_silver"
            }
        };
        return temp;
    }
}
