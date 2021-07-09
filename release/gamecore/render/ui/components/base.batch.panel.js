var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result)
    __defProp(target, key, result);
  return result;
};
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
import { Panel } from "apowophaserui";
import { MainUIScene } from "../../scenes/main.ui.scene";
import { UiUtils } from "utils";
import { Logger } from "structure";
import { Export } from "webworker-rpc";
export class BaseBatchPanel extends Panel {
  constructor(scene, render) {
    super(scene, render);
    __publicField(this, "mInitialized");
    __publicField(this, "mTweening", false);
    __publicField(this, "mScene");
    __publicField(this, "mWidth", 0);
    __publicField(this, "mHeight", 0);
    __publicField(this, "mPanelTween");
    __publicField(this, "dpr");
    __publicField(this, "mResources");
    __publicField(this, "mReLoadResources");
    __publicField(this, "mReloadTimes", 0);
    __publicField(this, "render");
    __publicField(this, "key", "");
    __publicField(this, "uiLayer", MainUIScene.LAYER_UI);
    __publicField(this, "exported", false);
    __publicField(this, "exportListeners", []);
    __publicField(this, "mSynchronize", false);
    if (!scene.sys)
      Logger.getInstance().error("no scene system");
    this.mScene = scene;
    this.mWorld = render;
    this.mInitialized = false;
    this.render = render;
    if (render) {
      this.dpr = Math.round(render.uiRatio || UiUtils.baseDpr);
      this.scale = this.mWorld.uiScale;
    }
  }
  get initialized() {
    return this.mInitialized;
  }
  resize(wid, hei) {
    super.resize(wid, hei);
    this.setSize(wid, hei);
  }
  startLoad() {
    if (!this.scene) {
      return;
    }
    this.scene.load.on(Phaser.Loader.Events.FILE_COMPLETE, this.onFileKeyComplete, this);
    this.scene.load.once(Phaser.Loader.Events.COMPLETE, this.loadComplete, this);
    this.scene.load.start();
  }
  show(param) {
    this.mSynchronize = false;
    super.show(param);
    if (!this.mInitialized)
      return;
    if (!this.mSynchronize)
      this.onShow();
  }
  hide() {
    this.onHide();
    if (this.soundGroup && this.soundGroup.close)
      this.playSound(this.soundGroup.close);
    if (!this.mTweening && this.mTweenBoo) {
      this.showTween(false);
    } else {
      this.destroy();
    }
  }
  destroy() {
    if (this.render && this.render.hasOwnProperty(this.key))
      delete this.render[this.key];
    this.exportListeners.length = 0;
    super.destroy();
  }
  addExportListener(f) {
    if (this.exported) {
      f();
      return;
    }
    this.exportListeners.push(f);
  }
  preload() {
    this.mPreLoad = true;
    if (!this.scene) {
      return;
    }
    let index = 0;
    if (this.mResources) {
      this.mResources.forEach((resource, key) => {
        if (!this.cacheExists(resource.type, key)) {
          index++;
          this.addResources(key, resource);
        }
      }, this);
    }
    if (index > 0) {
      this.startLoad();
    } else {
      if (this.mResources)
        this.mResources.clear();
      this.mPreLoad = false;
      this.init();
      this.mSynchronize = true;
    }
  }
  init() {
    if (this.mScene && this.mScene.sys && this.mScene.sys.displayList) {
      this.mScene.layerManager.addToLayer(this.uiLayer, this);
      super.init();
      this.setLinear(this.key);
      Logger.getInstance().debug("init========", this.key);
      this.__exportProperty();
      this.onInitialized();
    }
  }
  setLinear(key) {
    if (!key) {
      return;
    }
    const frame = this.scene.textures.getFrame(key, "__BASE");
    if (frame)
      frame.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
  }
  addResources(key, resource) {
    const resType = resource.type;
    if (resType) {
      if (this.scene.load[resType]) {
        this.scene.load[resource.type](key, resType !== "video" ? this.render.url.getUIRes(resource.dpr, resource.texture) : this.render.url.getNormalUIRes(resource.texture), resource.data ? resType !== "video" ? this.render.url.getUIRes(resource.dpr, resource.data) : this.render.url.getNormalUIRes(resource.data) : void 0);
      }
    }
    super.addResources(key, resource);
  }
  cacheExists(type, key) {
    if (type === "image" || type === "atlas" || type === "texture") {
      return this.scene.textures.exists(key);
    } else if (type === "json" || type === "video") {
      return this.scene.cache[type].exists(key);
    }
    return false;
  }
  get scaleWidth() {
    const width = this.scene.cameras.main.width / this.scale;
    return width;
  }
  get scaleHeight() {
    const height = this.scene.cameras.main.height / this.scale;
    return height;
  }
  get cameraWidth() {
    const width = this.scene.cameras.main.width;
    return width;
  }
  get cameraHeight() {
    const height = this.scene.cameras.main.height;
    return height;
  }
  __exportProperty() {
    if (!this.render) {
      return;
    }
    return this.render.exportProperty(this, this.render, this.key).onceReady(this.exportComplete.bind(this));
  }
  exportComplete() {
    this.exported = true;
    for (const listener of this.exportListeners) {
      listener();
    }
    this.exportListeners.length = 0;
  }
  onShow() {
  }
  onHide() {
    this.render.uiManager.hideBatchPanel(this);
  }
  onInitialized() {
  }
}
__decorateClass([
  Export()
], BaseBatchPanel.prototype, "initialized", 1);
__decorateClass([
  Export()
], BaseBatchPanel.prototype, "resize", 1);
__decorateClass([
  Export()
], BaseBatchPanel.prototype, "startLoad", 1);
__decorateClass([
  Export()
], BaseBatchPanel.prototype, "show", 1);
__decorateClass([
  Export()
], BaseBatchPanel.prototype, "hide", 1);
__decorateClass([
  Export()
], BaseBatchPanel.prototype, "destroy", 1);
__decorateClass([
  Export()
], BaseBatchPanel.prototype, "addExportListener", 1);
__decorateClass([
  Export()
], BaseBatchPanel.prototype, "preload", 1);
__decorateClass([
  Export()
], BaseBatchPanel.prototype, "init", 1);
__decorateClass([
  Export()
], BaseBatchPanel.prototype, "setLinear", 1);
__decorateClass([
  Export()
], BaseBatchPanel.prototype, "addResources", 1);
__decorateClass([
  Export()
], BaseBatchPanel.prototype, "cacheExists", 1);
__decorateClass([
  Export()
], BaseBatchPanel.prototype, "scaleWidth", 1);
__decorateClass([
  Export()
], BaseBatchPanel.prototype, "scaleHeight", 1);
__decorateClass([
  Export()
], BaseBatchPanel.prototype, "cameraWidth", 1);
__decorateClass([
  Export()
], BaseBatchPanel.prototype, "cameraHeight", 1);
__decorateClass([
  Export()
], BaseBatchPanel.prototype, "__exportProperty", 1);
__decorateClass([
  Export()
], BaseBatchPanel.prototype, "exportComplete", 1);
__decorateClass([
  Export()
], BaseBatchPanel.prototype, "onShow", 1);
__decorateClass([
  Export()
], BaseBatchPanel.prototype, "onHide", 1);
__decorateClass([
  Export()
], BaseBatchPanel.prototype, "onInitialized", 1);
