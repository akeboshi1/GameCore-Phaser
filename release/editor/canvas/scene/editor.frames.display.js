var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
import { BaseFramesDisplay } from "baseRender";
import { Logger, LogicPoint, Position45 } from "structure";
import { EditorTopDisplay } from "./top.display";
import { op_def } from "pixelpai_proto";
import { LayerEnum, Helpers } from "game-capsule";
export class EditorFramesDisplay extends BaseFramesDisplay {
  constructor(sceneEditor, config, sprite) {
    super(sceneEditor.scene, { resPath: config.LOCAL_HOME_PATH, osdPath: config.osd }, sprite.id, sprite.nodeType);
    this.sceneEditor = sceneEditor;
    __publicField(this, "sprite");
    __publicField(this, "mReferenceArea");
    __publicField(this, "mTopDisplay");
    __publicField(this, "mIsMoss", false);
    __publicField(this, "mOverlapped", false);
    __publicField(this, "mLayer");
    this.sprite = sprite;
    this.mLayer = sprite.layer;
  }
  mount(display, targetIndex) {
    if (!this.mCurAnimation) {
      return;
    }
    if (targetIndex === void 0) {
      let i = 0;
      while (this.mMountList.get(i)) {
        i++;
        if (i === 10) {
          Logger.getInstance().error("mount index is out of control");
          return;
        }
      }
      targetIndex = i;
      this.mCurAnimation.createMountPoint(targetIndex);
    }
    super.mount(display, targetIndex);
  }
  unmount(display) {
    if (!this.mMountContainer) {
      return;
    }
    super.unmount(display);
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
      this.load(displayInfo);
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
    this.defaultLayer();
  }
  setDirection(dir) {
    if (dir === this.direction)
      return;
    this.direction = dir;
    if (this.sprite) {
      this.sprite.setDirection(dir);
      this.play(this.sprite.currentAnimation);
    }
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
  clear() {
    this.mMountList.forEach((val, key) => {
      this.unmount(val);
    });
    this.mAnimation = null;
    this.mCurAnimation = null;
    this.mPreAnimation = null;
    this.clearDisplay();
    this.mDisplayDatas.clear();
    this.mSprites.forEach((display) => display.destroy());
    this.mSprites.clear();
    this.mMountContainer = null;
  }
  getMountIds() {
    const result = [];
    if (this.mMountList) {
      this.mMountList.forEach((val, key) => {
        const id = val.id;
        if (id)
          result.push(id);
      });
    }
    return result;
  }
  updateMountPoint(ele, x, y) {
    let index = -1;
    this.mMountList.forEach((val, key) => {
      if (val === ele) {
        index = key;
      }
    });
    if (index > -1) {
      this.mCurAnimation.updateMountPoint(index, x, y);
      const mount = this.mCurAnimation.mountLayer;
      if (mount) {
        const pos = mount.mountPoint;
        if (index < 0 || index >= pos.length) {
          return;
        }
        ele.setPosition(pos[index].x, pos[index].y);
      }
    }
  }
  play(val) {
    super.play(val);
    this.fetchProjection();
    if (this.mReferenceArea) {
      this.showRefernceArea();
    }
  }
  fetchProjection() {
    if (!this.mCurAnimation) {
      return;
    }
    const miniSize = this.sceneEditor.miniRoomSize;
    const collision = this.getCollisionArea();
    const origin = this.getOriginPoint();
    if (!collision)
      return;
    const rows = collision.length;
    const cols = collision[0].length;
    const width = cols;
    const height = rows;
    const offset = Position45.transformTo90(new LogicPoint(origin.x, origin.y), miniSize);
    this.mProjectionSize = { offset, width, height };
    this.updateSort();
  }
  getCollisionArea() {
    if (!this.mCurAnimation) {
      return;
    }
    let collision = this.mCurAnimation.collisionArea;
    if (this.mAnimation.flip) {
      collision = Helpers.flipArray(collision);
    }
    return collision;
  }
  getOriginPoint() {
    if (!this.mCurAnimation) {
      return;
    }
    const originPoint = this.mCurAnimation.originPoint;
    if (this.mAnimation.flip) {
      return new LogicPoint(originPoint.y, originPoint.x);
    }
    return originPoint;
  }
  get topDisplay() {
    if (!this.mTopDisplay) {
      this.mTopDisplay = new EditorTopDisplay(this.scene, this, 1);
    }
    return this.mTopDisplay;
  }
  get elementManager() {
    return this.sceneEditor.elementManager;
  }
  defaultLayer() {
    if (!this.sprite.layer) {
      if (this.nodeType === op_def.NodeType.TerrainNodeType) {
        this.sprite.layer = LayerEnum.Terrain;
      } else {
        this.sprite.layer = LayerEnum.Surface;
      }
    }
  }
  set isMoss(val) {
    this.mIsMoss = val;
  }
  get isMoss() {
    return this.mIsMoss;
  }
  set overlapped(val) {
    if (this.mOverlapped === val) {
      return;
    }
    this.mOverlapped = val;
    if (val) {
      this.showRefernceArea();
    } else {
      this.hideRefernceArea();
    }
  }
}
