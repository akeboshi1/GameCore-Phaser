var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
export class DynamicSprite extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, void 0);
    __publicField(this, "mLoadCompleteCallbak");
    __publicField(this, "mLoadContext");
    __publicField(this, "mLoadErrorCallback");
    __publicField(this, "mUrl");
    scene.sys.updateList.add(this);
  }
  load(textureURL, atlasURL, loadContext, completeCallBack, errorCallBack) {
    this.mLoadCompleteCallbak = completeCallBack;
    this.mLoadErrorCallback = errorCallBack;
    this.mLoadContext = loadContext;
    this.mUrl = textureURL + atlasURL;
    if (this.scene.cache.obj.get(this.mUrl)) {
      this.onLoadComplete();
    } else {
      this.scene.load.atlas(this.mUrl, textureURL, atlasURL);
      this.scene.load.once(Phaser.Loader.Events.COMPLETE, this.onLoadComplete, this);
      this.scene.load.once(Phaser.Loader.Events.FILE_LOAD_ERROR, this.onLoadError, this);
      this.scene.load.start();
    }
  }
  destroy(fromScene) {
    this.scene.sys.updateList.remove(this);
    super.destroy(fromScene);
  }
  onLoadComplete() {
    if (this.mLoadCompleteCallbak) {
      const cb = this.mLoadCompleteCallbak;
      this.mLoadCompleteCallbak = null;
      cb.call(this.mLoadContext);
      this.mLoadContext = null;
    }
    this.scene.anims.create({
      key: this.mUrl,
      frames: this.scene.anims.generateFrameNames(this.mUrl),
      repeat: 1
    });
    this.play(this.mUrl);
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
