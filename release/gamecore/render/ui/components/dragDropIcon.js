var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
import { DynamicImage } from "baseRender";
export class DragDropIcon extends Phaser.GameObjects.Container {
  constructor(mScene, render, x, y, texture) {
    super(mScene, x, y);
    this.mScene = mScene;
    this.render = render;
    __publicField(this, "mDropType");
    __publicField(this, "mDragType");
    __publicField(this, "mIcon");
    __publicField(this, "mUrl");
    __publicField(this, "mCallBack");
    this.mIcon = new DynamicImage(this.mScene, 0, 0);
    this.add(this.mIcon);
  }
  load(value, thisArg, onLoadComplete) {
    this.mUrl = value;
    const key = this.resKey;
    this.mIcon.load(this.render.url.getOsdRes(this.mUrl), () => {
      if (this.mCallBack)
        this.mCallBack();
    });
    this.mCallBack = onLoadComplete;
  }
  dragStart() {
  }
  dragStop(acceptDrag) {
  }
  dragDrop(dragable) {
  }
  dragOver(dragable) {
  }
  getDragData() {
  }
  getDropData() {
  }
  getDragImage() {
    return this.mIcon;
  }
  getVisualDisplay() {
    return void 0;
  }
  getBound() {
    const bound = this.getBounds();
    return new Phaser.Geom.Rectangle(bound.x, bound.y, bound.width, bound.height);
  }
  get resKey() {
    if (this.mUrl === void 0)
      return "";
    const key = this.render.url.getOsdRes(this.mUrl);
    return key;
  }
  destroy() {
    this.mCallBack = null;
    super.destroy(true);
  }
  get icon() {
    return this.mIcon;
  }
  setDragType(value) {
    this.mDragType = value;
  }
  setDropType(value) {
    this.mDropType = value;
  }
  getDropType() {
    return this.mDropType;
  }
  getDragType() {
    return this.mDragType;
  }
}
