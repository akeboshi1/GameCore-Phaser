export var ElementStateType;
(function (ElementStateType) {
    ElementStateType["NONE"] = "none";
    ElementStateType["UNFROZEN"] = "unfrozen";
    ElementStateType["REPAIR"] = "repair"; // 未解锁 材料够
})(ElementStateType || (ElementStateType = {}));
export var ElementState;
(function (ElementState) {
    // 无状态
    ElementState[ElementState["NONE"] = 0] = "NONE";
    // 创建element
    ElementState[ElementState["INIT"] = 1] = "INIT";
    // 数据初始化
    ElementState[ElementState["DATAINIT"] = 2] = "DATAINIT";
    // 数据准备更新
    ElementState[ElementState["DATAUPDATE"] = 3] = "DATAUPDATE";
    // 数据处理中
    ElementState[ElementState["DATADEALING"] = 4] = "DATADEALING";
    // 数据完成状态
    ElementState[ElementState["DATACOMPLETE"] = 5] = "DATACOMPLETE";
    // 预销毁
    ElementState[ElementState["PREDESTROY"] = 5] = "PREDESTROY";
    // 完成销毁
    ElementState[ElementState["DESTROYED"] = 6] = "DESTROYED";
})(ElementState || (ElementState = {}));
//# sourceMappingURL=element.state.data.js.map