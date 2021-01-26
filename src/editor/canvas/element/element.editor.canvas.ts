import { EditorCanvas, IEditorCanvasConfig } from "../editor.canvas";
import ElementEditorGrids from "./element.editor.grids";
import ElementEditorAnimations from "./element.editor.animations";
import ElementEditorResourceManager from "./element.editor.resource.manager";
import { Logger } from "utils";

export enum ElementEditorBrushType {
    Drag,
    Walkable,
    Collision,
    Interactive
}

export enum ElementEditorEmitType {
    Resource_Loaded = "resourceLoaded",
    Active_Animation_Layer = "activeAnimationLayer",
    Active_Mount_Layer = "activeMountLayer",
    Update_Frame_Sumb = "updateFrameSumb"
}

/**
 * api:https://dej4esdop1.feishu.cn/docs/doccn1Ez79LjYywnNiAGbaP35Tc
 */
export class ElementEditorCanvas extends EditorCanvas {

    public mData: any;// ElementNode

    private readonly SCENEKEY: string = "ElementEditorScene";
    private readonly ERROR_UNINITED: string = "canvas not inited";
    private readonly GAME_SIZE = { w: 1600, h: 900 };

    private mResManager: ElementEditorResourceManager;
    private mGrids: ElementEditorGrids;
    private mAnimations: ElementEditorAnimations;

    constructor(config: IEditorCanvasConfig) {
        super(config);
        Logger.getInstance().debug("ElementEditorCanvas.constructor()");

        this.mGame.scene.add(this.SCENEKEY, ElementEditorScene);

        // start
        this.mData = config.node;// ElementNode
        this.mResManager = new ElementEditorResourceManager(this.mData, this.mEmitter, this.mConfig.LOCAL_HOME_PATH);
        this.mGame.scene.start(this.SCENEKEY, this);
    }

    public destroy() {
        Logger.getInstance().debug("ElementEditorCanvas.destroy()");
        if (this.mData) {
            this.mData = null;
        }
        if (this.mResManager) {
            if (this.mAnimations) {
                this.mResManager.removeResourcesChangeListener(this.mAnimations);
            }
            this.mResManager.destroy();
        }
        if (this.mGrids) {
            this.mGrids.clear();
            this.mGrids.destroy();
        }
        if (this.mAnimations) {
            this.mAnimations.clear();
            this.mAnimations.destroy();
        }
        super.destroy();
    }

    public getScene() {
        if (this.mGame)
            return this.mGame.scene.getScene(this.SCENEKEY);

        return null;
    }

    public onSceneCreated() {
        // this.mGame.scale.setGameSize(this.GAME_SIZE.w, this.GAME_SIZE.h);

        const scene = this.getScene();
        this.mGrids = new ElementEditorGrids(scene, this.mData.animations.getDefaultAnimationData());
        this.mAnimations = new ElementEditorAnimations(scene, this.mData.animations.getDefaultAnimationData(), this.mGrids, this.mEmitter);
        this.mResManager.init(scene);

        this.mResManager.addResourcesChangeListener(this.mAnimations);

        // this.initCameraPosition();
    }
    public onSceneDestroy() {
        if (this.mGrids) this.mGrids.clear();
        if (this.mAnimations) this.mAnimations.clear();
    }

    //#region command from game-editor
    // 监听事件
    public on(event: ElementEditorEmitType, fn: Function, context?: any) {
        this.mEmitter.on(event, fn, context);
    }
    public off(event: ElementEditorEmitType, fn?: Function, context?: any, once?: boolean) {
        this.mEmitter.off(event, fn, context, once);
    }

    // 解析数据
    public deserializeDisplay(): Promise<any[]> {// IImage
        return this.mResManager.deserializeDisplay();
    }

    // 合图
    public generateSpriteSheet(images: any[]): Promise<{ url: string, json: string }> {// IImage
        return this.mResManager.generateSpriteSheet(images);
    }

    // 重新加载DisplayNode
    public reloadDisplayNode() {
        this.mResManager.loadResources();
    }

