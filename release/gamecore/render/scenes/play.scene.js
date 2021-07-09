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
import { BaseLayer, GroundLayer, PlayCamera, SurfaceLayer } from "baseRender";
import { MainUIScene } from "./main.ui.scene";
import { RoomScene } from "./room.scene";
import { Logger, LayerName, PlaySceneLoadState, SceneName } from "structure";
import { MotionManager } from "../input/motion.manager";
export class PlayScene extends RoomScene {
  constructor(config) {
    super(config || { key: SceneName.PLAY_SCENE });
    __publicField(this, "motion");
    __publicField(this, "mLoadState");
    __publicField(this, "cameraMovable", true);
    this.loadState = PlaySceneLoadState.CREATING_SCENE;
  }
  preload() {
    super.preload();
  }
  get motionMgr() {
    return this.motion;
  }
  create() {
    this.loadState = PlaySceneLoadState.CREATING_ROOM;
    Logger.getInstance().debug("create playscene");
    const oldCamera = this.cameras.main;
    const { width, height } = this.sys.scale;
    this.cameras.addExisting(new PlayCamera(0, 0, width, height, this.render.scaleRatio), true);
    this.cameras.remove(oldCamera);
    if (!this.game.scene.getScene(MainUIScene.name)) {
      this.game.scene.add(MainUIScene.name, MainUIScene, false);
    }
    const scene = this.game.scene.getScene(MainUIScene.name);
    if (!scene.scene.isActive()) {
      this.scene.launch(MainUIScene.name, {
        "render": this.render
      });
      const sceneManager = this.render.sceneManager;
      sceneManager.bringToTop(SceneName.LOADING_SCENE);
    } else {
      this.render.initUI();
    }
    this.scene.sendToBack();
    this.render.sceneManager.setMainScene(this);
    this.initMotion();
    this.render.camerasManager.startRoomPlay(this);
    this.layerManager.addLayer(this, BaseLayer, LayerName.GROUNDCLICK, 1);
    this.layerManager.addLayer(this, BaseLayer, LayerName.GROUND2, 2);
    this.layerManager.addLayer(this, GroundLayer, LayerName.WALL, 2).setScale(this.render.scaleRatio);
    this.layerManager.addLayer(this, GroundLayer, LayerName.HANGING, 3).setScale(this.render.scaleRatio);
    this.layerManager.addLayer(this, GroundLayer, LayerName.GROUND, 4).setScale(this.render.scaleRatio);
    this.layerManager.addLayer(this, BaseLayer, LayerName.MIDDLE, 5).setScale(this.render.scaleRatio);
    this.layerManager.addLayer(this, GroundLayer, LayerName.FLOOR, 5).setScale(this.render.scaleRatio);
    this.layerManager.addLayer(this, SurfaceLayer, LayerName.SURFACE, 6).setScale(this.render.scaleRatio);
    this.layerManager.addLayer(this, SurfaceLayer, LayerName.DECORATE, 7).setScale(this.render.scaleRatio);
    this.layerManager.addLayer(this, BaseLayer, LayerName.ATMOSPHERE, 7);
    this.layerManager.addLayer(this, BaseLayer, LayerName.SCENEUI, 8);
    this.render.startRoomPlay();
    this.render.changeScene(this);
    super.create();
  }
  update(time, delta) {
    this.render.updateRoom(time, delta);
    this.layerManager.update(time, delta);
    if (this.motion)
      this.motion.update(time, delta);
  }
  getKey() {
    return this.sys.config.key;
  }
  snapshot() {
    return __async(this, null, function* () {
    });
  }
  get loadState() {
    return this.mLoadState;
  }
  set loadState(val) {
    if (val === this.mLoadState)
      return;
    Logger.getInstance().debug("PlayScene change loadState: ", val);
    this.mLoadState = val;
    if (val === PlaySceneLoadState.LOAD_COMPOLETE) {
      this.render.hideLoading();
    }
  }
  onRoomCreated() {
    this.loadState = PlaySceneLoadState.LOAD_COMPOLETE;
  }
  pauseMotion() {
    if (this.motion)
      this.motion.pauser();
  }
  resumeMotion() {
    if (this.motion)
      this.motion.resume();
  }
  enableCameraMove() {
    this.cameraMovable = true;
  }
  disableCameraMove() {
    this.cameraMovable = false;
    this.removePointerMoveHandler();
  }
  initMotion() {
    this.motion = new MotionManager(this.render);
    this.motion.setScene(this);
  }
  initListener() {
    this.input.on("pointerdown", this.onPointerDownHandler, this);
    this.input.on("pointerup", this.onPointerUpHandler, this);
  }
  onPointerDownHandler(pointer, currentlyOver) {
    if (!this.cameraMovable)
      return;
    this.render.emitter.emit("pointerScene", SceneName.PLAY_SCENE, currentlyOver);
    this.addPointerMoveHandler();
  }
  onPointerUpHandler(pointer) {
    if (!this.cameraMovable)
      return;
    this.removePointerMoveHandler();
  }
  addPointerMoveHandler() {
    this.input.on("pointermove", this.onPointerMoveHandler, this);
    this.input.on("gameout", this.onGameOutHandler, this);
  }
  removePointerMoveHandler() {
    this.input.off("pointermove", this.onPointerMoveHandler, this);
    this.input.off("gameout", this.onGameOutHandler, this);
    if (this.render.camerasManager.moving) {
      this.render.syncCameraScroll();
      this.render.camerasManager.moving = false;
    }
  }
  onPointerMoveHandler(pointer) {
    if (!this.render.camerasManager.targetFollow) {
      this.render.camerasManager.offsetScroll(pointer.prevPosition.x - pointer.position.x, pointer.prevPosition.y - pointer.position.y);
    }
  }
  onGameOutHandler() {
    this.removePointerMoveHandler();
  }
}
