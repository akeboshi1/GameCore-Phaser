var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
import { SPRITE_SHEET_KEY, IMAGE_BLANK_KEY } from "./element.editor.resource.manager";
import { Logger } from "structure";
import { BaseFramesDisplay } from "baseRender";
import { AnimationModel } from "structure";
import { DragonbonesEditorDisplay } from "./dragonbones.editor.display";
import { ElementEditorEmitType } from "./element.editor.type";
export class ElementFramesDisplay extends BaseFramesDisplay {
  constructor(scene, node, grids, emitter, mConfig) {
    super(scene, { resPath: mConfig.LOCAL_HOME_PATH, osdPath: mConfig.osd });
    this.mConfig = mConfig;
    __publicField(this, "MOUNT_ANIMATION_TIME_SCALE", 1e3 / 12);
    __publicField(this, "mGrids");
    __publicField(this, "mEmitter");
    __publicField(this, "mSelectedGameObjects", []);
    __publicField(this, "mAnimationData");
    __publicField(this, "mCurFrameIdx", 0);
    __publicField(this, "mPlaying", false);
    __publicField(this, "mCurMountAnimation", { name: "idle", flip: false });
    this.mGrids = grids;
    this.mEmitter = emitter;
    this.mMountList = new Map();
    const parentContainer = scene.add.container(0, 0);
    parentContainer.add(this);
    this.scene.input.on("dragstart", this.onDragStartHandler, this);
    this.scene.input.on("drag", this.onDragHandler, this);
    this.scene.input.on("dragend", this.onDragEndHandler, this);
    this.scene.input.keyboard.on("keydown", this.keyboardEvent, this);
    this.setAnimationData(node);
  }
  setAnimationData(data) {
    this.clear();
    this.mAnimationData = data;
    this.mCurFrameIdx = 0;
    this.mPlaying = false;
    this.mIsInteracitve = true;
    if (!this.mAnimationData) {
      Logger.getInstance().warn("\u9009\u62E9\u52A8\u753B\u9519\u8BEF!");
      return;
    }
    Logger.getInstance().debug("setAnimationData: ", data);
    const originPos = this.mGrids.getAnchor90Point();
    this.x = originPos.x;
    this.y = originPos.y;
    this.updatePlay();
  }
  onResourcesLoaded() {
    this.clearDisplay();
    this.createDisplays();
    this.updatePlay();
  }
  onResourcesCleared() {
    this.clearDisplay();
  }
  setFrame(frameIdx) {
    this.mCurFrameIdx = frameIdx;
    this.updatePlay();
  }
  setMountAnimation(aniName, idx) {
    this.mCurMountAnimation.name = aniName;
    if (idx !== void 0) {
      if (!this.mMountList.get(idx)) {
        Logger.getInstance().warn("wrong idx: " + idx);
        return;
      }
      const arm = this.mMountList.get(idx);
      if (arm)
        arm.play(this.mCurMountAnimation);
    } else {
      this.mMountList.forEach((val) => {
        val.play(this.mCurMountAnimation);
      });
    }
  }
  updateMountDisplay() {
    this.updateMountLayerPlay();
  }
  setPlay(playing) {
    this.mPlaying = playing;
    this.updatePlay();
  }
  setInputEnabled(val) {
    this.mIsInteracitve = val;
    this.updateInputEnabled();
    if (!val)
      this.mSelectedGameObjects.length = 0;
  }
  setSelectedAnimationLayer(idxs) {
    let gos = [];
    idxs.forEach((idx) => {
      if (this.mDisplays.has(idx)) {
        gos = gos.concat(this.mDisplays.get(idx));
      }
    });
    this.setSelectedGameObjects(gos);
  }
  setSelectedMountLayer(mountPointIndex) {
    if (mountPointIndex !== void 0) {
      if (!this.mMountList.get(mountPointIndex)) {
        Logger.getInstance().warn("wrong idx: " + mountPointIndex);
        return;
      }
      this.setSelectedGameObjects(this.mMountList.get(mountPointIndex));
    } else {
      const arr = Array.from(this.mMountList.values());
      this.setSelectedGameObjects(arr);
    }
  }
  updateDepth() {
    if (!this.mAnimationData)
      return;
    this.mAnimationData.layerDict.forEach((val, key) => {
      if (!this.mDisplays.has(key))
        return;
      const display = this.mDisplays.get(key);
      if (display && display.parentContainer) {
        display.parentContainer.setDepth(val.depth);
      }
    });
    if (!this.mAnimationData.mountLayer)
      return;
    if (this.mMountContainer) {
      this.mMountContainer.setDepth(this.mAnimationData.mountLayer.index);
    }
    this.updateChildrenIdxByDepth();
  }
  updatePerAnimationLayerVisible(idx) {
    if (!this.mAnimationData)
      return;
    if (!this.mAnimationData.layerDict.has(idx) || !this.mDisplays.has(idx))
      return;
    if (this.mPlaying)
      return;
    const display = this.mDisplays.get(idx);
    const data = this.mAnimationData.layerDict.get(idx);
    if (data.frameVisible && this.mCurFrameIdx >= data.frameVisible.length)
      return;
    if (display) {
      display.visible = data.frameVisible ? data.frameVisible[this.mCurFrameIdx] : true;
    }
  }
  addAnimationLayer(idx) {
    throw new Error("todo add AnimationLayer");
    this.updatePlay();
  }
  updateAnimationLayer() {
    this.clearDisplay();
    this.createDisplays();
    this.updatePlay();
  }
  updateOffsetLoc(idx) {
    const display = this.mDisplays.get(idx);
    if (!display) {
      return;
    }
    if (!this.mAnimationData) {
      return;
    }
    const data = this.mAnimationData.layerDict.get(idx);
    if (!data) {
      return;
    }
    const baseLoc = data.offsetLoc || { x: 0, y: 0 };
    display.x = baseLoc.x;
    display.y = baseLoc.y;
  }
  generateThumbnail() {
    return new Promise((resolve, reject) => {
      if (!this.mAnimationData) {
        reject(null);
        return;
      }
      if (this.mAnimationData.layerDict.size === 0) {
        reject(null);
        return;
      }
      const firstLayer = this.mAnimationData.layerDict.values().next().value;
      if (firstLayer.frameName.length === 0) {
        reject(null);
        return;
      }
      const frameName = firstLayer.frameName[0];
      if (!this.scene.textures.exists(SPRITE_SHEET_KEY)) {
        reject(null);
        return;
      }
      if (!this.scene.textures.get(SPRITE_SHEET_KEY).has(frameName)) {
        reject(null);
        return;
      }
      if (frameName === IMAGE_BLANK_KEY) {
        reject(null);
        return;
      }
      const image = this.scene.make.image({ key: SPRITE_SHEET_KEY, frame: frameName }).setOrigin(0, 0);
      let scaleRatio = 1;
      if (image.width > 48 || image.height > 48) {
        if (image.width > image.height) {
          scaleRatio = 48 / image.width;
        } else {
          scaleRatio = 48 / image.height;
        }
        image.scale = scaleRatio;
      }
      const render = this.scene.make.renderTexture({
        width: image.displayWidth >> 0,
        height: image.displayHeight >> 0
      }, false);
      render.draw(image);
      render.snapshot((img) => {
        resolve(img.src);
        image.destroy();
        render.destroy();
      });
    });
  }
  clear() {
    this.clearDisplay();
    this.mSelectedGameObjects.length = 0;
    this.mDisplayDatas.clear();
  }
  clearDisplay() {
    this.mDisplays.forEach((element) => {
      if (element) {
        element.destroy();
      }
    });
    this.mDisplays.clear();
    this.mMountList.forEach((val) => {
      this.unmount(val);
      val.destroy(true);
    });
    this.mMountList.clear();
    super.clearDisplay();
  }
  makeAnimation(gen, key, frameName, frameVisible, frameRate, loop, frameDuration) {
    if (this.scene.anims.exists(key)) {
      this.scene.anims.remove(key);
    }
    super.makeAnimation(gen, key, frameName, frameVisible, frameRate, loop, frameDuration);
  }
  createDisplays(key, ani) {
    if (!this.mAnimationData)
      return;
    if (!this.scene.textures.exists(SPRITE_SHEET_KEY))
      return;
    super.createDisplays(SPRITE_SHEET_KEY, this.mAnimationData.createProtocolObject());
  }
  dragonBoneLoaded() {
  }
  keyboardEvent(value) {
    if (!this.mAnimationData || this.mSelectedGameObjects.length <= 0) {
      return;
    }
    let operated = false;
    switch (value.keyCode) {
      case 37:
        this.mSelectedGameObjects.forEach((element) => {
          element.x--;
        });
        operated = true;
        break;
      case 38:
        this.mSelectedGameObjects.forEach((element) => {
          element.y--;
        });
        operated = true;
        break;
      case 39:
        this.mSelectedGameObjects.forEach((element) => {
          element.x++;
        });
        operated = true;
        break;
      case 40:
        this.mSelectedGameObjects.forEach((element) => {
          element.y++;
        });
        operated = true;
        break;
    }
    if (operated)
      this.syncPositionData();
  }
  onDragStartHandler(pointer, gameObject) {
    if (!this.mSelectedGameObjects.includes(gameObject)) {
      this.setSelectedGameObjects(gameObject);
    }
    if (gameObject instanceof Phaser.GameObjects.Sprite) {
      const sprite = gameObject;
      this.mDisplays.forEach((val, key) => {
        if (val === sprite) {
          this.mEmitter.emit(ElementEditorEmitType.Active_Animation_Layer, key);
          Logger.getInstance().debug(ElementEditorEmitType.Active_Animation_Layer, key);
          return;
        }
      });
    } else if (gameObject instanceof dragonBones.phaser.display.ArmatureDisplay) {
      const arm = gameObject;
      this.mMountList.forEach((val, key) => {
        if (val === arm) {
          this.mEmitter.emit(ElementEditorEmitType.Active_Mount_Layer, key);
          Logger.getInstance().debug(ElementEditorEmitType.Active_Mount_Layer, key);
          return;
        }
      });
    }
  }
  onDragHandler(pointer, gameObject, dragX, dragY) {
    const delta = { x: 0, y: 0 };
    this.mSelectedGameObjects.forEach((element) => {
      if (element === gameObject) {
        delta.x = dragX - element.x;
        delta.y = dragY - element.y;
      }
    });
    this.mSelectedGameObjects.forEach((element) => {
      element.x = element.x + delta.x;
      element.y = element.y + delta.y;
    });
  }
  onDragEndHandler(pointer, gameobject) {
    this.syncPositionData();
  }
  syncPositionData() {
    if (!this.mAnimationData)
      return;
    this.mDisplays.forEach((val, key) => {
      const data = this.mAnimationData.layerDict.get(key);
      let { x, y } = val;
      x -= val.width * 0.5;
      y -= val.height * 0.5;
      if (!data.offsetLoc || data.offsetLoc.x !== x || data.offsetLoc.y !== y) {
        data.setOffsetLoc(x, y);
      }
    });
    const mountPoints = this.mAnimationData.mountLayer ? this.mAnimationData.mountLayer.mountPoint : null;
    if (mountPoints) {
      for (let i = 0; i < mountPoints.length; i++) {
        const data = mountPoints[i];
        const mountObject = this.mMountList.get(i);
        const { x, y } = mountObject;
        if (x !== data.x || y !== data.y) {
          data.x = x;
          data.y = y;
        }
      }
    }
  }
  updatePlay() {
    if (!this.mAnimationData)
      return;
    if (!this.scene) {
      Logger.getInstance().error("no scene created");
      return;
    }
    this.mDisplayDatas.clear();
    const anis = new Map();
    anis.set(this.mAnimationData.name, new AnimationModel(this.mAnimationData.createProtocolObject()));
    this.load({
      discriminator: "FramesModel",
      id: 0,
      gene: SPRITE_SHEET_KEY,
      animations: anis,
      animationName: this.mAnimationData.name
    });
    if (this.scene.textures.exists(SPRITE_SHEET_KEY)) {
      let index = 0;
      this.play({ name: this.mAnimationData.name, flip: false });
      this.mAnimationData.layerDict.forEach((val, key) => {
        const display = this.mDisplays.get(key);
        if (!display)
          return;
        if (!val.layerVisible) {
          display.visible = false;
          return;
        }
        const isSprite = display instanceof Phaser.GameObjects.Sprite;
        if (this.mPlaying) {
          display.visible = true;
        } else {
          if (isSprite)
            display.anims.stop();
          if (this.mCurFrameIdx >= val.frameName.length) {
            Logger.getInstance().warn("wrong frame idx: " + this.mCurFrameIdx + "; frameName.length: " + val.frameName.length);
            display.visible = false;
            return;
          }
          const frameName = val.frameName[this.mCurFrameIdx];
          if (!this.scene.textures.get(SPRITE_SHEET_KEY).has(frameName)) {
            Logger.getInstance().warn("donot have frame: " + frameName);
            display.visible = false;
            return;
          }
          display.setTexture(SPRITE_SHEET_KEY, frameName);
          display.setInteractive();
          this.updatePerInputEnabled(display);
          if (!val.frameVisible || this.mCurFrameIdx < val.frameVisible.length) {
            display.visible = val.frameVisible ? val.frameVisible[this.mCurFrameIdx] : true;
          }
        }
        index++;
      });
    }
    this.updateMountLayerPlay();
  }
  updateMountLayerPlay() {
    if (!this.mAnimationData)
      return;
    const mountlayer = this.mAnimationData.mountLayer;
    this.mMountList.forEach((val) => {
      this.unmount(val);
      val.destroy(true);
    });
    this.mMountList.clear();
    if (!mountlayer || !mountlayer.mountPoint)
      return;
    for (let i = 0; i < mountlayer.mountPoint.length; i++) {
      if (this.mMountList.get(i))
        continue;
      const arm = new DragonbonesEditorDisplay(this.scene, this.mConfig.osd);
      this.mount(arm, i);
      arm.load();
      const pos = { x: mountlayer.mountPoint[i].x, y: mountlayer.mountPoint[i].y };
      arm.setPosition(pos.x, pos.y);
      arm.play(this.mCurMountAnimation);
      arm.visible = true;
    }
    this.updateChildrenIdxByDepth();
    const firstLayer = this.mAnimationData.layerDict.values().next().value;
    if (mountlayer.frameVisible && mountlayer.frameVisible.length !== firstLayer.frameName.length) {
      Logger.getInstance().error("wrong data: frameName.length: " + firstLayer.frameName.length + "; mountlayer.frameVisible.length: " + mountlayer.frameVisible.length);
      return;
    }
    for (let i = 0; i < mountlayer.mountPoint.length; i++) {
      if (!this.mMountList.get(i))
        continue;
      const armature = this.mMountList.get(i);
      if (this.mPlaying) {
      } else {
        if (mountlayer.frameVisible && this.mCurFrameIdx < mountlayer.frameVisible.length) {
          const mountPointsVisible = mountlayer.frameVisible[this.mCurFrameIdx];
          const visible = this.getMaskValue(mountPointsVisible, i);
          armature.visible = visible;
        } else {
          armature.visible = true;
        }
      }
    }
  }
  onMountTimerEvent() {
    if (!this.mAnimationData || !this.mAnimationData.mountLayer || !this.mAnimationData.mountLayer.mountPoint) {
      Logger.getInstance().error("no data");
      return;
    }
    const mountlayer = this.mAnimationData.mountLayer;
    const frameDuration = [];
    const firstLayer = this.mAnimationData.layerDict.values().next().value;
    if (!firstLayer) {
      Logger.getInstance().error("no layer data");
      return;
    }
    if (firstLayer.frameName.length === 0) {
      Logger.getInstance().error("wrong frame length");
      return;
    }
    if (this.mAnimationData.frameDuration && this.mAnimationData.frameDuration.length !== firstLayer.frameName.length) {
      Logger.getInstance().error("wrong data: frameName.length: " + firstLayer.frameName.length + "; frameDuration.length: " + this.mAnimationData.frameDuration.length);
      return;
    }
    for (let i = 0; i < firstLayer.frameName.length; i++) {
      const dur = this.mAnimationData.frameDuration ? this.mAnimationData.frameDuration[i] : 0;
      frameDuration.push(1 / this.mAnimationData.frameRate + dur);
    }
    const t = 0;
    const f = 0;
    const curFrame = 0;
    for (let i = 0; i < mountlayer.mountPoint.length; i++) {
      if (!this.mMountList.get(i))
        continue;
      const armature = this.mMountList.get(i);
      if (mountlayer.frameVisible) {
        const mountPointsVisible = mountlayer.frameVisible[curFrame];
        const visible = this.getMaskValue(mountPointsVisible, i);
        armature.visible = visible;
      } else {
        armature.visible = true;
      }
    }
  }
  setSelectedGameObjects(gos) {
    this.mSelectedGameObjects.length = 0;
    this.mSelectedGameObjects = [].concat(gos);
    Logger.getInstance().debug("select game objects: ", this.mSelectedGameObjects);
  }
  getMaskValue(mask, idx) {
    return (mask >> idx) % 2 === 1;
  }
  updateInputEnabled() {
    this.mDisplays.forEach((display) => {
      this.updatePerInputEnabled(display);
    });
    this.mMountList.forEach((arm) => {
      arm.setDraggable(this.mIsInteracitve);
    });
  }
  updatePerInputEnabled(element) {
    if (element.input)
      this.scene.input.setDraggable(element, this.mIsInteracitve);
  }
  updateChildrenIdxByDepth() {
    this.list = this.list.sort((a, b) => {
      const ac = a;
      const bc = b;
      return ac.depth - bc.depth;
    });
  }
}
