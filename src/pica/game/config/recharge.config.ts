import { BaseConfigData } from "gamecore";
import { IRecharge } from "src/pica/structure/irecharge";

export class RechargeConfig extends BaseConfigData {

  public poolDatas: Map<number, Map<string, IRecharge>> = new Map();
  parseJson(json: any) {
    const sheet1 = json["Sheet1"];
    for (const temp of sheet1) {
      let type = temp.type;
      if (type !== 1) type = 4;
      if (this.poolDatas.has(type)) {
        const map = this.poolDatas.get(type);
        map.set(temp.id, temp);
      } else {
        const map = new Map();
        map.set(temp.id, temp);
        this.poolDatas.set(type, map);
      }
    }
  }
  get(type: number, id?: string) {
    if (!this.poolDatas.has(type)) return undefined;
    const map = this.poolDatas.get(type);
    if (id !== undefined) {
      return [map.get(id)];
    } else {
      const arr = Array.from(map.values());
      return arr;
    }
  }
}
