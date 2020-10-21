import { IPos, LogicPos } from "./logic.pos";

export interface IPosition45Obj {
    readonly cols: number;
    readonly rows: number;
    readonly tileWidth: number;
    readonly tileHeight: number;
    readonly sceneWidth?: number;
    readonly sceneHeight?: number;
    readonly offset?: IPos;
}
export class Position45 {
  public static transformTo90(point: IPos, position: IPosition45Obj): LogicPos {
    const offsetX = position.rows * (position.tileWidth / 2); // + position.tileWidth / 2;
    return new LogicPos((point.x - point.y) * (position.tileWidth / 2) + offsetX, (point.x + point.y) * (position.tileHeight / 2));
  }

  public static transformTo45(point3: IPos, position: IPosition45Obj): LogicPos {
    const offsetX = position.rows * (position.tileWidth / 2);
    return new LogicPos(Math.floor((point3.y + point3.z) / position.tileHeight + (point3.x - offsetX) / position.tileWidth),
                   Math.floor((point3.y + point3.z) / position.tileHeight - (point3.x - offsetX) / position.tileWidth)
    );
  }
}
