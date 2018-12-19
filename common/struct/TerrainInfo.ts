import {op_client, op_gameconfig} from "../../../protocol/protocols";
import ITerrain = op_client.ITerrain;

export class TerrainInfo implements ITerrain {
  public name: string;

  public des: string;

  public x = 0;

  public y = 0;

  public z = 0;

  public animations: op_gameconfig.IAnimation[];

  public animationName: string;

  public type: string;

  public get col(): number {
    return this.x;
  }

  public get row(): number {
    return this.y;
  }

  public setInfo(base: any): void {
    let value: any;
    for (let key in base) {
      value = base[key];
      this[key] = value;
    }
  }
}
