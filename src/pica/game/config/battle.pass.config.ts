import { BaseConfigData } from "gamecore";
import { IBattlePass } from "picaStructure";

export class BattlePassConfig extends BaseConfigData {
    battlepass: IBattlePass[];
    public get(id: string) {
        if (!this.battlepass) return undefined;
        for (const temp of this.battlepass) {
            if (temp.id === id) return temp;
        }
        return undefined;
    }
    public parseJson(json) {
        const obj = json["Sheet1"];
        this.battlepass = obj;
    }
}
