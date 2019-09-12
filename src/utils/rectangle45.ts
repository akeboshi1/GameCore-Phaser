export class Rectangle45 {
    row: number;
    col: number;
    endRow: number;
    endCol: number;

    constructor(row: number, col: number, endRow: number, endCol: number) {
        this.row = row;
        this.col = col;
        this.endRow = endRow;
        this.endCol = endCol;
    }

    public contains(x: number, y: number): boolean {
        return x >= this.row && x <= this.endRow && y >= this.col && y <= this.endCol;
    }
}
