var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
import { NineSlicePatch } from "apowophaserui";
export class DynamicNinepatch {
  constructor(mScene, mParent) {
    this.mScene = mScene;
    this.mParent = mParent;
    __publicField(this, "mUrl");
    __publicField(this, "mLoadCompleteCallBack");
    __publicField(this, "mLoadContext");
    __publicField(this, "mImage");
    __publicField(this, "mConfig");
  }
  load(value, config, completeCallBack, loadContext) {
    this.mLoadCompleteCallBack = completeCallBack;
    this.mLoadContext = loadContext;
    this.mConfig = config;
    this.mUrl = value;
    if (this.mScene.cache.obj.get(value)) {
      this.onLoadCompleteHandler();
    } else {
      this.mScene.load.image(this.mUrl, this.mUrl);
      this.mScene.load.once(Phaser.Loader.Events.COMPLETE, this.onLoadCompleteHandler, this);
      this.mScene.load.start();
    }
  }
  onLoadCompleteHandler() {
    this.mImage = new NineSlicePatch(this.mScene, 0, 0, this.mConfig.width, this.mConfig.height, this.mConfig.key, void 0, this.mConfig.config, this.mConfig.scale);
    if (this.mLoadCompleteCallBack) {
      this.mLoadCompleteCallBack.call(this.mLoadContext, this.mImage);
      this.mLoadCompleteCallBack = null;
      this.mLoadContext = null;
    }
  }
  get image() {
    return this.mImage;
  }
}
