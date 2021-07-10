import { IRoomService } from "gamecore";
import { IPos, LogicPos } from "./logic.pos";
export declare class AStar {
    private sizeChart;
    private grid;
    private finder;
    private gridBackup;
    constructor(sizeChart: IRoomService);
    init(matrix: number[][]): void;
    reset(matrix: number[][]): void;
    setWalkableAt(x: number, y: number, value: boolean): void;
    isWalkableAt(x: number, y: number): any;
    find(startPos: IPos, targetList: IPos[], toReverse: boolean): LogicPos[];
    _invalidPoint(position: IPos, cols: number, rows: number): boolean;
}
