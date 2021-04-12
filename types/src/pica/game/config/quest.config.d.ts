import { BaseConfigData } from "gamecore";
import { IQuest } from "../../structure";
export declare class QuestConfig extends BaseConfigData {
    get(id: string): IQuest;
}
