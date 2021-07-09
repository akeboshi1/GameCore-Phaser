var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
import { BaseLayer } from "./base.layer";
export class GroundLayer extends BaseLayer {
  constructor() {
    super(...arguments);
    __publicField(this, "mSortDirty", false);
  }
  add(child) {
    super.add(child);
    this.mSortDirty = true;
    return this;
  }
  sortLayer() {
    if (!this.mSortDirty) {
      return;
    }
    this.mSortDirty = false;
    this.sort("depth", (displayA, displayB) => {
      return displayA.y + displayA.z > displayB.y + displayB.z;
    });
  }
}
