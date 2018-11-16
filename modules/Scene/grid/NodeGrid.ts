import {ANode} from "./ANode";
import {RoomNode} from "./RoomNode";

export class NodeGrid {
    public nodeClass: any = RoomNode;
    private _nodes: Array<any>;

    public constructor() {
    }

    private _startNode: ANode;

    /**
     * Returns the start node.
     */
    public get startNode(): ANode {
        return this._startNode;
    }

    private _endNode: ANode;

    /**
     * Returns the end node.
     */
    public get endNode(): ANode {
        return this._endNode;
    }

    private _numCols: number;

    /**
     * Returns the number of columns in the grid.
     */
    public get numCols(): number {
        return this._numCols;
    }

    private _numRows: number;

    /**
     * Returns the number of rows in the grid.
     */
    public get numRows(): number {
        return this._numRows;
    }

    /** 设置网格尺寸 */
    public setSize(numCols: number, numRows: number): void {
        this._numCols = numCols;
        this._numRows = numRows;
        this._nodes = new Array();


        for (let i: number = 0; i < this._numCols; i++) {
            this._nodes[i] = new Array();
            for (let j: number = 0; j < this._numRows; j++) {
                this._nodes[i][j] = new this.nodeClass(i, j);
            }
        }
    }

    public getAllNodes(): Array<any> {
        let results: Array<any> = [];
        let n: number = this._nodes.length;
        for (let i: number = 0; i < n; i++) {
            let rowData: Array<any> = this._nodes[i];
            results.push.apply(null, rowData);
        }
        return results;
    }

    /**
     * Returns the node at the given coords.
     * @param x The iosX coord.
     * @param y The iosY coord.
     */
    public getNode(x: number, y: number): any {
        let node = this._nodes[x][y];
        if (node == null || node === undefined)
            throw new Error("kong");
        return node;
    }

    /**
     * Sets the node at the given coords as the end node.
     * @param x The iosX coord.
     * @param y The iosY coord.
     */
    public setEndNode(x: number, y: number): void {
        this._endNode = this._nodes[x][y];
    }

    /**
     * Sets the node at the given coords as the start node.
     * @param x The iosX coord.
     * @param y The iosY coord.
     */
    public setStartNode(x: number, y: number): void {
        this._startNode = this._nodes[x][y];
    }

    /**
     * Sets the node at the given coords as walkable or not.
     * @param x The iosX coord.
     * @param y The iosY coord.
     */
    public setWalkable(x: number, y: number, value: boolean): void {
        this._nodes[x][y].walkable = value;
    }
}
