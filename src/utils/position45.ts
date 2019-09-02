import { IPoint3, Point3 } from "./point3";

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
  public static transformTo90(point: Phaser.Geom.Point, position: IPosition45Obj): Point3 {
    const offset = position.offset;
    return new Point3(
      ((point.x - point.y) / 2) * position.tileWidth + (position.sceneWidth >> 1),
      ((point.x + point.y) / 2) * position.tileHeight + 0,
    );
  }

  public static transformTo45(point3: IPoint3, position: IPosition45Obj): Phaser.Geom.Point {
    const offset = position.offset;
    return new Phaser.Geom.Point(
      Math.floor((point3.y + point3.z) / position.tileHeight + (point3.x - (position.sceneWidth >> 1)) / position.tileWidth),
      Math.floor((point3.y + point3.z) / position.tileHeight - (point3.x - 0) / position.tileWidth),
    );
  }
}
