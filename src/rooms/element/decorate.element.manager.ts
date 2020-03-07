import { ElementManager } from "./element.manager";
import { ISprite, Sprite } from "./sprite";
import { Element } from "./element";
import { DecorateRoomService } from "../decorate.room";
import { PBpacket } from "net-socket-packet";
import { op_client, op_def } from "pixelpai_proto";
import NodeType = op_def.NodeType;

export class DecorateElementManager extends ElementManager {
  protected mRoom: DecorateRoomService;
  constructor(room: DecorateRoomService) {
    super(room);
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

  protected addMap(sprite: ISprite) {
    const displayInfo = sprite.displayInfo;
    if (!displayInfo) {
      return;
    }
    const curAni = sprite.currentAnimation;
    const aniName = curAni.animationName;
    const flip = curAni.flip;
    const collisionArea = displayInfo.getCollisionArea(aniName, flip);
    let walkArea = displayInfo.getWalkableArea(aniName, flip);
    const origin = displayInfo.getOriginPoint(aniName, flip);
    const rows = collisionArea.length;
    const cols = collisionArea[0].length;
    const pos = this.mRoom.transformToMini45(sprite.pos);
    if (!walkArea) {
      walkArea = new Array(rows);
      for (let i = 0; i < rows; i++) {
        walkArea[i] = new Array(cols).fill(0);
      }
    }
    let row = 0;
    let col = 0;
    for (let i = 0; i < rows; i++) {
      row = pos.y + i - origin.x;
      for (let j = 0; j < cols; j++) {
        if (collisionArea[i][j] === 1 && walkArea[i][j] === 0) {
          col = pos.x + j - origin.y;
          if (row >= 0 && row < this.mMap.length && col >= 0 && col < this.mMap[row].length) {
            this.mMap[row][col] = 0;
          }
        }
      }
    }
  }

  protected removeMap(sprite: ISprite) {
    const displayInfo = sprite.displayInfo;
    if (!displayInfo) {
      return;
    }
    const curAni = sprite.currentAnimation;
    const aniName = curAni.animationName;
    const flip = curAni.flip;
    const collisionArea = displayInfo.getCollisionArea(aniName, flip);
    let walkArea = displayInfo.getWalkableArea(aniName, flip);
    const origin = displayInfo.getOriginPoint(aniName, flip);
    const rows = collisionArea.length;
    const cols = collisionArea[0].length;
    const pos = this.mRoom.transformToMini45(sprite.pos);
    if (!walkArea) {
      walkArea = new Array(rows);
      for (let i = 0; i < cols; i++) {
        walkArea[i] = new Array(cols).fill(0);
      }
    }
    let row = 0;
    let col = 0;
    for (let i = 0; i < rows; i++) {
      row = pos.y + i - origin.x;
      for (let j = 0; j < cols; j++) {
        col = pos.x + j - origin.y;
        if (collisionArea[i][j] === 1) {
          if (row >= 0 && row < this.mMap.length && col >= 0 && col < this.mMap[row].length) {
            this.mMap[pos.y + i - origin.x][pos.x + j - origin.y] = -1;
          }
        }
      }
    }
  }

  get map(): number[][] {
    return this.mMap;
  }
}
