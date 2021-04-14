import { BaseConfigData } from "gamecore";
import { ISocial } from "../../structure";
import { Logger } from "utils";
export class SocialConfig extends BaseConfigData {

    public socailMap: Map<string, ISocial> = new Map();
    public socails: ISocial[];
    public get(id: string): ISocial {
        if (this.socailMap.has(id)) {
            return this.socailMap.get(id);
        } else {
            Logger.getInstance().error(`social表未配置ID为:${id}的数据`);
            return undefined;
        }
    }
    public parseJson(json) {
        const socails = json["social"];
        for (const temp of socails) {
            try {
                temp.tag = JSON.parse(temp.tag);
                this.socailMap.set(temp.id, temp);
            } catch {
                Logger.getInstance().error(`parse ${temp.tag} error`);
            }
        }
        this.socails = socails;
    }
}
