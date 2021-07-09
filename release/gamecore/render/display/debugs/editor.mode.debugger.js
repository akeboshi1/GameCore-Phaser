var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
import { Logger } from "structure";
const _EditorModeDebugger = class {
  constructor(render) {
    this.render = render;
    __publicField(this, "isDebug", false);
    _EditorModeDebugger._instance = this;
  }
  static getInstance() {
    if (!_EditorModeDebugger._instance) {
      Logger.getInstance().error("SortDebugger not created");
    }
    return _EditorModeDebugger._instance;
  }
  getIsDebug() {
    return this.isDebug;
  }
  q() {
    if (this.isDebug) {
      this.render.mainPeer.elementsHideReferenceArea();
    }
    this.isDebug = false;
  }
  v() {
    if (!this.isDebug) {
      this.render.mainPeer.elementsShowReferenceArea();
    }
    this.isDebug = true;
  }
};
export let EditorModeDebugger = _EditorModeDebugger;
__publicField(EditorModeDebugger, "_instance");
