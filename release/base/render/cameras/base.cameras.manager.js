var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
import { Logger } from "structure";
export class BaseCamerasManager {
  constructor() {
    __publicField(this, "mMain");
    __publicField(this, "mMoving");
    __publicField(this, "mTarget");
    __publicField(this, "mCameras");
    __publicField(this, "zoom", 1);
    this.mCameras = [];
  }
  checkContains(pos) {
    const rectange = this.mMain.worldView;
    if (rectange)
      return false;
    return rectange.contains(pos.x, pos.y);
  }
  startRoomPlay(scene) {
    this.mMain = scene.cameras.main;
  }
  pan(x, y, duration) {
    x *= this.zoom;
    y *= this.zoom;
    for (const cam of this.mCameras) {
      cam.pan(x, y, duration);
    }
    return new Promise((resolve, reject) => {
      this.mMain.once(Phaser.Cameras.Scene2D.Events.PAN_COMPLETE, () => {
        resolve();
      });
    });
  }
  resize(width, height) {
  }
  setScroll(x, y) {
    if (!this.mMain) {
      return;
    }
    x -= this.mMain.width * 0.5;
    y -= this.mMain.height * 0.5;
    for (const camera of this.mCameras) {
      camera.setScroll(x, y);
    }
  }
  offsetScroll(x, y) {
    if (!this.mMain) {
      return;
    }
    for (const camera of this.mCameras) {
      camera.scrollX += x;
      camera.scrollY += y;
    }
    this.moving = true;
  }
  startFollow(target) {
    this.mTarget = target;
    if (this.mMain && target) {
      for (const camera of this.mCameras) {
        camera.startFollow(target);
      }
    }
  }
  stopFollow() {
    this.mTarget = null;
    if (this.mMain) {
      for (const camera of this.mCameras) {
        camera.stopFollow();
      }
    }
  }
  addCamera(camera) {
    const index = this.mCameras.indexOf(camera);
    if (index === -1) {
      this.mCameras.push(camera);
    }
    if (this.mTarget) {
      camera.startFollow(this.mTarget);
    }
  }
  removeCamera(camera) {
    const index = this.mCameras.indexOf(camera);
    if (index > -1) {
      this.mCameras.splice(index, 1);
    }
  }
  setBounds(x, y, width, height, centerOn) {
    if (!this.mMain) {
      Logger.getInstance().error("camera does not exist");
      return;
    }
    for (const camera of this.mCameras) {
      camera.setBounds(x, y, width, height, centerOn);
    }
  }
  setPosition(x, y) {
    if (!this.mMain) {
      return;
    }
    for (const camera of this.mCameras) {
      camera.setPosition(x, y);
    }
  }
  scrollTargetPoint(x, y, effect) {
    if (!this.mMain) {
      return;
    }
    this.stopFollow();
    if (effect) {
      this.pan(x, y, 1e3);
    } else {
      this.setScroll(x, y);
    }
  }
  destroy() {
    Logger.getInstance().log("camerasmanager destroy");
    this.mMain = void 0;
    this.mTarget = void 0;
    this.mCameras = [];
  }
  set moving(val) {
    this.mMoving = val;
  }
  get moving() {
    return this.mMoving;
  }
  get targetFollow() {
    return this.mTarget;
  }
  set camera(camera) {
    this.mMain = camera;
    this.addCamera(camera);
  }
  get camera() {
    return this.mMain;
  }
}
