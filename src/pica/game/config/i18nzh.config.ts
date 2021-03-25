import { BaseConfigData } from "gamecore";

export class I18nZHDataConfig extends BaseConfigData {
    public text(id: string, tips?: string) {
        if (this.hasOwnProperty(id))
            return this[id];
        else {
            // tslint:disable-next-line:no-console
            console.error((!tips ? "" : tips), `语言表未配置ID为:${id}的数据`);
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
