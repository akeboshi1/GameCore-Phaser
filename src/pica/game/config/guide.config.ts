import { BaseConfigData } from "gamecore";
import { IGuide } from "picaStructure";
import { Logger } from "utils";
export class GuideConfig extends BaseConfigData {
    Sheet1: IGuide[];

    public get(id: string): IGuide {
        const result = this.Sheet1.find((c) => c.id === id);
        if (result != null) return result;

        Logger.getInstance().error(`Guide表未配置ID为:${id}的数据`);
        return undefined;
    }

    public findGuide(uiName: string): IGuide {
        const result = this.Sheet1.find((c) => c.uiName === uiName);
        return result;
    }

    public findGuideByUiGuide(uiGuide: string): IGuide {
        const result = this.Sheet1.find((c) => c.uiGuide === uiGuide);
        return result;
    }
}
