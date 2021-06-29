import { ICountablePackageItem } from "./icountablepackageitem";
import { IPermission } from "./ipermission";

export interface IFameLevel {
    level: number;
    stage: string;
    exp: number;
    exchangeLimit: number;
    rewardItems: ICountablePackageItem[];
    permission?: any;

    // 动态数据
    allReceived: boolean;
    haveReward: boolean;
    unlockSystem: string;
    unlockRoom: number;
}
