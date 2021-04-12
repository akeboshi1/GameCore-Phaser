import { BaseConfigData } from "gamecore";
import { ILevel } from "../../structure";
export declare class LevelConfig extends BaseConfigData {
    miningLevel: Map<number, ILevel>;
    playerLevel: Map<number, ILevel>;
    cabinLevel: Map<number, ILevel>;
    storeLevel: Map<number, ILevel>;
    loggingLevel: Map<number, ILevel>;
    farmingLevel: Map<number, ILevel>;
    get(type: string, level: number): ILevel;
    parseJson(json: any): void;
    protected getMap(tag: string): Map<number, ILevel>;
}
