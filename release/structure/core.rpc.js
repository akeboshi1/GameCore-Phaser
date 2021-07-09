import { Export } from "webworker-rpc";
export const CoreExport = (params) => {
  return Export(params);
};
export var CoreParamType;
(function(CoreParamType2) {
  CoreParamType2[CoreParamType2["str"] = 1] = "str";
  CoreParamType2[CoreParamType2["boolean"] = 2] = "boolean";
  CoreParamType2[CoreParamType2["num"] = 3] = "num";
  CoreParamType2[CoreParamType2["unit8array"] = 4] = "unit8array";
  CoreParamType2[CoreParamType2["executor"] = 5] = "executor";
  CoreParamType2[CoreParamType2["custom"] = 6] = "custom";
})(CoreParamType || (CoreParamType = {}));
