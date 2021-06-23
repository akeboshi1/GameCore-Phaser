import { Export } from "webworker-rpc";

export const CoreExport = (params?: number[]) => {
    return Export(params);
};

export enum CoreParamType {
    str = 1,
    boolean = 2,
    num = 3,
    unit8array = 4,
    executor = 5,
    custom = 6
}
