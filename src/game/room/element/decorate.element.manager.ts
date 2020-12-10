import { ElementManager } from "./element.manager";
import { Element, InputEnable } from "./element";
import { PBpacket } from "net-socket-packet";
import { op_client, op_def } from "pixelpai_proto";
import NodeType = op_def.NodeType;
import { IPos, LogicPos } from "utils";
import { ISprite, Sprite } from "../display/sprite/sprite";
import { DecorateRoomService } from "../room/decorate.room";

export class DecorateElementManager extends ElementManager {
  protected mRoom: DecorateRoomService;
  constructor(room: DecorateRoomService) {
    super(room);
  }

  public canPut(pos45: IPos, collisionArea: number[][], origin: IPos) {
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
        if (col >= map[i].length || map[row][col] !== 1) {
          return false;
        }
      }
    }
    return true;
  }

  // public addToMap(sprite: ISprite) {
  // }

  // public removeFromMap(sprite: ISprite) {
  // }

  public removeEmpty() {
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
    // if (addMap) this.addToMap(sprite);
    this.mElements.set(ele.id || 0, ele);
    return ele;
  }
  protected getFrozenType(sprite: ISprite) {
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

  // protected onSync(packet: PBpacket) {
  //   const content: op_client.IOP_EDITOR_REQ_CLIENT_SYNC_SPRITE = packet.content;
  //   if (content.nodeType !== NodeType.ElementNodeType) {
  //     return;
  //   }
  //   let element: Element = null;
  //   const sprites = content.sprites;
  //   for (const sprite of sprites) {
  //     element = this.get(sprite.id);
  //     if (element) {
  //       const sp = new Sprite(sprite, content.nodeType);
  //       element.model = sp;
  //       // this.addToMap(sp);
  //     }
  //   }
  // }

  get map(): number[][] {
    return this.mMap;
  }

}
