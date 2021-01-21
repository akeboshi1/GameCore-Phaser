import { Logger } from "utils";
import { PlayCamera } from "../cameras/play.camera";
import { BaseLayer, GroundLayer, SurfaceLayer } from "base";
import { MainUIScene } from "./main.ui.scene";
import { RoomScene } from "./room.scene";
import { Size } from "src/utils/size";
import { PlaySceneLoadState, SceneName } from "structure";
import { MotionManager } from "../input/motion.manager";

// 游戏正式运行用 Phaser.Scene
export class PlayScene extends RoomScene {
    public readonly LAYER_GROUNDCLICK = "groundClickLayer";
    public readonly LAYER_GROUND2 = "groundLayer2";
    public readonly LAYER_GROUND = "groundLayer";
    public readonly LAYER_MIDDLE = "middleLayer";
    public readonly LAYER_SURFACE = "surfaceLayer";
    public readonly LAYER_ATMOSPHERE = "atmosphere";
    public readonly LAYER_SCENEUI = "sceneUILayer";
    protected motionManager: MotionManager;
    protected mLoadState: PlaySceneLoadState;
    constructor(config?: string | Phaser.Types.Scenes.SettingsConfig) {
        super(config || { key: SceneName.PLAY_SCENE });
        this.loadState = PlaySceneLoadState.CREATING_SCENE;
    }

    get motionMgr(): MotionManager {
        return this.motionManager;
    }

    public create() {
        this.loadState = PlaySceneLoadState.CREATING_ROOM;
        Logger.getInstance().log("create playscene");
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
        } else {
            this.render.initUI();
            // this.mRoom.initUI();
        }
        this.scene.sendToBack();
        this.scale.on("orientationchange", this.checkOriention, this);
        this.scale.on("resize", this.checkSize, this);

        // ======= render startPlay
        this.render.sceneManager.setMainScene(this);
        this.initInput();
        this.render.camerasManager.startRoomPlay(this);

        // this.onLoadCompleteHandler();

        // set layers
        // ==========背景层
        this.layerManager.addLayer(this, BaseLayer, this.LAYER_GROUNDCLICK, 1);
        this.layerManager.addLayer(this, BaseLayer, this.LAYER_GROUND2, 2);

        // ==========舞台层
        this.layerManager.addLayer(this, GroundLayer, this.LAYER_GROUND, 3).setScale(this.render.scaleRatio);
        this.layerManager.addLayer(this, BaseLayer, this.LAYER_MIDDLE, 4).setScale(this.render.scaleRatio);
        this.layerManager.addLayer(this, SurfaceLayer, this.LAYER_SURFACE, 5).setScale(this.render.scaleRatio);
        this.layerManager.addLayer(this, BaseLayer, this.LAYER_ATMOSPHERE, 6);
        this.layerManager.addLayer(this, BaseLayer, this.LAYER_SCENEUI, 7);

        // ======= mainworker startPlay
        this.render.startRoomPlay();
        this.render.changeScene(this);

        // Logger.getInstance().log("sort-display: ", sort.addFixedDisplayObject);

        this.initListener();
        super.create();
    }

    update(time: number, delta: number) {
        this.render.updateRoom(time, delta);
        this.layerManager.update(time, delta);
        if (this.motionManager) this.motionManager.update(time, delta);
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

        Logger.getInstance().log("PlayScene change loadState: ", val);
        this.mLoadState = val;

        if (val === PlaySceneLoadState.LOAD_COMPOLETE) {
            this.render.hideLoading();
        }
    }

    onRoomCreated() {
        this.loadState = PlaySceneLoadState.LOAD_COMPOLETE;
    }

    protected initInput() {
        this.motionManager = new MotionManager(this.render);
        this.motionManager.setScene(this);
    }

    protected initListener() {
        this.input.on("pointerdown", this.onPointerDownHandler, this);
        this.input.on("pointerup", this.onPointerUpHandler, this);
        // this.load.on(Phaser.Loader.Events.COMPLETE, this.onLoadCompleteHandler, this);
    }

    protected onPointerDownHandler(pointer: Phaser.Input.Pointer) {
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
    //     Logger.getInstance().log("playload complete");
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
