import { TerrainManager } from "./terrain.manager";
import { IRoomService } from "../room";
import { ISprite, Sprite } from "../element/sprite";
import { Terrain } from "./terrain";
import { DecorateRoom, DecorateRoomService } from "../decorate.room";
import { IElement } from "../element/element";
import { IFramesModel } from "../display/frames.model";
import { IDragonbonesModel } from "../display/dragonbones.model";
import { PBpacket } from "net-socket-packet";
import { op_def, op_client } from "pixelpai_proto";

export class DecorateTerrainManager extends TerrainManager {
  protected mRoom: DecorateRoomService;
  private map: number[][];
  constructor(roomService: DecorateRoomService) {
    super(roomService);
    const miniSize = roomService.miniSize;
    this.map = new Array(miniSize.rows);
    for (let i = 0; i < miniSize.rows; i++) {
      this.map[i] = new Array(miniSize.cols).fill(0);
    }
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
      this.addMap(sprite);
    }
    return terrain;
  }

  protected onSyncSprite(packet: PBpacket) {
    const content: op_client.IOP_EDITOR_REQ_CLIENT_SYNC_SPRITE = packet.content;
    if (content.nodeType !== op_def.NodeType.TerrainNodeType) {
        return;
    }
    let terrain: Terrain = null;
    const sprites = content.sprites;
    for (const sprite of sprites) {
        terrain = this.get(sprite.id);
        if (terrain) {
            const sp = new Sprite(sprite, content.nodeType);
            terrain.model = sp;
            if (sp.displayInfo) {
              this.addMap(sp);
            }
            // terrain.setRenderable(true);
        }
    }
}

  protected addMap(sprite: ISprite) {
    const displayInfo = sprite.displayInfo;
    const aniName = sprite.currentAnimationName || displayInfo.animationName;
    const collisionArea = displayInfo.getCollisionArea(aniName);
    const walkArea = displayInfo.getWalkableArea(aniName);
    const origin = displayInfo.getOriginPoint(aniName);
    let rows = collisionArea.length;
    let cols = collisionArea[0].length;
    rows = rows === 1 ? 2 : rows;
    cols = cols === 1 ? 2 : cols;
    const pos = sprite.pos;
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        if ((i >= collisionArea.length || j >= collisionArea[i].length) || collisionArea[i][j] === 1 && walkArea[i][j] === 1) {
          this.map[pos.x + i - origin.x][pos.y + j - origin.y] = 1;
        }
      }
    }
  }
}
