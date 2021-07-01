import { BaseConfigData } from "gamecore";
import { IPermission } from "src/pica/structure/ipermission";
import { Logger } from "utils";
export class PermissionConfig extends BaseConfigData {
    poolsMap: Map<string, IPermission> = new Map();
    public get(id: string): IPermission {
        const map = this.poolsMap;
        if (map.has(id)) {

            return map.get(id);
        } else {
            Logger.getInstance().error(`Level表未配置ID为:${id}的数据`);
            return undefined;
        }
    }
    parseJson(json) {
        const sheet1 = json["Sheet1"];
        for (const temp of sheet1) {
            this.poolsMap.set(temp.id, temp);
        }
    }
}
