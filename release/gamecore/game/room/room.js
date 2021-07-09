var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
import { op_client, op_def, op_virtual_world } from "pixelpai_proto";
import { PacketHandler, PBpacket } from "net-socket-packet";
import { AStar, Handler, Logger, LogicPos, Position45 } from "structure";
import { LoadState, SceneName } from "structure";
const IActor = op_client.IActor;
import { TerrainManager } from "./terrain/terrain.manager";
import { ElementManager } from "./element/element.manager";
import { PlayerManager } from "./player/player.manager";
import { CamerasManager } from "./camera/cameras.worker.manager";
import { EffectManager } from "./effect/effect.manager";
import { SkyBoxManager } from "./sky.box/sky.box.manager";
import { WallManager } from "./element/wall.manager";
import { CollsionManager } from "../collsion";
import { RoomStateManager } from "./state";
import { ViewblockManager } from "./viewblock/viewblock.manager";
import { Sprite } from "baseGame";
export class Room extends PacketHandler {
  constructor(manager) {
    super();
    this.manager = manager;
    __publicField(this, "mGame");
    __publicField(this, "mID");
    __publicField(this, "mTerrainManager");
    __publicField(this, "mElementManager");
    __publicField(this, "mPlayerManager");
    __publicField(this, "mSkyboxManager");
    __publicField(this, "mEffectManager");
    __publicField(this, "mSize");
    __publicField(this, "mMiniSize");
    __publicField(this, "mCameraService");
    __publicField(this, "mBlocks");
    __publicField(this, "mEnableDecorate", false);
    __publicField(this, "mIsDecorating", false);
    __publicField(this, "mWallMamager");
    __publicField(this, "mScaleRatio");
    __publicField(this, "mStateManager");
    __publicField(this, "mAstar");
    __publicField(this, "mIsLoading", false);
    __publicField(this, "mManagersReadyStates", new Map());
    __publicField(this, "mCollsionManager");
    __publicField(this, "mActorData");
    __publicField(this, "mUpdateHandlers", []);
    __publicField(this, "mDecorateEntryData", null);
    __publicField(this, "mTerrainMap");
    __publicField(this, "mWalkableMap");
    __publicField(this, "mWalkableMarkMap", new Map());
    __publicField(this, "mInteractiveList");
    __publicField(this, "mIsWaitingForDecorateResponse", false);
    this.mGame = this.manager.game;
    this.mScaleRatio = this.mGame.scaleRatio;
    if (this.mGame) {
      this.addListen();
      this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_ENABLE_EDIT_MODE, this.onEnableEditModeHandler);
      this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_UNWALKABLE_BIT_MAP, this.onShowMapTitle);
      this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_SET_CAMERA_FOLLOW, this.onCameraFollowHandler);
      this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_RESET_CAMERA_SIZE, this.onCameraResetSizeHandler);
      this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_SYNC_STATE, this.onSyncStateHandler);
      this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_CURRENT_SCENE_ALL_SPRITE, this.onAllSpriteReceived);
      this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_NOTICE_RELOAD_SCENE, this.onReloadScene);
    }
  }
  addListen() {
    if (this.connection) {
      this.connection.addPacketListener(this);
    }
  }
  removeListen() {
    if (this.connection) {
      this.connection.removePacketListener(this);
    }
  }
  enter(data) {
    if (!data) {
      return;
    }
    this.mID = data.id;
    this.mSize = {
      cols: data.cols,
      rows: data.rows,
      tileHeight: data.tileHeight,
      tileWidth: data.tileWidth,
      sceneWidth: (data.rows + data.cols) * (data.tileWidth / 2),
      sceneHeight: (data.rows + data.cols) * (data.tileHeight / 2)
    };
    this.mMiniSize = {
      cols: data.cols * 2,
      rows: data.rows * 2,
      tileWidth: data.tileWidth / 2,
      tileHeight: data.tileHeight / 2
    };
    this.game.renderPeer.setRoomSize(this.mSize, this.mMiniSize);
    this.mWalkableMap = new Array(this.mMiniSize.rows);
    for (let i = 0; i < this.mWalkableMap.length; i++) {
      this.mWalkableMap[i] = new Array(this.mMiniSize.cols).fill(-1);
    }
    this.mTerrainMap = new Array(this.mMiniSize.rows);
    for (let i = 0; i < this.mTerrainMap.length; i++) {
      this.mTerrainMap[i] = new Array(this.mMiniSize.cols).fill(-1);
    }
    this.mInteractiveList = new Array(this.mMiniSize.rows);
    for (let i = 0; i < this.mInteractiveList.length; i++) {
      this.mInteractiveList[i] = new Array(this.mMiniSize.cols);
    }
    this.mGame.showLoading({
      "dpr": this.mScaleRatio,
      "sceneName": "PlayScene",
      "state": LoadState.CREATESCENE
    });
    this.mIsLoading = true;
  }
  onFullPacketReceived(sprite_t) {
    if (sprite_t !== op_def.NodeType.TerrainNodeType) {
      return;
    }
  }
  onClockReady() {
  }
  pause() {
    this.mGame.roomPause(this.mID);
  }
  resume() {
    this.mGame.roomResume(this.mID);
  }
  addActor(data) {
    this.mActorData = data;
  }
  addBlockObject(object) {
    return new Promise((resolve, reject) => {
      if (this.blocks) {
        this.blocks.add(object).then((val) => {
          resolve(val);
        });
      } else {
        reject(false);
      }
    });
  }
  removeBlockObject(object) {
    if (this.blocks) {
      this.blocks.remove(object);
    }
  }
  updateBlockObject(object) {
    if (this.blocks) {
      this.blocks.check(object);
    }
  }
  transformTo90(p) {
    if (!this.mSize) {
      return;
    }
    return Position45.transformTo90(p, this.mSize);
  }
  transformTo45(p) {
    if (!this.mSize) {
      return;
    }
    return Position45.transformTo45(p, this.mSize);
  }
  transformToMini90(p) {
    if (!this.mMiniSize) {
      return;
    }
    return Position45.transformTo90(p, this.miniSize);
  }
  transformToMini45(p) {
    if (!this.mMiniSize) {
      return;
    }
    return Position45.transformTo45(p, this.mMiniSize);
  }
  getElement(id) {
    let ele = null;
    if (this.mPlayerManager) {
      ele = this.mPlayerManager.get(id);
    }
    if (!ele && this.mElementManager) {
      ele = this.mElementManager.get(id);
    }
    if (!ele && this.mTerrainManager) {
      ele = this.mTerrainManager.get(id);
    }
    return ele;
  }
  update(time, delta) {
    this.updateClock(time, delta);
    if (this.mElementManager)
      this.mElementManager.update(time, delta);
    if (this.mPlayerManager)
      this.mPlayerManager.update(time, delta);
    if (this.terrainManager)
      this.terrainManager.update(time, delta);
    if (this.mGame.httpClock)
      this.mGame.httpClock.update(time, delta);
    if (this.mCameraService)
      this.mCameraService.update(time, delta);
    if (this.mCollsionManager)
      this.mCollsionManager.update(time, delta);
    for (const oneHandler of this.mUpdateHandlers) {
      oneHandler.runWith([time, delta]);
    }
  }
  updateClock(time, delta) {
  }
  now() {
    return this.mGame.clock.unixTime;
  }
  getMaxScene() {
    if (!this.mSize) {
      return;
    }
    const w = this.mSize.sceneWidth;
    const h = this.mSize.sceneHeight;
    return { width: w, height: h };
  }
  createManager() {
    this.mCameraService = new CamerasManager(this.mGame, this);
    this.mTerrainManager = new TerrainManager(this, this);
    this.mElementManager = new ElementManager(this);
    this.mPlayerManager = new PlayerManager(this);
    this.mBlocks = new ViewblockManager(this.mCameraService);
    this.mSkyboxManager = new SkyBoxManager(this);
    this.mEffectManager = new EffectManager(this);
    this.mWallMamager = new WallManager(this);
    this.mCollsionManager = new CollsionManager(this);
    this.mCollsionManager.addWall();
  }
  startPlay() {
    return __async(this, null, function* () {
      Logger.getInstance().debug("room startplay =====");
      this.game.renderPeer.showPlay();
      this.createManager();
      const padding = 199 * this.mScaleRatio;
      const offsetX = this.mSize.rows * (this.mSize.tileWidth / 2);
      this.mGame.peer.render.roomstartPlay();
      this.mGame.peer.render.gridsDebugger.setData(this.mSize);
      this.mGame.peer.render.setCamerasBounds(-padding - offsetX * this.mScaleRatio, -padding, this.mSize.sceneWidth * this.mScaleRatio + padding * 2, this.mSize.sceneHeight * this.mScaleRatio + padding * 2);
      this.mBlocks.int(this.mSize);
      this.mGame.user.enterScene(this, this.mActorData);
      if (this.connection) {
        yield this.cameraService.syncCamera();
        if (this.cameraService.initialize)
          yield this.cameraService.syncCameraScroll();
        this.connection.send(new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_SCENE_CREATED));
      }
      this.initSkyBox();
      this.mTerrainManager.init();
      this.mWallMamager.init();
      this.mAstar = new AStar(this);
      const map = [];
      for (let i = 0; i < this.miniSize.rows; i++) {
        map[i] = [];
        for (let j = 0; j < this.miniSize.cols; j++) {
          map[i][j] = 1;
        }
      }
      this.mAstar.init(map);
    });
  }
  initUI() {
    this.mIsLoading = false;
  }
  addToInteractiveMap(sprite) {
    const displayInfo = sprite.displayInfo;
    if (!displayInfo) {
      return;
    }
    const interactiveList = sprite.getInteractive();
    if (!interactiveList) {
      this.removeFromInteractiveMap(sprite);
      return;
    }
    const id = sprite.id;
    const addPos = sprite.getOriginPoint();
    const pos = sprite.pos;
    const index45 = this.transformToMini45(new LogicPos(pos.x, pos.y));
    const len = interactiveList.length;
    if (!this.mInteractiveList)
      this.mInteractiveList = [];
    for (let i = 0; i < len; i++) {
      const interactivePos = interactiveList[i];
      const x = interactivePos.x + index45.x - addPos.x;
      const y = interactivePos.y + index45.y - addPos.y;
      if (!this.mInteractiveList[y])
        this.mInteractiveList[y] = [];
      if (!this.mInteractiveList[y][x])
        this.mInteractiveList[y][x] = [];
      if (this.mInteractiveList[y][x].indexOf(id) === -1)
        this.mInteractiveList[y][x].push(id);
    }
  }
  removeFromInteractiveMap(sprite) {
    const id = sprite.id;
    if (!this.mInteractiveList)
      return;
    const len = this.mInteractiveList.length;
    for (let i = 0; i < len; i++) {
      const tmpLen = this.mInteractiveList[i].length;
      for (let j = 0; j < tmpLen; j++) {
        const ids = this.mInteractiveList[i][j];
        if (!ids || ids.length < 1)
          continue;
        const tmpLen1 = ids.length;
        for (let k = 0; k < tmpLen1; k++) {
          const tmpId = ids[k];
          if (id === tmpId) {
            this.mInteractiveList[i][j].splice(k, 1);
          }
        }
      }
    }
  }
  addToWalkableMap(sprite, isTerrain = false) {
    const displayInfo = sprite.displayInfo;
    if (!displayInfo) {
      return;
    }
    const walkableData = this.getSpriteWalkableData(sprite, isTerrain);
    if (!walkableData)
      return;
    const { origin, collisionArea, walkableArea, pos45, rows, cols } = walkableData;
    let tempY = 0;
    let tempX = 0;
    for (let i = 0; i < rows; i++) {
      tempY = pos45.y + i - origin.y;
      for (let j = 0; j < cols; j++) {
        tempX = pos45.x + j - origin.x;
        if (tempY < 0 || tempY >= this.mWalkableMap.length || tempX < 0 || tempX >= this.mWalkableMap[tempY].length) {
          continue;
        }
        const canWalk = collisionArea[i][j] === 0 || walkableArea[i][j] === 1;
        this.addWalkableMark(tempX, tempY, sprite.id, isTerrain ? 0 : 1, canWalk);
        if (isTerrain)
          this.setTerrainMap(tempX, tempY, canWalk);
      }
    }
    if (isTerrain)
      this.showDecorateGrid();
  }
  removeFromWalkableMap(sprite, isTerrain = false) {
    if (!sprite)
      return;
    const walkableData = this.getSpriteWalkableData(sprite, isTerrain);
    if (!walkableData)
      return;
    const { origin, collisionArea, walkableArea, pos45, rows, cols } = walkableData;
    let tempY = 0;
    let tempX = 0;
    for (let i = 0; i < rows; i++) {
      tempY = pos45.y + i - origin.y;
      for (let j = 0; j < cols; j++) {
        tempX = pos45.x + j - origin.x;
        if (tempY < 0 || tempY >= this.mWalkableMap.length || tempX < 0 || tempX >= this.mWalkableMap[tempY].length) {
          continue;
        }
        this.removeWalkableMark(tempX, tempY, sprite.id);
      }
    }
  }
  getInteractiveEles(x, y) {
    if (!this.mInteractiveList)
      return null;
    const gridLen = 80;
    const list = [];
    const pos = this.transformToMini45(new LogicPos(x, y));
    const baseX = pos.x;
    const baseY = pos.y;
    const rows = this.miniSize.rows;
    const cols = this.miniSize.cols;
    for (let i = -gridLen; i <= gridLen; i++) {
      if (baseY + i < 0 || baseY + i >= rows)
        continue;
      for (let j = -gridLen; j < gridLen; j++) {
        if (baseX + j < 0 || baseX + j >= cols)
          continue;
        const idPos = { x: baseX + j, y: baseY + i };
        const ids = this.mInteractiveList[idPos.y][idPos.x];
        if (ids && ids.length > 0) {
          list.push(ids);
        }
      }
    }
    return list;
  }
  isWalkable(x, y) {
    if (y < 0 || y >= this.mWalkableMap.length || x < 0 || x >= this.mWalkableMap[y].length) {
      return false;
    }
    return this.mWalkableMap[y][x] === 1;
  }
  findPath(startPos, targetPosList, toReverse) {
    return this.mAstar.find(startPos, targetPosList, toReverse);
  }
  clear() {
    if (this.mStateManager) {
      this.mStateManager.destroy();
    }
    if (this.mTerrainManager) {
      this.mTerrainManager.destroy();
    }
    if (this.mElementManager) {
      this.mElementManager.destroy();
    }
    if (this.mPlayerManager) {
      this.mPlayerManager.destroy();
    }
    if (this.mBlocks) {
      this.mBlocks.destroy();
    }
    if (this.mEffectManager)
      this.mEffectManager.destroy();
    if (this.mSkyboxManager)
      this.mSkyboxManager.destroy();
    if (this.mWallMamager)
      this.mWallMamager.destroy();
    if (this.mCollsionManager)
      this.mCollsionManager.destroy();
    if (this.mActorData)
      this.mActorData = null;
    Logger.getInstance().debug("room clear");
    if (this.game) {
      if (this.game.renderPeer)
        this.game.renderPeer.clearRoom();
      if (this.game.uiManager)
        this.game.uiManager.recover();
    }
    this.mTerrainMap = [];
    this.mWalkableMap = [];
    this.mInteractiveList = [];
    this.mWalkableMarkMap.clear();
  }
  destroy() {
    this.removeListen();
    this.clear();
    this.game.renderPeer.removeScene(SceneName.PLAY_SCENE);
  }
  addUpdateHandler(caller, method) {
    this.removeUpdateHandler(caller, method);
    const handler = new Handler(caller, method);
    this.mUpdateHandlers.push(handler);
  }
  removeUpdateHandler(caller, method) {
    let removeid = -1;
    for (let i = 0; i < this.mUpdateHandlers.length; i++) {
      const item = this.mUpdateHandlers[i];
      if (item.caller === caller && item.method === method) {
        removeid = i;
        break;
      }
    }
    if (removeid !== -1) {
      const hander = this.mUpdateHandlers.splice(removeid, 1)[0];
      hander.clear();
    }
  }
  destroyUpdateHandler() {
    for (const item of this.mUpdateHandlers) {
      item.clear();
    }
    this.mUpdateHandlers.length = 0;
  }
  get isLoading() {
    return this.mIsLoading;
  }
  onManagerCreated(key) {
    if (this.mManagersReadyStates.has(key))
      return;
    this.mManagersReadyStates.set(key, false);
  }
  onManagerReady(key) {
    if (!this.mManagersReadyStates.has(key))
      return;
    this.mManagersReadyStates.set(key, true);
    let allReady = true;
    this.mManagersReadyStates.forEach((val) => {
      if (val === false) {
        allReady = false;
      }
    });
    if (allReady) {
      this.game.renderPeer.roomReady();
      this.onRoomReady();
    }
  }
  onRoomReady() {
    if (!this.terrainManager.isDealEmptyTerrain) {
      this.terrainManager.dealEmptyTerrain();
    }
  }
  cameraFollowHandler() {
    if (!this.cameraService.initialize)
      return;
    this.cameraService.syncCameraScroll();
  }
  requestSaveDecorating(pkt) {
    if (this.mIsWaitingForDecorateResponse)
      return;
    this.mIsWaitingForDecorateResponse = true;
    this.connection.send(pkt);
  }
  checkSpriteConflictToWalkableMap(sprite, isTerrain = false, pos) {
    const walkableData = this.getSpriteWalkableData(sprite, isTerrain, pos);
    if (!walkableData) {
      Logger.getInstance().error("data error check sprite: ", sprite);
      return [];
    }
    const { origin, collisionArea, walkableArea, pos45, rows, cols } = walkableData;
    const result = new Array(rows);
    for (let i = 0; i < rows; i++) {
      result[i] = new Array(cols).fill(1);
    }
    let tempY = 0;
    let tempX = 0;
    for (let i = 0; i < rows; i++) {
      tempY = pos45.y + i - origin.y;
      for (let j = 0; j < cols; j++) {
        result[i][j] = collisionArea[i][j];
        tempX = pos45.x + j - origin.x;
        if (collisionArea[i][j] === 0 || walkableArea[i][j] === 1) {
          continue;
        }
        const val = this.isWalkable(tempX, tempY);
        if (!val) {
          result[i][j] = 2;
        }
      }
    }
    return result;
  }
  initSkyBox() {
    const scenerys = this.game.elementStorage.getScenerys();
    if (scenerys) {
      for (const scenery of scenerys) {
        this.addSkyBox({
          id: scenery.id,
          uris: scenery.uris,
          depth: scenery.depth,
          width: scenery.width,
          height: scenery.height,
          speed: scenery.speed,
          offset: scenery.offset,
          fit: scenery.fit
        });
      }
    }
  }
  addSkyBox(scenery) {
    this.mSkyboxManager.add(scenery);
  }
  get terrainManager() {
    return this.mTerrainManager || void 0;
  }
  get elementManager() {
    return this.mElementManager || void 0;
  }
  get playerManager() {
    return this.mPlayerManager || void 0;
  }
  get skyboxManager() {
    return this.mSkyboxManager;
  }
  get wallManager() {
    return this.mWallMamager;
  }
  get cameraService() {
    return this.mCameraService || void 0;
  }
  get effectManager() {
    return this.mEffectManager;
  }
  get collsionManager() {
    return this.mCollsionManager;
  }
  get id() {
    return this.mID;
  }
  get roomSize() {
    return this.mSize || void 0;
  }
  get miniSize() {
    return this.mMiniSize;
  }
  get blocks() {
    return this.mBlocks;
  }
  get game() {
    return this.mGame;
  }
  get enableDecorate() {
    return this.mEnableDecorate;
  }
  get isDecorating() {
    return this.mIsDecorating;
  }
  get connection() {
    if (this.manager) {
      return this.manager.connection;
    }
  }
  get sceneType() {
    return op_def.SceneTypeEnum.NORMAL_SCENE_TYPE;
  }
  onEnableEditModeHandler(packet) {
    this.mEnableDecorate = true;
  }
  onShowMapTitle(packet) {
  }
  onCameraResetSizeHandler() {
    this.cameraService.initialize = true;
  }
  onCameraFollowHandler(packet) {
    if (!this.cameraService.initialize)
      return;
    const content = packet.content;
    if (content.hasOwnProperty("id")) {
      const id = content.id ? content.id : 0;
      this.cameraService.startFollow(id, content.effect);
    } else {
      this.cameraService.stopFollow();
    }
    if (content.hasOwnProperty("pos")) {
      const pos = content.pos;
      this.cameraService.setCamerasScroll(pos.x, pos.y, content.effect);
    }
  }
  onAllSpriteReceived(packet) {
    const content = packet.content;
    const sprites = content.sprites;
    if (!sprites) {
      Logger.getInstance().error("<OP_VIRTUAL_WORLD_REQ_CLIENT_CURRENT_SCENE_ALL_SPRITE> content.sprites is undefined");
      return;
    }
    const nodeType = content.nodeType;
    const addList = [];
    if (nodeType === op_def.NodeType.ElementNodeType || nodeType === op_def.NodeType.SpawnPointType) {
      for (const sp of content.sprites) {
        if (this.mElementManager.get(sp.id))
          continue;
        addList.push(sp);
      }
      this.mElementManager.addSpritesToCache(addList);
    } else if (nodeType === op_def.NodeType.TerrainNodeType) {
      for (const sp of content.sprites) {
        if (this.mTerrainManager.get(sp.id))
          continue;
        addList.push(sp);
      }
      this.mTerrainManager.addSpritesToCache(addList);
    }
  }
  onReloadScene(packet) {
    const content = packet.content;
    const sprites = content.sprites;
    if (!sprites) {
      Logger.getInstance().error("<OP_VIRTUAL_WORLD_REQ_CLIENT_NOTICE_RELOAD_SCENE> content.sprites is undefined");
      return;
    }
    const nodeType = content.nodeType;
    const addList = [];
    for (const sp of content.sprites) {
      const _sprite = new Sprite(sp, nodeType);
      addList.push(_sprite);
    }
    if (nodeType === op_def.NodeType.ElementNodeType || nodeType === op_def.NodeType.SpawnPointType) {
      if (content.packet.currentFrame !== void 0 && content.packet.currentFrame === 1) {
        const elements = this.elementManager.getElements();
        for (const element of elements) {
          this.elementManager.remove(element.id);
        }
      }
      this.mElementManager.addSpritesToCache(content.sprites);
    } else if (nodeType === op_def.NodeType.TerrainNodeType) {
      if (content.packet.currentFrame !== void 0 && content.packet.currentFrame === 1) {
        const terrains = this.terrainManager.getElements();
        for (const terrain of terrains) {
          this.terrainManager.remove(terrain.id);
        }
      }
      this.mTerrainManager.add(addList);
    }
  }
  onSyncStateHandler(packet) {
    const content = packet.content;
    const states = content.stateGroup;
    for (const state of states) {
      switch (state.owner.type) {
        case op_def.NodeType.ElementNodeType:
          this.mElementManager.setState(state);
          break;
        case op_def.NodeType.CharacterNodeType:
          this.mPlayerManager.setState(state);
          break;
        case op_def.NodeType.SceneNodeType:
          this.setState(state);
          break;
      }
    }
  }
  getSpriteWalkableData(sprite, isTerrain, pos) {
    let collisionArea = sprite.getCollisionArea();
    let walkableArea = sprite.getWalkableArea();
    const origin = sprite.getOriginPoint();
    if (!collisionArea) {
      return null;
    }
    let rows = collisionArea.length;
    let cols = collisionArea[0].length;
    let pos45;
    let pos90;
    if (pos === void 0) {
      pos90 = sprite.pos;
    } else {
      pos90 = pos;
    }
    if (isTerrain) {
      pos45 = this.transformTo45(new LogicPos(pos90.x, pos90.y));
      pos45.x *= 2;
      pos45.y *= 2;
      if (rows === 1 && cols === 1) {
        rows = 2;
        cols = 2;
        const colVal = collisionArea[0][0];
        collisionArea = new Array(rows);
        for (let i = 0; i < rows; i++) {
          collisionArea[i] = new Array(cols).fill(colVal);
        }
        walkableArea = new Array(rows);
        for (let i = 0; i < rows; i++) {
          walkableArea[i] = new Array(cols).fill(0);
        }
      }
    } else {
      pos45 = this.transformToMini45(new LogicPos(pos90.x, pos90.y));
    }
    if (!walkableArea || walkableArea.length === 0) {
      walkableArea = new Array(rows);
      for (let i = 0; i < rows; i++) {
        walkableArea[i] = new Array(cols).fill(0);
      }
    } else {
      const wRows = walkableArea.length;
      const wCols = walkableArea[0].length;
      if (rows !== wRows || cols !== wCols) {
        const temp = new Array(rows);
        for (let i = 0; i < rows; i++) {
          temp[i] = new Array(cols).fill(0);
        }
        for (let i = 0; i < rows; i++) {
          for (let j = 0; j < cols; j++) {
            if (i >= wRows || j >= wCols) {
              continue;
            }
            temp[i][j] = walkableArea[i][j];
          }
        }
        walkableArea = temp;
      }
    }
    return { origin, collisionArea, walkableArea, pos45, rows, cols };
  }
  addWalkableMark(x, y, id, level, walkable) {
    const idx = this.mapPos2Idx(x, y);
    if (!this.mWalkableMarkMap.has(idx)) {
      this.mWalkableMarkMap.set(idx, new Map());
    }
    const marks = this.mWalkableMarkMap.get(idx);
    if (marks.has(id)) {
      marks.delete(id);
    }
    marks.set(id, { level, walkable });
    this.caculateWalkableMark(x, y);
  }
  removeWalkableMark(x, y, id) {
    const idx = this.mapPos2Idx(x, y);
    if (!this.mWalkableMarkMap.has(idx)) {
      this.mWalkableMarkMap.set(idx, new Map());
    }
    const marks = this.mWalkableMarkMap.get(idx);
    if (marks.has(id)) {
      marks.delete(id);
    }
    this.caculateWalkableMark(x, y);
  }
  caculateWalkableMark(x, y) {
    const idx = this.mapPos2Idx(x, y);
    if (!this.mWalkableMarkMap.has(idx)) {
      this.setWalkableMap(x, y, false);
      return;
    }
    const marks = this.mWalkableMarkMap.get(idx);
    if (marks.size === 0) {
      this.setWalkableMap(x, y, false);
      return;
    }
    let highestLv = -1;
    let result = false;
    marks.forEach((val) => {
      if (val.level < highestLv)
        return;
      if (val.level > highestLv) {
        highestLv = val.level;
        result = val.walkable;
        return;
      }
      if (!val.walkable) {
        result = false;
      }
    });
    this.setWalkableMap(x, y, result);
  }
  setWalkableMap(x, y, walkable) {
    if (y < 0 || y >= this.mWalkableMap.length || x < 0 || x >= this.mWalkableMap[y].length) {
      return;
    }
    const newVal = walkable ? 1 : 0;
    if (this.mWalkableMap[y][x] === newVal)
      return;
    this.mWalkableMap[y][x] = newVal;
    this.mAstar.setWalkableAt(x, y, walkable);
  }
  setTerrainMap(x, y, walkable) {
    if (y < 0 || y >= this.mTerrainMap.length || x < 0 || x >= this.mTerrainMap[y].length) {
      return;
    }
    const newVal = walkable ? 1 : 0;
    if (this.mTerrainMap[y][x] === newVal)
      return;
    this.mTerrainMap[y][x] = newVal;
  }
  mapPos2Idx(x, y) {
    return x + y * this.mMiniSize.cols;
  }
  setState(state) {
    if (!this.mStateManager)
      this.mStateManager = new RoomStateManager(this);
    this.mStateManager.setState(state);
  }
  showDecorateGrid() {
    if (!this.isDecorating)
      return;
    if (!this.mTerrainManager.hasAddComplete)
      return;
    this.game.renderPeer.showEditGrids(this.mMiniSize, this.mTerrainMap);
  }
}
