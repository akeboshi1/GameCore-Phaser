var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
export var LoadType;
(function(LoadType2) {
  LoadType2[LoadType2["IMAGE"] = 0] = "IMAGE";
  LoadType2[LoadType2["JSON"] = 1] = "JSON";
  LoadType2[LoadType2["ALTAS"] = 2] = "ALTAS";
  LoadType2[LoadType2["DRAGONBONES"] = 3] = "DRAGONBONES";
})(LoadType || (LoadType = {}));
var LoadState;
(function(LoadState2) {
  LoadState2[LoadState2["NONE"] = 0] = "NONE";
  LoadState2[LoadState2["PRELOAD"] = 1] = "PRELOAD";
  LoadState2[LoadState2["PROGRESS"] = 2] = "PROGRESS";
  LoadState2[LoadState2["COMPLETE"] = 3] = "COMPLETE";
  LoadState2[LoadState2["ERROR"] = 4] = "ERROR";
  LoadState2[LoadState2["RETRY"] = 5] = "RETRY";
})(LoadState || (LoadState = {}));
export class LoadQueue extends Phaser.Events.EventEmitter {
  constructor(scene) {
    super();
    this.scene = scene;
    __publicField(this, "mQueue", []);
  }
  add(list) {
    list.forEach((loadObject) => {
      if (loadObject) {
        const type = loadObject.type;
        const key = loadObject.key;
        const altasUrl = loadObject.altasUrl, textureUrl = loadObject.textureUrl, jsonUrl = loadObject.jsonUrl, boneUrl = loadObject.boneUrl;
        switch (type) {
          case 2:
            this.scene.load.atlas(key, altasUrl);
            break;
          case 0:
            this.scene.load.image(key, textureUrl);
            break;
          case 1:
            this.scene.load.json(key, jsonUrl);
            break;
          case 3:
            this.scene.load.dragonbone(key, textureUrl, jsonUrl, boneUrl, null, null, { responseType: "arraybuffer" });
            break;
        }
        this.mQueue.push(loadObject);
      }
    });
  }
  startLoad() {
    this.mQueue.forEach((loadObject) => {
      loadObject.state = 2;
    });
    this.addListen();
    this.scene.load.start();
  }
  destroy() {
    this.removeListen();
    if (this.mQueue)
      this.mQueue = null;
    super.destroy();
  }
  addListen() {
    this.removeListen();
    this.scene.load.on(Phaser.Loader.Events.FILE_COMPLETE, this.fileComplete, this);
    this.scene.load.once(Phaser.Loader.Events.COMPLETE, this.totalComplete, this);
    this.scene.load.on(Phaser.Loader.Events.FILE_LOAD_ERROR, this.fileLoadError, this);
  }
  removeListen() {
    this.scene.load.off(Phaser.Loader.Events.FILE_COMPLETE, this.fileComplete, this);
    this.scene.load.off(Phaser.Loader.Events.COMPLETE, this.totalComplete, this);
    this.scene.load.off(Phaser.Loader.Events.FILE_LOAD_ERROR, this.fileLoadError, this);
  }
  totalComplete() {
    this.emit("QueueComplete");
    this.clearQueue();
  }
  fileComplete(key, type) {
    this.emit("QueueProgress", this.scene.load.progress, key, type);
  }
  fileLoadError(file) {
    this.emit("QueueError", file.key);
  }
  clearQueue() {
    this.removeListen();
    if (!this.mQueue)
      return;
    this.mQueue.length = 0;
    this.mQueue = [];
  }
}
