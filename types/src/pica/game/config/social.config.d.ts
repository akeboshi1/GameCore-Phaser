import { BaseConfigData } from "gamecore";
import { ISocial } from "src/pica/structure/isocial";
export declare class SocialConfig extends BaseConfigData {
    socailMap: Map<string, ISocial>;
    socails: ISocial[];
    get(id: string): ISocial;
    parseJson(json: any): void;
}
