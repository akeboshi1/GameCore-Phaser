var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
import { PacketHandler, PBpacket } from "net-socket-packet";
import { op_client, op_def, op_virtual_world } from "pixelpai_proto";
import { Logger, LogicPos, MessageType } from "structure";
import { Element } from "./element";
import { Sprite } from "baseGame";
const NodeType = op_def.NodeType;
import { InputEnable } from "./input.enable";
const _ElementManager = class extends PacketHandler {
  constructor(mRoom) {
    super();
    this.mRoom = mRoom;
    __publicField(this, "hasAddComplete", false);
    __publicField(this, "mElements", new Map());
    __publicField(this, "mCacheAddList", []);
    __publicField(this, "mCacheSyncList", []);
    __publicField(this, "mCacheDisplayRef", new Map());
    __publicField(this, "mAddCache", []);
    __publicField(this, "mCacheRemoveList", []);
    __publicField(this, "mDealAddList", []);
    __publicField(this, "mRequestSyncIdList", []);
    __publicField(this, "mDealSyncMap", new Map());
    __publicField(this, "mGameConfig");
    __publicField(this, "mLoadLen", 0);
    __publicField(this, "mCurIndex", 0);
    if (this.mRoom && this.mRoom.game) {
      this.mGameConfig = this.mRoom.game.elementStorage;
    }
    this.addListen();
    this.mRoom.onManagerCreated(this.constructor.name);
  }
  addListen() {
    if (this.connection) {
      this.connection.addPacketListener(this);
      this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_ADD_SPRITE, this.onAdd);
      this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_ADD_SPRITE_END, this.addComplete);
      this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_DELETE_SPRITE, this.onRemove);
      this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_MOVE_SPRITE, this.onMove);
      this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_ADJUST_POSITION, this.onAdjust);
      this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_SYNC_SPRITE, this.onSync);
      this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_HOT_BLOCK_SYNC_SPRITE, this.onBlockSyncSprite);
      this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_HOT_BLOCK_DELETE_SPRITE, this.onBlockDeleteSprite);
      this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_HOT_BLOCK_SYNC_SPRITE_END, this.onBlockSpriteEnd);
      this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_ONLY_BUBBLE, this.onShowBubble);
      this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_ONLY_BUBBLE_CLEAN, this.onClearBubbleHandler);
      this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_CHANGE_SPRITE_ANIMATION, this.onChangeAnimation);
      this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_SET_SPRITE_POSITION, this.onSetPosition);
      this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_TRIGGER_MOVE_SPRITE, this.onTiggerMove);
    }
  }
  removeListen() {
    if (this.connection) {
      Logger.getInstance().debug("elementmanager ---- removepacklistener");
      this.connection.removePacketListener(this);
    }
  }
  init() {
  }
  has(id) {
    return this.mElements.has(id);
  }
  get(id) {
    const element = this.mElements.get(id);
    if (!element) {
      return;
    }
    return element;
  }
  remove(id) {
    const element = this.mElements.get(id);
    if (element) {
      this.mElements.delete(id);
      element.destroy();
      element.removeFromWalkableMap();
    }
    return element;
  }
  getElements() {
    return Array.from(this.mElements.values());
  }
  add(sprites, addMap) {
    for (const sprite of sprites) {
      this._add(sprite, addMap);
    }
  }
  addDisplayRef(displays) {
    for (const display of displays) {
      if (!this.get(display.id))
        this.mCacheDisplayRef.set(display.id, display);
    }
    this.dealSyncList();
  }
  setState(state) {
    const ele = this.get(state.owner.id);
    if (ele)
      ele.setState(state);
  }
  destroy() {
    this.hasAddComplete = false;
    this.removeListen();
    if (this.mElements) {
      this.mElements.forEach((element) => this.remove(element.id));
      this.mElements.clear();
    }
    if (this.mDealAddList)
      this.mDealAddList.length = 0;
    if (this.mRequestSyncIdList)
      this.mRequestSyncIdList.length = 0;
    if (this.mDealSyncMap)
      this.mDealSyncMap.clear();
    if (this.mCacheAddList) {
      this.mCacheAddList.length = 0;
      this.mCacheAddList = [];
    }
    if (this.mCacheSyncList) {
      this.mCacheSyncList.length = 0;
      this.mCacheSyncList = [];
    }
    this.mCurIndex = 0;
    this.mLoadLen = 0;
  }
  update(time, delta) {
    if (!this.hasAddComplete)
      return;
    if (this.mCacheAddList && this.mCacheAddList.length < 1 && this.mCacheSyncList && this.mCacheSyncList.length < 1 && this.mDealAddList && this.mDealAddList.length < 1) {
      if (this.roomService.game.emitter)
        this.roomService.game.emitter.emit(_ElementManager.ELEMENT_READY);
    }
    this.mElements.forEach((ele) => ele.update(time, delta));
    if (this.mCacheRemoveList.length > 0)
      this.dealRemoveList(this.mCacheRemoveList);
  }
  elementLoadCallBack(id) {
    let loadAll = true;
    for (let i = 0, len = this.mDealAddList.length; i < len; i++) {
      const ele = this.mDealAddList[i];
      if (ele.id === id) {
        ele.state = true;
      }
      if (!ele.state) {
        loadAll = false;
      }
    }
    if (!loadAll)
      return;
    this.mDealAddList.length = 0;
    this.mDealAddList = [];
    if (this.mCacheSyncList.length < 1) {
      this.dealAddList();
    } else {
      this.dealSyncList();
    }
  }
  dealAddList(spliceBoo = false) {
    const len = 30;
    let point;
    let sprite = null;
    const ids = [];
    const eles = [];
    const tmpLen = !spliceBoo ? this.mCacheAddList.length > len ? len : this.mCacheAddList.length : this.mDealAddList.length;
    const tmpList = !spliceBoo ? this.mCacheAddList.splice(0, tmpLen) : this.mDealAddList.length > 0 ? this.mDealAddList : this.mRequestSyncIdList.splice(0, tmpLen);
    for (let i = 0; i < tmpLen; i++) {
      const obj = tmpList[i];
      if (!obj)
        continue;
      point = obj.point3f;
      if (point) {
        if (this.mCacheDisplayRef.has(obj.id)) {
          this.mCacheDisplayRef.delete(obj.id);
        }
        sprite = new Sprite(obj, 3);
        if (!this.checkDisplay(sprite)) {
          ids.push(sprite.id);
        } else {
          obj.state = true;
          if (this.mDealAddList.indexOf(obj) === -1) {
            this.mDealAddList.push(obj);
          }
        }
        const ele = this._add(sprite);
        eles.push(ele);
      }
    }
    this.fetchDisplay(ids);
  }
  elementDisplaySyncReady(id) {
    this.mDealSyncMap.set(id, true);
    let syncAll = true;
    this.mDealSyncMap.forEach((val, key) => {
      if (!val) {
        syncAll = false;
        return;
      }
    });
    if (!syncAll)
      return;
    this.mDealSyncMap.clear();
    this.dealSyncList();
  }
  dealSyncList() {
    const len = 30;
    if (this.mCacheSyncList && this.mCacheSyncList.length > 0) {
      let element = null;
      const tmpLen = this.mCacheSyncList.length > len ? len : this.mCacheSyncList.length;
      const tmpList = this.mCacheSyncList.splice(0, tmpLen);
      const ele = [];
      for (let i = 0; i < tmpLen; i++) {
        const sprite = tmpList[i];
        if (!sprite)
          continue;
        if (this.mRequestSyncIdList.length > 0 && this.mRequestSyncIdList.indexOf(sprite.id) === -1) {
          continue;
        }
        const data = new Sprite(sprite, 3);
        if (data.displayInfo)
          this.mRoom.game.elementStorage.add(data.displayInfo);
        element = this.get(sprite.id);
        if (element) {
          this.mDealSyncMap.set(sprite.id, false);
          const command = sprite.command;
          if (command === op_def.OpCommand.OP_COMMAND_UPDATE) {
            element.model = data;
          } else if (command === op_def.OpCommand.OP_COMMAND_PATCH) {
            element.updateModel(sprite);
          }
          ele.push(element);
        } else {
          this.mDealAddList.push(sprite);
        }
      }
      this.dealAddList(true);
    }
  }
  dealDisplayRef() {
    this.mCacheDisplayRef.forEach((ref) => {
      const { id, pos, name, layer, direction, mountSprites } = ref;
      this.addSpritesToCache([{
        id,
        point3f: pos,
        nickname: name,
        direction,
        layer,
        mountSprites
      }]);
    });
    this.mCacheDisplayRef.clear();
  }
  onDisplayReady(id) {
    const element = this.mElements.get(id);
    if (!element)
      return;
    element.state = true;
    if (this.mRoom.isDecorating && this.mRoom.game.emitter) {
      this.mRoom.game.emitter.emit(MessageType.DECORATE_ELEMENT_CREATED, id);
    }
    this.elementLoadCallBack(id);
    if (!this.hasAddComplete || this.mCacheAddList && this.mCacheAddList.length > 0)
      return;
    const notReadyElements = [];
    this.mElements.forEach((ele, key) => {
      if (ele.state === false) {
        notReadyElements.push(ele);
      }
    });
    if (this.mLoadLen > 0) {
      this.mRoom.game.renderPeer.updateProgress(this.mCurIndex++ / this.mLoadLen);
    }
    if (notReadyElements.length < 1) {
      Logger.getInstance().debug("#loading onManagerReady ", this.constructor.name);
      this.mRoom.onManagerReady(this.constructor.name);
      if (this.mRequestSyncIdList && this.mRequestSyncIdList.length > 0) {
        this.fetchDisplay(this.mRequestSyncIdList);
        this.mRequestSyncIdList.length = 0;
        this.mRequestSyncIdList = [];
      }
      for (const cacheId of this.mAddCache) {
        const ele = this.mElements.get(cacheId);
        if (ele) {
          ele.asociate();
        }
      }
      this.mAddCache = [];
    }
  }
  showReferenceArea() {
    this.mElements.forEach((ele) => {
      ele.showRefernceArea();
    });
  }
  hideReferenceArea() {
    this.mElements.forEach((ele) => {
      ele.hideRefernceArea();
    });
  }
  addSpritesToCache(objs) {
    for (const obj of objs) {
      if (this.get(obj.id)) {
        continue;
      }
      this.mAddCache.push(obj.id);
      const sprite = new Sprite(obj, 3);
      if (this.checkDisplay(sprite)) {
        this.mCacheAddList.push(obj);
      } else {
        this.mRequestSyncIdList.push(obj.id);
      }
    }
  }
  get connection() {
    if (this.mRoom) {
      return this.mRoom.game.connection;
    }
    Logger.getInstance().error("roomManager is undefined");
    return;
  }
  onAdjust(packet) {
    const content = packet.content;
    const sprites = content.spritePositions;
    const type = content.nodeType;
    if (type !== NodeType.ElementNodeType) {
      return;
    }
    let ele;
    let point;
    for (const sprite of sprites) {
      ele = this.mElements.get(sprite.id);
      if (!ele) {
        continue;
      }
      point = sprite.point3f;
      ele.setPosition(new LogicPos(point.x || 0, point.y || 0, point.z || 0));
    }
  }
  onAdd(packet) {
    if (!this.mGameConfig) {
      Logger.getInstance().error("gameConfig does not exist");
      return;
    }
    const content = packet.content;
    const objs = content.sprites;
    if (!objs)
      return;
    const type = content.nodeType;
    if (type !== NodeType.ElementNodeType) {
      return;
    }
    this.addSpritesToCache(objs);
  }
  _add(sprite, addMap = false) {
    if (addMap === void 0)
      addMap = true;
    let ele = this.mElements.get(sprite.id);
    if (ele) {
      ele.model = sprite;
    } else {
      ele = new Element(sprite, this);
      ele.setInputEnable(InputEnable.Interactive);
    }
    if (addMap)
      ele.addToWalkableMap();
    this.mElements.set(ele.id || 0, ele);
    return ele;
  }
  addComplete(packet) {
    this.hasAddComplete = true;
    this.mCurIndex = 0;
    this.mLoadLen = 0;
    if (this.mCacheAddList && this.mCacheAddList.length > 0) {
      this.mLoadLen = this.mCacheAddList.length;
      this.mRoom.game.renderPeer.updateProgress(this.mCurIndex / this.mLoadLen);
      this.dealAddList();
    } else {
      this.dealSyncList();
    }
    if (!this.mCacheAddList || this.mCacheAddList.length === 0) {
      this.mRoom.onManagerReady(this.constructor.name);
      if (this.mRequestSyncIdList && this.mRequestSyncIdList.length > 0) {
        this.fetchDisplay(this.mRequestSyncIdList);
        this.mRequestSyncIdList.length = 0;
        this.mRequestSyncIdList = [];
      }
    }
  }
  checkDisplay(sprite) {
    if (!sprite.displayInfo) {
      const elementRef = this.roomService.game.elementStorage.getElementRef(sprite.bindID || sprite.id);
      if (elementRef) {
        if (!sprite.nickname)
          sprite.nickname = elementRef.name;
        const displayInfo = elementRef.displayModel;
        if (displayInfo) {
          sprite.setDisplayInfo(displayInfo);
          return displayInfo;
        }
      }
    }
    return sprite.displayInfo;
  }
  fetchDisplay(ids) {
    if (ids.length < 1)
      return;
    const packet = new PBpacket(op_virtual_world.OPCODE._OP_REQ_VIRTUAL_WORLD_QUERY_SPRITE_RESOURCE);
    const content = packet.content;
    content.ids = ids;
    this.connection.send(packet);
  }
  get roomService() {
    return this.mRoom;
  }
  onSetPosition(packet) {
    const content = packet.content;
    const type = content.nodeType;
    const id = content.id;
    if (type !== NodeType.ElementNodeType && type !== NodeType.CharacterNodeType) {
      return;
    }
    const ele = this.get(id);
    if (ele)
      ele.setPosition(new LogicPos(content.position.x, content.position.y, content.position.z));
  }
  onRemove(packet) {
    const content = packet.content;
    const type = content.nodeType;
    const ids = content.ids;
    if (type !== NodeType.ElementNodeType) {
      return;
    }
    this.dealRemoveList(ids);
  }
  dealRemoveList(list) {
    const tmpList = [];
    for (const id of list) {
      const ele = this.get(id);
      if (!ele)
        continue;
      if (!ele.state) {
        tmpList.push(ele);
        continue;
      }
      this.remove(id);
    }
    this.mCacheRemoveList = tmpList;
  }
  onSync(packet) {
    const content = packet.content;
    if (content.nodeType !== NodeType.ElementNodeType) {
      return;
    }
    const command = content.command;
    const sprites = content.sprites;
    for (const sprite of sprites) {
      sprite.command = command;
      this.mCacheSyncList.push(sprite);
    }
    this.dealSyncList();
  }
  onMove(packet) {
    const content = packet.content;
    if (content.movePath) {
      const moveDataList = content.movePath;
      const len = moveDataList.length;
      let moveData;
      let elementID;
      let element;
      for (let i = 0; i < len; i++) {
        moveData = moveDataList[i];
        elementID = moveData.id;
        element = this.get(elementID);
        if (!element) {
          continue;
        }
        element.move(moveData.movePos);
      }
    }
  }
  onTiggerMove(packet) {
    const content = packet.content;
    const id = content.id;
    const veloctiy = content.velocity;
    const len = content.length;
    this.mRoom.playerManager.actor.stopBoxMove = true;
    const ele = this.get(id);
    if (ele) {
      const pos = ele.moveBasePos();
      if (pos)
        ele.moveMotion(veloctiy.x * 400 + pos.x, veloctiy.y * 400 + pos.y);
    }
  }
  onShowBubble(packet) {
    const content = packet.content;
    const element = this.get(content.receiverid);
    if (element) {
      element.showBubble(content.context, content.chatsetting);
    }
  }
  onClearBubbleHandler(packet) {
    const content = packet.content;
    const element = this.get(content.receiverid);
    if (element) {
      element.clearBubble();
    }
  }
  onChangeAnimation(packet) {
    const content = packet.content;
    if (content.nodeType !== NodeType.ElementNodeType) {
      return;
    }
    let ele = null;
    const ids = content.ids;
    for (const id of ids) {
      ele = this.get(id);
      if (ele) {
        ele.setQueue(content.changeAnimation);
      }
    }
  }
  onBlockSyncSprite(packet) {
    const content = packet.content;
    if (content.nodeType !== op_def.NodeType.ElementNodeType) {
      return;
    }
    const sprites = content.sprites;
    const add = [];
    for (const sprite of sprites) {
      if (this.get(sprite.id)) {
        sprite.command = content.command;
        this.mCacheSyncList.push(sprite);
        continue;
      }
      if (this.mCacheDisplayRef.has(sprite.id)) {
        this.mCacheDisplayRef.delete(sprite.id);
      }
      add.push(sprite);
    }
    if (add.length > 0)
      this.addSpritesToCache(add);
    if (this.mCacheSyncList.length > 0)
      this.dealSyncList();
  }
  onBlockDeleteSprite(packet) {
    const content = packet.content;
    if (content.nodeType !== op_def.NodeType.ElementNodeType) {
      return;
    }
    const ids = content.spriteIds;
    for (const id of ids) {
      if (this.mCacheDisplayRef.has(id))
        this.mCacheDisplayRef.delete(id);
      if (this.get(id))
        this.remove(id);
    }
  }
  onBlockSpriteEnd(packet) {
    this.dealDisplayRef();
    this.addComplete(packet);
    this.mRoom.onManagerReady(this.constructor.name);
  }
};
export let ElementManager = _ElementManager;
__publicField(ElementManager, "ELEMENT_READY", "ELEMENT_READY");
