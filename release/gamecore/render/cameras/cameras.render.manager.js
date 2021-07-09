var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
import { BaseCamerasManager } from "baseRender";
import { Logger } from "structure";
export class CamerasRenderManager extends BaseCamerasManager {
  constructor(render) {
    super();
    this.render = render;
    __publicField(this, "MINI_VIEW_SIZE", 50);
    __publicField(this, "VIEW_PORT_SIZE", 50);
    __publicField(this, "viewPort", new Phaser.Geom.Rectangle());
    __publicField(this, "miniViewPort", new Phaser.Geom.Rectangle());
    this.mCameras = [];
    this.zoom = this.render.scaleRatio;
  }
  startRoomPlay(scene) {
    this.mMain = scene.cameras.main;
  }
  pan(x, y, duration, ease, force, callback, context) {
    x *= this.zoom;
    y *= this.zoom;
    for (const cam of this.mCameras) {
      cam.pan(x, y, duration, ease, force, callback, context);
    }
    return new Promise((resolve, reject) => {
      this.mMain.once(Phaser.Cameras.Scene2D.Events.PAN_COMPLETE, () => {
        resolve();
      });
    });
  }
  set camera(camera) {
    this.mMain = camera;
    this.addCamera(camera);
    this.setViewPortSize();
  }
  get camera() {
    return this.mMain;
  }
  resize(width, height) {
    Logger.getInstance().debug("resize");
    this.resetCameraSize(width, height);
    Logger.getInstance().debug("camera ===== resize");
    if (this.mTarget) {
      Logger.getInstance().debug("target ===== resize");
      this.startFollow(this.mTarget);
    }
  }
  scrollTargetPoint(x, y, effect) {
    if (!this.mMain) {
      return;
    }
    this.stopFollow();
    if (effect) {
      this.pan(x, y, 1e3).then(() => {
        this.render.syncCameraScroll();
      });
    } else {
      this.setScroll(x, y);
      this.render.syncCameraScroll();
    }
  }
  destroy() {
    Logger.getInstance().debug("camerasmanager destroy");
    this.mMain = void 0;
    this.mTarget = void 0;
    this.mCameras = [];
  }
  resetCameraSize(width, height) {
    Logger.getInstance().debug("resetCamerSize");
    this.render.mainPeer.resetGameraSize(width, height);
  }
  setViewPortSize() {
    if (!this.mMain) {
      Logger.getInstance().error("camera does not exist");
      return;
    }
    const size = this.render.getCurrentRoomSize();
    if (!size) {
      Logger.getInstance().error("room size does not exist");
      return;
    }
    const viewW = (this.VIEW_PORT_SIZE + this.VIEW_PORT_SIZE) * (size.tileWidth / 2);
    const viewH = (this.VIEW_PORT_SIZE + this.VIEW_PORT_SIZE) * (size.tileHeight / 2);
    this.viewPort.setSize(viewW, viewH);
    const miniViewW = (this.MINI_VIEW_SIZE + this.MINI_VIEW_SIZE) * (size.tileWidth / 2);
    const miniviewH = (this.MINI_VIEW_SIZE + this.MINI_VIEW_SIZE) * (size.tileHeight / 2);
    this.miniViewPort.setSize(miniViewW, miniviewH);
  }
}