    // 切换动画
    public changeAnimationData(animationDataId: number) {
        if (!this.mGrids || !this.mAnimations) {
            Logger.getInstance().error(this.ERROR_UNINITED);
            return;
        }

        const aniData = this.mData.animations.getAnimationData(animationDataId);
        this.mGrids.setAnimationData(aniData);
        this.mAnimations.setAnimationData(aniData);
    }

    // 控制播放帧
    public selectFrame(frameIndex: number) {
        if (!this.mAnimations) {
            Logger.getInstance().error(this.ERROR_UNINITED);
            return;
        }

        this.mAnimations.setFrame(frameIndex);
    }

    // 控制播放
    public playAnimation() {
        if (!this.mAnimations) {
            Logger.getInstance().error(this.ERROR_UNINITED);
            return;
        }

        this.mAnimations.setPlay(true);
    }
    public stopAnimation() {
        if (!this.mAnimations) {
            Logger.getInstance().error(this.ERROR_UNINITED);
            return;
        }

        this.mAnimations.setPlay(false);
    }

    // 切换画笔信息
    public changeBrush(mode: ElementEditorBrushType) {
        if (!this.mGrids || !this.mAnimations) {
            Logger.getInstance().error(this.ERROR_UNINITED);
            return;
        }

        this.mGrids.changeBrush(mode);
        this.mAnimations.setInputEnabled(mode === ElementEditorBrushType.Drag);
    }

    // 选择动画图层
    public selectAnimationLayer(layerIndexs: number[]) {
        if (!this.mAnimations) {
            Logger.getInstance().error(this.ERROR_UNINITED);
            return;
        }

        this.mAnimations.setSelectedAnimationLayer(layerIndexs);
    }

    // 选择挂载点图层
    public selectMountLayer(mountPointIndex?: number) {
        if (!this.mAnimations) {
            Logger.getInstance().error(this.ERROR_UNINITED);
            return;
        }

        this.mAnimations.setSelectedMountLayer(mountPointIndex);
    }

    // 更新深度
    public updateDepth() {
        if (!this.mAnimations) {
            Logger.getInstance().error(this.ERROR_UNINITED);
            return;
        }

        this.mAnimations.updateDepth();
    }

    // 更新动画层
    public updateAnimationLayer() {
        if (!this.mAnimations) {
            Logger.getInstance().error(this.ERROR_UNINITED);
            return;
        }

        this.mAnimations.updateAnimationLayer();
    }

    // 控制挂载点动画播放
    public toggleMountPointAnimationPlay(playerAnimationName: string, mountPointIndex?: number) {
        if (!this.mAnimations) {
            Logger.getInstance().error(this.ERROR_UNINITED);
            return;
        }

        this.mAnimations.setMountAnimation(playerAnimationName, mountPointIndex);
    }

    // 更新挂载层
    public updateMountLayer() {
        if (!this.mAnimations) {
            Logger.getInstance().error(this.ERROR_UNINITED);
            return;
        }

        this.mAnimations.updateMountDisplay();
    }

    public updateOffsetLoc(layerIndexs: number) {
        if (!this.mAnimations) {
            Logger.getInstance().error(this.ERROR_UNINITED);
            return;
        }
        this.mAnimations.updateOffsetLoc(layerIndexs);
    }

    // 生成缩略图
    public generateThumbnail(): Promise<string> {
        if (!this.mAnimations) {
            Logger.getInstance().error(this.ERROR_UNINITED);
            return;
        }

        return this.mAnimations.generateThumbnail();
    }
    //#endregion

    private initCameraPosition() {
        const gameSize = this.mGame.scale.gameSize;
        const cam = this.getScene().cameras.main;
        cam.setPosition(- (gameSize.width / 2 - this.mConfig.width / 2), - (gameSize.height / 2 - this.mConfig.height / 2));
    }
}

class ElementEditorScene extends Phaser.Scene {

    private mCanvas: ElementEditorCanvas;

    public init(canvas: ElementEditorCanvas): void {
        this.mCanvas = canvas;
    }

    public create(game: Phaser.Scene): void {
        if (this.mCanvas) this.mCanvas.onSceneCreated();
    }

    public destroy() {
        if (this.mCanvas) this.mCanvas.onSceneDestroy();
    }
}
