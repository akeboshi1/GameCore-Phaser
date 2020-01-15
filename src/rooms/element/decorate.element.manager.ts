import { ElementManager } from "./element.manager";
import { ISprite, Sprite } from "./sprite";
import { Element, IElement } from "./element";
import { DecorateRoomService } from "../decorate.room";
import { PBpacket } from "net-socket-packet";
import { op_client, op_def } from "pixelpai_proto";
import NodeType = op_def.NodeType;

export class DecorateElementManager extends ElementManager {
  protected mRoom: DecorateRoomService;
  private mMap: number[][];
  constructor(room: DecorateRoomService) {
    super(room);
    const size = room.miniSize;
    this.mMap = new Array(size.cols);
    for (let i = 0; i < this.mMap.length; i++) {
      this.mMap[i] = new Array(size.rows).fill(-1);
    }
  }

  public remove(id: number): IElement {
    const ele = super.remove(id);
    if (ele) {
      this.removeMap(ele.model);
    }
    return ele;
  }

  protected onSync(packet: PBpacket) {
    const content: op_client.IOP_EDITOR_REQ_CLIENT_SYNC_SPRITE = packet.content;
    if (content.nodeType !== NodeType.ElementNodeType) {
        return;
    }
    let element: Element = null;
    const sprites = content.sprites;
    for (const sprite of sprites) {
        element = this.get(sprite.id);
        if (element) {
            const sp = new Sprite(sprite, content.nodeType);
            element.model = sp;
            this.addMap(sp);
        }
    }
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
    const pos = this.mRoom.transformToMini45(sprite.pos);
    if (!walkArea) {
      walkArea = new Array(rows);
      for (let i = 0; i < rows; i++) {
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
    const pos = this.mRoom.transformToMini45(sprite.pos);
    if (!walkArea) {
      walkArea = new Array(rows);
      for (let i = 0; i < cols; i++) {
        walkArea[i] = new Array(cols).fill(0);
      }
    }
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        if (collisionArea[i][j] === 1) {
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
