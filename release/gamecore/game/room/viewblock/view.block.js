var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
import { Intersects } from "structure";
export class Viewblock {
  constructor(mRect, index) {
    this.mRect = mRect;
    __publicField(this, "mElements", new Map());
    __publicField(this, "mInCamera");
    __publicField(this, "mIndex");
    this.mIndex = index;
  }
  add(element, miniViewPort) {
    this.mElements.set(element.id, element);
    return element.setRenderable(this.mInCamera);
  }
  remove(ele) {
    return this.mElements.delete(ele.id);
  }
  check(bound) {
    if (!bound)
      return;
    const newStat = Intersects.RectangleToRectangle(bound, this.rectangle);
    this.mElements.forEach((ele) => {
      ele.setRenderable(this.mInCamera, 0);
    });
    this.mInCamera = newStat;
  }
  getElement(id) {
    return this.mElements.get(id);
  }
  get rectangle() {
    return this.mRect || void 0;
  }
  get inCamera() {
    return this.mInCamera;
  }
}
