var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
import { EditorCanvas } from "../editor.canvas";
import { AvatarEditorDragonbone } from "./avatar.editor.dragonbone";
import { Logger } from "structure";
export class AvatarEditorCanvas extends EditorCanvas {
  constructor(config) {
    super(config);
    __publicField(this, "mData");
    __publicField(this, "SCENEKEY", "AvatarEditorScene");
    __publicField(this, "SCENEKEY_SNAPSHOT", "AvatarEditorSnapshotScene");
    __publicField(this, "mDragonbone");
    Logger.getInstance().debug("AvatarEditorCanvas.constructor()");
    this.mGame.scene.add(this.SCENEKEY, AvatarEditorScene);
    this.mData = config.node;
    this.mGame.scene.start(this.SCENEKEY, { onCreated: this.onSceneCreated.bind(this), onUpdate: this.update.bind(this), onDestroy: this.onSceneDestroy.bind(this), resPath: this.mConfig.LOCAL_HOME_PATH });
  }
  destroy() {
    Logger.getInstance().debug("AvatarEditorCanvas.destroy()");
    if (this.mData) {
      this.mData = null;
    }
    if (this.mDragonbone) {
      this.mDragonbone.destroy();
    }
    super.destroy();
  }
  getScene() {
    if (this.mGame)
      return this.mGame.scene.getScene(this.SCENEKEY);
    return null;
  }
  onSceneCreated(scene) {
    this.mDragonbone = new AvatarEditorDragonbone(scene, this.mConfig.LOCAL_HOME_PATH, this.mConfig.osd, this.mEmitter, true);
  }
  update() {
  }
  onSceneDestroy() {
    this.mData = null;
    if (this.mDragonbone) {
      this.mDragonbone.destroy();
    }
  }
  loadLocalResources(img, part, dir, layer) {
    if (this.mDragonbone)
      return this.mDragonbone.loadLocalResources(img, part, dir);
    return Promise.reject("not init yet");
  }
  toggleFacing(dir) {
    if (this.mDragonbone)
      this.mDragonbone.setDir(dir);
  }
  play(animationName) {
    if (this.mDragonbone)
      this.mDragonbone.play(animationName);
  }
  clearParts() {
    if (this.mDragonbone)
      this.mDragonbone.clearParts();
  }
  mergeParts(sets) {
    if (this.mDragonbone)
      this.mDragonbone.mergeParts(sets);
  }
  cancelParts(sets) {
    if (this.mDragonbone)
      this.mDragonbone.cancelParts(sets);
  }
  generateShopIcon(width, height) {
    return new Promise((resolve, reject) => {
      const curScene = this.getScene();
      const curSets = this.mDragonbone.curSets;
      if (this.mGame.scene.getScene(this.SCENEKEY_SNAPSHOT)) {
        Logger.getInstance().error("generating!");
        reject("generating!");
        return;
      }
      this.mGame.scale.resize(width, height);
      this.mGame.scene.add(this.SCENEKEY_SNAPSHOT, AvatarEditorScene, false);
      curScene.scene.launch(this.SCENEKEY_SNAPSHOT, {
        onCreated: (s) => {
          const a = new AvatarEditorDragonbone(s, this.mConfig.LOCAL_HOME_PATH, this.mConfig.osd, this.mEmitter, true, curSets, (dragonbone) => {
            dragonbone.generateShopIcon(width, height).then((src) => {
              resolve(src);
              this.mGame.scale.resize(this.mConfig.width, this.mConfig.height);
              this.mGame.scene.stop(this.SCENEKEY_SNAPSHOT);
              this.mGame.scene.remove(this.SCENEKEY_SNAPSHOT);
            });
          });
        }
      });
    });
  }
  generateHeadIcon(width, height) {
    return new Promise((resolve, reject) => {
      const curScene = this.getScene();
      const curSets = this.mDragonbone.curSets;
      if (this.mGame.scene.getScene(this.SCENEKEY_SNAPSHOT)) {
        Logger.getInstance().error("generating!");
        reject("generating!");
        return;
      }
      this.mGame.scene.add(this.SCENEKEY_SNAPSHOT, AvatarEditorScene, false);
      curScene.scene.launch(this.SCENEKEY_SNAPSHOT, {
        onCreated: (s) => {
          this.mGame.scene.sendToBack(this.SCENEKEY_SNAPSHOT);
          const a = new AvatarEditorDragonbone(s, this.mConfig.LOCAL_HOME_PATH, this.mConfig.osd, this.mEmitter, false, curSets, (dragonbone) => {
            dragonbone.generateHeadIcon().then((src) => {
              resolve(src);
              this.mGame.scene.stop(this.SCENEKEY_SNAPSHOT);
              this.mGame.scene.remove(this.SCENEKEY_SNAPSHOT);
            });
          });
        }
      });
    });
  }
  on(event, fn, context) {
    this.mEmitter.on(event, fn, context);
  }
  off(event, fn, context, once) {
    this.mEmitter.off(event, fn, context, once);
  }
}
export class AvatarEditorScene extends Phaser.Scene {
  constructor() {
    super(...arguments);
    __publicField(this, "onSceneCreated");
    __publicField(this, "onSceneUpdate");
    __publicField(this, "onSceneDestroy");
    __publicField(this, "resPath");
  }
  preload() {
    Logger.getInstance().debug("AvatarEditorScene preload");
    this.game.plugins.installScenePlugin("DragonBones", dragonBones.phaser.plugin.DragonBonesScenePlugin, "dragonbone", this, true);
    this.load.image("avatar_placeholder", this.resPath + "dragonbones/avatar.png");
  }
  init(data) {
    this.onSceneCreated = data.onCreated;
    this.onSceneUpdate = data.onUpdate;
    this.onSceneDestroy = data.onDestroy;
    this.resPath = data.resPath;
  }
  create() {
    if (this.onSceneCreated)
      this.onSceneCreated(this);
  }
  update() {
    if (this.onSceneUpdate)
      this.onSceneUpdate();
  }
  destroy() {
    if (this.onSceneDestroy)
      this.onSceneDestroy();
  }
}
export var AvatarEditorEmitType;
(function(AvatarEditorEmitType2) {
  AvatarEditorEmitType2["ERROR"] = "error";
})(AvatarEditorEmitType || (AvatarEditorEmitType = {}));
