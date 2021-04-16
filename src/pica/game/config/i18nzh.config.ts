/*
 * @Author: your name
 * @Date: 2021-03-25 19:02:40
 * @LastEditTime: 2021-04-09 17:18:02
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /game-core/src/pica/game/config/i18nzh.config.ts
 */
import { BaseConfigData } from "gamecore";
import { Logger } from "utils";

export class I18nZHDataConfig extends BaseConfigData {
    public text(id: string, tips?: string) {
        if (this.hasOwnProperty(id))
            return this[id];
        else {
            Logger.getInstance().error((!tips ? "" : tips), `语言表未配置ID为:${id}的数据`);
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
