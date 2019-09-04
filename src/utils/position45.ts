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
    const offsetX = position.sceneWidth / 2 - position.tileWidth / 2;
    return new Point3(
      ((point.x - point.y) / 2) * position.tileWidth + offsetX,
      ((point.x + point.y) / 2) * position.tileHeight,
    );
  }

  public static transformTo45(point3: IPoint3, position: IPosition45Obj): Phaser.Geom.Point {
    const offsetX = position.sceneWidth / 2 - position.tileWidth / 2;
    return new Phaser.Geom.Point(
      Math.floor((point3.y + point3.z) / position.tileHeight + (point3.x - offsetX) / position.tileWidth),
      Math.floor((point3.y + point3.z) / position.tileHeight - (point3.x - offsetX) / position.tileWidth),
    );
  }
}
