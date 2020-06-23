import { TerrainManager } from "./terrain.manager";
import { ISprite, Sprite } from "../element/Sprite";
import { Terrain } from "./terrain";
import { DecorateRoomService } from "../decorate.room";
import { IElement } from "../element/element";
import { PBpacket } from "net-socket-packet";
import { op_def, op_client } from "pixelpai_proto";
import { Pos } from "../../utils/pos";

export class DecorateTerrainManager extends TerrainManager {
  protected mRoom: DecorateRoomService;
  constructor(roomService: DecorateRoomService) {
    super(roomService);
    const miniSize = roomService.miniSize;
    this.mMap = new Array(miniSize.cols);
    for (let i = 0; i < miniSize.rows; i++) {
      this.mMap[i] = new Array(miniSize.rows).fill(0);
    }
  }

  public remove(id: number): IElement {
    const terrain = super.remove(id);
    if (terrain) {
      this.removeMap(terrain.model);
    }
    return terrain;
  }

  public canPut(pos45: Pos, collisionArea: number[][], origin: Phaser.Geom.Point) {
    let row = 0;
    let col = 0;
    const map = this.map;
    for (let i = 0; i < collisionArea.length; i++) {
      row = i + pos45.y - origin.y;
      if (row >= map.length) {
        return false;
      }
      for (let j = 0; j < collisionArea[i].length; j++) {
        col = j + pos45.x - origin.x;
        if (col >= map[i].length || map[row][col] === 0) {
          return false;
        }
      }
    }
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
    this.setMap(sprite, 1);
  }

  protected removeMap(sprite: ISprite) {
    this.setMap(sprite, 0);
  }

  protected setMap(sprite: ISprite, type: number) {
    const displayInfo = sprite.displayInfo;
    if (!displayInfo) {
      return;
    }
    const curAni = sprite.currentAnimation;
    const aniName = curAni.animationName;
    const flip = curAni.flip;
    const collisionArea = displayInfo.getCollisionArea(aniName, flip);
    const walkArea = displayInfo.getWalkableArea(aniName, flip);
    const origin = displayInfo.getOriginPoint(aniName, flip);
    let rows = collisionArea.length;
    let cols = collisionArea[0].length;
    let hasCollisionArea = true;
    if (rows === 1 && cols === 1) {
      rows = 2;
      cols = 2;
      hasCollisionArea = false;
    }
    const pos = sprite.pos;
    // terrain pos为60*30大格子
    pos.x *= 2;
    pos.y *= 2;
    let _x = 0;
    let _y = 0;
    for (let i = 0; i < rows; i++) {
      _x = pos.x + i - origin.x;
      for (let j = 0; j < cols; j++) {
        if ((!hasCollisionArea) || collisionArea[i][j] === 1 && walkArea[i][j] === 1) {
          _y = pos.y + j - origin.y;
          if (_x >= this.mMap.length || _y >= this.mMap[_x].length) {
            continue;
          }
          this.mMap[pos.x + i - origin.x][pos.y + j - origin.y] = type;
        }
      }
    }
  }
}
