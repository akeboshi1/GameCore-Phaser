import { BaseConfigData } from "./base.config.data";
import { I18nZHData } from "./i18n.zh";

export enum BaseDataType {
    i18n_zh = 1,
    explore = 2,
    item = 3
}
export class BaseDataManager {
    private resPath: string;
    private dataMap: Map<BaseDataType, BaseConfigData> = new Map();
    constructor(basePath: string) {
        this.resPath = basePath;
    }

    private add() {
        this.dataMap.set(BaseDataType.i18n_zh, new I18nZHData());
    }

    private resName(type: BaseDataType) {
        return BaseDataType[BaseDataType.i18n_zh];
    }
}
