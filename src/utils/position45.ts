import { IPoint3, Point3 } from "./point3";

export interface IPosition45Obj {
  readonly cols: number;
  readonly rows: number;
  readonly tileWidth: number;
  readonly tileHeight: number;
  readonly offset: Phaser.Geom.Point;
}

export class Position45 {
  static readonly titleWidth = 60;
  static readonly titleHeight = 30;

  static transformTo90(point: Phaser.Geom.Point, position: IPosition45Obj): Point3 {
    const offset = position.offset;
    return new Point3(
      ((point.x - point.y) / 2) * position.tileWidth + offset.x,
      ((point.x + point.y) / 2) * position.tileHeight + offset.y,
      
    );
  }

  static transformTo45(point3: IPoint3, position: IPosition45Obj): Phaser.Geom.Point {
    const offset = position.offset;
    return new Phaser.Geom.Point(
      Math.floor((point3.y + point3.z) / Position45.titleHeight + (point3.x - offset.x) / position.tileWidth),
      Math.floor((point3.y + point3.z) / Position45.titleHeight - (point3.x - offset.y) / position.tileWidth),
    );
  }
}