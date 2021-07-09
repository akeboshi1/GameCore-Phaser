var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
import { ValueResolver, LogicPos } from "structure";
export class BaseDisplay extends Phaser.GameObjects.Container {
  constructor(scene, id) {
    super(scene);
    __publicField(this, "createdHandler");
    __publicField(this, "mAlpha", 1);
    __publicField(this, "mDirection", 3);
    __publicField(this, "mDisplayInfo");
    __publicField(this, "mAnimation");
    __publicField(this, "mRootMount");
    __publicField(this, "mMountList", new Map());
    __publicField(this, "moveData");
    __publicField(this, "mCreated", false);
    __publicField(this, "mSprites", new Map());
    __publicField(this, "mLoadDisplayPromise", null);
    __publicField(this, "mProjectionSize");
    __publicField(this, "mSortX", 0);
    __publicField(this, "mSortY", 0);
    __publicField(this, "mID", 0);
    __publicField(this, "mHasInteractive", false);
    this.mID = id;
  }
  destroy(fromScene) {
    this.mSprites.forEach((sprite) => sprite.destroy());
    this.mSprites.clear();
    if (this.parentContainer) {
      this.parentContainer.remove(this);
    }
    this.mHasInteractive = false;
    super.destroy(fromScene);
  }
  load(data) {
    this.displayInfo = data;
    if (!this.displayInfo)
      return Promise.reject("displayInfo error");
    this.mLoadDisplayPromise = new ValueResolver();
    return this.mLoadDisplayPromise.promise(() => {
      this.scene.load.start();
    });
  }
  displayCreated() {
    this.mCreated = true;
    if (this.createdHandler) {
      this.createdHandler.runWith(this.displayInfo);
    }
  }
  get created() {
    return this.mCreated;
  }
  set direction(dir) {
    this.mDirection = dir;
    if (this.mDisplayInfo) {
      this.mDisplayInfo.avatarDir = dir;
      this.play(this.mAnimation);
    }
  }
  get direction() {
    return this.mDirection;
  }
  get displayInfo() {
    return this.mDisplayInfo;
  }
  set displayInfo(data) {
    this.mDisplayInfo = data;
  }
  play(animation) {
    this.mAnimation = animation;
  }
  changeAlpha(val) {
    if (this.mAlpha === val) {
      return;
    }
    this.alpha = val;
    this.mAlpha = val;
  }
  setDirection(dir) {
    if (dir === this.direction)
      return;
    this.direction = dir;
    this.play(this.mAnimation);
  }
  setPosition(x, y, z, w) {
    super.setPosition(x, y, z, w);
    this.update();
    return this;
  }
  update() {
    this.updateSort();
    if (this.mMountList) {
      this.mMountList.forEach((mount) => mount.update());
    }
  }
  getPosition() {
    const pos = new LogicPos(this.x, this.y);
    if (this.mRootMount) {
      const rootPos = this.mRootMount.getPosition();
      pos.x += rootPos.x;
      pos.y += rootPos.y;
    }
    return pos;
  }
  setRootMount(gameObject) {
    this.mRootMount = gameObject;
    this.update();
  }
  mount(display, index) {
  }
  unmount(display) {
  }
  destroyMount() {
    this.mMountList.forEach((mount, index) => mount.destroy());
    this.mMountList.clear();
  }
  fadeIn(callback) {
  }
  fadeOut(callback) {
  }
  getSprite(key) {
    return this.mSprites.get(key);
  }
  getScene() {
    return this.scene;
  }
  updateSort() {
    if (this.mRootMount)
      return;
    const x = this.x - this.projectionSize.offset.x;
    const y = this.y - this.projectionSize.offset.y;
    this.mSortX = (x + 2 * y) / 30;
    this.mSortY = (2 * y - x) / 30;
  }
  get runningAnimation() {
    return this.mAnimation;
  }
  get rootMount() {
    return this.mRootMount;
  }
  get projectionSize() {
    if (!this.mProjectionSize) {
      this.mProjectionSize = { offset: { x: 0, y: 0 }, width: 0, height: 0 };
    }
    return this.mProjectionSize;
  }
  get sortX() {
    return this.mSortX;
  }
  get sortY() {
    return this.mSortY;
  }
  get sortZ() {
    return this.z || 0;
  }
  get id() {
    return this.mID;
  }
  get hasInteractive() {
    return this.mHasInteractive;
  }
  set hasInteractive(val) {
    this.mHasInteractive = val;
  }
}
