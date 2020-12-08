import { LoadingTips } from "../loadqueue/loading.tips";
import { Logger } from "utils";
import { PlayCamera } from "../cameras/play.camera";
import { BasicLayer } from "../managers/layer.manager";
import { MainUIScene } from "./main.ui.scene";
import { RoomScene } from "./room.scene";
import { Size } from "src/utils/size";
import { SceneName } from "structure";
import { MotionManager } from "../input/motion.manager";

// 游戏正式运行用 Phaser.Scene
export class PlayScene extends RoomScene {
    protected readonly LAYER_GROUNDCLICK = "groundClickLayer";
    protected readonly LAYER_GROUND2 = "groundLayer2";
    protected readonly LAYER_GROUND = "groundLayer";
    protected readonly LAYER_MIDDLE = "middleLayer";
    protected readonly LAYER_SURFACE = "surfaceLayer";
    protected readonly LAYER_ATMOSPHERE = "atmosphere";
    protected readonly LAYER_SCENEUI = "sceneUILayer";

    protected motionManager: MotionManager;

    constructor(config?: string | Phaser.Types.Scenes.SettingsConfig) {
        super(config || { key: SceneName.PLAY_SCENE });
    }

    public preload() { }

    public create() {
        super.create();
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
        const txt = LoadingTips.loadingResources();
        this.render.showLoading({ "text": txt });
        this.onLoadCompleteHandler();

        // set layers
        // ==========背景层
        this.layerManager.addLayer(this, BasicLayer, this.LAYER_GROUNDCLICK, 1);
        this.layerManager.addLayer(this, BasicLayer, this.LAYER_GROUND2, 2);

        // ==========舞台层
        this.layerManager.addLayer(this, GroundLayer, this.LAYER_GROUND, 3).setScale(this.render.scaleRatio);
        this.layerManager.addLayer(this, BasicLayer, this.LAYER_MIDDLE, 4).setScale(this.render.scaleRatio);
        this.layerManager.addLayer(this, SurfaceLayer, this.LAYER_SURFACE, 5).setScale(this.render.scaleRatio);
        this.layerManager.addLayer(this, BasicLayer, this.LAYER_ATMOSPHERE, 6);
        this.layerManager.addLayer(this, BasicLayer, this.LAYER_SCENEUI, 7);

        // ======= mainworker startPlay
        this.render.startRoomPlay();
        this.render.changeScene(this);

        this.input.on("pointerdown", this.onPointerDownHandler, this);
        this.input.on("pointerup", this.onPointerUpHandler, this);
        // this.load.on(Phaser.Loader.Events.COMPLETE, this.onLoadCompleteHandler, this);
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

    protected initInput() {
        this.motionManager = new MotionManager(this.render);
        this.motionManager.setScene(this);
    }

    private onPointerDownHandler(pointer: Phaser.Input.Pointer) {
        this.addPointerMoveHandler();
    }

    private onPointerUpHandler(pointer: Phaser.Input.Pointer) {
        this.removePointerMoveHandler();
    }

    private addPointerMoveHandler() {
        this.input.on("pointermove", this.onPointerMoveHandler, this);
        this.input.on("gameout", this.onGameOutHandler, this);
    }

    private removePointerMoveHandler() {
        this.input.off("pointermove", this.onPointerMoveHandler, this);
        this.input.off("gameout", this.onGameOutHandler, this);
        if (this.render.camerasManager.moving) {
            this.render.syncCameraScroll();
            this.render.camerasManager.moving = false;
        }
    }

    private onPointerMoveHandler(pointer: Phaser.Input.Pointer) {
        if (!this.render.camerasManager.targetFollow) {
            this.render.camerasManager.offsetScroll(
                pointer.prevPosition.x - pointer.position.x,
                pointer.prevPosition.y - pointer.position.y
            );
        }
    }

    private onGameOutHandler() {
        this.removePointerMoveHandler();
    }

    private onLoadCompleteHandler() {
        Logger.getInstance().log("playload complete");
        this.load.off(Phaser.Loader.Events.COMPLETE, this.onLoadCompleteHandler, this);
        // this.render.hideLoading();
    }

    private checkOriention(orientation) {
        if (orientation === Phaser.Scale.PORTRAIT) {
        } else if (orientation === Phaser.Scale.LANDSCAPE) {
        }
    }

    private checkSize(size: Size) {
        const width: number = size.width;
        const height: number = size.height;
    }
}

class GroundLayer extends BasicLayer {
    public sortLayer() {
        this.sort("depth");
    }
}

class SurfaceLayer extends BasicLayer {
    public sortLayer() {
        // TODO: import ElementDisplay
        this.sort("depth", (displayA: any, displayB: any) => {
            // 游戏中所有元素的sortz为1，只在同一高度上，所以下面公式中加入sortz暂时不影响排序，后期sortz会有变化
            return displayA.sortY + displayA.sortZ > displayB.sortY + displayB.sortZ;
        });
    }
}
