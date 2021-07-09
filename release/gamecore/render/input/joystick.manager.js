var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
import { PacketHandler } from "net-socket-packet";
export class JoystickManager extends PacketHandler {
  constructor(render) {
    super();
    this.render = render;
    __publicField(this, "scene");
    __publicField(this, "mJoystick");
    __publicField(this, "mScaleRatio");
    this.mScaleRatio = render.scaleRatio;
    this.mJoystick = this.render.mainPeer["JoystickManager"];
  }
  setScene(scene) {
    this.scene = scene;
    if (!scene) {
      return;
    }
    this.onListener();
  }
  onListener() {
    this.scene.input.on("pointerdown", this.onDownHandler, this);
    this.scene.input.on("pointerup", this.onUpHandler, this);
  }
  offListener() {
    this.scene.input.off("pointermove", this.onPointerMoveHandler, this);
    this.scene.input.off("pointerdown", this.onDownHandler, this);
    this.scene.input.off("pointerup", this.onUpHandler, this);
  }
  destroy() {
    this.offListener();
  }
  onPointerMoveHandler(pointer) {
    this.calcAngle(pointer);
  }
  onDownHandler(pointer) {
    this.scene.input.on("pointermove", this.onPointerMoveHandler, this);
    this.calcAngle(pointer);
    this.start();
  }
  onUpHandler(pointer) {
    this.scene.input.off("pointermove", this.onPointerMoveHandler, this);
    if (pointer.downX - pointer.upX > 10 * this.mScaleRatio || Math.abs(pointer.downY - pointer.upY) > 10 * this.mScaleRatio) {
      this.stop();
    }
  }
  calcAngle(pointer) {
    if (!this.mJoystick) {
      return;
    }
    this.mJoystick.calcAngle(Math.ceil(pointer.worldX / this.mScaleRatio), Math.ceil(pointer.worldY / this.mScaleRatio));
  }
  start() {
    if (!this.mJoystick) {
      return;
    }
    this.mJoystick.start();
  }
  stop() {
    if (!this.mJoystick) {
      return;
    }
    this.mJoystick.stop();
  }
}
