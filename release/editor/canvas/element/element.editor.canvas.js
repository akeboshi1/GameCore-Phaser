var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
import { EditorCanvas } from "../editor.canvas";
import ElementEditorGrids from "./element.editor.grids";
import ElementEditorResourceManager from "./element.editor.resource.manager";
import { ElementFramesDisplay } from "./element.frames.display";
import { Logger } from "structure";
import { ElementEditorBrushType } from "./element.editor.type";
export class ElementEditorCanvas extends EditorCanvas {
  constructor(config) {
    super(config);
    __publicField(this, "mData");
    __publicField(this, "SCENEKEY", "ElementEditorScene");
    __publicField(this, "ERROR_UNINITED", "canvas not inited");
    __publicField(this, "GAME_SIZE", { w: 1600, h: 900 });
    __publicField(this, "mResManager");
    __publicField(this, "mGrids");
    __publicField(this, "mAnimations");
    Logger.getInstance().debug("ElementEditorCanvas.constructor()");
    this.mGame.scene.add(this.SCENEKEY, ElementEditorScene);
    this.mData = config.node;
    this.mResManager = new ElementEditorResourceManager(this.mData, this.mEmitter, this.mConfig.LOCAL_HOME_PATH);
    this.mGame.scene.start(this.SCENEKEY, this);
  }
  destroy() {
    Logger.getInstance().debug("ElementEditorCanvas.destroy()");
    if (this.mData) {
      this.mData = null;
    }
    if (this.mResManager) {
      if (this.mAnimations) {
        this.mResManager.removeResourcesChangeListener(this.mAnimations);
      }
      this.mResManager.destroy();
    }
    if (this.mGrids) {
      this.mGrids.clear();
      this.mGrids.destroy();
    }
    if (this.mAnimations) {
      this.mAnimations.clear();
      this.mAnimations.destroy();
    }
    super.destroy();
  }
  getScene() {
    if (this.mGame)
      return this.mGame.scene.getScene(this.SCENEKEY);
    return null;
  }
  onSceneCreated() {
    const scene = this.getScene();
    this.mGrids = new ElementEditorGrids(scene, this.mData.animations.getDefaultAnimationData());
    this.mAnimations = new ElementFramesDisplay(scene, this.mData.animations.getDefaultAnimationData(), this.mGrids, this.mEmitter, this.mConfig);
    this.mResManager.init(scene);
    this.mResManager.addResourcesChangeListener(this.mAnimations);
  }
  onSceneDestroy() {
    if (this.mGrids)
      this.mGrids.clear();
    if (this.mAnimations)
      this.mAnimations.clear();
  }
  on(event, fn, context) {
    this.mEmitter.on(event, fn, context);
  }
  off(event, fn, context, once) {
    this.mEmitter.off(event, fn, context, once);
  }
  deserializeDisplay() {
    return this.mResManager.deserializeDisplay();
  }
  generateSpriteSheet(images) {
    return this.mResManager.generateSpriteSheet(images);
  }
  reloadDisplayNode() {
    this.mResManager.loadResources();
  }
  changeAnimationData(animationDataId) {
    if (!this.mGrids || !this.mAnimations) {
      Logger.getInstance().error(this.ERROR_UNINITED);
      return;
    }
    const aniData = this.mData.animations.getAnimationData(animationDataId);
    this.mGrids.setAnimationData(aniData);
    this.mAnimations.setAnimationData(aniData);
  }
  selectFrame(frameIndex) {
    if (!this.mAnimations) {
      Logger.getInstance().error(this.ERROR_UNINITED);
      return;
    }
    this.mAnimations.setFrame(frameIndex);
  }
  playAnimation() {
    if (!this.mAnimations) {
      Logger.getInstance().error(this.ERROR_UNINITED);
      return;
    }
    this.mAnimations.setPlay(true);
  }
  stopAnimation() {
    if (!this.mAnimations) {
      Logger.getInstance().error(this.ERROR_UNINITED);
      return;
    }
    this.mAnimations.setPlay(false);
  }
  changeBrush(mode) {
    if (!this.mGrids || !this.mAnimations) {
      Logger.getInstance().error(this.ERROR_UNINITED);
      return;
    }
    this.mGrids.changeBrush(mode);
    this.mAnimations.setInputEnabled(mode === ElementEditorBrushType.Drag);
  }
  selectAnimationLayer(layerIndexs) {
    if (!this.mAnimations) {
      Logger.getInstance().error(this.ERROR_UNINITED);
      return;
    }
    this.mAnimations.setSelectedAnimationLayer(layerIndexs);
  }
  selectMountLayer(mountPointIndex) {
    if (!this.mAnimations) {
      Logger.getInstance().error(this.ERROR_UNINITED);
      return;
    }
    this.mAnimations.setSelectedMountLayer(mountPointIndex);
  }
  updateDepth() {
    if (!this.mAnimations) {
      Logger.getInstance().error(this.ERROR_UNINITED);
      return;
    }
    this.mAnimations.updateDepth();
  }
  updateAnimationLayer() {
    if (!this.mAnimations) {
      Logger.getInstance().error(this.ERROR_UNINITED);
      return;
    }
    this.mAnimations.updateAnimationLayer();
  }
  toggleMountPointAnimationPlay(playerAnimationName, mountPointIndex) {
    if (!this.mAnimations) {
      Logger.getInstance().error(this.ERROR_UNINITED);
      return;
    }
    this.mAnimations.setMountAnimation(playerAnimationName, mountPointIndex);
  }
  updateMountLayer() {
    if (!this.mAnimations) {
      Logger.getInstance().error(this.ERROR_UNINITED);
      return;
    }
    this.mAnimations.updateMountDisplay();
  }
  updateOffsetLoc(layerIndexs) {
    if (!this.mAnimations) {
      Logger.getInstance().error(this.ERROR_UNINITED);
      return;
    }
    this.mAnimations.updateOffsetLoc(layerIndexs);
  }
  generateThumbnail() {
    if (!this.mAnimations) {
      Logger.getInstance().error(this.ERROR_UNINITED);
      return;
    }
    return this.mAnimations.generateThumbnail();
  }
  initCameraPosition() {
    const gameSize = this.mGame.scale.gameSize;
    const cam = this.getScene().cameras.main;
    cam.setPosition(-(gameSize.width / 2 - this.mConfig.width / 2), -(gameSize.height / 2 - this.mConfig.height / 2));
  }
}
class ElementEditorScene extends Phaser.Scene {
  constructor() {
    super(...arguments);
    __publicField(this, "mCanvas");
  }
  init(canvas) {
    this.mCanvas = canvas;
  }
  create(game) {
    if (this.mCanvas)
      this.mCanvas.onSceneCreated();
  }
  destroy() {
    if (this.mCanvas)
      this.mCanvas.onSceneDestroy();
  }
}
