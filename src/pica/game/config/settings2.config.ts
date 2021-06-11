import { BaseConfigData } from "gamecore";
import { Logger } from "utils";
export class Setting2Config extends BaseConfigData {
    public defaultRecipes: number[];
    public reputationSettings: IReputationSettings;
    public get(id: string) {
        if (this.hasOwnProperty(id)) {
            return this[id];
        } else {
            Logger.getInstance().error(`Scene表未配置ID为:${id}的数据`);
            return undefined;
        }
    }
    public parseJson(json) {
        const arr = json["设置"];
        for (const temp of arr) {
            this[temp.id] = JSON.parse(temp.value);
        }
    }

    public getReputationCoin() {
        if (!this.reputationSettings || !this.reputationSettings.ExchangeReputationCoinPerEnergy) return undefined;
        return this.reputationSettings.ExchangeReputationCoinPerEnergy;
    }
}

export interface IReputationSettings {
    EnterRoomReputationValue: number;
    ExchangeReputationCoinPerEnergy: { id: string, count: number };
    GalleryBadgeReputationValue: number;
    RoomLikeReputationValue: number;
}
