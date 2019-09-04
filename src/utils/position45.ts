import {Pos} from "./pos";

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
    const offset = position.offset;
    return new Pos(
      ((point.x - point.y) / 2) * position.tileWidth + (position.sceneWidth >> 1),
      ((point.x + point.y) / 2) * position.tileHeight + 0,
    );
  }

  public static transformTo45(point3: Pos, position: IPosition45Obj): Pos {
    const offset = position.offset;
    return new Pos(
      Math.floor((point3.y + point3.z) / position.tileHeight + (point3.x - (position.sceneWidth >> 1)) / position.tileWidth),
      Math.floor((point3.y + point3.z) / position.tileHeight - (point3.x - 0) / position.tileWidth),
    );
  }
}
