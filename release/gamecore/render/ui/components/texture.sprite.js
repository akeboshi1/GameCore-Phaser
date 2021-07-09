var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
import { Logger } from "structure";
export class TextureSprite extends Phaser.GameObjects.Container {
  constructor(scene, dpr, auto, timeFrame, times) {
    super(scene);
    __publicField(this, "compl");
    __publicField(this, "error");
    __publicField(this, "mUrls");
    __publicField(this, "loadUrls");
    __publicField(this, "errorUrls");
    __publicField(this, "dpr");
    __publicField(this, "auto");
    __publicField(this, "times");
    __publicField(this, "timeFrame");
    __publicField(this, "tempTimes");
    __publicField(this, "timerID");
    __publicField(this, "isPlaying", false);
    __publicField(this, "indexed", 0);
    __publicField(this, "frameImg");
    this.dpr = dpr;
    this.auto = auto || false;
    this.setAniData(times, timeFrame);
  }
  load(value, compl, error) {
    if (!this.scene) {
      Logger.getInstance().fatal(`Create failed does not exist`);
      return;
    }
    this.compl = compl;
    this.error = error;
    this.mUrls = value;
    this.loadUrls = [];
    this.errorUrls = [];
    for (const url of this.mUrls) {
      if (!this.scene.textures.exists(url)) {
        this.scene.load.image(url);
        this.loadUrls.push(url);
      }
    }
    if (this.loadUrls.length > 0) {
      this.scene.load.on(Phaser.Loader.Events.FILE_COMPLETE, this.onLoadComplete, this);
      this.scene.load.on(Phaser.Loader.Events.FILE_LOAD_ERROR, this.onLoadError, this);
      this.scene.load.start();
    } else {
      this.onLoadComplete();
    }
  }
  setAniData(times, timeFrame) {
    this.times = times || -1;
    this.timeFrame = timeFrame || 30;
    this.tempTimes = this.times;
  }
  play(force) {
    if (force) {
      if (this.timerID) {
        clearTimeout(this.timerID);
      }
      this.indexed = 0;
      this.tempTimes = this.times;
    } else if (this.isPlaying)
      return;
    const excute = () => {
      this.frameImg.setTexture(this.mUrls[this.indexed]);
      this.indexed++;
      if (this.indexed === this.mUrls.length) {
        this.indexed = 0;
        if (this.times > 0) {
          this.tempTimes--;
          if (this.tempTimes === 0) {
            this.playEnd();
            return;
          }
        }
      }
      this.timerID = setTimeout(() => {
        excute();
      }, this.timeFrame);
    };
    excute();
  }
  stop() {
    if (this.isPlaying) {
      clearTimeout(this.timerID);
      this.playEnd();
    }
  }
  destroy(fromScene = false) {
    this.compl = void 0;
    this.error = void 0;
    this.mUrls = void 0;
    this.loadUrls = void 0;
    this.errorUrls = void 0;
    if (this.scene) {
      this.scene.load.off(Phaser.Loader.Events.FILE_COMPLETE, this.onLoadComplete, this);
      this.scene.load.off(Phaser.Loader.Events.FILE_LOAD_ERROR, this.onLoadError, this);
    }
    super.destroy(fromScene);
  }
  get playing() {
    return this.isPlaying;
  }
  playEnd() {
    this.isPlaying = false;
    this.tempTimes = this.times;
    this.timerID = void 0;
    this.indexed = 0;
    this.frameImg.setTexture(this.mUrls[this.indexed]);
  }
  onLoadComplete(file) {
    const index = this.loadUrls.indexOf(file);
    if (index !== -1) {
      this.loadUrls.splice(index, 1);
      if (this.loadUrls.length === 0) {
        if (this.auto)
          this.play();
        if (this.compl) {
          this.compl.run();
          this.compl = void 0;
        }
        this.scene.load.off(Phaser.Loader.Events.FILE_COMPLETE, this.onLoadComplete, this);
        this.scene.load.off(Phaser.Loader.Events.FILE_LOAD_ERROR, this.onLoadError, this);
      }
    }
  }
  onLoadError(file) {
    const index = this.loadUrls.indexOf(file.url);
    if (index !== -1) {
      this.loadUrls.splice(index, 1);
      this.errorUrls.push(file.url);
      if (this.loadUrls.length === 0) {
        this.scene.load.off(Phaser.Loader.Events.FILE_COMPLETE, this.onLoadComplete, this);
        this.scene.load.off(Phaser.Loader.Events.FILE_LOAD_ERROR, this.onLoadError, this);
        if (this.error) {
          this.error.runWith(this.errorUrls);
          this.error = void 0;
        }
      }
    }
  }
}
