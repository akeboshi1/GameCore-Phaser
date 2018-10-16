import {ANode} from "./ANode";
import {RoomNode} from "./RoomNode";
import Globals from "../../Globals";

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


        for (var i: number = 0; i < this._numCols; i++) {
            this._nodes[i] = new Array();
            for (var j: number = 0; j < this._numRows; j++) {
                this._nodes[i][j] = new this.nodeClass(i, j);
            }
        }
    }

    public getAllNodes(): Array<any> {
        var results: Array<any> = [];
        var n: number = this._nodes.length;
        for (var i: number = 0; i < n; i++) {
            var rowData: Array<any> = this._nodes[i];
            results.push.apply(null, rowData);
        }
        return results;
    }

    /**
     * Returns the node at the given coords.
     * @param x The x coord.
     * @param y The y coord.
     */
    public getNode(x: number, y: number): any {
        let node = this._nodes[x][y]
        if (node == null || node === undefined)
            throw new Error("kong");
        return node;
    }

    /**
     * Sets the node at the given coords as the end node.
     * @param x The x coord.
     * @param y The y coord.
     */
    public setEndNode(x: number, y: number): void {
        this._endNode = this._nodes[x][y];
    }

    /**
     * Sets the node at the given coords as the start node.
     * @param x The x coord.
     * @param y The y coord.
     */
    public setStartNode(x: number, y: number): void {
        this._startNode = this._nodes[x][y];
    }

    /**
     * Sets the node at the given coords as walkable or not.
     * @param x The x coord.
     * @param y The y coord.
     */
    public setWalkable(x: number, y: number, value: boolean): void {
        this._nodes[x][y].walkable = value;
    }

    /**
     * 判断两节点之间是否存在障碍物
     * @param point1
     * @param point2
     * @return
     *
     */
    public hasBarrier(startX: number, startY: number, endX: number, endY: number): boolean {
        //如果起点终点是同一个点那傻子都知道它们间是没有障碍物的
        if (startX == endX && startY == endY) return false;
        if (this.getNode(endX, endY).walkable == false) return true;

        //两节点中心位置
        var point1: Phaser.Point = new Phaser.Point(startX + 0.5, startY + 0.5);
        var point2: Phaser.Point = new Phaser.Point(endX + 0.5, endY + 0.5);

//			var point1:Point = new Point( startX, startY);
//			var point2:Point = new Point( endX, endY);

        var distX: number = Math.abs(endX - startX);
        var distY: number = Math.abs(endY - startY);

        /**遍历方向，为true则为横向遍历，否则为纵向遍历*/
        var loopDirection: Boolean = distX > distY ? true : false;

        /**起始点与终点的连线方程*/
        var lineFuction: Function;

        /** 循环递增量 */
        var i: number;

        /** 循环起始值 */
        var loopStart: number;

        /** 循环终结值 */
        var loopEnd: number;

        /** 起终点连线所经过的节点 */
        var nodesPassed: Array<any> = [];
        var elem: ANode;

        //为了运算方便，以下运算全部假设格子尺寸为1，格子坐标就等于它们的行、列号
        if (loopDirection) {
            lineFuction = Globals.Tool.getLineFunc(point1, point2, 0);

            loopStart = Math.min(startX, endX);
            loopEnd = Math.max(startX, endX);

            //开始横向遍历起点与终点间的节点看是否存在障碍(不可移动点)
            for (i = loopStart; i <= loopEnd; i++) {
                //由于线段方程是根据终起点中心点连线算出的，所以对于起始点来说需要根据其中心点
                //位置来算，而对于其他点则根据左上角来算
                if (i == loopStart) i += 0.5;
                //根据x得到直线上的y值
                var yPos: number = lineFuction(i);


                nodesPassed = this.getNodesUnderPoint(i, yPos);
                for (elem of nodesPassed) {
                    if (elem.walkable == false) return true;
                }


                if (i == loopStart + 0.5) i -= 0.5;
            }
        }
        else {
            lineFuction = Globals.Tool.getLineFunc(point1, point2, 1);

            loopStart = Math.min(startY, endY);
            loopEnd = Math.max(startY, endY);

            //开始纵向遍历起点与终点间的节点看是否存在障碍(不可移动点)
            for (i = loopStart; i <= loopEnd; i++) {
                if (i == loopStart) i += 0.5;
                //根据y得到直线上的x值
                var xPos: number = lineFuction(i);

                nodesPassed = this.getNodesUnderPoint(xPos, i);
                for (elem of nodesPassed) {
                    if (elem.walkable == false) return true;
                }

                if (i == loopStart + 0.5) i -= 0.5;
            }
        }


        return false;
    }

    ////////////////////////////////////////
    // getters / setters
    ////////////////////////////////////////

    /**
     * 得到一个点下的所有节点
     * @param xPos        点的横向位置
     * @param yPos        点的纵向位置
     * @param grid        所在网格
     * @param exception    例外格，若其值不为空，则在得到一个点下的所有节点后会排除这些例外格
     * @return            共享此点的所有节点
     *
     */
    public getNodesUnderPoint(xPos: number, yPos: number/*, exception:Array=null */): Array<any> {
        var result: Array<any> = [];
        var xIsInt: Boolean = xPos % 1 == 0;
        var yIsInt: Boolean = yPos % 1 == 0;

        //点由四节点共享情况
        if (xIsInt && yIsInt) {
            result[0] = this.getNode(xPos - 1, yPos - 1);
            result[1] = this.getNode(xPos, yPos - 1);
            result[2] = this.getNode(xPos - 1, yPos);
            result[3] = this.getNode(xPos, yPos);
        }
        //点由2节点共享情况
        //点落在两节点左右临边上
        else if (xIsInt && !yIsInt) {
            result[0] = this.getNode(xPos - 1, Math.round(yPos));
            result[1] = this.getNode(xPos, Math.round(yPos));
        }
        //点落在两节点上下临边上
        else if (!xIsInt && yIsInt) {
            result[0] = this.getNode(Math.round(xPos), yPos - 1);
            result[1] = this.getNode(Math.round(xPos), yPos);
        }
        //点由一节点独享情况
        else {
            result[0] = this.getNode(Math.round(xPos), Math.round(yPos));
        }

        return result;
    }

    public findReplacer(toNode: ANode): ANode {
        var result: ANode;
        //若终点可移动则根本无需寻找替代点
        if (toNode.walkable) {
            result = toNode;
        }
        //否则遍历终点周围节点以寻找离起始点最近一个可移动点作为替代点
        else {
            //根据节点的埋葬深度选择遍历的圈
            //若该节点是第一次遍历，则计算其埋葬深度
            if (toNode.buriedDepth == -1) {
                toNode.buriedDepth = this.getNodeBuriedDepth(toNode, Math.max(this._numCols, this._numRows));
            }

            var xFrom: number = toNode.x - toNode.buriedDepth < 0 ? 0 : toNode.x - toNode.buriedDepth;
            var xTo: number = toNode.x + toNode.buriedDepth > this.numCols - 1 ? this.numCols - 1 : toNode.x + toNode.buriedDepth;
            var yFrom: number = toNode.y - toNode.buriedDepth < 0 ? 0 : toNode.y - toNode.buriedDepth;
            var yTo: number = toNode.y + toNode.buriedDepth > this.numRows - 1 ? this.numRows - 1 : toNode.y + toNode.buriedDepth;

            var n: ANode;//当前遍历节点

            for (var i: number = xFrom; i <= xTo; i++) {
                for (var j: number = yFrom; j <= yTo; j++) {
                    if (i > xFrom && i < xTo && j > yFrom && j < yTo) continue;

                    n = this.getNode(i, j);

                    if (n.walkable) {
                        //计算此候选节点到起点的距离，记录离起点最近的候选点为替代点
                        n.getDistanceTo(toNode);

                        if (!result) {
                            result = n;
                        }
                        else if (n.distance < result.distance) {
                            result = n;
                        }
                    }
                }
            }
        }

        return result;
    }

    protected onCreateANode(x: number, y: number): ANode {
        var node: ANode = new ANode(x, y);
        return node;
    }

    /** 计算一个节点的埋葬深度
     * @param node        欲计算深度的节点
     * @param loopCount    计算深度时遍历此节点外围圈数。默认值为10*/
    private getNodeBuriedDepth(node: ANode, loopCount: number = 10): number {
        //如果检测节点本身是不可移动的则默认它的深度为1
        var result: number = node.walkable ? 0 : 1;
        var l: number = 1;

        while (l <= loopCount) {
            var startX: number = node.x - l < 0 ? 0 : node.x - l;
            var endX: number = node.x + l > this.numCols - 1 ? this.numCols - 1 : node.x + l;
            var startY: number = node.y - l < 0 ? 0 : node.y - l;
            var endY: number = node.y + l > this.numRows - 1 ? this.numRows - 1 : node.y + l;

            var n: ANode;
            //遍历一个节点周围一圈看是否周围一圈全部是不可移动点，若是，则深度加一，
            //否则返回当前累积的深度值
            for (var i: number = startX; i <= endX; i++) {
                for (var j: number = startY; j <= endY; j++) {
                    if (i > startX && i < endX && j > startY && j < endY) continue;

                    n = this.getNode(i, j);

                    if (n.walkable) {
                        return result;
                    }
                }
            }

            //遍历完一圈，没发现一个可移动点，则埋葬深度加一。接着遍历下一圈
            result++;
            l++;
        }
        return result;
    }
}
