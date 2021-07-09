var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
import { EventDispatcher } from "structure";
export class BaseDataControlManager {
  constructor(game) {
    __publicField(this, "mGame");
    __publicField(this, "mEvent");
    __publicField(this, "mPackMap");
    __publicField(this, "mDataMap");
    this.mGame = game;
    this.mEvent = new EventDispatcher();
    this.initPackMap();
    this.initDataMap();
  }
  initPackMap() {
  }
  initDataMap() {
  }
  get emitter() {
    return this.mEvent;
  }
  init() {
  }
  addPackListener() {
    this.mPackMap.forEach((value) => {
      value.addPackListener();
    });
  }
  removePackListener() {
    this.mPackMap.forEach((value) => {
      value.removePackListener();
    });
  }
  emit(type, data, dataType) {
    const mEvent = this.getEvent(dataType);
    mEvent.emit(type, data);
  }
  on(event, fn, context, dataType) {
    const mEvent = this.getEvent(dataType);
    mEvent.on(event, context, fn);
  }
  off(event, fn, context, dataType) {
    const mEvent = this.getEvent(dataType);
    mEvent.off(event, context, fn);
  }
  clear() {
    this.removePackListener();
    this.mEvent.offAll();
    this.mPackMap.forEach((value) => {
      value.clear();
    });
    this.mDataMap.forEach((value) => {
      value.clear();
    });
  }
  destroy() {
    this.removePackListener();
    this.mEvent.destroy();
    this.mPackMap.forEach((value) => {
      value.destroy();
    });
    this.mDataMap.forEach((value) => {
      value.destroy();
    });
  }
  getDataMgr(type) {
    let data;
    if (this.mPackMap.has(type)) {
      data = this.mPackMap.get(type);
    } else if (this.mDataMap.has(type)) {
      data = this.mDataMap.get(type);
    }
    if (data)
      return data;
    return null;
  }
  getEvent(dataType) {
    const mEvent = !dataType ? this.mEvent : this.getDataMgr(dataType).Event;
    return mEvent;
  }
}
export var DataMgrType;
(function(DataMgrType2) {
  DataMgrType2[DataMgrType2["None"] = 0] = "None";
  DataMgrType2[DataMgrType2["BaseMgr"] = 1] = "BaseMgr";
  DataMgrType2[DataMgrType2["CacheMgr"] = 2] = "CacheMgr";
  DataMgrType2[DataMgrType2["EleMgr"] = 3] = "EleMgr";
  DataMgrType2[DataMgrType2["SceneMgr"] = 4] = "SceneMgr";
  DataMgrType2[DataMgrType2["CommonMgr"] = 5] = "CommonMgr";
  DataMgrType2[DataMgrType2["ChatMgr"] = 6] = "ChatMgr";
})(DataMgrType || (DataMgrType = {}));
