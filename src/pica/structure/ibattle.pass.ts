export interface IBattlePass {
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
    elementaryRewardTakenList: number;
    /**
     * 已领取通行证高级奖励列表
     */
    deluxeRewardTakenList: number;
    /**
     * 是否购买高级通行证
     */
    boughtDeluxeBattlePass: number;
}
