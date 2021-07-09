var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
import { PacketHandler, PBpacket } from "net-socket-packet";
import { op_client, op_def, op_virtual_world } from "pixelpai_proto";
import { Terrain } from "./terrain";
const NodeType = op_def.NodeType;
import { Logger, LogicPos } from "structure";
import { EmptyTerrain } from "./empty.terrain";
import { Sprite } from "baseGame";
export class TerrainManager extends PacketHandler {
  constructor(mRoom, listener) {
    super();
    this.mRoom = mRoom;
    __publicField(this, "hasAddComplete", false);
    __publicField(this, "mTerrains", new Map());
    __publicField(this, "mCacheDisplayRef", new Map());
    __publicField(this, "mGameConfig");
    __publicField(this, "mPacketFrameCount", 0);
    __publicField(this, "mListener");
    __publicField(this, "mEmptyMap");
    __publicField(this, "mDirty", false);
    __publicField(this, "mTerrainCache");
    __publicField(this, "mIsDealEmptyTerrain", false);
    this.mListener = listener;
    if (this.connection) {
      this.connection.addPacketListener(this);
      this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_ADD_SPRITE, this.onAdd);
      this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_ADD_SPRITE_END, this.addComplete);
      this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_DELETE_SPRITE, this.onRemove);
      this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_SYNC_SPRITE, this.onSyncSprite);
      this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_CHANGE_SPRITE_ANIMATION, this.onChangeAnimation);
      this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_HOT_BLOCK_SYNC_SPRITE, this.onBlockSyncSprite);
      this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_HOT_BLOCK_DELETE_SPRITE, this.onBlockDeleteSprite);
      this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_HOT_BLOCK_SYNC_SPRITE_END, this.onBlockSpriteEnd);
    }
    if (this.mRoom) {
      this.mGameConfig = this.mRoom.game.elementStorage;
    }
  }
  get isDealEmptyTerrain() {
    return this.mIsDealEmptyTerrain;
  }
  init() {
    this.mIsDealEmptyTerrain = false;
    const roomSize = this.roomService.roomSize;
    this.mEmptyMap = new Array(roomSize.cols);
    for (let i = 0; i < roomSize.cols; i++) {
      this.mEmptyMap[i] = new Array(roomSize.rows);
      for (let j = 0; j < roomSize.rows; j++) {
        this.addEmpty(this.roomService.transformTo90(new LogicPos(i, j)));
      }
    }
  }
  update(time, delta) {
    if (this.mDirty) {
      const len = this.mEmptyMap.length;
      for (let i = 0; i < len; i++) {
        const tmpList = this.mEmptyMap[i];
        const tmpLen = tmpList.length;
        for (let j = 0; j < tmpLen; j++) {
          const terrain = tmpList[j];
          if (terrain && terrain.dirty) {
            this.mEmptyMap[i][j] = void 0;
            terrain.destroy();
          }
        }
      }
      this.mDirty = false;
    }
  }
  dealEmptyTerrain() {
    this.mIsDealEmptyTerrain = true;
    this.mEmptyMap.forEach((emptyTerrainList) => {
      if (emptyTerrainList)
        emptyTerrainList.forEach((emptyTerrain) => {
          if (emptyTerrain)
            emptyTerrain.addDisplay();
        });
    });
    this.mRoom.game.loadTotalSceneConfig();
  }
  addSpritesToCache(sprites) {
    const ids = [];
    let point;
    if (!this.mTerrainCache)
      this.mTerrainCache = [];
    this.hasAddComplete = false;
    for (const sprite of sprites) {
      if (this.mTerrains.get(sprite.id))
        continue;
      point = sprite.point3f;
      this.removeEmpty(new LogicPos(point.x, point.y));
      if (point) {
        const s = new Sprite(sprite, op_def.NodeType.TerrainNodeType);
        this.checkTerrainDisplay(s);
        if (!s.displayInfo) {
          ids.push(s.id);
        }
        this.mTerrainCache.push(s);
      }
    }
    this.fetchDisplay(ids);
  }
  destroy() {
    this.mIsDealEmptyTerrain = false;
    if (this.connection) {
      this.connection.removePacketListener(this);
    }
    if (this.mTerrains) {
      this.mTerrains.forEach((terrain) => this.remove(terrain.id));
      this.mTerrains.clear();
    }
    if (this.mTerrainCache) {
      this.mTerrainCache.length = 0;
      this.mTerrainCache = null;
    }
  }
  get(id) {
    const terrain = this.mTerrains.get(id);
    if (!terrain) {
      return;
    }
    return terrain;
  }
  add(sprites) {
    for (const sprite of sprites) {
      this._add(sprite);
    }
  }
  remove(id) {
    if (!this.mTerrains)
      return;
    const terrain = this.mTerrains.get(id);
    if (terrain) {
      this.mTerrains.delete(id);
      terrain.destroy();
    }
    return terrain;
  }
  getElements() {
    return Array.from(this.mTerrains.values());
  }
  onDisplayCreated(id) {
  }
  onDisplayRemoved(id) {
  }
  addDisplayRef(displays) {
    for (const ref of displays) {
      if (!this.mCacheDisplayRef.get(ref.id))
        this.mCacheDisplayRef.set(ref.id, ref);
    }
  }
  changeAllDisplayData(id) {
  }
  onAdd(packet) {
    this.mPacketFrameCount++;
    if (!this.mGameConfig) {
      return;
    }
    const content = packet.content;
    const sprites = content.sprites;
    const type = content.nodeType;
    if (type !== op_def.NodeType.TerrainNodeType) {
      return;
    }
    this.addSpritesToCache(sprites);
  }
  _add(sprite) {
    let terrain = this.mTerrains.get(sprite.id);
    if (!terrain) {
      terrain = new Terrain(sprite, this);
    } else {
      terrain.model = sprite;
    }
    this.mTerrains.set(terrain.id || 0, terrain);
    return terrain;
  }
  addComplete(packet) {
    this.hasAddComplete = true;
    this.dealTerrainCache();
  }
  onRemove(packet) {
    const content = packet.content;
    const type = content.nodeType;
    const ids = content.ids;
    if (type !== op_def.NodeType.TerrainNodeType) {
      return;
    }
    for (const id of ids) {
      const terrain = this.remove(id);
      if (terrain) {
        this.addEmpty(terrain.model.pos);
      }
    }
  }
  onSyncSprite(packet) {
    const content = packet.content;
    if (content.nodeType !== op_def.NodeType.TerrainNodeType) {
      return;
    }
    let terrain = null;
    const sprites = content.sprites;
    for (const sprite of sprites) {
      terrain = this.get(sprite.id);
      if (terrain) {
        const sp = new Sprite(sprite, content.nodeType);
        terrain.model = sp;
      }
    }
  }
  checkDisplay(sprite) {
    if (!sprite.displayInfo) {
      const displayInfo = this.roomService.game.elementStorage.getDisplayModel(sprite.bindID || sprite.id);
      if (displayInfo) {
        sprite.setDisplayInfo(displayInfo);
        return displayInfo;
      }
    }
  }
  checkTerrainDisplay(sprite) {
    if (!sprite.displayInfo) {
      const palette = this.roomService.game.elementStorage.getTerrainPaletteByBindId(sprite.bindID);
      if (palette) {
        sprite.setDisplayInfo(palette);
      }
    }
  }
  fetchDisplay(ids) {
    if (ids.length === 0) {
      return;
    }
    const packet = new PBpacket(op_virtual_world.OPCODE._OP_REQ_VIRTUAL_WORLD_QUERY_SPRITE_RESOURCE);
    const content = packet.content;
    content.ids = ids;
    this.connection.send(packet);
  }
  removeMap(sprite) {
    this.setMap(sprite, 1);
  }
  addMap(sprite) {
    this.setMap(sprite, 0);
  }
  setMap(sprite, type) {
    const displayInfo = sprite.displayInfo;
    if (!displayInfo) {
      return;
    }
    const curAni = sprite.currentAnimation;
  }
  onChangeAnimation(packet) {
    const content = packet.content;
    if (content.nodeType !== NodeType.TerrainNodeType) {
      return;
    }
    const anis = content.changeAnimation;
    const ids = content.ids;
    if (anis.length < 1) {
      return;
    }
    let terrain = null;
    for (const id of ids) {
      terrain = this.get(id);
      if (terrain) {
        terrain.play(anis[0].animationName);
      }
    }
  }
  addEmpty(pos) {
    const tmpPos = this.roomService.transformTo45(pos);
    const block = new EmptyTerrain(this.roomService, pos, tmpPos.x, tmpPos.y);
    const pos45 = this.roomService.transformTo45(pos);
    this.mEmptyMap[pos45.x][pos45.y] = block;
  }
  removeEmpty(pos) {
    const pos45 = this.roomService.transformTo45(pos);
    if (pos45.x >= this.mEmptyMap.length || pos45.y >= this.mEmptyMap[0].length) {
      Logger.getInstance().debug(`position ${pos.x} ${pos.y} exceed the map boundary`);
      return;
    }
    if (!this.mEmptyMap[pos45.x] || !this.mEmptyMap[pos45.x][pos45.y])
      return;
    const block = this.mEmptyMap[pos45.x][pos45.y];
    if (block) {
      block.dirty = true;
      this.mDirty = true;
    }
  }
  dealTerrainCache() {
    if (this.mTerrainCache) {
      this.mTerrainCache.forEach((sprite) => {
        this._add(sprite);
      });
      this.mTerrainCache.length = 0;
      this.mTerrainCache = null;
      this.hasAddComplete = true;
    }
  }
  onBlockSyncSprite(packet) {
    const content = packet.content;
    const { nodeType, sprites } = content;
    if (nodeType !== op_def.NodeType.TerrainNodeType)
      return;
    for (const sprite of sprites) {
      if (this.mCacheDisplayRef.has(sprite.id))
        this.mCacheDisplayRef.delete(sprite.id);
    }
    this.addSpritesToCache(sprites);
  }
  onBlockDeleteSprite(packet) {
    const content = packet.content;
    const { nodeType, spriteIds } = content;
    if (nodeType !== op_def.NodeType.TerrainNodeType)
      return;
    for (const id of spriteIds) {
      if (this.mCacheDisplayRef.has(id))
        this.mCacheDisplayRef.delete(id);
      if (this.get(id))
        this.remove(id);
    }
  }
  onBlockSpriteEnd(packet) {
    if (!this.mTerrainCache) {
      this.mTerrainCache = [];
    }
    const add = [];
    this.mCacheDisplayRef.forEach((display) => {
      const { id, pos, direction } = display;
      add.push({ id, point3f: this.roomService.transformTo90(pos), direction });
    });
    this.mCacheDisplayRef.clear();
    if (add.length > 0) {
      this.addSpritesToCache(add);
    }
    this.hasAddComplete = true;
    this.dealTerrainCache();
  }
  get connection() {
    if (this.mRoom) {
      return this.mRoom.game.connection;
    }
  }
  get roomService() {
    return this.mRoom;
  }
}
