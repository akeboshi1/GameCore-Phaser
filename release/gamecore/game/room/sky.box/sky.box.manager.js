var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
export class SkyBoxManager {
  constructor(room) {
    __publicField(this, "mRoom");
    __publicField(this, "mScenetys");
    __publicField(this, "mGame");
    this.mRoom = room;
    this.mGame = room.game;
    this.mScenetys = new Map();
  }
  add(scenery) {
    this.mScenetys.set(scenery.id, scenery);
    this.mGame.renderPeer.addSkybox(scenery);
  }
  update(scenery) {
  }
  remove(id) {
    const block = this.mScenetys.get(id);
    if (block) {
    }
  }
  resize(width, height) {
    if (!this.mScenetys) {
      return;
    }
    this.mScenetys.forEach((scenety) => {
    });
  }
  destroy() {
    this.mScenetys.forEach((scenery) => this.mGame.renderPeer.removeSkybox(scenery.id));
    this.mScenetys.clear();
  }
  get scenery() {
    return Array.from(this.mScenetys.values());
  }
}
