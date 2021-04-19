import { LogicRectangle } from "./logic.rectangle";

export class LogicRectangle45 extends LogicRectangle {
    row: number = 0;
    col: number = 0;
    endRow: number = 0;
    endCol: number = 0;
    constructor(row: number, col: number, endRow: number, endCol: number) {
        super(row, col, endRow, endCol);
        this.row = row;
        this.col = col;
        this.endRow = endRow;
        this.endCol = endCol;
    }
}
