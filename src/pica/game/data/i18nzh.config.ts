import { BaseConfigData } from "gamecore";

export class I18nZHDataConfig extends BaseConfigData {
    public text(id: string) {
        if (this.hasOwnProperty(id))
            return this[id];
        else {
            // tslint:disable-next-line:no-console
            console.error(`语言表未配置ID为:${id}的数据`);
            return "";
        }
    }
}
