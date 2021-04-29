import { IPosition45Obj } from "structure";
import { Render } from "../render";
/**
 * 房间布置显示网格
 */
export declare class TerrainGrid {
    private render;
    private miniSize;
    private graphics;
    private dirty;
    private map;
    private deltaTime;
    private curDelta;
    constructor(render: Render, miniSize: IPosition45Obj);
    setMap(map: number[][]): void;
    update(time: number, delta: number): void;
    destroy(): void;
    private drawGrid;
    private draw;
    private drawLine;
}
