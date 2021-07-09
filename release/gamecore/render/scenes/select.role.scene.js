var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
import { BasicScene } from "baseRender";
import { SceneName } from "structure";
export class SelectRoleScene extends BasicScene {
  constructor() {
    super({ key: SceneName.SELECTROLE_SCENE });
    __publicField(this, "mWorld");
  }
  preload() {
  }
  init(data) {
    this.mWorld = data;
  }
  create() {
    super.create();
  }
  get key() {
    return this.sys.config.key;
  }
}
