import {IRectangle} from "./IRectangle";
import {IQuadTreeNode} from "./IQuadTreeNode";

export class QuadTree {
  public bounds: IRectangle;
  protected max_objects: number;
  protected max_levels: number;
  protected level: number;
  protected children: IQuadTreeNode[];
  protected nodes: QuadTree[];

  constructor(bounds: IRectangle, max_objects?: number, max_levels?: number, level?: number) {
    this.max_objects = max_objects || 10;
    this.max_levels = max_levels || 4;

    this.level = level || 0;
    this.bounds = bounds;

    this.children = [];
    this.nodes = [];
  }

  public getIndex(pRect: IRectangle): number {
    let index = -1,
      verticalMidpoint = this.bounds.x + (this.bounds.width / 2),
      horizontalMidpoint = this.bounds.y + (this.bounds.height / 2),

      // pRect can completely fit within the top quadrants
      topQuadrant = pRect.y + pRect.height < horizontalMidpoint,

      // pRect can completely fit within the bottom quadrants
      bottomQuadrant = (pRect.y > horizontalMidpoint);

    // pRect can completely fit within the left quadrants
    if (pRect.x + pRect.width < verticalMidpoint) {
      if (topQuadrant) {
        index = 1;
      } else if (bottomQuadrant) {
        index = 2;
      }

      // pRect can completely fit within the right quadrants
    } else if (pRect.x > verticalMidpoint) {
      if (topQuadrant) {
        index = 0;
      } else if (bottomQuadrant) {
        index = 3;
      }
    }

    return index;
  }

  public retrieve(pRect: IRectangle): IQuadTreeNode[] {
    let index = this.getIndex(pRect),
      returnObjects = this.children;

    // if we have subnodes ...
    if (this.nodes.length > 0) {

      // if pRect fits into a subnode ..
      if (index !== -1) {
        returnObjects = returnObjects.concat(this.nodes[index].retrieve(pRect));

        // if pRect does not fit into a subnode, check it against all subnodes
      } else {
        let len = this.nodes.length;
        for (let i = 0; i < len; i = i + 1) {
          returnObjects = returnObjects.concat(this.nodes[i].retrieve(pRect));
        }
      }
    }

    return returnObjects;
  }

  public insert(pRect: IQuadTreeNode): void {
    let i = 0,
      index;

    // if we have subnodes ...
    if (this.nodes.length > 0) {
      index = this.getIndex({x: pRect.quadX, y: pRect.quadY, width: pRect.quadW, height: pRect.quadH});

      if (index !== -1) {
        this.nodes[index].insert(pRect);
        return;
      }
    }

    this.children.push(pRect);

    if (this.children.length > this.max_objects && this.level < this.max_levels) {

      // split if we don't already have subnodes
      if (this.nodes.length === 0) {
        this.split();
      }

      // add all objects to there corresponding subnodes
      while (i < this.children.length) {

        index = this.getIndex({
          x: this.children[i].quadX,
          y: this.children[i].quadY,
          width: this.children[i].quadW,
          height: this.children[i].quadH
        });

        if (index !== -1) {
          this.nodes[index].insert(this.children.splice(i, 1)[0]);
        } else {
          ++i;
        }
      }
    }
  }

  public remove(obj: IQuadTreeNode): boolean {
    let node = this.getObjectNode({x: obj.quadX, y: obj.quadY, width: obj.quadW, height: obj.quadH}), index = -1;

    if ((<QuadTree>node).children) {
      index = (<QuadTree>node).children.indexOf(obj);
    }

    if (index === -1) {
      return false;
    }

    if ((<QuadTree>node).children) {
      (<QuadTree>node).children.splice(index, 1);
    }
    return true;
  }

  public clear(): void {
    this.children = [];

    if (this.nodes.length === 0) {
      return;
    }

    for (let i = 0; i < this.nodes.length; i++) {

      this.nodes[i].clear();

    }

    this.nodes = [];
  }

  public cleanup(): void {
    let objects = this.getAll();

    this.clear();

    for (let i = 0; i < objects.length; i++) {
      this.insert(objects[i]);
    }
  }

  protected split(): void {
    let nextLevel = this.level + 1,
      subWidth = Math.round(this.bounds.width / 2),
      subHeight = Math.round(this.bounds.height / 2),
      x = Math.round(this.bounds.x),
      y = Math.round(this.bounds.y);

    // top right node
    this.nodes[0] = new QuadTree({
      x: x + subWidth,
      y: y,
      width: subWidth,
      height: subHeight
    }, this.max_objects, this.max_levels, nextLevel);

    // top left node
    this.nodes[1] = new QuadTree({
      x: x,
      y: y,
      width: subWidth,
      height: subHeight
    }, this.max_objects, this.max_levels, nextLevel);

    // bottom left node
    this.nodes[2] = new QuadTree({
      x: x,
      y: y + subHeight,
      width: subWidth,
      height: subHeight
    }, this.max_objects, this.max_levels, nextLevel);

    // bottom right node
    this.nodes[3] = new QuadTree({
      x: x + subWidth,
      y: y + subHeight,
      width: subWidth,
      height: subHeight
    }, this.max_objects, this.max_levels, nextLevel);
  }

  private getAll(): IQuadTreeNode[] {
    let children = this.children;

    for (let i = 0; i < this.nodes.length; i++) {
      children = children.concat(this.nodes[i].getAll());
    }

    return children;
  }

  private getObjectNode(obj: IRectangle): QuadTree | boolean {
    let index;

    // if there are no subnodes, object must be here
    if (this.nodes.length === 0) {

      return this;

    } else {

      index = this.getIndex(obj);

      // if the object does not fit into a subnode, it must be here
      if (index === -1) {

        return this;

        // if it fits into a subnode, continue deeper search there
      } else {
        let node = this.nodes[index].getObjectNode(obj);
        if (node) {

          return node;

        }
      }
    }

    return false;
  }
}
