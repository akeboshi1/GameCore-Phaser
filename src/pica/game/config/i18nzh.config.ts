import { BaseConfigData } from "gamecore";
import { Logger, StringUtils } from "utils";

export class I18nZHDataConfig extends BaseConfigData {
    public text(id: string, tips?: string) {
        if (!StringUtils.isNullOrUndefined(id) && this.hasOwnProperty(id))
            return this[id];
        else {
            if (!StringUtils.isNullOrUndefined(id) && id !== "") Logger.getInstance().error((!tips ? "" : tips), `语言表未配置ID为:${id}的数据`);
            return id;
        }
    }

    public has(id: string) {
        if (this.hasOwnProperty(id)) {
            return true;
        }
        return false;
    }
}
