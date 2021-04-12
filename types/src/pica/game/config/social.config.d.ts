import { BaseConfigData } from "gamecore";
import { ISocial } from "../../structure";
export declare class SocialConfig extends BaseConfigData {
    socailMap: Map<string, ISocial>;
    socails: ISocial[];
    get(id: string): ISocial;
    parseJson(json: any): void;
}
