import { LoadingTips } from "../../game/loading/loading.tips";
import { Logger, Size } from "utils";
import { PlayCamera } from "../cameras/play.camera";
import { BasicLayer } from "../managers/layer.manager";
import { MainUIScene } from "./main.ui.scene";
import { RoomScene } from "./room.scene";

// 游戏正式运行用 Phaser.Scene
export class PlayScene extends RoomScene {
    private readonly LAYER_GROUNDCLICK = "groundClickLayer";
    private readonly LAYER_GROUND2 = "groundLayer2";
    private readonly LAYER_GROUND = "groundLayer";
    private readonly LAYER_MIDDLE = "middleLayer";
    private readonly LAYER_SURFACE = "surfaceLayer";
    private readonly LAYER_ATMOSPHERE = "atmosphere";
    private readonly LAYER_SCENEUI = "sceneUILayer";

    constructor(config?: string | Phaser.Types.Scenes.SettingsConfig) {
        super(config || { key: PlayScene.name });
    }

    public preload() { }

    public create() {
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
                "roomid": this.mRoomID,
            });
        } else {
            this.render.initUI();
            // this.mRoom.initUI();
        }
        this.scene.sendToBack();
        this.scale.on("orientationchange", this.checkOriention, this);
        this.scale.on("resize", this.checkSize, this);
        // ======= mainworker startPlay
        this.render.startRoomPlay();
        // ======= render startPlay
        this.render.camermsManager.startRoomPlay(this);
        this.render.showLoading({ "text": LoadingTips.loadingResources() });
        this.load.on(Phaser.Loader.Events.COMPLETE, this.onLoadCompleteHandler, this);
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
    }

    update(time: number, delta: number) {
        this.render.updateRoom(time, delta);
    }

    // setViewPort(x: number, y: number, width: number, height: number) {
    //     super.setViewPort(x, y, width, height);
    //     this.cameras.main.zoom = Math.ceil(window.devicePixelRatio);
    // }

    getKey(): string {
        return (this.sys.config as Phaser.Types.Scenes.SettingsConfig).key;
    }

    private onLoadCompleteHandler() {
        Logger.getInstance().log("playload complete");
        this.load.off(Phaser.Loader.Events.COMPLETE, this.onLoadCompleteHandler, this);
        this.render.sceneManager.sleepScene("LoadingScene");
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
