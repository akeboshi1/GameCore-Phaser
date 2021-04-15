import { BaseConfigData } from "gamecore";
import { IQuestGroup } from "picaStructure";
import { Logger } from "utils";
export class QuestGroupConfig extends BaseConfigData {

    public map: Map<string, IQuestGroup> = new Map();
    public get(id: string): IQuestGroup {
        if (this.map.has(id)) {
            return this.map.get(id);
        } else {
            Logger.getInstance().error(`QuestGroup表未配置ID为:${id}的数据`);
            return undefined;
        }
    }
    public parseJson(json) {
        for (const temp of json) {
            this.map.set(temp.id, temp);
        }
    }
}
