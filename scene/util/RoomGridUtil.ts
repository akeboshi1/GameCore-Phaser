import {RoomNode} from "../grid/RoomNode";
import {NodeGrid} from "../grid/NodeGrid";

export class RoomGridUtil {
    private _grid: NodeGrid;

    public constructor() {
    }

    public getNode(colIndex: number, rowIndex: number): RoomNode {
        if (colIndex < 0 || colIndex > this._grid.numCols - 1 || rowIndex < 0 || rowIndex > this._grid.numRows - 1) return null;

        return this._grid.getNode(colIndex, rowIndex) as RoomNode;
    }

    public initGrid(numCols: number, numRows: number): void {
        this._grid = new NodeGrid();
        this._grid.setSize(numCols, numRows);
        this._grid.nodeClass = RoomNode;

        let i: number = 0;
        let n: number = numCols * numRows;
        for (; i < n; i++) {
            let colIndex: number = Math.floor(i % numCols);
            let rowIndex: number = Math.floor(i / numCols);
            this.setGrid(colIndex, rowIndex, 1, 1, true);
        }
    }

    public setGrid(colIndex: number, rowIndex: number, cols: number, rows: number, walkable: boolean): void {
        let i: number = 0;
        for (; i < cols; i++) {
            let j: number = 0;
            for (; j < rows; j++) {
                this._grid.getNode(colIndex + i, rowIndex + j).walkable = walkable;
            }
        }
    }
}