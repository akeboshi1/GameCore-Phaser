var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
import { LayerEnum } from "game-capsule";
export class LayerName {
}
__publicField(LayerName, "GROUNDCLICK", "groundClickLayer");
__publicField(LayerName, "GROUND2", "groundLayer2");
__publicField(LayerName, "GROUND", LayerEnum.Terrain.toString());
__publicField(LayerName, "MIDDLE", "middleLayer");
__publicField(LayerName, "FLOOR", LayerEnum.Floor.toString());
__publicField(LayerName, "SURFACE", LayerEnum.Surface.toString());
__publicField(LayerName, "DECORATE", "decorateLayer");
__publicField(LayerName, "WALL", LayerEnum.Wall.toString());
__publicField(LayerName, "HANGING", LayerEnum.Hanging.toString());
__publicField(LayerName, "ATMOSPHERE", "atmosphere");
__publicField(LayerName, "SCENEUI", "sceneUILayer");
