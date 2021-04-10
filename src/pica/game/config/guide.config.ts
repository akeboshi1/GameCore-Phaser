import { BaseConfigData } from "gamecore";
import { IGuide } from "../../structure";
import { Logger } from "utils";
export class GuideConfig extends BaseConfigData {
    Sheet1: IGuide[];

    public get(id: string): IGuide {
        const result = this.Sheet1.find((c) => c.id === id);
        if (result != null) return result;

        Logger.getInstance().error(`Guide表未配置ID为:${id}的数据`);
        return undefined;
    }

    public findGuide(id: string): IGuide {
        const result = this.Sheet1.find((c) => c.id === id);
        return result;
    }

}
