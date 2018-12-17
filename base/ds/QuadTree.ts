import {IQuadTreeNode} from "./IQuadTreeNode";

export class QuadTree {
    protected _depth: number;
    protected _maxDepth: number;
    protected _hWidth: number;
    protected _hHeight: number;
    protected _centerX: number;
    protected _centerY: number;
    private _topLeft: QuadTree;
    private _topRight: QuadTree;
    private _bottomLeft: QuadTree;
    private _bottomRight: QuadTree;
    private _rect: Phaser.Rectangle;
    private _children: IQuadTreeNode[];

    constructor(p_rect: Phaser.Rectangle, p_maxDepth: number = 3, currentDepth: number = 0) {
        this.init(p_rect, p_maxDepth, currentDepth);
    }

    public init(p_rect: Phaser.Rectangle, p_maxDepth: number = 3, currentDepth: number = 0): void {
        this.clear();
        this._depth = currentDepth;
        this._maxDepth = p_maxDepth;
        this._rect = p_rect;
        this._hWidth = this._rect.width >> 1;
        this._hHeight = this._rect.height >> 1;
        this._centerX = this._rect.x + this._hWidth;
        this._centerY = this._rect.y + this._hHeight;
    }

    public clear(): void {
        this._children = [];
        this._topLeft = this._topRight = this._bottomLeft = this._bottomRight = null;
    }

    public retrieve(node: Phaser.Rectangle): IQuadTreeNode[] {
        let result: IQuadTreeNode[] = [];

// 如果所取区块比本身区域还大，那么它所有子树的children都取出
        if (node.x <= this._rect.x && node.y <= this._rect.y && node.x + node.width >= this._rect.right && node.y + node.height >= this._rect.bottom) {
            result.push.apply(result, this._children);

            if (this._topLeft) result.push.apply(result, this._topLeft.retrieve(node));
            if (this._topRight) result.push.apply(result, this._topRight.retrieve(node));
            if (this._bottomLeft) result.push.apply(result, this._bottomLeft.retrieve(node));
            if (this._bottomRight) result.push.apply(result, this._bottomRight.retrieve(node));

            return result;
        }

// 否则就只取对应的区域子树
        let objRight: number = node.x + node.width;
        let objBottom: number = node.y + node.height;

// 完全在分区里
        if ((node.x > this._rect.x) && (objRight < this._centerX)) {
            if (node.y > this._rect.y && objBottom < this._centerY) {
                if (this._topLeft) result.push.apply(result, this._topLeft.retrieve(node));
                return result;
            }
            if (node.y > this._centerY && objBottom < this._rect.bottom) {
                if (this._bottomLeft) result.push.apply(result, this._bottomLeft.retrieve(node));
                return result;
            }
        }
        if (node.x > this._centerX && objRight < this._rect.right) {
            if (node.y > this._rect.y && objBottom < this._centerY) {
                if (this._topRight) result.push.apply(result, this._topRight.retrieve(node));
                return result;
            }
            if (node.y > this._centerY && objBottom < this._rect.bottom) {
                if (this._bottomRight) result.push.apply(result, this._bottomRight.retrieve(node));
                return result;
            }
        }

        // 只要有部分在分区里，也放到对应分区里，但注意可以重复放

        // 上边
        if (objBottom > this._rect.y && node.y < this._centerY) {

            if (node.x < this._centerX && objRight > this._rect.x) {
                if (this._topLeft) result.push.apply(result, this._topLeft.retrieve(node));
            }
            if (node.x < this._rect.right && objRight > this._centerX) {
                if (this._topRight) result.push.apply(result, this._topRight.retrieve(node));
            }
        }

        // 下边
        if (objBottom > this._centerY && node.y < this._rect.bottom) {
            if (node.x < this._centerX && objRight > this._rect.x) {
                if (this._bottomLeft) result.push.apply(result, this._bottomLeft.retrieve(node));
            }

            if (node.x < this._rect.right && objRight > this._centerX) {
                if (this._bottomRight) result.push.apply(result, this._bottomRight.retrieve(node));
            }
        }
        return result;

    }

    public insert(node: IQuadTreeNode): void {

// 如果不能切分或者obj比整个区域还大，就放到children里
        if (this._depth >= this._maxDepth || (node.quadX <= this._rect.x && node.quadY <= this._rect.y && node.quadX + node.quadW >= this._rect.right && node.quadY + node.quadH >= this._rect.bottom)) {

            this._children.push(node);
            return;
        }

        if (this._topLeft == null) {
            let d: number = this._depth + 1;
            this._topLeft = new QuadTree(new Phaser.Rectangle(this._rect.x, this._rect.y, this._hWidth, this._hHeight), this._maxDepth, d);
            this._topRight = new QuadTree(new Phaser.Rectangle(this._rect.x + this._hWidth, this._rect.y, this._hWidth, this._hHeight), this._maxDepth, d);
            this._bottomLeft = new QuadTree(new Phaser.Rectangle(this._rect.x, this._rect.y + this._hHeight, this._hWidth, this._hHeight), this._maxDepth, d);
            this._bottomRight = new QuadTree(new Phaser.Rectangle(this._rect.x + this._hWidth, this._rect.y + this._hHeight, this._hWidth, this._hHeight), this._maxDepth, d);
        }

        let objRight: number = node.quadX + node.quadW;
        let objBottom: number = node.quadY + node.quadH;

// 可以完全放到分区里就递归放到对应分区里
        if ((node.quadX > this._rect.x) && (objRight < this._centerX)) {
            if (node.quadY > this._rect.y && objBottom < this._centerY) {
                this._topLeft.insert(node);
                return;
            }
            if (node.quadY > this._centerY && objBottom < this._rect.bottom) {
                this._bottomLeft.insert(node);
                return;
            }
        }
        if (node.quadX > this._centerX && objRight < this._rect.right) {
            if (node.quadY > this._rect.y && objBottom < this._centerY) {
                this._topRight.insert(node);
                return;
            }
            if (node.quadY > this._centerY && objBottom < this._rect.bottom) {
                this._bottomRight.insert(node);
                return;
            }
        }

// 只要有部分在分区里，也放到对应分区里，但注意可以重复放

// 上边
        if (objBottom > this._rect.y && node.quadY < this._centerY) {

            if (node.quadX < this._centerX && objRight > this._rect.x) {
                this._topLeft.insert(node);
            }
            if (node.quadX < this._rect.right && objRight > this._centerX) {
                this._topRight.insert(node);
            }
        }
// 下边
        if (objBottom > this._centerY && node.quadY < this._rect.bottom) {
            if (node.quadX < this._centerX && objRight > this._rect.x) {
                this._bottomLeft.insert(node);
            }

            if (node.quadX < this._rect.right && objRight > this._centerX) {
                this._bottomRight.insert(node);
            }
        }

    }

}
