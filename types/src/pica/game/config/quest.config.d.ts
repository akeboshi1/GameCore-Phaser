import { BaseConfigData } from "gamecore";
import { IQuest } from "picaStructure";
export declare class QuestConfig extends BaseConfigData {
    get(id: string): IQuest;
}
