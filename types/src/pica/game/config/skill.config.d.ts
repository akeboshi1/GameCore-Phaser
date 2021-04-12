import { BaseConfigData } from "gamecore";
import { ICraftSkill } from "../../structure";
export declare class SkillConfig extends BaseConfigData {
    get(id: string): ICraftSkill;
}
