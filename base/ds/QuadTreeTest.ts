import {QuadTree} from "./QuadTree";
import {IQuadTreeNode} from "./IQuadTreeNode";
import Globals from "../../Globals";
import {IRectangle} from "./IRectangle";

export class QuadTreeTest extends QuadTree {

  protected _graphicsTree: Phaser.Graphics;

  public get graphicsTree(): Phaser.Graphics {
    if (this._graphicsTree === undefined || this._graphicsTree === null) this._graphicsTree = Globals.game.make.graphics();
    this._graphicsTree.lineStyle(1, 0x99ECFF);
    Globals.LayerManager.sceneLayer.add(this._graphicsTree);
    return this._graphicsTree;
  }

  protected _graphicsNode: Phaser.Graphics;

  public get graphicsNode(): Phaser.Graphics {
    if (this._graphicsNode === undefined || this._graphicsNode === null) this._graphicsNode = Globals.game.make.graphics();
    this._graphicsNode.lineStyle(1, 0xffcc00);
    Globals.LayerManager.sceneLayer.add(this._graphicsNode);
    return this._graphicsNode;
  }

  public insert(pRect: IQuadTreeNode): void {
    super.insert(pRect);
    this.graphicsTree.moveTo(pRect.quadX, pRect.quadY);
    this.graphicsTree.lineTo(pRect.quadX + pRect.quadW, pRect.quadY);
    this.graphicsTree.lineTo(pRect.quadX + pRect.quadW, pRect.quadY + pRect.quadH);
    this.graphicsTree.lineTo(pRect.quadX, pRect.quadY + pRect.quadH);
    this.graphicsTree.lineTo(pRect.quadX, pRect.quadY);
  }

  public retrieve(pRect: IRectangle): IQuadTreeNode[] {
    let result: IQuadTreeNode[] = super.retrieve(pRect);
    let len = result.length;
    Globals.LayerManager.graphics.clear();
    Globals.LayerManager.graphics.lineStyle(1, 0x0700FF);
    for (let i = 0; i < len; i++) {
      Globals.LayerManager.graphics.moveTo(result[i].quadX, result[i].quadY);
      Globals.LayerManager.graphics.lineTo(result[i].quadX + result[i].quadW, result[i].quadY);
      Globals.LayerManager.graphics.lineTo(result[i].quadX + result[i].quadW, result[i].quadY + result[i].quadH);
      Globals.LayerManager.graphics.lineTo(result[i].quadX, result[i].quadY + result[i].quadH);
      Globals.LayerManager.graphics.lineTo(result[i].quadX, result[i].quadY);
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
    }, this.max_objects, this.max_levels, nextLevel);

    // top left node
    this.nodes[1] = new QuadTreeTest({
      x: x,
      y: y,
      width: subWidth,
      height: subHeight
    }, this.max_objects, this.max_levels, nextLevel);

    // bottom left node
    this.nodes[2] = new QuadTreeTest({
      x: x,
      y: y + subHeight,
      width: subWidth,
      height: subHeight
    }, this.max_objects, this.max_levels, nextLevel);

    // bottom right node
    this.nodes[3] = new QuadTreeTest({
      x: x + subWidth,
      y: y + subHeight,
      width: subWidth,
      height: subHeight
    }, this.max_objects, this.max_levels, nextLevel);

    for (let i = 0; i < 4; i++) {
      this.graphicsNode.moveTo(this.nodes[i].bounds.x, this.nodes[i].bounds.y);
      this.graphicsNode.lineTo(this.nodes[i].bounds.x + this.nodes[i].bounds.width, this.nodes[i].bounds.y);
      this.graphicsNode.lineTo(this.nodes[i].bounds.x + this.nodes[i].bounds.width, this.nodes[i].bounds.y + this.nodes[i].bounds.height);
      this.graphicsNode.lineTo(this.nodes[i].bounds.x, this.nodes[i].bounds.y + this.nodes[i].bounds.height);
      this.graphicsNode.lineTo(this.nodes[i].bounds.x, this.nodes[i].bounds.y);
    }
  }
}
