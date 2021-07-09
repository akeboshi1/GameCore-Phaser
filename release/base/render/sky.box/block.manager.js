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
import { Logger, Fit } from "structure";
import { DynamicImage } from "../ui/components/dynamic.image";
export class BlockManager {
  constructor(scenery, render) {
    this.render = render;
    __publicField(this, "mContainer");
    __publicField(this, "mRows", 1);
    __publicField(this, "mCols", 1);
    __publicField(this, "mGridWidth");
    __publicField(this, "mGridHeight");
    __publicField(this, "mGrids");
    __publicField(this, "mUris");
    __publicField(this, "mMainCamera");
    __publicField(this, "mScaleRatio");
    __publicField(this, "mSceneName", "");
    __publicField(this, "scene");
    __publicField(this, "mScenery");
    __publicField(this, "mCameras");
    __publicField(this, "mStateMap");
    __publicField(this, "_bound");
    __publicField(this, "tween");
    this.mGrids = [];
    this.mScenery = scenery;
    this.mUris = scenery.uris;
    this.mCameras = render.camerasManager;
    this.mMainCamera = this.mCameras.camera;
    this._bound = this.mMainCamera.getBounds();
    this.mScaleRatio = this.render.scaleRatio;
    this.setSize(scenery.width, scenery.height);
    const playScene = render.getMainScene();
    if (!playScene) {
      Logger.getInstance().fatal(`${BlockManager.name} scene does not exist`);
      return;
    }
    this.mSceneName = `SkyBoxScene_${scenery.id}`;
    const sceneManager = this.render.sceneManager;
    if (!sceneManager) {
      Logger.getInstance().fatal("scene manager does not exist");
    }
    sceneManager.launchScene(sceneManager.getMainScene(), this.mSceneName, "SkyBoxScene", this);
    this.updateDepth();
  }
  startPlay(scene) {
    this.scene = scene;
    this.initBlock();
    if (this.mStateMap) {
      this.mStateMap.forEach((state) => this.handlerState(state));
    }
  }
  check(time, delta) {
    const worldView = this.mMainCamera.worldView;
    const viewPort = new Phaser.Geom.Rectangle(worldView.x - worldView.width / 2, worldView.y - worldView.height / 2, worldView.width * 2, worldView.height * 2);
    for (const block of this.mGrids) {
      block.checkCamera(Phaser.Geom.Intersects.RectangleToRectangle(viewPort, block.rectangle));
    }
  }
  update(scenery) {
    this.mScenery = scenery;
    this.mUris = scenery.uris;
    this.setSize(scenery.width, scenery.height);
    this.initBlock();
    this.updateDepth();
  }
  setSize(imageW, imageH, gridW, gridH) {
    if (this.mUris.length === 0) {
      return;
    }
    let cols = 1;
    let rows = 1;
    if (this.mUris.length > 1 || this.mUris[0].length > 1) {
      cols = imageW / 1024;
      rows = imageH / 1024;
    }
    this.mCols = Math.round(cols);
    this.mRows = Math.round(rows);
    this.mGridWidth = imageW / this.mCols;
    this.mGridHeight = imageH / this.mRows;
  }
  resize(width, height) {
    if (!this.scene || !this.mMainCamera) {
      return;
    }
    const camera = this.scene.cameras.main;
    if (!camera) {
      return;
    }
    this.mScaleRatio = this.render.scaleRatio;
    this.updatePosition();
    this._bound = this.mMainCamera.getBounds();
    camera.setBounds(this._bound.x, this._bound.y, this._bound.width, this._bound.height);
    for (const grid of this.mGrids) {
      grid.setScaleRatio(this.mScaleRatio);
      grid.resize(width, height);
    }
  }
  updateScale(val) {
    this.mContainer.setScale(val);
    for (const grid of this.mGrids) {
      grid.setScaleRatio(val);
    }
    this.updatePosition();
  }
  getLayer() {
    return this.mContainer;
  }
  updatePosition() {
    return __async(this, null, function* () {
      const { offset } = this.mScenery;
      const loc = yield this.fixPosition({ x: offset.x, y: offset.y });
      this.mContainer.setPosition(loc.x, loc.y);
      for (const block of this.mGrids) {
        block.updatePosition();
      }
    });
  }
  destroy() {
    if (this.render && this.render.game) {
      this.render.game.scene.remove(this.mSceneName);
    }
    this.mGrids.length = 0;
  }
  setState(state) {
    this.handlerState(state);
  }
  playSkyBoxAnimation(packet) {
    return __async(this, null, function* () {
      const { id, targets, duration, reset, resetDuration } = packet;
      if (id === void 0 || targets === void 0 || duration === void 0) {
        return;
      }
      if (!this.scene || !this.mContainer) {
        return;
      }
      if (id !== this.mScenery.id) {
        return;
      }
      const targetPos = yield this.fixPosition(targets);
      const resetPos = yield this.fixPosition(reset);
      this.move(this.mContainer, targetPos, duration, resetPos, resetDuration);
    });
  }
  handlerState(state) {
    for (const prop of state) {
      if (this.mScenery.id === prop.id) {
        this.playSkyBoxAnimation(prop);
      }
    }
  }
  updateDepth() {
    if (!this.render) {
      return;
    }
    const playScene = this.render.getMainScene();
    if (!this.mScenery || !playScene) {
      Logger.getInstance().fatal(`scene does not exist`);
      return;
    }
    const scene = this.render.game.scene.getScene(this.mSceneName);
    if (!scene) {
      return;
    }
    if (this.mScenery.depth < 0) {
      scene.scene.sendToBack(this.mSceneName);
    } else {
      scene.scene.moveAbove(playScene.sys.settings.key, this.mSceneName);
    }
  }
  initBlock() {
    this.clear();
    this.mContainer = this.scene.add.container(0, 0);
    this.mContainer.setScale(this.render.scaleRatio);
    const len = this.mUris.length;
    if (this.mScenery.fit === Fit.Repeat) {
    } else {
      for (let i = 0; i < len; i++) {
        const l = this.mUris[i].length;
        for (let j = 0; j < l; j++) {
          const block = new Block(this.scene, this.mUris[i][j], this.mScaleRatio, this.render.url);
          block.setRectangle(j * this.mGridWidth, i * this.mGridHeight, this.mGridWidth, this.mGridHeight);
          this.mGrids.push(block);
        }
      }
    }
    this.mContainer.add(this.mGrids);
    this.initCamera();
  }
  move(targets, props, duration, resetProps, resetDuration) {
    if (this.tween) {
      this.tween.stop();
      this.tween.removeAllListeners();
    }
    this.tween = this.scene.tweens.add({
      targets,
      props,
      duration,
      loop: -1,
      onUpdate: () => {
        for (const block of this.mGrids) {
          block.updatePosition();
        }
      }
    });
    if (resetProps) {
      this.tween.once("loop", () => {
        if (resetProps) {
          targets.x = resetProps.x;
          targets.y = resetProps.y;
        }
        this.tween.stop();
        this.move(targets, props, resetDuration);
      });
    }
  }
  initCamera() {
    const camera = this.scene.cameras.main;
    if (this.mCameras) {
      camera.setBounds(this._bound.x, this._bound.y, this._bound.width, this._bound.height);
      this.updatePosition();
      camera.setScroll(this.mMainCamera.scrollX, this.mMainCamera.scrollY);
      this.mCameras.addCamera(camera);
    }
  }
  clear() {
    for (const grid of this.mGrids) {
      grid.destroy();
    }
    this.mGrids.length = 0;
    if (this.mContainer) {
      this.mContainer.destroy(true);
    }
  }
  get scenery() {
    return this.mScenery;
  }
  get scaleRatio() {
    return this.mScaleRatio;
  }
  fixPosition(props) {
    return __async(this, null, function* () {
      if (!props)
        return;
      const offset = yield this.getOffset();
      if (props.x !== void 0) {
        props.x = (offset.x + props.x) * this.render.scaleRatio;
      }
      if (props.y !== void 0) {
        props.y = (offset.y + props.y) * this.render.scaleRatio;
      }
      return props;
    });
  }
  getOffset() {
    return __async(this, null, function* () {
      const os = { x: 0, y: 0 };
      let x = 0;
      let y = 0;
      if (this.mScenery) {
        if (this.mScenery.fit === Fit.Center) {
          const size = yield this.render.getCurrentRoomSize();
          const { width, height } = this.mScenery;
          x = -width >> 1;
          y = size.sceneHeight - height >> 1;
        }
      }
      return Promise.resolve({ x, y });
    });
  }
}
class Block extends DynamicImage {
  constructor(scene, key, scale, url) {
    super(scene, 0, 0);
    this.url = url;
    __publicField(this, "mLoaded", false);
    __publicField(this, "mInCamera", false);
    __publicField(this, "mKey");
    __publicField(this, "mRectangle");
    __publicField(this, "mScale");
    this.mKey = key;
    this.mScale = scale;
    this.setOrigin(0);
  }
  checkCamera(val) {
    if (this.mInCamera !== val) {
      this.mInCamera = val;
      this.visible = val;
      if (this.mLoaded) {
      } else {
        this.load(this.url.getOsdRes(this.mKey));
      }
    }
  }
  setRectangle(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.setSize(width, height);
    const parentX = this.parentContainer ? this.parentContainer.x : 0;
    const parentY = this.parentContainer ? this.parentContainer.y : 0;
    this.mRectangle = new Phaser.Geom.Rectangle(x * this.mScale + parentX, y * this.mScale + parentY, width * this.mScale, height * this.mScale);
  }
  updatePosition() {
    if (this.mRectangle) {
      this.mRectangle.x = this.x * this.mScale + (this.parentContainer ? this.parentContainer.x : 0);
      this.mRectangle.y = this.y * this.mScale + (this.parentContainer ? this.parentContainer.y : 0);
    }
  }
  resize(width, height) {
    this.setRectangle(this.x, this.y, this.width, this.height);
  }
  setScaleRatio(val) {
    this.mScale = val;
  }
  get rectangle() {
    return this.mRectangle;
  }
  get key() {
    return this.mKey;
  }
  onLoadComplete(file) {
    super.onLoadComplete(file);
    if (this.texture) {
      this.mLoaded = true;
      this.texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
    }
  }
}
