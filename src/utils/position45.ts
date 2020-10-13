import { IPos } from "./logic.pos";
import { LogicPoint } from "./logic.point";

export interface IPosition45Obj {
    readonly cols: number;
    readonly rows: number;
    readonly tileWidth: number;
    readonly tileHeight: number;
    readonly sceneWidth?: number;
    readonly sceneHeight?: number;
    readonly offset?: LogicPoint;
}
export class Position45 {
  public static transformTo90(point: IPos, position: IPosition45Obj): IPos {
    const offsetX = position.rows * (position.tileWidth / 2); // + position.tileWidth / 2;
    const pos: IPos = {
      x: (point.x - point.y) * (position.tileWidth / 2) + offsetX,
      y: ((point.x + point.y)) * (position.tileHeight / 2)
    };
    return pos;
  }

  public static transformTo45(point3: IPos, position: IPosition45Obj): IPos {
    const offsetX = position.rows * (position.tileWidth / 2);
    // const offsetX = position.sceneWidth / 2; // - position.tileWidth / 2;
    const pos: IPos = {
      x: Math.floor((point3.y + point3.z) / position.tileHeight + (point3.x - offsetX) / position.tileWidth),
      y: Math.floor((point3.y + point3.z) / position.tileHeight - (point3.x - offsetX) / position.tileWidth),
    };
    return pos;
  }
}
