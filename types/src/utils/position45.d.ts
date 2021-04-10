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
export declare class Position45 {
    static transformTo90(point: IPos, position: IPosition45Obj): LogicPos;
    static transformTo45(point3: IPos, position: IPosition45Obj): LogicPos;
}
