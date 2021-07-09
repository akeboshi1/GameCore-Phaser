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
import { BaseDragonbonesDisplay, ReferenceArea } from "baseRender";
import { Logger, DisplayField, LayerName, TitleMask } from "structure";
import { LoadQueue } from "../../loadqueue";
import { ElementTopDisplay } from "../element.top.display";
export class DragonbonesDisplay extends BaseDragonbonesDisplay {
  constructor(scene, render, id, uuid, type) {
    super(scene, { resPath: render.url.RES_PATH, osdPath: render.url.OSD_PATH }, id);
    this.render = render;
    this.uuid = uuid;
    __publicField(this, "mTitleMask");
    __publicField(this, "mNodeType");
    __publicField(this, "mReferenceArea");
    __publicField(this, "mTopDisplay");
    __publicField(this, "mSortX", 0);
    __publicField(this, "mSortY", 0);
    __publicField(this, "mLoadQueue");
    __publicField(this, "mName");
    __publicField(this, "mStartFireTween");
    this.mNodeType = type;
    this.mLoadQueue = new LoadQueue(scene);
    this.mLoadQueue.on("QueueProgress", this.fileComplete, this);
    this.mLoadQueue.on("QueueError", this.fileError, this);
    this.mHasInteractive = true;
  }
  load(display, field, useRenderTex = true) {
    field = !field ? DisplayField.STAGE : field;
    if (field !== DisplayField.STAGE) {
      return Promise.reject("field is not STAGE");
    }
    return super.load(display, field, useRenderTex);
  }
  get hasInteractive() {
    return this.mHasInteractive;
  }
  set hasInteractive(val) {
    this.mHasInteractive = val;
  }
  startLoad() {
    return new Promise((resolve, reject) => {
      if (!this.mLoadQueue || this.mCreated) {
        resolve(null);
        return;
      }
      this.mLoadQueue.once("QueueComplete", () => {
        resolve(null);
      }, this);
      this.mLoadQueue.startLoad();
    });
  }
  destroy() {
    if (this.mLoadQueue) {
      this.mLoadQueue.off("QueueProgress", this.fileComplete, this);
      this.mLoadQueue.off("QueueError", this.fileError, this);
      this.mLoadQueue.destroy();
    }
    if (this.mStartFireTween) {
      this.mStartFireTween.stop();
      this.mStartFireTween = void 0;
    }
    if (this.mReferenceArea) {
      this.mReferenceArea.destroy();
      this.mReferenceArea = void 0;
    }
    if (this.mTopDisplay) {
      this.mTopDisplay.destroy();
    }
    super.destroy();
  }
  get nodeType() {
    return this.mNodeType;
  }
  set titleMask(val) {
    this.mTitleMask = val;
  }
  get titleMask() {
    return this.mTitleMask;
  }
  checkCollision(sprite) {
    const currentCollisionArea = sprite.currentCollisionArea;
    if (currentCollisionArea && currentCollisionArea.length > 0)
      return true;
    return false;
  }
  showRefernceArea(area, origin) {
    return __async(this, null, function* () {
      if (!area || area.length <= 0 || !origin)
        return;
      if (!this.mReferenceArea) {
        this.mReferenceArea = new ReferenceArea(this.scene);
      }
      const roomSize = yield this.render.mainPeer.getCurrentRoomSize();
      this.mReferenceArea.draw(area, origin, roomSize.tileWidth / this.render.scaleRatio, roomSize.tileHeight / this.render.scaleRatio);
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
  }
  hideGrids() {
  }
  updateTopDisplay() {
    if (this.mTopDisplay)
      this.mTopDisplay.update();
  }
  setVisible(value) {
    if (this.mTopDisplay) {
      if (value)
        this.mTopDisplay.showNickname(this.mName);
      else
        this.mTopDisplay.hideNickname();
    }
    return super.setVisible(value);
  }
  showNickname(name) {
    if (name === void 0) {
      name = this.mName;
    }
    this.mName = name;
    if (!this.checkShowNickname())
      return;
    if (!this.mTopDisplay) {
      this.mTopDisplay = new ElementTopDisplay(this.scene, this, this.render);
    }
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
    this.render.renderEmitter("dragonBones_initialized");
  }
  get projectionSize() {
    if (!this.mProjectionSize) {
      this.mProjectionSize = { offset: { x: 0, y: 0 }, width: 0, height: 0 };
    }
    return this.mProjectionSize;
  }
  play(val) {
    super.play(val);
    this.fetchProjection();
  }
  startFireMove(pos) {
    this.mStartFireTween = this.scene.tweens.add({
      targets: this,
      duration: 5e3,
      ease: "Linear",
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
  doMove(moveData) {
  }
  update() {
    super.update();
    this.updateTopDisplay();
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
  mount(display, index) {
    if (!this.mMountContainer) {
      this.mMountContainer = this.scene.make.container(void 0, false);
    }
    display.x = this.topPoint.x;
    display.y = this.topPoint.y;
    if (!this.mMountContainer.parentContainer) {
      this.add(this.mMountContainer);
    }
    this.mMountContainer.addAt(display, index);
    this.mMountList.set(index, display);
    display.setRootMount(this);
  }
  unmount(display) {
    if (!this.mMountContainer) {
      return;
    }
    display.setRootMount(void 0);
    display.visible = true;
    let index = -1;
    this.mMountList.forEach((val, key) => {
      if (val === display) {
        index = key;
      }
    });
    if (index >= 0) {
      this.mMountList.delete(index);
    }
    this.mMountContainer.remove(display, false);
    this.render.displayManager.addToLayer(LayerName.SURFACE, display);
  }
  get sortX() {
    return this.mSortX;
  }
  get sortY() {
    return this.mSortY;
  }
  fetchProjection() {
    return __async(this, null, function* () {
      if (!this.id)
        return;
      this.mProjectionSize = yield this.render.mainPeer.fetchProjectionSize(this.id);
    });
  }
  fileComplete(progress, key, type) {
    if (key !== this.resourceName || type !== "image") {
      return;
    }
    this.createArmatureDisplay();
  }
  fileError(key) {
    if (key !== this.resourceName)
      return;
    this.displayCreated();
  }
  onArmatureLoopComplete(event) {
    super.onArmatureLoopComplete(event);
    if (!this.mArmatureDisplay || !this.mAnimation) {
      return;
    }
    const queue = this.mAnimation.playingQueue;
    const times = queue.playTimes === void 0 ? -1 : queue.playTimes;
    if (queue.playedTimes >= times && times > 0) {
      this.render.mainPeer.completeDragonBonesAnimationQueue(this.id);
    }
  }
  checkShowNickname() {
    return (this.mTitleMask & TitleMask.TQ_NickName) > 0;
  }
  get nickname() {
    return this.mName;
  }
}
