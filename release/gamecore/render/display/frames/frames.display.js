var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
import { BaseFramesDisplay, ReferenceArea } from "baseRender";
import { Logger, DisplayField, LayerName, TitleMask } from "structure";
import { ElementTopDisplay } from "../element.top.display";
export class FramesDisplay extends BaseFramesDisplay {
  constructor(scene, render, id, type) {
    super(scene, { resPath: render.url.RES_PATH, osdPath: render.url.OSD_PATH }, type);
    this.render = render;
    __publicField(this, "mID");
    __publicField(this, "mTitleMask");
    __publicField(this, "mReferenceArea");
    __publicField(this, "mTopDisplay");
    __publicField(this, "mName");
    __publicField(this, "mStartFireTween");
    __publicField(this, "mDebugPoint");
    __publicField(this, "mGrids");
    this.mNodeType = type;
    this.mID = id;
  }
  startLoad() {
    this.scene.load.start();
    return Promise.resolve(null);
  }
  destroy() {
    if (this.mReferenceArea) {
      this.mReferenceArea.destroy();
      this.mReferenceArea = void 0;
    }
    if (this.mTopDisplay) {
      this.mTopDisplay.destroy();
    }
    if (this.mStartFireTween) {
      this.mStartFireTween.stop();
      this.mStartFireTween = void 0;
    }
    if (this.mDebugPoint) {
      this.mDebugPoint.destroy();
      this.mDebugPoint = void 0;
    }
    if (this.mGrids) {
      this.mGrids.destroy();
      this.mGrids = void 0;
    }
    super.destroy();
  }
  set titleMask(val) {
    this.mTitleMask = val;
  }
  get titleMask() {
    return this.mTitleMask;
  }
  get hasInteractive() {
    return this.mHasInteractive;
  }
  set hasInteractive(val) {
    this.mHasInteractive = val;
  }
  update() {
    super.update();
    this.updateTopDisplay();
  }
  checkCollision(sprite) {
    const currentCollisionArea = sprite.currentCollisionArea;
    if (currentCollisionArea && currentCollisionArea.length > 0)
      return true;
    return false;
  }
  showRefernceArea(area, origin, conflictMap) {
    return __async(this, null, function* () {
      if (!area || area.length <= 0 || !origin)
        return;
      const roomSize = this.render.roomSize;
      if (!this.mReferenceArea) {
        this.mReferenceArea = new ReferenceArea(this.scene);
      }
      let drawArea = area;
      if (conflictMap !== void 0 && conflictMap.length > 0) {
        drawArea = conflictMap;
      }
      this.mReferenceArea.draw(drawArea, origin, roomSize.tileWidth / this.render.scaleRatio, roomSize.tileHeight / this.render.scaleRatio);
      this.addAt(this.mReferenceArea, 0);
    });
  }
  hideRefernceArea() {
    if (this.mReferenceArea) {
      this.mReferenceArea.destroy();
      this.mReferenceArea = void 0;
    }
  }
  showGrids() {
    if (this.mGrids) {
      this.mGrids.destroy();
      this.mGrids = void 0;
    }
  }
  hideGrids() {
    if (this.mGrids) {
      this.mGrids.destroy();
      this.mGrids = void 0;
    }
  }
  updateTopDisplay() {
    if (this.mTopDisplay)
      this.mTopDisplay.update();
  }
  showNickname(name) {
    if (name === void 0) {
      name = this.mName;
    }
    this.mName = name;
    if (!this.mTopDisplay) {
      this.mTopDisplay = new ElementTopDisplay(this.scene, this, this.render);
    }
    if (!this.checkShowNickname())
      return;
    this.mTopDisplay.showNickname(name);
  }
  showTopDisplay(data) {
    if (!data) {
      if (this.mTopDisplay)
        this.mTopDisplay.destroy();
      this.mTopDisplay = void 0;
      return;
    }
    if (!this.mTopDisplay)
      this.mTopDisplay = new ElementTopDisplay(this.scene, this, this.render);
    this.mTopDisplay.loadState(data);
  }
  showBubble(text, setting) {
    if (!this.mTopDisplay) {
      this.mTopDisplay = new ElementTopDisplay(this.scene, this, this.render);
    }
    this.mTopDisplay.showBubble(text, setting);
  }
  clearBubble() {
    if (!this.mTopDisplay)
      return;
    this.mTopDisplay.clearBubble();
  }
  displayCreated() {
    super.displayCreated();
    if (this.mTopDisplay) {
      this.mTopDisplay.updateOffset();
    }
    this.render.mainPeer.elementDisplayReady(this.id);
  }
  play(val) {
    super.play(val);
    this.fetchProjection();
  }
  doMove(moveData) {
  }
  startFireMove(pos) {
    Logger.getInstance().log("startFireMove ===>", pos, this.x, this.y);
    this.mStartFireTween = this.scene.tweens.add({
      targets: this,
      duration: 900,
      ease: "Expo.Out",
      props: {
        x: pos.x,
        y: pos.y
      },
      onComplete: () => {
        if (this.mStartFireTween)
          this.mStartFireTween.stop();
        if (this.mStartFireTween)
          this.mStartFireTween = void 0;
      },
      onCompleteParams: [this]
    });
  }
  setPosition(x, y, z, w) {
    super.setPosition(x, y, z, w);
    this.updateTopDisplay();
    return this;
  }
  addEffect(display) {
    if (!display) {
      return Logger.getInstance().error("Failed to add effect, display does not exist");
    }
    const backend = display.getSprite(DisplayField.BACKEND);
    if (backend) {
      this.addAt(backend, DisplayField.BACKEND);
    }
    const frontend = display.getSprite(DisplayField.FRONTEND);
    if (frontend) {
      this.addAt(frontend, DisplayField.FRONTEND);
    }
  }
  removeEffect(display) {
    if (!display) {
      return Logger.getInstance().error("Failed to remove effect, display does not exist");
    }
    const backend = display.getSprite(DisplayField.BACKEND);
    if (backend) {
      this.remove(backend, true);
    }
    const frontend = display.getSprite(DisplayField.FRONTEND);
    if (frontend) {
      this.remove(frontend, true);
    }
  }
  unmount(display) {
    if (!this.mMountContainer) {
      return;
    }
    super.unmount(display);
    this.render.displayManager.addToLayer(LayerName.SURFACE, display);
  }
  scaleTween() {
    if (this.mMountContainer && this.mMountContainer.list.length > 0) {
      return;
    }
    if (this.mScaleTween) {
      return;
    }
    const tmp = this.scale;
    this.mScaleTween = this.scene.tweens.add({
      targets: this,
      duration: 100,
      scale: tmp * 1.25,
      yoyo: true,
      repeat: 0,
      onComplete: () => {
        this.scale = 1;
        if (this.mScaleTween) {
          this.mScaleTween = void 0;
        }
      }
    });
  }
  fetchProjection() {
    return __async(this, null, function* () {
      if (!this.id)
        return;
      this.mProjectionSize = yield this.render.mainPeer.fetchProjectionSize(this.id);
      this.updateSort();
    });
  }
  completeFrameAnimationQueue() {
    super.completeFrameAnimationQueue();
    this.render.mainPeer.completeFrameAnimationQueue(this.id);
  }
  checkShowNickname() {
    return (this.mTitleMask & TitleMask.TQ_NickName) > 0;
  }
  onAnimationUpdateHandler(ani, frame) {
    if (!this.mMountContainer || !this.mCurAnimation)
      return;
    const frameVisible = this.mCurAnimation.mountLayer.frameVisible;
    if (!frameVisible) {
      return;
    }
    const index = frame.index - 1;
    if (index > frameVisible.length) {
      return;
    }
    this.mMountList.forEach((value, key) => {
      value.visible = this.getMaskValue(frameVisible[index], key);
    });
  }
  getMaskValue(mask, idx) {
    return (mask >> idx) % 2 === 1;
  }
  get nickname() {
    return this.mName;
  }
}
