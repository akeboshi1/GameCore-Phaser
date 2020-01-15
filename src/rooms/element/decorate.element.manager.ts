import { ElementManager } from "./element.manager";
import { ISprite } from "./sprite";
import { Element, IElement } from "./element";
import { DecorateRoomService } from "../decorate.room";

export class DecorateElementManager extends ElementManager {
  protected mRoom: DecorateRoomService;
  private mMap: number[][];
  constructor(room: DecorateRoomService) {
    super(room);
    const size = room.miniSize;
    this.mMap = new Array(size.rows);
    for (let i = 0; i < this.mMap.length; i++) {
      this.mMap[i] = new Array(size.cols).fill(-1);
    }
  }

  public remove(id: number): IElement {
    const ele = super.remove(id);
    if (ele) {
      this.removeMap(ele.model);
    }
    return ele;
  }

  protected _add(sprite: ISprite): Element {
    const ele = super._add(sprite);
    this.addMap(sprite);
    return ele;
  }

  protected addMap(sprite: ISprite) {
    const displayInfo = sprite.displayInfo;
    if (!displayInfo) {
      return;
    }
    const aniName = sprite.currentAnimationName || displayInfo.animationName;
    const collisionArea = displayInfo.getCollisionArea(aniName);
    let walkArea = displayInfo.getWalkableArea(aniName);
    const origin = displayInfo.getOriginPoint(aniName);
    const rows = collisionArea.length;
    const cols = collisionArea[0].length;
    const pos = sprite.pos;
    if (!walkArea) {
      walkArea = new Array(rows);
      for (let i = 0; i < cols; i++) {
        walkArea[i] = new Array(cols).fill(0);
      }
    }
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        if (collisionArea[i][j] === 1 && walkArea[i][j] === 0) {
          this.mMap[pos.x + i - origin.x][pos.y + j - origin.y] = 0;
        }
      }
    }
  }

  protected removeMap(sprite: ISprite) {
    const displayInfo = sprite.displayInfo;
    if (!displayInfo) {
      return;
    }
    const aniName = sprite.currentAnimationName || displayInfo.animationName;
    const collisionArea = displayInfo.getCollisionArea(aniName);
    let walkArea = displayInfo.getWalkableArea(aniName);
    const origin = displayInfo.getOriginPoint(aniName);
    const rows = collisionArea.length;
    const cols = collisionArea[0].length;
    const pos = sprite.pos;
    if (!walkArea) {
      walkArea = new Array(rows);
      for (let i = 0; i < cols; i++) {
        walkArea[i] = new Array(cols).fill(0);
      }
    }
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        if (collisionArea[i][j] === 1 && walkArea[i][j] === 0) {
          this.mMap[pos.x + i - origin.x][pos.y + j - origin.y] = -1;
        }
      }
    }
  }

  protected setMap(sprite: ISprite, type: number) {
    const displayInfo = sprite.displayInfo;
    if (!displayInfo) {
      return;
    }
    const aniName = sprite.currentAnimationName || displayInfo.animationName;
    const collisionArea = displayInfo.getCollisionArea(aniName);
    let walkArea = displayInfo.getWalkableArea(aniName);
    const origin = displayInfo.getOriginPoint(aniName);
    const rows = collisionArea.length;
    const cols = collisionArea[0].length;
    const pos = sprite.pos;
    if (!walkArea) {
      walkArea = new Array(rows);
      for (let i = 0; i < cols; i++) {
        walkArea[i] = new Array(cols).fill(0);
      }
    }
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        if (walkArea[i][j] === 0) {
          this.mMap[pos.x + i - origin.x][pos.y + j - origin.y] = type;
        }
      }
    }
  }

  get map(): number[][] {
    return this.mMap;
  }
}
