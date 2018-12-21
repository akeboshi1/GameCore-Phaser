import {QuadTree} from "./QuadTree";
import {IQuadTreeNode} from "./IQuadTreeNode";
import Globals from "../../Globals";
import {IRectangle} from "./IRectangle";

export class QuadTreeTest extends QuadTree {

    constructor(bounds: IRectangle, parent?: Phaser.Group, max_objects?: number, max_levels?: number, level?: number) {
        super(bounds, max_objects, max_levels, level);
        if (parent) {
            parent.add(QuadTreeTest.graphicsRetrieve);
            parent.add(QuadTreeTest.graphicsNode);
            parent.add(QuadTreeTest.graphicsTree);
        }
    }

    protected static _graphicsRetrieve: Phaser.Graphics;

    public static get graphicsRetrieve(): Phaser.Graphics {
        if (this._graphicsRetrieve === undefined || this._graphicsRetrieve === null) this._graphicsRetrieve = Globals.game.make.graphics();
        this._graphicsRetrieve.lineStyle(1, 0x0700FF);
        return this._graphicsRetrieve;
    }

    protected static _graphicsTree: Phaser.Graphics;

    public static get graphicsTree(): Phaser.Graphics {
        if (this._graphicsTree === undefined || this._graphicsTree === null) this._graphicsTree = Globals.game.make.graphics();
        this._graphicsTree.lineStyle(1, 0x99ECFF);
        return this._graphicsTree;
    }

    protected static _graphicsNode: Phaser.Graphics;

    public static get graphicsNode(): Phaser.Graphics {
        if (this._graphicsNode === undefined || this._graphicsNode === null) this._graphicsNode = Globals.game.make.graphics();
        this._graphicsNode.lineStyle(1, 0xffcc00);
        return this._graphicsNode;
    }

    public insert(pRect: IQuadTreeNode): void {
        super.insert(pRect);
        QuadTreeTest.graphicsTree.moveTo(pRect.quadX, pRect.quadY);
        QuadTreeTest.graphicsTree.lineTo(pRect.quadX + pRect.quadW, pRect.quadY);
        QuadTreeTest.graphicsTree.lineTo(pRect.quadX + pRect.quadW, pRect.quadY + pRect.quadH);
        QuadTreeTest.graphicsTree.lineTo(pRect.quadX, pRect.quadY + pRect.quadH);
        QuadTreeTest.graphicsTree.lineTo(pRect.quadX, pRect.quadY);
    }

    public retrieve(pRect: IRectangle): IQuadTreeNode[] {
        let result: IQuadTreeNode[] = super.retrieve(pRect);
        let len = result.length;
        QuadTreeTest.graphicsRetrieve.clear();
        QuadTreeTest.graphicsRetrieve.lineStyle(1, 0x0700FF);
        for (let i = 0; i < len; i++) {
            QuadTreeTest.graphicsRetrieve.moveTo(result[i].quadX, result[i].quadY);
            QuadTreeTest.graphicsRetrieve.lineTo(result[i].quadX + result[i].quadW, result[i].quadY);
            QuadTreeTest.graphicsRetrieve.lineTo(result[i].quadX + result[i].quadW, result[i].quadY + result[i].quadH);
            QuadTreeTest.graphicsRetrieve.lineTo(result[i].quadX, result[i].quadY + result[i].quadH);
            QuadTreeTest.graphicsRetrieve.lineTo(result[i].quadX, result[i].quadY);
        }
        return result;
    }

    protected split(): void {
        let nextLevel = this.level + 1,
            subWidth = Math.round(this.bounds.width / 2),
            subHeight = Math.round(this.bounds.height / 2),
            x = Math.round(this.bounds.x),
            y = Math.round(this.bounds.y);

        // top right node
        this.nodes[0] = new QuadTreeTest({
            x: x + subWidth,
            y: y,
            width: subWidth,
            height: subHeight
        }, null, this.max_objects, this.max_levels, nextLevel);

        // top left node
        this.nodes[1] = new QuadTreeTest({
            x: x,
            y: y,
            width: subWidth,
            height: subHeight
        }, null, this.max_objects, this.max_levels, nextLevel);

        // bottom left node
        this.nodes[2] = new QuadTreeTest({
            x: x,
            y: y + subHeight,
            width: subWidth,
            height: subHeight
        }, null, this.max_objects, this.max_levels, nextLevel);

        // bottom right node
        this.nodes[3] = new QuadTreeTest({
            x: x + subWidth,
            y: y + subHeight,
            width: subWidth,
            height: subHeight
        }, null, this.max_objects, this.max_levels, nextLevel);

        for (let i = 0; i < 4; i++) {
            QuadTreeTest.graphicsNode.moveTo(this.nodes[i].bounds.x, this.nodes[i].bounds.y);
            QuadTreeTest.graphicsNode.lineTo(this.nodes[i].bounds.x + this.nodes[i].bounds.width, this.nodes[i].bounds.y);
            QuadTreeTest.graphicsNode.lineTo(this.nodes[i].bounds.x + this.nodes[i].bounds.width, this.nodes[i].bounds.y + this.nodes[i].bounds.height);
            QuadTreeTest.graphicsNode.lineTo(this.nodes[i].bounds.x, this.nodes[i].bounds.y + this.nodes[i].bounds.height);
            QuadTreeTest.graphicsNode.lineTo(this.nodes[i].bounds.x, this.nodes[i].bounds.y);
        }
    }
}
