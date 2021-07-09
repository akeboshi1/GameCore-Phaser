var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
import { BasicScene } from "baseRender";
export class RoomScene extends BasicScene {
  constructor(config) {
    super(config);
    __publicField(this, "mRoomID");
  }
  init(data) {
    super.init(data);
    if (data) {
      this.mRoomID = data.roomid;
    }
  }
  create() {
    this.initListener();
    super.create();
  }
  initListener() {
    this.input.on("pointerdown", this.onPointerDownHandler, this);
    this.input.on("pointerup", this.onPointerUpHandler, this);
    this.input.on("gameout", this.onGameOutHandler, this);
  }
  onGameOutHandler() {
    this.input.off("pointerdown", this.onPointerDownHandler, this);
    this.input.off("pointerup", this.onPointerUpHandler, this);
    this.input.off("gameout", this.onGameOutHandler, this);
  }
  onPointerDownHandler(pointer, currentlyOver) {
  }
  onPointerUpHandler(pointer, currentlyOver) {
  }
}
