import { BaseConfigData } from "gamecore";
import { IQuest } from "picaStructure";
import { Logger } from "utils";
export class QuestConfig extends BaseConfigData {

    public get(id: string): IQuest {
        if (this.hasOwnProperty(id)) {
            return this[id];
        } else {
            Logger.getInstance().error(`Quest表未配置ID为:${id}的数据`);
            return undefined;
        }
    }
}
