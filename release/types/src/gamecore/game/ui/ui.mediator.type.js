var UIMediatorType = /** @class */ (function () {
    function UIMediatorType() {
    }
    UIMediatorType.BagMediator = "BagMediator"; // 角色背包
    UIMediatorType.ChatMediator = "ChatMediator"; // 场景聊天框
    UIMediatorType.NOTICE = "Notice";
    UIMediatorType.DIALOGO = "DIALOGO";
    UIMediatorType.Turn_Btn_Top = "Turn_Btn_Top";
    UIMediatorType.Turn_Btn_Bottom = "Turn_Btn_Bottom";
    UIMediatorType.App_Back = "App_Back";
    UIMediatorType.Editor_Save = "Editor_Save";
    UIMediatorType.Editor_Cancel = "Editor_Cancel";
    UIMediatorType.Close_Btn = "Close_Btn";
    UIMediatorType.ControlF = "ControlF"; // 展示框
    UIMediatorType.Storage = "Storage"; // 物件背包
    UIMediatorType.UserInfo = "UserInfo"; // 人物信息
    UIMediatorType.UserMenu = "UserMenu"; // 人物菜单
    UIMediatorType.MessageBox = "MessageBox"; // 消息框
    UIMediatorType.ComponentRank = "ComponentRank"; // 常驻固定排行榜
    UIMediatorType.Rank = "Rank"; // 排行榜
    UIMediatorType.VoteResult = "VoteResult"; // 投票界面
    UIMediatorType.Shop = "Shop"; // 内购商城
    UIMediatorType.MineSettle = "MineSettle"; // 矿洞结算
    UIMediatorType.EquipUpgrade = "EquipUpgrade"; // 装备升级
    UIMediatorType.DecorateControll = "DecorateControll"; // 布置控制
    return UIMediatorType;
}());
export { UIMediatorType };
export var UILayoutType;
(function (UILayoutType) {
    UILayoutType[UILayoutType["None"] = 0] = "None";
    UILayoutType[UILayoutType["Middle"] = 1] = "Middle";
    UILayoutType[UILayoutType["Top"] = 2] = "Top";
    UILayoutType[UILayoutType["Left"] = 3] = "Left";
    UILayoutType[UILayoutType["Right"] = 4] = "Right";
    UILayoutType[UILayoutType["Bottom"] = 5] = "Bottom";
})(UILayoutType || (UILayoutType = {}));
//# sourceMappingURL=ui.mediator.type.js.map