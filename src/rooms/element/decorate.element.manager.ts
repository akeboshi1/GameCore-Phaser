import { ElementManager } from "./element.manager";
import { IRoomService } from "../room";
import { ISprite } from "./sprite";
import { Element, IElement } from "./element";
import { DecorateRoom } from "../decorate.room";
import { FramesModel } from "../display/frames.model";
import { IDragonbonesModel } from "../display/dragonbones.model";
import { Pos } from "../../utils/pos";

export class DecorateElementManager extends ElementManager {
  private map: number[][] = [];
  constructor(room: IRoomService) {
    super(room);
  }

  public remove(id: number): IElement {
    const ele = super.remove(id);
    if (ele) {
      // ele.model
    }
    return ele;
  }

  protected _add(sprite: ISprite): Element {
    const ele = super._add(sprite);
    const displayInfo = sprite.displayInfo;
    if (displayInfo) {
      // TODO 添加放到外面
      const aniName = sprite.currentAnimationName || displayInfo.animationName;
      this.addMap(aniName, sprite.pos, sprite.displayInfo);
    }
    return ele;
  }

  protected addMap(aniName: string, pos: Pos, displayInfo: FramesModel | IDragonbonesModel) {
      const collisionArea = displayInfo.getCollisionArea(aniName);
      const walkArea = displayInfo.getWalkableArea(aniName);
      const origin = displayInfo.getOriginPoint(aniName);
      if (!walkArea) {
        return;
      }
      const decorateRoom: DecorateRoom = <DecorateRoom> this.mRoom;
      const pos45 = decorateRoom.transformToMini45(pos);
      for (let i = 0; i < collisionArea.length; i++) {
        for (let j = 0; j < collisionArea[0].length; j++) {
          // 避免影响到其他物件
          if (collisionArea[i][j] === 1) {
            if (i > walkArea.length && j > walkArea[j].length && walkArea[i][j] === 1) {
              decorateRoom.setMap(pos45.x + i - origin.x, pos45.y + j - origin.y, collisionArea[i][j]);
            }
          }
        }
      }
  }

  protected removeMap() {

  }
}
