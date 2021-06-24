import { ICountablePackageItem } from "./icountablepackageitem";

export interface IBattlePassState {
    /**
     * 当前通行证等级
     */
    battlePassLevel: number;
    /**
     * 当前通行证经验
     */
    battlePassExp: number;
    /**
     * 已领取通行证基础奖励列表
     */
    elementaryRewardTakenList: number[];
    /**
     * 已领取通行证高级奖励列表
     */
    deluxeRewardTakenList: number[];
    /**
     * 是否购买高级通行证
     */
    boughtDeluxeBattlePass: number;
    /**
     * 挑战赛ID
     */
    battlePassId: string;
    /**
     * 是否已经领取最终奖励
     */
    gotMaxLevelReward: boolean;
    /**
     * 最终奖励是否可以领取
     */
    deluxeCanReceive: boolean;
    /**
     * 本地服务器时间
     */
    localTime: number;
}

export interface IBattlePass {
    id: string;
    levelUpCost: ICountablePackageItem[];
    maxLevelReward: ICountablePackageItem[];
    price: number;
    startTime: number;
    localTime: number;
    endTime: number;
}
export interface IBattlePassLevel {
    deluxeReward: ICountablePackageItem[];
    elementaryReward: ICountablePackageItem[];
    exp: number;
    level: number;
}
