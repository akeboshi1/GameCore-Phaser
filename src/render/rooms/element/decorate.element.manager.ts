import { ElementManager } from "../../../game/room/element/element.manager";
import { ISprite, Sprite } from "./sprite";
import { Element, InputEnable } from "./element";
import { DecorateRoomService } from "../decorate.room";
import { PBpacket } from "net-socket-packet";
import { op_client, op_def } from "pixelpai_proto";
import NodeType = op_def.NodeType;
import { Pos } from "../../game/core/utils/pos";

export class DecorateElementManager extends ElementManager {
  protected mRoom: DecorateRoomService;
  constructor(room: DecorateRoomService) {
    super(room);
  }

  public addMap(sprite: ISprite) {
    const displayInfo = sprite.displayInfo;
    if (!displayInfo) {
      return;
    }
    if (this.mRoom.selectedSprite && this.mRoom.selectedSprite.id === sprite.id) {
      return;
    }
    const curAni = sprite.currentAnimation;
    const aniName = curAni.name;
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
      row = pos.y + i - origin.y;
      for (let j = 0; j < cols; j++) {
        if (collisionArea[i][j] === 1 && (i >= walkArea.length || j >= walkArea[i].length || walkArea[i][j] === 0)) {
          col = pos.x + j - origin.x;
          if (row >= 0 && row < this.mMap.length && col >= 0 && col < this.mMap[row].length) {
            this.mMap[row][col] = 1;
          }
        }
      }
    }
  }

  public removeMap(sprite: ISprite) {
    const displayInfo = sprite.displayInfo;
    if (!displayInfo) {
      return;
    }
    const curAni = sprite.currentAnimation;
    const aniName = curAni.name;
    const flip = curAni.flip;
    const collisionArea = displayInfo.getCollisionArea(aniName, flip);
    const origin = displayInfo.getOriginPoint(aniName, flip);
    const rows = collisionArea.length;
    const cols = collisionArea[0].length;
    const pos = this.mRoom.transformToMini45(sprite.pos);
    let row = 0;
    let col = 0;
    for (let i = 0; i < rows; i++) {
      row = pos.y + i - origin.y;
      for (let j = 0; j < cols; j++) {
        col = pos.x + j - origin.x;
        if (collisionArea[i][j] === 1) {
          if (row >= 0 && row < this.mMap.length && col >= 0 && col < this.mMap[row].length) {
            this.mMap[row][col] = 0;
          }
        }
      }
    }
  }

  public canPut(pos45: Pos, collisionArea: number[][], origin: Phaser.Geom.Point) {
    let row = 0;
    let col = 0;
    const map = this.map;
    for (let i = 0; i < collisionArea.length; i++) {
      row = i + pos45.y - origin.y;
      if (row < 0 || row >= map.length) {
        return false;
      }
      for (let j = 0; j < collisionArea[i].length; j++) {
        col = j + pos45.x - origin.x;
        if (col >= map[i].length || map[row][col] === 1) {
          return false;
        }
      }
    }
    return true;
  }

  protected _add(sprite: ISprite, addMap?: boolean): Element {
    if (addMap === undefined) addMap = true;
    let ele = this.mElements.get(sprite.id);
    if (ele) {
      ele.model = sprite;
    } else {
      ele = new Element(sprite, this);
      if (this.getFrozenType(sprite) === "FROZEN")
        ele.setInputEnable(InputEnable.Diasble);
      else
        ele.setInputEnable(InputEnable.Enable);
    }
    // if (!ele) ele = new Element(sprite, this);
    if (addMap) this.addMap(sprite);
    this.mElements.set(ele.id || 0, ele);
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

  get map(): number[][] {
    return this.mMap;
  }
  private getFrozenType(sprite: ISprite) {
    let frozenType;
    const arr = sprite.attrs;
    if (arr) {
      arr.forEach((value) => {
        if (value.key === "frozenType") {
          frozenType = value.value;
        }
      });
    }
    return frozenType;
  }
}
