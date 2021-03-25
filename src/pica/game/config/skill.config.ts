import { BaseConfigData } from "gamecore";
import { ICraftSkill } from "src/pica/structure/icraftskill";
import { Logger } from "utils";
export class SkillConfig extends BaseConfigData {
    public get(id: string): ICraftSkill {
        if (this.hasOwnProperty(id)) {
            const data = this[id];

            const _skill = {
                id: data.id,
                name: data.name,
                display: { texturePath : data.display.texture_path },
                quality: data.quality,
            };
            const skill = {
                skill: _skill,
                _materials: data.formula.materials,
                _product: data.formula.products,
            };

            return skill;
        } else {
            Logger.getInstance().error(`Skill表未配置ID为:${id}的数据`);
            return undefined;
        }
    }
}
