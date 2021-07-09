var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
import { Logger } from "structure";
export class DynamicImage extends Phaser.GameObjects.Image {
  constructor(scene, x, y, key, frame) {
    super(scene, x, y, key, frame);
    __publicField(this, "mLoadCompleteCallbak");
    __publicField(this, "mLoadContext");
    __publicField(this, "mLoadErrorCallback");
    __publicField(this, "mUrl");
  }
  load(value, loadContext, completeCallBack, errorCallBack) {
    if (!value)
      return Logger.getInstance().error("load value is undefined");
    this.mLoadCompleteCallbak = completeCallBack;
    this.mLoadErrorCallback = errorCallBack;
    this.mLoadContext = loadContext;
    if (!this.scene) {
      Logger.getInstance().fatal(`${DynamicImage.name} Create failed does not exist`);
      return;
    }
    this.mUrl = value;
    if (this.scene.textures.exists(value)) {
      this.onLoadComplete(value);
    } else {
      this.scene.load.image(value, value);
      this.scene.load.on(Phaser.Loader.Events.FILE_COMPLETE, this.onLoadComplete, this);
      this.scene.load.on(Phaser.Loader.Events.FILE_LOAD_ERROR, this.onLoadError, this);
      this.scene.load.start();
    }
  }
  destroy(fromScene = false) {
    this.mLoadCompleteCallbak = null;
    this.mLoadContext = null;
    this.mLoadErrorCallback = null;
    this.mUrl = "";
    if (this.scene) {
      this.scene.load.off(Phaser.Loader.Events.FILE_COMPLETE, this.onLoadComplete, this);
      this.scene.load.off(Phaser.Loader.Events.FILE_LOAD_ERROR, this.onLoadError, this);
    }
    super.destroy(fromScene);
  }
  onLoadComplete(file) {
    if (file === this.mUrl) {
      this.scene.load.off(Phaser.Loader.Events.FILE_COMPLETE, this.onLoadComplete, this);
      this.scene.load.off(Phaser.Loader.Events.FILE_LOAD_ERROR, this.onLoadError, this);
      this.setTexture(this.mUrl);
      if (this.mLoadCompleteCallbak) {
        const cb = this.mLoadCompleteCallbak;
        this.mLoadCompleteCallbak = null;
        cb.call(this.mLoadContext);
        this.mLoadContext = null;
      }
    }
  }
  onLoadError(file) {
    if (this.mUrl === file.url) {
      if (this.mLoadErrorCallback) {
        const cb = this.mLoadErrorCallback;
        this.mLoadErrorCallback = null;
        cb.call(this.mLoadContext);
        this.mLoadContext = null;
      }
    }
  }
}
