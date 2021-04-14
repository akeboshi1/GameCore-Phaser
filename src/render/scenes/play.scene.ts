import { Logger, Url } from "utils";
import { PlayCamera } from "../cameras/play.camera";
import { BaseLayer, GroundLayer, SurfaceLayer } from "baseRender";
import { MainUIScene } from "./main.ui.scene";
import { RoomScene } from "./room.scene";
import { LayerName, PlaySceneLoadState, SceneName} from "structure";
import { MotionManager } from "../input/motion.manager";
import { LayerEnum } from "game-capsule";

// 游戏正式运行用 Phaser.Scene
export class PlayScene extends RoomScene {
    protected motion: MotionManager;
    protected mLoadState: PlaySceneLoadState;
    private cameraMovable: boolean = true;

    constructor(config?: string | Phaser.Types.Scenes.SettingsConfig) {
        super(config || { key: SceneName.PLAY_SCENE });
        this.loadState = PlaySceneLoadState.CREATING_SCENE;
    }

    public preload() {
        this.load.audio("click", Url.getRes("sound/click.mp3"));
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
        }
        this.scene.sendToBack();

        // ======= render startPlay
        this.render.sceneManager.setMainScene(this);
        this.initMotion();
        this.render.camerasManager.startRoomPlay(this);

        // set layers
        // ==========背景层
        this.layerManager.addLayer(this, BaseLayer, LayerName.GROUNDCLICK, 1);
        this.layerManager.addLayer(this, BaseLayer, LayerName.GROUND2, 2);

        // ==========舞台层
        this.layerManager.addLayer(this, GroundLayer, LayerName.WALL, 2).setScale(this.render.scaleRatio);
        this.layerManager.addLayer(this, GroundLayer, LayerName.GROUND, 3).setScale(this.render.scaleRatio);
        this.layerManager.addLayer(this, BaseLayer, LayerName.MIDDLE, 4).setScale(this.render.scaleRatio);
        this.layerManager.addLayer(this, GroundLayer, LayerName.FLOOR, 4).setScale(this.render.scaleRatio);
        this.layerManager.addLayer(this, SurfaceLayer, LayerName.SURFACE, 5).setScale(this.render.scaleRatio);
        this.layerManager.addLayer(this, SurfaceLayer, LayerName.DECORATE, 6).setScale(this.render.scaleRatio);
        this.layerManager.addLayer(this, BaseLayer, LayerName.ATMOSPHERE, 6);
        this.layerManager.addLayer(this, BaseLayer, LayerName.SCENEUI, 7);

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

    public pauseMotion() {
        if (this.motion) this.motion.pauser();
    }

    public resumeMotion() {
        if (this.motion) this.motion.resume();
    }

    public enableCameraMove() {
        this.cameraMovable = true;
    }

    public disableCameraMove() {
        this.cameraMovable = false;

        this.removePointerMoveHandler();
    }

    protected initMotion() {
        this.motion = new MotionManager(this.render);
        this.motion.setScene(this);
    }

    protected initListener() {
        this.input.on("pointerdown", this.onPointerDownHandler, this);
        this.input.on("pointerup", this.onPointerUpHandler, this);
    }

    protected onPointerDownHandler(pointer: Phaser.Input.Pointer, currentlyOver: Phaser.GameObjects.GameObject[]) {
        if (!this.cameraMovable) return;
        this.render.emitter.emit("pointerScene", SceneName.PLAY_SCENE, currentlyOver);
        this.addPointerMoveHandler();
    }

    protected onPointerUpHandler(pointer: Phaser.Input.Pointer) {
        if (!this.cameraMovable) return;
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
}
