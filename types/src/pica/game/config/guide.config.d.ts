import { BaseConfigData } from "gamecore";
import { IGuide } from "picaStructure";
export declare class GuideConfig extends BaseConfigData {
    Sheet1: IGuide[];
    get(id: string): IGuide;
    findGuide(id: string): IGuide;
}
