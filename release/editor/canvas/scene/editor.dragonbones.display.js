var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
import { BaseDragonbonesDisplay } from "baseRender";
import { LayerEnum } from "game-capsule";
import { EditorTopDisplay } from "./top.display";
export class EditorDragonbonesDisplay extends BaseDragonbonesDisplay {
  constructor(scene, config, sprite) {
    super(scene, { resPath: config.LOCAL_HOME_PATH, osdPath: config.osd }, sprite.id);
    __publicField(this, "sprite");
    __publicField(this, "mReferenceArea");
    __publicField(this, "mTopDisplay");
    __publicField(this, "mNodeType");
    this.setSprite(sprite);
    this.mNodeType = sprite.nodeType;
  }
  asociate() {
  }
  selected() {
    this.showNickname();
  }
  unselected() {
    this.hideNickname();
  }
  showRefernceArea() {
  }
  hideRefernceArea() {
    if (this.mReferenceArea) {
      this.mReferenceArea.destroy();
      this.mReferenceArea = void 0;
    }
  }
  showNickname() {
    this.topDisplay.showNickname(this.name);
  }
  hideNickname() {
    this.mTopDisplay.hideNickname();
  }
  setPosition(x, y, z, w) {
    super.setPosition(x, y, z, w);
    if (this.mTopDisplay) {
      this.mTopDisplay.update();
    }
    return this;
  }
  updateSprite(sprite) {
    this.setSprite(sprite);
    const displayInfo = sprite.displayInfo;
    if (displayInfo) {
      this.load(displayInfo, void 0, false);
    }
    const pos = sprite.pos;
    if (pos) {
      this.setPosition(pos.x, pos.y, pos.z);
    }
    this.name = sprite.nickname;
    this.play(sprite.currentAnimation);
    this.asociate();
  }
  setSprite(sprite) {
    this.sprite = sprite;
    if (!sprite.currentAnimationName) {
      sprite.setAnimationName("idle");
    }
    this.defaultLayer();
  }
  clear() {
    this.mMountList.forEach((val, key) => {
      this.unmount(val);
    });
  }
  getMountIds() {
    return [];
  }
  toSprite() {
    if (!this.sprite) {
      return;
    }
    const pos = this.sprite.pos;
    pos.x = this.x;
    pos.y = this.y;
    pos.z = this.z;
    const sprite = this.sprite.toSprite();
    const mountIds = this.getMountIds();
    sprite.mountSprites = mountIds;
    return sprite;
  }
  createArmatureDisplay() {
    super.createArmatureDisplay();
    this.setData("id", this.sprite.id);
  }
  get isMoss() {
    return false;
  }
  get nodeType() {
    return this.mNodeType;
  }
  defaultLayer() {
    if (!this.sprite.layer) {
      this.sprite.layer = LayerEnum.Surface;
    }
  }
  get topDisplay() {
    if (!this.mTopDisplay) {
      this.mTopDisplay = new EditorTopDisplay(this.scene, this, 1);
    }
    return this.mTopDisplay;
  }
}
