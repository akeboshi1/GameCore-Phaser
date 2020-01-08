import { ElementManager } from "./element.manager";
import { IRoomService } from "../room";
import { ISprite } from "./sprite";
import { Element } from "./element";
import { DecorateRoom } from "../decorate.room";

export class DecorateElementManager extends ElementManager {
  constructor(room: IRoomService) {
    super(room);
  }

  protected _add(sprite: ISprite): Element {
    const ele = super._add(sprite);
    const displayInfo = sprite.displayInfo;
    if (displayInfo) {
      // TODO 添加放到外面
      const aniName = sprite.currentAnimationName || displayInfo.animationName;
      const area = displayInfo.getCollisionArea(aniName);
      const origin = displayInfo.getOriginPoint(aniName);
      const decorateRoom: DecorateRoom = <DecorateRoom> this.mRoom;
      const pos45 = decorateRoom.transformToMini45(sprite.pos);
      for (let i = 0; i < area.length; i++) {
        for (let j = 0; j < area[0].length; j++) {
          // 避免影响到其他物件
          if (area[i][j] === 1) decorateRoom.setMap(pos45.x + i - origin.x, pos45.y + j - origin.y, area[i][j]);
        }
      }
    }
    return ele;
  }
}
