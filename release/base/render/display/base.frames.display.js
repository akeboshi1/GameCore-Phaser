var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
import { BaseDisplay } from "./base.display";
import { Direction, Logger, DisplayField } from "structure";
export class BaseFramesDisplay extends BaseDisplay {
  constructor(scene, pathObj, id, nodeType) {
    super(scene, id);
    this.pathObj = pathObj;
    __publicField(this, "mFadeTween");
    __publicField(this, "mDisplayDatas", new Map());
    __publicField(this, "mScaleTween");
    __publicField(this, "mDisplays", new Map());
    __publicField(this, "mMainSprite");
    __publicField(this, "mMountContainer");
    __publicField(this, "mCurAnimation");
    __publicField(this, "mIsSetInteractive", false);
    __publicField(this, "mIsInteracitve", false);
    __publicField(this, "mPreAnimation");
    __publicField(this, "mNodeType");
    __publicField(this, "mField");
    this.mNodeType = nodeType;
    this.mID = id;
  }
  load(displayInfo, field) {
    field = !field ? DisplayField.STAGE : field;
    this.mField = field;
    this.mDisplayInfo = displayInfo;
    if (!this.framesInfo || !this.framesInfo.gene) {
      return Promise.reject("framesInfo error" + displayInfo.id);
    }
    const currentDisplay = this.mDisplayDatas.get(field);
    if (!currentDisplay || currentDisplay.gene !== displayInfo.gene) {
      this.mDisplayDatas.set(field, this.framesInfo);
    }
    if (this.scene.textures.exists(this.framesInfo.gene)) {
      this.onLoadCompleted(field);
    } else {
      const display = this.framesInfo.display;
      if (!display) {
        Logger.getInstance().debug("update frame loadError", "display is undefined");
        this.displayCreated();
        return;
      }
      if (display.texturePath === "" || display.dataPath === "") {
        Logger.getInstance().debug("update frame loadError", "\u52A8\u753B\u8D44\u6E90\u62A5\u9519\uFF1A", this.displayInfo);
        this.displayCreated();
      } else {
        this.scene.load.atlas(this.framesInfo.gene, this.pathObj.osdPath + display.texturePath, this.pathObj.osdPath + display.dataPath);
        const onAdd = (key) => {
          if (key !== this.framesInfo.gene)
            return;
          this.onAddTextureHandler(key, field, onAdd);
          if (this.scene) {
            this.scene.load.off(Phaser.Loader.Events.FILE_LOAD_ERROR, onLoadError, this);
          }
        };
        const onLoadError = (imageFile) => {
          const key = imageFile.multiFile ? imageFile.multiFile.key : imageFile.key;
          if (key !== this.framesInfo.gene)
            return;
          Logger.getInstance().debug(`update frame loadError ${imageFile.url}`);
          this.displayCreated();
        };
        this.scene.load.on(Phaser.Loader.Events.FILE_LOAD_ERROR, onLoadError, this);
        this.scene.textures.on(Phaser.Textures.Events.ADD, onAdd, this);
        this.scene.load.start();
      }
    }
    return Promise.resolve(null);
  }
  play(animation, field) {
    super.play(animation);
    if (!animation)
      return;
    const times = animation.times;
    field = !field ? DisplayField.STAGE : field;
    const data = this.mDisplayDatas.get(field);
    if (!this.scene || !data)
      return;
    if (this.scene.textures.exists(data.gene) === false) {
      return;
    }
    const aniDatas = data.animations;
    this.mCurAnimation = aniDatas.get(animation.name);
    if (!this.mCurAnimation)
      return;
    const layer = this.mCurAnimation.layer;
    this.tryCreateDisplay(data.gene, aniDatas, this.mCurAnimation);
    let display = null;
    for (let i = 0; i < layer.length; i++) {
      const { frameName, offsetLoc } = layer[i];
      display = this.mDisplays.get(layer[i].id || i);
      if (!display) {
        continue;
      }
      if (frameName.length > 1) {
        const key = `${data.gene}_${animation.name}_${i}`;
        this.makeAnimation(data.gene, key, layer[i].frameName, layer[i].frameVisible, this.mCurAnimation.frameRate, this.mCurAnimation.loop, this.mCurAnimation.frameDuration);
        const anis = display.anims;
        anis.play(key);
        if (typeof times === "number" && times !== 0) {
          anis.setRepeat(times > 0 ? times - 1 : times);
        }
      } else {
        display.setFrame(frameName[0]);
      }
      display.scaleX = animation.flip ? -1 : 1;
      this.updateBaseLoc(display, animation.flip, offsetLoc);
    }
    this.emit("updateAnimation");
    if (this.mMainSprite) {
      this.mMainSprite.on(Phaser.Animations.Events.ANIMATION_REPEAT, this.onAnimationRepeatHander, this);
    }
    if (this.mMountContainer && this.mMountContainer.parentContainer && this.mCurAnimation.mountLayer) {
      const stageContainer = this.mSprites.get(DisplayField.STAGE);
      stageContainer.moveTo(this.mMountContainer, this.mCurAnimation.mountLayer.index);
    }
    this.mPreAnimation = animation;
  }
  playEffect() {
    const data = this.mDisplayDatas.get(DisplayField.Effect);
    if (!data) {
      return;
    }
    const anis = data.animations;
    const aniName = data.animationName;
    if (!anis) {
      return;
    }
    const ani = anis.get(aniName);
    if (!ani) {
      return;
    }
    const layer = ani.layer;
    const effects = [];
    for (let i = 0; i < layer.length; i++) {
      let display;
      const { frameName, offsetLoc } = layer[i];
      if (frameName.length > 1) {
        const key = `${data.gene}_${aniName}_${i}`;
        this.makeAnimation(data.gene, key, layer[i].frameName, layer[i].frameVisible, ani.frameRate, ani.loop, ani.frameDuration);
        display = this.scene.make.sprite(void 0, false).play(key);
      } else {
        display = this.scene.make.image(void 0, false).setTexture(data.gene, frameName[0]);
      }
      display.x = offsetLoc.x + display.width * 0.5;
      display.y = offsetLoc.y + display.height * 0.5;
      effects.push(display);
    }
    if (effects.length > 1) {
      this.addAt(effects[1], DisplayField.BACKEND);
      this.mSprites.set(DisplayField.BACKEND, effects[1]);
    }
    this.addAt(effects[0], DisplayField.FRONTEND);
    this.mSprites.set(DisplayField.FRONTEND, effects[0]);
  }
  fadeIn(callback) {
    if (this.mAlpha === 0) {
      return;
    }
    this.alpha = 0;
    this.clearFadeTween();
    this.mFadeTween = this.scene.tweens.add({
      targets: this,
      alpha: this.mAlpha,
      duration: 1200,
      onComplete: () => {
        if (callback)
          callback();
      }
    });
  }
  fadeOut(callback) {
    this.clearFadeTween();
    this.mFadeTween = this.scene.tweens.add({
      targets: this,
      alpha: 0,
      duration: 1200,
      onComplete: () => {
        if (callback)
          callback();
      }
    });
  }
  setInteractive(shape, callback, dropZone) {
    this.mIsInteracitve = true;
    this.mDisplays.forEach((display) => {
      display.setInteractive({ pixelPerfect: true });
    });
    return this;
  }
  disableInteractive() {
    this.mIsInteracitve = false;
    this.mDisplays.forEach((display) => {
      display.disableInteractive();
    });
    return this;
  }
  removeDisplay(field) {
    const display = this.mSprites.get(field);
    if (display) {
      this.mSprites.delete(field);
      display.destroy();
    }
  }
  mount(display, targetIndex) {
    if (!display)
      return;
    if (!this.mCurAnimation) {
      return;
    }
    if (!this.mCurAnimation.mountLayer) {
      Logger.getInstance().error("mountLayer does not exist: ", this.mCurAnimation);
      return;
    }
    if (targetIndex !== void 0 && this.mMountList.get(targetIndex) && this.mMountList.get(targetIndex) === display) {
      return;
    }
    const { index, mountPoint } = this.mCurAnimation.mountLayer;
    if (!mountPoint) {
      Logger.getInstance().error("mount mountPoint does not exist,id:", this.id);
      return;
    }
    if (targetIndex === void 0)
      targetIndex = 0;
    if (targetIndex >= mountPoint.length) {
      Logger.getInstance().error("mount index does not exist");
      return;
    }
    let { x } = mountPoint[targetIndex];
    if (this.mAnimation.flip) {
      x = 0 - x;
    }
    display.x = x;
    display.y = mountPoint[targetIndex].y;
    if (!this.mMountContainer) {
      this.mMountContainer = this.scene.make.container(void 0, false);
    }
    if (!this.mMountContainer.parentContainer) {
      const container = this.mSprites.get(DisplayField.STAGE);
      if (container)
        container.addAt(this.mMountContainer, index);
    }
    this.mMountContainer.addAt(display, targetIndex);
    display.setRootMount(this);
    this.mMountList.set(targetIndex, display);
    if (this.mMainSprite) {
    }
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
    const list = this.mMountContainer.list;
    if (list.length <= 0 && this.mDisplays.size > 0) {
    }
  }
  destroy() {
    this.clearDisplay();
    if (this.mFadeTween) {
      this.clearFadeTween();
      this.mFadeTween = void 0;
    }
    if (this.mScaleTween) {
      this.mScaleTween.stop();
      this.mScaleTween = void 0;
    }
    this.mDisplayDatas.clear();
    super.destroy();
  }
  createDisplays(key, ani) {
    this.clearDisplay();
    const layer = ani.layer;
    let display;
    for (let i = 0; i < layer.length; i++) {
      display = this.createDisplay(key, layer[i]);
      if (display) {
        this.mDisplays.set(layer[i].id || i, display);
        this.addToStageContainer(display);
      }
    }
    this.mIsInteracitve ? this.setInteractive() : this.disableInteractive();
    this.mIsSetInteractive = true;
  }
  createDisplay(key, layer) {
    let display;
    const { frameName } = layer;
    if (frameName.length > 1) {
      display = this.scene.make.sprite(void 0, false);
      if (!this.mMainSprite) {
        this.mMainSprite = display;
      }
    } else if (frameName.length === 1) {
      display = this.scene.make.image({ key, frame: frameName[0] });
    } else {
      return;
    }
    display.setData("id", this.mID);
    return display;
  }
  clearFadeTween() {
    if (this.mFadeTween) {
      this.mFadeTween.stop();
      this.mFadeTween.remove();
    }
  }
  completeFrameAnimationQueue() {
  }
  tryCreateDisplay(key, animations, newAni) {
    if (!this.mPreAnimation) {
      this.createDisplays(key, newAni);
      return;
    }
    if (this.mPreAnimation.name === newAni.name) {
      return;
    }
    const oldAni = animations.get(this.mPreAnimation.name);
    if (!oldAni) {
      return;
    }
    const oldLayer = oldAni.layer;
    const newLayer = newAni.layer;
    if (oldLayer.length !== newLayer.length) {
      this.createDisplays(key, newAni);
      return;
    }
    for (let i = 0; i < oldLayer.length; i++) {
      const oldFrames = oldLayer[i].frameName;
      const newFrames = newLayer[i].frameName;
      if (oldFrames.length !== newFrames.length) {
        this.createDisplays(key, newAni);
        return;
      } else {
        const oldId = oldLayer[i].id;
        const newId = newLayer[i].id;
        if (oldId === newId)
          continue;
        const oldDisplay = this.mDisplays.get(oldId);
        if (oldDisplay) {
          this.mDisplays.set(newId, oldDisplay);
          this.mDisplays.delete(oldId);
        }
      }
    }
  }
  clearDisplay() {
    this.mDisplays.forEach((display) => display.destroy());
    this.mMountList.clear();
    this.mDisplays.clear();
    this.mMainSprite = null;
    this.mPreAnimation = null;
  }
  onAddTextureHandler(key, field, cb) {
    if (field === void 0) {
      field = DisplayField.STAGE;
    }
    const data = this.mDisplayDatas.get(field);
    if (data && data.gene === key) {
      this.scene.textures.off(Phaser.Textures.Events.ADD, cb, this);
      this.onLoadCompleted(field);
    } else {
      Logger.getInstance().debug("no addtexture", this, data, field);
    }
  }
  mAllLoadCompleted() {
    this.scene.load.off(Phaser.Loader.Events.COMPLETE, this.mAllLoadCompleted, this);
    this.onLoadCompleted(this.mField);
  }
  onLoadCompleted(field) {
    this.clearDisplay();
    const data = this.mDisplayDatas.get(field);
    if (!data) {
      return;
    }
    if (this.scene.textures.exists(data.gene)) {
      if (field === DisplayField.STAGE) {
        if (this.mAnimation) {
          this.play(this.mAnimation);
        } else {
          let flip = false;
          switch (data.avatarDir) {
            case Direction.south_east:
            case Direction.east_north:
              flip = true;
              break;
            case Direction.west_south:
            case Direction.north_west:
              break;
          }
          this.play({ name: data.animationName, flip });
        }
      } else {
        this.playEffect();
      }
    }
    this.displayCreated();
  }
  makeAnimation(gen, key, frameName, frameVisible, frameRate, loop, frameDuration) {
    if (frameVisible && frameName.length !== frameVisible.length) {
      Logger.getInstance().error("wrong data: frameName.length: " + frameName.length + "; frameVisible.length: " + frameVisible.length);
      return;
    }
    if (frameDuration && frameName.length !== frameDuration.length) {
      Logger.getInstance().error("wrong data: frameName.length: " + frameName.length + "; frameDuration.length: " + frameDuration.length);
      return;
    }
    if (this.scene.anims.exists(key)) {
      return;
    }
    const frames = [];
    for (let i = 0; i < frameName.length; i++) {
      const frame = frameName[i];
      const visible = frameVisible ? frameVisible[i] : true;
      if (frameDuration) {
        frames.push({ key: gen, frame, duration: frameDuration[i] * 1e3, visible });
      } else {
        frames.push({ key: gen, frame, visible });
      }
    }
    const repeat = loop ? -1 : 0;
    const config = {
      key,
      frames,
      frameRate,
      repeat
    };
    this.scene.anims.create(config);
  }
  updateBaseLoc(display, flip, offsetLoc) {
    if (!offsetLoc)
      offsetLoc = { x: 0, y: 0 };
    let x = offsetLoc.x;
    const y = offsetLoc.y;
    if (flip) {
      x = 0 - (display.width + x);
    }
    display.x = x + display.width * 0.5;
    display.y = y + display.height * 0.5;
  }
  onAnimationRepeatHander() {
    const queue = this.mAnimation.playingQueue;
    if (!queue)
      return;
    if (queue.playedTimes === void 0) {
      queue.playedTimes = 1;
    } else {
      queue.playedTimes++;
    }
    if (queue.playedTimes >= queue.playTimes) {
      if (this.mMainSprite) {
        this.mMainSprite.off(Phaser.Animations.Events.ANIMATION_REPEAT, this.onAnimationRepeatHander, this);
      }
      this.completeFrameAnimationQueue();
    }
  }
  addToStageContainer(display) {
    if (!display) {
      return;
    }
    let container = this.mSprites.get(DisplayField.STAGE);
    if (!container) {
      container = this.scene.make.container(void 0, false);
      container.setData("id", this.mID);
      this.addAt(container, DisplayField.STAGE);
      this.mSprites.set(DisplayField.STAGE, container);
    }
    container.add(display);
  }
  get framesInfo() {
    return this.mDisplayInfo;
  }
  get spriteWidth() {
    let width = 0;
    if (this.mDisplays) {
      this.mDisplays.forEach((display) => {
        if (display.width > width)
          width = display.width;
      });
    }
    return width;
  }
  get spriteHeight() {
    let height = 0;
    if (this.mDisplays) {
      this.mDisplays.forEach((display) => {
        if (display.width > height)
          height = display.height;
      });
    }
    return height;
  }
  get topPoint() {
    return new Phaser.Geom.Point(0, -this.spriteHeight);
  }
  get nodeType() {
    return this.mNodeType;
  }
}
