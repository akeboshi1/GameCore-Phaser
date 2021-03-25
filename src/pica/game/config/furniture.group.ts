import { BaseConfigData } from "gamecore";
import { IFurnitureGroup } from "picaStructure";
import { Logger } from "utils";
export class FurnitureGroup extends BaseConfigData {
    public groupMap: Map<string, IFurnitureGroup> = new Map();
    public get(id: string): IFurnitureGroup {
        if (this.groupMap.has(id)) {
            return this.groupMap.get(id);
        } else {
            Logger.getInstance().error(`家具组表未配置ID为:${id}的数据`);
            return undefined;
        }
    }

    public checkGroup(id: string) {
        return this.groupMap.has(id);
    }
    public parseJson(json) {
        const sheet1 = json["Sheet1"];
        for (const temp of sheet1) {
            for (const id of temp.group) {
                const tempGroup: IFurnitureGroup = { id, group: temp.group };
                this.groupMap.set(id, tempGroup);
            }
        }
    }
}
