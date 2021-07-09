var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
import { Logger } from "structure";
export class LayerManager {
  constructor() {
    __publicField(this, "mDepthSurface");
    __publicField(this, "layers");
    __publicField(this, "delta", 0);
    this.layers = new Map();
  }
  setScale(zoom) {
    this.layers.forEach((val) => {
      val.setScale(zoom);
    });
  }
  addLayer(scene, layerClass, name, depth) {
    if (this.layers.get(name)) {
      Logger.getInstance().warn("repeated layer name: ", name);
      return;
    }
    const layer = new layerClass(scene, name, depth);
    this.layers.set(name, layer);
    scene.sys.displayList.add(layer);
    return layer;
  }
  addToLayer(layerName, obj, index = -1) {
    const layer = this.layers.get(layerName);
    if (!layer)
      return;
    if (index === -1 || index === void 0) {
      layer.add(obj);
    } else {
      layer.addAt(obj, index);
    }
  }
  destroy() {
    this.layers.forEach((layer) => {
      layer.destroy();
    });
    this.layers = null;
  }
  getLayer(name) {
    if (!this.layers.get(name)) {
      return null;
    }
    return this.layers.get(name);
  }
  update(time, delta) {
    if (time - this.delta < 200) {
      return;
    }
    this.delta = time;
    this.layers.forEach((val) => {
      val.sortLayer();
    });
  }
  set depthSurfaceDirty(val) {
    this.mDepthSurface = val;
  }
}
