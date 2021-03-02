import { Logger } from "utils";
import { PlayCamera } from "../cameras/play.camera";
import { BaseLayer, GroundLayer, SurfaceLayer } from "baseRender";
import { MainUIScene } from "./main.ui.scene";
import { RoomScene } from "./room.scene";
import { Size } from "src/utils/size";
import { PlaySceneLoadState, SceneName } from "structure";
import {MotionManager} from "../input/motion.manager";
import { LayerEnum } from "game-capsule";

// 游戏正式运行用 Phaser.Scene
export class PlayScene extends RoomScene {
    public static LAYER_GROUNDCLICK = "groundClickLayer";
    public static LAYER_GROUND2 = "groundLayer2";
    public static LAYER_GROUND = LayerEnum.Terrain.toString();
    public static LAYER_MIDDLE = "middleLayer";
    public static LAYER_FLOOR = LayerEnum.Floor.toString();
    public static LAYER_SURFACE = LayerEnum.Surface.toString();
    public static LAYER_WALL = LayerEnum.Wall.toString();
    public static LAYER_ATMOSPHERE = "atmosphere";
    public static LAYER_SCENEUI = "sceneUILayer";
    protected motion: MotionManager;
    protected mLoadState: PlaySceneLoadState;

    constructor(config?: string | Phaser.Types.Scenes.SettingsConfig) {
        super(config || { key: SceneName.PLAY_SCENE });
        this.loadState = PlaySceneLoadState.CREATING_SCENE;
    }

    public preload() {
        super.preload();
    }

    get motionMgr(): MotionManager {
        return this.motion;
    }

    public create() {
        this.loadState = PlaySceneLoadState.CREATING_ROOM;
        Logger.getInstance().debug("create playscene");
        const oldCamera = this.cameras.main;
        const { width, height } = this.sys.scale;
        this.cameras.addExisting(
            new PlayCamera(0, 0, width, height, this.render.scaleRatio),
            true
        );
        this.cameras.remove(oldCamera);

        if (!this.game.scene.getScene(MainUIScene.name)) {
            this.game.scene.add(MainUIScene.name, MainUIScene, false);
        }
        const scene = this.game.scene.getScene(MainUIScene.name);
        if (!scene.scene.isActive()) {
            this.scene.launch(MainUIScene.name, {
                "render": this.render,
            });
            const sceneManager = this.render.sceneManager;
            sceneManager.bringToTop(SceneName.LOADING_SCENE);
        } else {
            this.render.initUI();
            // this.mRoom.initUI();
        }
        this.scene.sendToBack();
        this.scale.on("orientationchange", this.checkOriention, this);
        this.scale.on("resize", this.checkSize, this);

        // ======= render startPlay
        this.render.sceneManager.setMainScene(this);
        this.initMotion();
        this.render.camerasManager.startRoomPlay(this);

        // this.onLoadCompleteHandler();

        // set layers
        // ==========背景层
        this.layerManager.addLayer(this, BaseLayer, PlayScene.LAYER_GROUNDCLICK, 1);
        this.layerManager.addLayer(this, BaseLayer, PlayScene.LAYER_GROUND2, 2);

        // ==========舞台层
        this.layerManager.addLayer(this, GroundLayer, PlayScene.LAYER_WALL, 2).setScale(this.render.scaleRatio);
        this.layerManager.addLayer(this, GroundLayer, PlayScene.LAYER_GROUND, 3).setScale(this.render.scaleRatio);
        this.layerManager.addLayer(this, BaseLayer, PlayScene.LAYER_MIDDLE, 4).setScale(this.render.scaleRatio);
        this.layerManager.addLayer(this, GroundLayer, PlayScene.LAYER_FLOOR, 4).setScale(this.render.scaleRatio);
        this.layerManager.addLayer(this, SurfaceLayer, PlayScene.LAYER_SURFACE, 5).setScale(this.render.scaleRatio);
        this.layerManager.addLayer(this, BaseLayer, PlayScene.LAYER_ATMOSPHERE, 6);
        this.layerManager.addLayer(this, BaseLayer, PlayScene.LAYER_SCENEUI, 7);

        // ======= mainworker startPlay
        this.render.startRoomPlay();
        this.render.changeScene(this);
        super.create();
    }

    update(time: number, delta: number) {
        this.render.updateRoom(time, delta);
        this.layerManager.update(time, delta);
        if (this.motion) this.motion.update(time, delta);
    }

    // setViewPort(x: number, y: number, width: number, height: number) {
    //     super.setViewPort(x, y, width, height);
    //     this.cameras.main.zoom = Math.ceil(window.devicePixelRatio);
    // }

    getKey(): string {
        return (this.sys.config as Phaser.Types.Scenes.SettingsConfig).key;
    }

    get loadState(): PlaySceneLoadState {
        return this.mLoadState;
    }
    set loadState(val: PlaySceneLoadState) {
        if (val === this.mLoadState) return;
        Logger.getInstance().debug("PlayScene change loadState: ", val);
        this.mLoadState = val;

        if (val === PlaySceneLoadState.LOAD_COMPOLETE) {
            this.render.hideLoading();
        }
    }

    onRoomCreated() {
        this.loadState = PlaySceneLoadState.LOAD_COMPOLETE;
    }

    protected initMotion() {
        this.motion = new MotionManager(this.render);
        this.motion.setScene(this);
    }

    protected initListener() {
        this.input.on("pointerdown", this.onPointerDownHandler, this);
        this.input.on("pointerup", this.onPointerUpHandler, this);
        // this.load.on(Phaser.Loader.Events.COMPLETE, this.onLoadCompleteHandler, this);
    }

    protected onPointerDownHandler(pointer: Phaser.Input.Pointer, currentlyOver: Phaser.GameObjects.GameObject[]) {
        this.render.emitter.emit("pointerScene", SceneName.PLAY_SCENE, currentlyOver);
        this.addPointerMoveHandler();
    }

    protected onPointerUpHandler(pointer: Phaser.Input.Pointer) {
        this.removePointerMoveHandler();
    }

    protected addPointerMoveHandler() {
        this.input.on("pointermove", this.onPointerMoveHandler, this);
        this.input.on("gameout", this.onGameOutHandler, this);
    }

    protected removePointerMoveHandler() {
        this.input.off("pointermove", this.onPointerMoveHandler, this);
        this.input.off("gameout", this.onGameOutHandler, this);
        if (this.render.camerasManager.moving) {
            this.render.syncCameraScroll();
            this.render.camerasManager.moving = false;
        }
    }

    protected onPointerMoveHandler(pointer: Phaser.Input.Pointer) {
        if (!this.render.camerasManager.targetFollow) {
            this.render.camerasManager.offsetScroll(
                pointer.prevPosition.x - pointer.position.x,
                pointer.prevPosition.y - pointer.position.y
            );
        }
    }

    protected onGameOutHandler() {
        this.removePointerMoveHandler();
    }

    // protected onLoadCompleteHandler() {
    //     Logger.getInstance().debug("playload complete");
    //     this.load.off(Phaser.Loader.Events.COMPLETE, this.onLoadCompleteHandler, this);
    //     this.render.hideLoading();
    // }

    protected checkOriention(orientation) {
        if (orientation === Phaser.Scale.PORTRAIT) {
        } else if (orientation === Phaser.Scale.LANDSCAPE) {
        }
    }

    protected checkSize(size: Size) {
        const width: number = size.width;
        const height: number = size.height;
    }
}
