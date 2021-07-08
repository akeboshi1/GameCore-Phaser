import { Export } from "webworker-rpc";
export var CoreExport = function (params) {
    return Export(params);
};
export var CoreParamType;
(function (CoreParamType) {
    CoreParamType[CoreParamType["str"] = 1] = "str";
    CoreParamType[CoreParamType["boolean"] = 2] = "boolean";
    CoreParamType[CoreParamType["num"] = 3] = "num";
    CoreParamType[CoreParamType["unit8array"] = 4] = "unit8array";
    CoreParamType[CoreParamType["executor"] = 5] = "executor";
    CoreParamType[CoreParamType["custom"] = 6] = "custom";
})(CoreParamType || (CoreParamType = {}));
//# sourceMappingURL=core.rpc.js.map