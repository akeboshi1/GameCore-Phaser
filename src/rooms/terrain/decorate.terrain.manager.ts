import { TerrainManager } from "./terrain.manager";
import { IRoomService } from "../room";
import { ISprite } from "../element/sprite";
import { Terrain } from "./terrain";
import { DecorateRoom } from "../decorate.room";
import { IElement } from "../element/element";

export class DecorateTerrainManager extends TerrainManager {
  constructor(roomService: IRoomService) {
    super(roomService);
  }

  public remove(id: number): IElement {
    const terrain = super.remove(id);
    if (terrain) {
      
    }
    return terrain;
  }

  protected _add(sprite: ISprite): Terrain {
    const terrain = super._add(sprite);
    const displayInfo = sprite.displayInfo;
    if (displayInfo) {
      const aniName = sprite.currentAnimationName || displayInfo.animationName;
      const collisionArea = displayInfo.getCollisionArea(aniName);
      const walkArea = displayInfo.getWalkableArea(aniName);
      const origin = displayInfo.getOriginPoint(aniName);
      const decorateRoom: DecorateRoom = <DecorateRoom> this.mRoom;
      if (!walkArea) {
        return terrain;
      }
      const pos45 = decorateRoom.transformToMini45(sprite.pos);
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
    return terrain;
}
}
