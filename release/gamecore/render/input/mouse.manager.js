var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
import { FramesDisplay } from "../display/frames/frames.display";
import { MessageType } from "structure";
import { NodeType } from "../managers/display.manager";
import { UiUtils } from "utils";
export var MouseEvent;
(function(MouseEvent2) {
  MouseEvent2[MouseEvent2["RightMouseDown"] = 1] = "RightMouseDown";
  MouseEvent2[MouseEvent2["RightMouseUp"] = 2] = "RightMouseUp";
  MouseEvent2[MouseEvent2["LeftMouseDown"] = 3] = "LeftMouseDown";
  MouseEvent2[MouseEvent2["LeftMouseUp"] = 4] = "LeftMouseUp";
  MouseEvent2[MouseEvent2["WheelDown"] = 5] = "WheelDown";
  MouseEvent2[MouseEvent2["WheelUp"] = 6] = "WheelUp";
  MouseEvent2[MouseEvent2["RightMouseHolding"] = 7] = "RightMouseHolding";
  MouseEvent2[MouseEvent2["LeftMouseHolding"] = 8] = "LeftMouseHolding";
  MouseEvent2[MouseEvent2["Tap"] = 9] = "Tap";
})(MouseEvent || (MouseEvent = {}));
export class MouseManager {
  constructor(render) {
    this.render = render;
    __publicField(this, "running", false);
    __publicField(this, "zoom");
    __publicField(this, "scene");
    __publicField(this, "mGameObject");
    __publicField(this, "mDownDelay", 1e3);
    __publicField(this, "mDownTime");
    __publicField(this, "delay", 500);
    __publicField(this, "debounce");
    __publicField(this, "mClickID");
    __publicField(this, "mClickDelay", 500);
    __publicField(this, "mClickTime", 0);
    this.zoom = this.render.scaleRatio || UiUtils.baseDpr;
  }
  get clickID() {
    return this.mClickID;
  }
  changeScene(scene) {
    this.pause();
    this.mGameObject = null;
    this.scene = scene;
    if (!this.scene)
      return;
    scene.input.on("gameobjectdown", this.onGameObjectDownHandler, this);
    scene.input.on("pointerdown", this.onPointerDownHandler, this);
    this.resume();
  }
  resize(width, height) {
    this.zoom = this.render.scaleRatio || UiUtils.baseDpr;
  }
  pause() {
    this.running = false;
  }
  resume() {
    this.running = true;
  }
  onUpdate(pointer, gameobject) {
    const now = Date.now();
    this.mClickTime = now;
    if (this.running === false || pointer === void 0) {
      return;
    }
    const events = [];
    if (pointer.leftButtonDown()) {
      events.push(3);
    } else if (pointer.leftButtonReleased()) {
      events.push(4);
    }
    if (pointer.middleButtonDown()) {
      events.push(5);
    } else if (pointer.middleButtonReleased()) {
      events.push(6);
    }
    if (pointer.rightButtonDown()) {
      events.push(1);
    } else if (pointer.rightButtonReleased()) {
      events.push(2);
    }
    let id = 0;
    let com = null;
    if (gameobject) {
      id = gameobject.getData("id");
      if (id) {
        com = this.render.displayManager.getDisplay(id);
      }
    }
    if (!pointer.isDown) {
      const diffX = Math.abs(pointer.downX - pointer.upX);
      const diffY = Math.abs(pointer.downY - pointer.upY);
      if (diffX > 10 || diffY > 10)
        return;
      if (!gameobject || !gameobject.parentContainer)
        return;
      if (!com || !(com instanceof FramesDisplay))
        return;
      if (com.nodeType !== NodeType.ElementNodeType)
        return;
      if (!com.hasInteractive)
        return;
      com.scaleTween();
    }
    if (events.length === 0)
      return;
    this.sendMouseEvent(events, id, { x: pointer.worldX / this.zoom, y: pointer.worldY / this.zoom });
  }
  set enable(value) {
    if (this.scene) {
      this.scene.input.mouse.enabled = value;
    }
  }
  get enable() {
    if (this.scene) {
      return this.scene.input.mouse.enabled;
    }
    return false;
  }
  destroy() {
    this.running = false;
    if (this.scene) {
      this.scene.input.off("gameobjectdown", this.onGameObjectDownHandler, this);
      this.scene.input.off("pointerdown", this.onPointerDownHandler, this);
      this.scene.input.off("pointerup", this.onPointerUp, this);
    }
    this.scene = null;
    this.debounce = null;
    this.mGameObject = null;
    this.pause();
  }
  onGameObjectDownHandler(pointer, gameObject) {
    const id = gameObject.getData("id");
    const display = this.render.displayManager.getDisplay(id);
    const soundKey = "sound/click.mp3";
    if (display.displayInfo && display.displayInfo.sound) {
    } else {
      this.render.soundManager.playSound({
        soundKey
      });
    }
    if (this.render.guideManager.canInteractive(id))
      return;
    this.mGameObject = gameObject;
    if (display.nodeType === NodeType.ElementNodeType)
      this.render.renderEmitter("FurnitureEvent", id);
    clearTimeout(this.mDownTime);
    this.mDownTime = setTimeout(this.holdHandler.bind(this), this.mDownDelay, pointer, gameObject);
  }
  checkClickTime() {
    const now = Date.now();
    if (now - this.mClickTime < this.mClickDelay) {
      return false;
    }
    this.mClickTime = now;
    return true;
  }
  onGameObjectUpHandler(pointer, gameObject) {
    this.onUpdate(pointer, gameObject);
  }
  onPointerDownHandler(pointer, gameobject) {
    if (!this.checkClickTime())
      return;
    if (this.render.guideManager.canInteractive())
      return;
    if (this.debounce) {
      this.mGameObject = null;
      return;
    }
    this.debounce = setTimeout(() => {
      this.debounce = null;
    }, this.delay);
    this.scene.input.off("pointerup", this.onPointerUp, this);
    this.scene.input.on("pointerup", this.onPointerUp, this);
    if (this.render) {
      if (this.render.emitter) {
        this.render.emitter.emit(MessageType.SCENE_BACKGROUND_CLICK, pointer);
      }
    }
    this.onUpdate(pointer, this.mGameObject);
  }
  onPointerUp(pointer) {
    clearTimeout(this.mDownTime);
    this.onUpdate(pointer, this.mGameObject);
    this.mGameObject = null;
  }
  holdHandler(pointer, gameobject) {
    clearTimeout(this.mDownTime);
    if (Math.abs(pointer.downX - pointer.x) > 5 * this.zoom || Math.abs(pointer.downY - pointer.y) > 5 * this.zoom) {
      return;
    }
    let id = 0;
    let com = null;
    if (gameobject && gameobject.parentContainer) {
      id = gameobject.parentContainer.getData("id");
      com = gameobject.parentContainer.parentContainer || gameobject.parentContainer;
      this.sendMouseEvent([8], id, {
        x: pointer.worldX / this.zoom,
        y: pointer.worldY / this.zoom
      });
    }
  }
  sendMouseEvent(mouseEvent, id, point3f) {
    this.mClickID = id;
    this.render.mainPeer.sendMouseEvent(id, mouseEvent, point3f);
  }
}
