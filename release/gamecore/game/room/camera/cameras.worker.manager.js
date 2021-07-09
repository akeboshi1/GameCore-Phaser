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
import { PacketHandler, PBpacket } from "net-socket-packet";
import { op_editor, op_virtual_world } from "pixelpai_proto";
import { BlockIndex } from "utils";
import { Logger, LogicPos, LogicRectangle, LogicRectangle45 } from "structure";
import { BlockIndexManager } from "../block/block.index.manager";
export class CamerasManager extends PacketHandler {
  constructor(mGame, mRoomService) {
    super();
    this.mGame = mGame;
    this.mRoomService = mRoomService;
    __publicField(this, "syncDirty", false);
    __publicField(this, "m_blockWidth", 300);
    __publicField(this, "m_blockHeight", 150);
    __publicField(this, "MINI_VIEW_SIZE", 50);
    __publicField(this, "VIEW_PORT_SIZE", 50);
    __publicField(this, "viewPort", new LogicRectangle());
    __publicField(this, "miniViewPort", new LogicRectangle());
    __publicField(this, "zoom", 1);
    __publicField(this, "syncTime", 0);
    __publicField(this, "target");
    __publicField(this, "preCamerasList");
    __publicField(this, "mInitialize", false);
    __publicField(this, "mBlockManager");
    this.zoom = this.mGame.scaleRatio;
    this.mBlockManager = new BlockIndexManager(this.mRoomService);
  }
  set initialize(val) {
    this.mInitialize = val;
    this.syncDirty = true;
  }
  get initialize() {
    return this.mInitialize;
  }
  getViewPort() {
    return new Promise((resolve, reject) => {
      this.mGame.peer.render.getWorldView().then((obj) => {
        const worldView = obj;
        if (!worldView)
          return;
        const width = worldView.width / this.zoom;
        const height = worldView.height / this.zoom;
        this.viewPort.x = worldView.x / this.zoom - width * 0.5;
        this.viewPort.y = worldView.y / this.zoom - height * 0.5;
        this.viewPort.width = worldView.width / this.zoom + width;
        this.viewPort.height = worldView.height / this.zoom + height;
        resolve(this.viewPort);
      });
    });
  }
  getMiniViewPort() {
    return new Promise((resolve) => {
      this.mGame.peer.render.getWorldView().then((obj) => {
        const worldView = obj;
        this.miniViewPort.x = worldView.x / this.zoom + (worldView.width / this.zoom - this.miniViewPort.width >> 1);
        this.miniViewPort.y = worldView.y / this.zoom + (worldView.height / this.zoom - this.miniViewPort.height >> 1);
        const pos = this.mRoomService.transformTo45(new LogicPos(this.miniViewPort.x + (this.miniViewPort.width >> 1), this.miniViewPort.y));
        resolve(new LogicRectangle45(pos.x, pos.y, this.MINI_VIEW_SIZE, this.MINI_VIEW_SIZE));
      });
    });
  }
  syncToEditor() {
    const cameraView = this.mGame.peer.render.getWorldView();
    const pkt = new PBpacket(op_editor.OPCODE._OP_CLIENT_REQ_EDITOR_RESET_CAMERA);
    const content = pkt.content;
    content.x = cameraView.x;
    content.y = cameraView.y;
    content.width = cameraView.width;
    content.height = cameraView.height;
    this.connection.send(pkt);
  }
  centerCameas() {
  }
  syncCamera() {
    return __async(this, null, function* () {
      const cameraView = yield this.mGame.peer.render.getWorldView();
      const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_RESET_CAMERA_SIZE);
      const size = packet.content;
      size.width = cameraView.width / this.zoom;
      size.height = cameraView.height / this.zoom;
      this.connection.send(packet);
    });
  }
  syncCameraScroll() {
    return __async(this, null, function* () {
      if (!this.mInitialize)
        return;
      const cameraView = yield this.mGame.peer.render.getWorldView();
      if (!cameraView) {
        Logger.getInstance().error("no cameraView");
        return;
      }
      const width = cameraView.width / this.zoom;
      const height = cameraView.height / this.zoom;
      const x = cameraView.x / this.zoom;
      const y = cameraView.y / this.zoom;
      this.mBlockManager.checkBlockIndex({ x, y, width, height });
    });
  }
  feachAllElement() {
    const size = this.mGame.roomManager.currentRoom.roomSize;
    const tileWidth = size.tileWidth;
    const tileHeight = size.tileHeight;
    const blockWidth = this.m_blockWidth;
    const blockHeight = this.m_blockHeight;
    const cols = size.cols;
    const rows = size.rows;
    const widLen = Math.ceil(size.sceneWidth / blockWidth);
    const heiLen = Math.ceil(size.sceneHeight / blockHeight);
    const pointerList = [];
    const offset = rows * (tileWidth / 2);
    for (let i = 0; i < widLen + 1; i++) {
      for (let j = 0; j < heiLen + 1; j++) {
        pointerList.push({ x: i * blockWidth - offset, y: j * blockHeight, width: blockWidth, height: blockHeight });
      }
    }
    const blockIndex = new BlockIndex().getBlockIndexs(pointerList, size);
    const pkt = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_UPDATE_HOT_BLOCK);
    const content = pkt.content;
    content.blockIndex = blockIndex;
    this.connection.send(pkt);
  }
  resetCameraSize(width, height) {
    if (!this.connection) {
      Logger.getInstance().error("connection is undefined");
      return;
    }
    this.syncCamera();
  }
  update(time, delta) {
    if (!this.syncDirty || !this.mInitialize) {
      return;
    }
    this.syncTime += delta;
    if (this.syncTime > 1e3) {
      this.syncTime = 0;
      this.syncCameraScroll();
      this.syncDirty = false;
    }
  }
  destroy() {
    this.mInitialize = false;
    this.preCamerasList.length = 0;
    this.preCamerasList = null;
  }
  startFollow(target, effect) {
    this.target = target;
    this.mGame.renderPeer.cameraFollow(target, effect);
  }
  stopFollow() {
    this.target = void 0;
    this.mGame.renderPeer.stopFollow();
  }
  setCamerasScroll(x, y, effect) {
    this.mGame.renderPeer.setCamerasScroll(x, y, effect);
  }
  get connection() {
    if (!this.mRoomService) {
      Logger.getInstance().error("room service is undefined");
      return;
    }
    return this.mGame.connection;
  }
}
