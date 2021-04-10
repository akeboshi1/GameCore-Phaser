import { BaseConfigData } from "gamecore";
import { IJob } from "src/pica/structure/ijob";
import { Logger } from "utils";
export class JobConfig extends BaseConfigData {

    excludes = ["id"];
    public jobMap: Map<string, Map<string, IJob[]>> = new Map();
    public get(id: string): IJob {
        if (this.hasOwnProperty(id)) {
            return this[id];
        } else {
            Logger.getInstance().error(`Job表未配置ID为:${id}的数据`);
            return undefined;
        }
    }
    public parseJson(json) {
        for (const temp of json) {
            this[temp.id] = temp;
        }
    }
}
