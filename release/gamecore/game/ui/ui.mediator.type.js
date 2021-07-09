var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
export class UIMediatorType {
}
__publicField(UIMediatorType, "BagMediator", "BagMediator");
__publicField(UIMediatorType, "ChatMediator", "ChatMediator");
__publicField(UIMediatorType, "NOTICE", "Notice");
__publicField(UIMediatorType, "DIALOGO", "DIALOGO");
__publicField(UIMediatorType, "Turn_Btn_Top", "Turn_Btn_Top");
__publicField(UIMediatorType, "Turn_Btn_Bottom", "Turn_Btn_Bottom");
__publicField(UIMediatorType, "App_Back", "App_Back");
__publicField(UIMediatorType, "Editor_Save", "Editor_Save");
__publicField(UIMediatorType, "Editor_Cancel", "Editor_Cancel");
__publicField(UIMediatorType, "Close_Btn", "Close_Btn");
__publicField(UIMediatorType, "ControlF", "ControlF");
__publicField(UIMediatorType, "Storage", "Storage");
__publicField(UIMediatorType, "UserInfo", "UserInfo");
__publicField(UIMediatorType, "UserMenu", "UserMenu");
__publicField(UIMediatorType, "MessageBox", "MessageBox");
__publicField(UIMediatorType, "ComponentRank", "ComponentRank");
__publicField(UIMediatorType, "Rank", "Rank");
__publicField(UIMediatorType, "VoteResult", "VoteResult");
__publicField(UIMediatorType, "Shop", "Shop");
__publicField(UIMediatorType, "MineSettle", "MineSettle");
__publicField(UIMediatorType, "EquipUpgrade", "EquipUpgrade");
__publicField(UIMediatorType, "DecorateControll", "DecorateControll");
export var UILayoutType;
(function(UILayoutType2) {
  UILayoutType2[UILayoutType2["None"] = 0] = "None";
  UILayoutType2[UILayoutType2["Middle"] = 1] = "Middle";
  UILayoutType2[UILayoutType2["Top"] = 2] = "Top";
  UILayoutType2[UILayoutType2["Left"] = 3] = "Left";
  UILayoutType2[UILayoutType2["Right"] = 4] = "Right";
  UILayoutType2[UILayoutType2["Bottom"] = 5] = "Bottom";
})(UILayoutType || (UILayoutType = {}));
