import { Pos } from "./pos";
import {Logger} from "./log";

export interface IPosition45Obj {
  readonly cols: number;
  readonly rows: number;
  readonly tileWidth: number;
  readonly tileHeight: number;
  readonly sceneWidth: number;
  readonly sceneHeight: number;
  readonly offset?: Phaser.Geom.Point;
}

export class Position45 {
  public static transformTo90(point: Pos, position: IPosition45Obj): Pos {
    const offsetX = position.rows * (position.tileWidth / 2); // + position.tileWidth / 2;
    return new Pos(
      (point.x - point.y) * (position.tileWidth / 2) + offsetX,
      ((point.x + point.y)) * (position.tileHeight / 2)
    );
  }

  public static transformTo45(point3: Pos, position: IPosition45Obj): Pos {
    const offsetX = position.rows * (position.tileWidth / 2);
    // const offsetX = position.sceneWidth / 2; // - position.tileWidth / 2;
    return new Pos(
      Math.floor((point3.y + point3.z) / position.tileHeight + (point3.x - offsetX) / position.tileWidth),
      Math.floor((point3.y + point3.z) / position.tileHeight - (point3.x - offsetX) / position.tileWidth),
    );
  }
}
