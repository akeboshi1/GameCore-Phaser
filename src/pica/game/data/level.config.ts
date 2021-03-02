import { BaseConfigData } from "gamecore";
import { ILevel } from "src/pica/structure/ilevel";
export class LevelConfig extends BaseConfigData {
    miningLevel: Map<number, ILevel>;
    playerLevel: Map<number, ILevel>;
    cabinLevel: Map<number, ILevel>;
    storeLevel: Map<number, ILevel>;
    loggingLevel: Map<number, ILevel>;
    farmingLevel: Map<number, ILevel>;
    // public get(type: string, level: string): ILevel {
    //     if (this.hasOwnProperty(id)) {
    //         const data = this[id];
    //         const _skill = {
    //             id: data.id,
    //             name: data.name,
    //             display: { texturePath: data.display.texture_path },
    //             quality: data.quality,
    //         };
    //         const skill = {
    //             skill: _skill,
    //             _materials: data.formula.materials,
    //             _product: data.formula.products,
    //         };

    //         return skill;
    //     } else {
    //         Logger.getInstance().error(`Skill表未配置ID为:${id}的数据`);
    //         return undefined;
    //     }
    // }

    parseJson(json) {

    }

    protected getMap(tag: string) {
        switch (tag) {
            case "miningLevel":
                return this.miningLevel;
            case "playerLevel":
                return this.playerLevel;
            case "cabinLevel":
                return this.cabinLevel;
            case "storeLevel":
                return this.storeLevel;
            case "loggingLevel":
                return this.loggingLevel;
            case "farmingLevel":
                return this.farmingLevel;
        }
    }
}
