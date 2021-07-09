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
import { NodeType } from "../managers";
import { MainUIScene } from "../scenes/main.ui.scene";
import { SceneName, LogicPos } from "structure";
export class MotionManager {
  constructor(render) {
    this.render = render;
    __publicField(this, "enable");
    __publicField(this, "scene");
    __publicField(this, "uiScene");
    __publicField(this, "gameObject");
    __publicField(this, "scaleRatio");
    __publicField(this, "isHolding", false);
    __publicField(this, "holdTime");
    __publicField(this, "holdDelay", 200);
    __publicField(this, "curtime");
    __publicField(this, "isRunning", true);
    this.scaleRatio = render.scaleRatio;
  }
  addListener() {
    if (!this.scene) {
      return;
    }
    this.scene.input.on("pointerup", this.onPointerUpHandler, this);
    this.scene.input.on("pointerdown", this.onPointerDownHandler, this);
    this.scene.input.on("gameobjectdown", this.onGameObjectDownHandler, this);
    this.scene.input.on("gameobjectup", this.onGameObjectUpHandler, this);
    if (this.uiScene)
      this.uiScene.input.on("gameobjectdown", this.onUiGameObjectDownHandler, this);
  }
  removeListener() {
    if (!this.scene) {
      return;
    }
    this.scene.input.off("pointerup", this.onPointerUpHandler, this);
    this.scene.input.off("pointerdown", this.onPointerDownHandler, this);
    this.scene.input.off("pointermove", this.onPointerMoveHandler, this);
    this.scene.input.off("gameobjectdown", this.onGameObjectDownHandler, this);
    this.scene.input.off("gameobjectup", this.onGameObjectUpHandler, this);
    if (this.uiScene)
      this.uiScene.input.off("gameobjectdown", this.onUiGameObjectDownHandler, this);
  }
  resize(width, height) {
    this.scaleRatio = this.render.scaleRatio;
  }
  update(time, delta) {
    if (!this.isRunning)
      return;
    if (this.isHolding === false)
      return;
    this.curtime += delta;
    if (this.curtime < 200) {
      return;
    }
    this.curtime = 0;
    const pointer = this.scene.input.activePointer;
    if (pointer.camera) {
      if (pointer.camera.scene && pointer.camera.scene.sys.settings.key === MainUIScene.name) {
        this.isHolding = false;
        this.scene.input.off("pointermove", this.onPointerMoveHandler, this);
        this.clearGameObject();
        return;
      }
    }
    if (!pointer || !this.render.displayManager || !this.render.displayManager.user || !this.render.displayManager.user.visible)
      return;
    const position = this.getPreUserPos(pointer);
    this.start(position.x / this.scaleRatio, position.y / this.scaleRatio);
  }
  setScene(scene) {
    this.removeListener();
    this.scene = scene;
    if (!this.scene) {
      return;
    }
    this.uiScene = this.render.game.scene.getScene(SceneName.MAINUI_SCENE);
    this.addListener();
  }
  pauser() {
    this.isRunning = false;
    this.isHolding = false;
    this.clearGameObject();
  }
  resume() {
    this.isRunning = true;
  }
  destroy() {
    this.removeListener();
  }
  onGuideOnPointUpHandler(pointer, id) {
    return __async(this, null, function* () {
      this.scene.input.off("pointermove", this.onPointerMoveHandler, this);
      if (id) {
        if (id) {
          const ele = this.render.displayManager.getDisplay(id);
          if (ele.nodeType === NodeType.CharacterNodeType) {
            this.render.mainPeer.activePlayer(id);
            this.clearGameObject();
            return;
          }
          let targets = yield this.render.mainPeer.getInteractivePosition(id);
          if (!targets || targets.length === 0) {
            const { x, y } = ele;
            targets = [{ x, y }];
          }
          this.movePath(pointer.worldX / this.render.scaleRatio, pointer.worldY / this.render.scaleRatio, 0, targets, id);
        }
      } else {
        this.movePath(pointer.worldX / this.render.scaleRatio, pointer.worldY / this.render.scaleRatio, 0, [new LogicPos(pointer.worldX / this.scaleRatio, pointer.worldY / this.scaleRatio)]);
      }
      this.clearGameObject();
    });
  }
  onPointerDownHandler(pointer) {
    return __async(this, null, function* () {
      if (!this.isRunning)
        return;
      if (!this.render.guideManager || this.render.guideManager.canInteractive())
        return;
      this.scene.input.on("pointermove", this.onPointerMoveHandler, this);
      this.holdTime = setTimeout(() => {
        this.isHolding = true;
      }, this.holdDelay);
    });
  }
  onPointerUpHandler(pointer) {
    return __async(this, null, function* () {
      if (!this.isRunning)
        return;
      this.isHolding = false;
      this.scene.input.off("pointermove", this.onPointerMoveHandler, this);
      if (!this.render.guideManager || this.render.guideManager.canInteractive())
        return;
      if (Math.abs(pointer.downX - pointer.upX) >= 5 * this.render.scaleRatio && Math.abs(pointer.downY - pointer.upY) >= 5 * this.render.scaleRatio || pointer.upTime - pointer.downTime > this.holdDelay) {
        this.stop();
      } else {
        if (this.gameObject) {
          const id = this.gameObject.getData("id");
          if (id) {
            if (!this.render.guideManager || this.render.guideManager.canInteractive(id))
              return;
            yield this.getEleMovePath(id, pointer);
          }
        } else {
          this.movePath(pointer.worldX / this.render.scaleRatio, pointer.worldY / this.render.scaleRatio, 0, [new LogicPos(pointer.worldX / this.scaleRatio, pointer.worldY / this.scaleRatio)]);
        }
      }
      this.clearGameObject();
    });
  }
  getEleMovePath(id, pointer) {
    return __async(this, null, function* () {
      const ele = this.render.displayManager.getDisplay(id);
      if (!ele || !ele.hasInteractive) {
        this.movePath(pointer.worldX / this.render.scaleRatio, pointer.worldY / this.render.scaleRatio, 0, [new LogicPos(pointer.worldX / this.scaleRatio, pointer.worldY / this.scaleRatio)]);
        return;
      }
      if (ele.nodeType === NodeType.CharacterNodeType) {
        this.render.mainPeer.activePlayer(id);
        this.clearGameObject();
        return;
      }
      let targets = yield this.render.mainPeer.getInteractivePosition(this.getMountId(id));
      if (!targets || targets.length === 0) {
        const { x, y } = ele;
        targets = [{ x, y }];
      }
      this.movePath(pointer.worldX / this.render.scaleRatio, pointer.worldY / this.render.scaleRatio, 0, targets, id);
    });
  }
  onPointerMoveHandler(pointer) {
    return __async(this, null, function* () {
      if (!this.isRunning)
        return;
      this.isHolding = true;
    });
  }
  onUiGameObjectDownHandler(pointer) {
    if (!this.isRunning)
      return;
    if (!this.render.guideManager || this.render.guideManager.canInteractive())
      return;
    this.isHolding = false;
    this.scene.input.off("pointermove", this.onPointerMoveHandler, this);
    this.stop();
    clearTimeout(this.holdTime);
  }
  onGameObjectDownHandler(pointer, gameObject) {
    if (!this.isRunning)
      return;
    const id = gameObject ? gameObject.getData("id") : void 0;
    if (!this.render.guideManager || this.render.guideManager.canInteractive(id))
      return;
    this.gameObject = gameObject;
  }
  onGameObjectUpHandler(pointer, gameObject) {
    if (!this.isRunning)
      return;
    if (!this.render.guideManager || this.render.guideManager.canInteractive())
      return;
  }
  getMountId(id) {
    const ele = this.render.displayManager.getDisplay(id);
    if (!ele)
      return -1;
    if (ele.rootMount) {
      return this.getMountId(ele.rootMount.id);
    }
    return ele.id;
  }
  start(worldX, worldY, id) {
    this.render.mainPeer.moveMotion(worldX, worldY, id);
  }
  movePath(x, y, z, targets, id) {
    this.render.mainPeer.findPath(targets, id);
  }
  stop() {
    this.render.mainPeer.stopSelfMove();
  }
  getPreUserPos(pointer) {
    if (!this.scene || !this.scene.cameras || !this.scene.cameras.main)
      return null;
    const { x, y } = this.render.displayManager.user;
    const tmpX = pointer.worldX / this.scaleRatio - x;
    const tmpY = pointer.worldY / this.scaleRatio - y;
    return this.scene.cameras.main.getWorldPoint(pointer.x - tmpX, pointer.y - tmpY);
  }
  clearGameObject() {
    this.gameObject = null;
    clearTimeout(this.holdTime);
  }
}
