import {IPosition45Obj, Logger, LogicPos, Position45} from "utils";
import { PlayCamera } from "../cameras/play.camera";
import { BasicLayer } from "../managers/layer.manager";
import { MainUIScene } from "./main.ui.scene";
import { RoomScene } from "./room.scene";
import { Size } from "src/utils/size";
import { PlaySceneLoadState, SceneName } from "structure";
import { MotionManager } from "../input/motion.manager";
import { IDisplayObject } from "../display";
import sort from "sort-display-object";
import { BaseDragonbonesDisplay, BaseFramesDisplay } from "display";

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

        Logger.getInstance().debug("sort-display: ", sort.addFixedDisplayObject);

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
        // tslint:disable-next-line:no-console
        console.log("PlayScene change loadState: ", val);
        Logger.getInstance().debug("PlayScene change loadState: ", val);
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

class GroundLayer extends BasicLayer {
    private mSortDirty: boolean = false;

    public add(child: Phaser.GameObjects.GameObject) {
        super.add(child);
        this.mSortDirty = true;
        return this;
    }
    public sortLayer() {
        if (!this.mSortDirty) {
            return;
        }
        this.mSortDirty = false;
        this.sort("depth", (displayA: any, displayB: any) => {
            // 游戏中所有元素的sortz为1，只在同一高度上，所以下面公式中加入sortz暂时不影响排序，后期sortz会有变化
            return displayA.y + displayA.z > displayB.y + displayB.z;
        });
    }
}

class SurfaceLayer extends BasicLayer {
    public add(child: BaseFramesDisplay | BaseDragonbonesDisplay) {
        super.add(child);
        return this;
    }

    public sortLayer() {
        // this.sortUtil.depthSort(this.list);
        // TODO: import ElementDisplay
        // this.sort("depth", (displayA: any, displayB: any) => {
        //     // 游戏中所有元素的sortz为1，只在同一高度上，所以下面公式中加入sortz暂时不影响排序，后期sortz会有变化
        //     return displayA.y + displayA.z > displayB.y + displayB.z;
        // });
        sort.reset();
        sort.setTolerance(0.8);
        const displays = this.list;
        for (const display of displays) {
            const dis = <any> display;
            const projection = dis.projectionSize;

            if (dis.nodeType === 5) {
                sort.addDynamicDisplayObject(dis.id, dis.sortX, dis.sortY, projection.width, projection.height, true, dis.nickname, dis);
            } else {
                sort.addFixedDisplayObject(dis.id, dis.sortX, dis.sortY, projection.width, projection.height, false, dis.nickname, dis);
            }
        }
        try {
            this.list = sort.sort();
        } catch {
            Logger.getInstance().error("Cyclic dependency");
        }
    }
}
