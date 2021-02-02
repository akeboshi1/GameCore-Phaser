import { BaseConfigData } from "./base.config.data";

export class I18nZHData extends BaseConfigData {
    public text(id: string) {
        if (this.hasOwnProperty(id))
            return this[id];
        else return "";
    }
}
