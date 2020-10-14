import Rectangle = Phaser.Geom.Rectangle;

export class Rectangle45 extends Rectangle {
    row: number;
    col: number;
    endRow: number;
    endCol: number;

    constructor(row: number, col: number, endRow: number, endCol: number) {
        super(row, col, endRow, endCol);
        this.row = row;
        this.col = col;
        this.endRow = endRow;
        this.endCol = endCol;
    }
}
