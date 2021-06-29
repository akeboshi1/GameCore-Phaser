import { BaseConfigData } from "gamecore";
import { IBattlePassLevel } from "picaStructure";

export class BattleLevelConfig extends BaseConfigData {
    battlelevel: IBattlePassLevel[];
    public get(level: number) {
        if (!this.battlelevel) return undefined;
        for (const temp of this.battlelevel) {
            if (temp.level === level) return temp;
        }
        return undefined;
    }
    public getLevels() {
        return this.battlelevel;
    }
    public parseJson(json) {
        const obj = json["Sheet1"];
        this.battlelevel = obj;
    }
}
