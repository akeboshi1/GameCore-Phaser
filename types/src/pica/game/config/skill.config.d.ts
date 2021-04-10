import { BaseConfigData } from "gamecore";
import { ICraftSkill } from "src/pica/structure/icraftskill";
export declare class SkillConfig extends BaseConfigData {
    get(id: string): ICraftSkill;
}
