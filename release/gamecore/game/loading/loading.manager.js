var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
export class LoadingManager {
  constructor(game) {
    __publicField(this, "mGame");
    __publicField(this, "mResources");
    __publicField(this, "mLoading");
    this.mGame = game;
    this.mResources = [];
  }
  start(state, data) {
    return new Promise((resolve, reject) => {
      this.mGame.peer.render.showLoading({ "dpr": this.mGame.getGameConfig().scale_ratio, state, data }).then(() => {
        resolve(null);
      });
    });
  }
  sceneCallback() {
    if (this.mResources.length > 0) {
      return this.addAssets(this.mResources);
    }
  }
  addAssets(assets) {
    if (!assets) {
      return;
    }
    for (const asset of assets) {
      this.loadAsset(asset);
    }
    return this.startup();
  }
  startup() {
    for (const asset of this.mResources) {
      this.loadAsset(asset);
    }
    this.mLoading = true;
  }
  destroy() {
    if (this.mResources) {
      this.mResources = [];
    }
  }
  loadAsset(asset) {
    const type = this.getLoadType(asset.type);
  }
  get game() {
    if (!this.mGame) {
      return null;
    }
    return this.mGame;
  }
  getLoadType(fileType) {
    if (fileType === "mp3" || fileType === "wmv" || fileType === "ogg") {
      return "audio";
    }
    return fileType;
  }
}
