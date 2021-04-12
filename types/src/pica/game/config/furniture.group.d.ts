import { BaseConfigData } from "gamecore";
import { IFurnitureGroup } from "picaStructure";
export declare class FurnitureGroup extends BaseConfigData {
    groupMap: Map<string, IFurnitureGroup>;
    get(id: string): IFurnitureGroup;
    checkGroup(id: string): boolean;
    parseJson(json: any): void;
}
