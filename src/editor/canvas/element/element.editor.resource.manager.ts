import * as path from "path";
import { MaxRectsPacker } from "maxrects-packer";
import { Atlas, AnimationModel, RunningAnimation,Logger } from "structure";
import { EditorCanvas, IEditorCanvasConfig } from "../editor.canvas";
import ElementEditorAnimations from "./element.editor.animations";
import { Url } from "utils";
import version from "../../../../version";
import Position45Utils from "../../utils/position45.utils";
import { BaseDragonbonesDisplay, BaseFramesDisplay } from "baseRender";
import { AnimationDataNode } from "game-capsule";
import { DragonbonesEditorDisplay } from "./dragonbones.editor.display";

export const WEB_HOME_PATH: string = "https://osd.tooqing.com/";
export const SPRITE_SHEET_KEY: string = "ELEMENT_EDITOR_SPRITE_SHEET_KEY";
export const IMAGE_BLANK_KEY: string = "blank";

export default class ElementEditorResourceManager {
    private mElementNode: any;// ElementNode
    private mScene: Phaser.Scene;
    private mEmitter: Phaser.Events.EventEmitter;
    private mResourcesChangeListeners: ResourcesChangeListener[] = [];
    private mLocalHomePath: string;

    constructor(data: any, emitter: Phaser.Events.EventEmitter, localHomePath: string) {// ElementNode
        this.mElementNode = data;
        this.mEmitter = emitter;
        this.mLocalHomePath = localHomePath;
    }

    public init(scene: Phaser.Scene) {
        this.mScene = scene;
        this.loadResources();
    }

    public addResourcesChangeListener(listener: ResourcesChangeListener) {
        this.mResourcesChangeListeners.push(listener);
    }
    public removeResourcesChangeListener(listener: ResourcesChangeListener) {
        const idx: number = this.mResourcesChangeListeners.indexOf(listener);
        if (idx !== -1) {
            this.mResourcesChangeListeners.splice(idx, 1);
        }
    }

    public loadResources() {
        if (!this.mScene) {
            Logger.getInstance().warn("ResourceManager not inited");
            return;
        }

        if (!this.mElementNode ||
            !this.mElementNode.animations.display.texturePath ||
            this.mElementNode.animations.display.texturePath === "" ||
            !this.mElementNode.animations.display.dataPath ||
            this.mElementNode.animations.display.dataPath === "") {
            this.mEmitter.emit(ElementEditorEmitType.Resource_Loaded, false, "DisplayNode is empty");
            return;
        }
        this.clearResource();
        const val = this.mElementNode.animations.display;
        this.mScene.load.addListener(Phaser.Loader.Events.COMPLETE, this.imageLoaded, this);
        this.mScene.load.atlas(
            SPRITE_SHEET_KEY,
            path.join(this.mLocalHomePath, val.texturePath),// this.mLocalHomePath WEB_HOME_PATH
            path.join(this.mLocalHomePath, val.dataPath)// this.mLocalHomePath WEB_HOME_PATH
        ).on("loaderror", this.imageLoadError, this);
        Logger.getInstance().debug("loadResources ", path.join(this.mLocalHomePath, val.texturePath));
        this.mScene.load.start();
    }

    public generateSpriteSheet(images: any[]): Promise<{ url: string, json: string }> {// IImage
        return new Promise<{ url: string, json: string }>((resolve, reject) => {
            if (!this.mScene) {
                Logger.getInstance().warn("ResourceManager not inited");
                reject(null);
                return;
            }

            let imgCount = 0;
            for (const image of images) {
                // if (image.name === this.IMAGE_BLANK_KEY) continue;
                imgCount++;
                if (!this.mScene.textures.exists(image.key)) {
                    this.mScene.textures.addBase64(image.key, image.url);
                }
            }
            if (imgCount === 0) {
                Logger.getInstance().warn("no image data");
                reject(null);
                return;
            }

            const _imgs = [].concat(images);
            const onLoadFunc = () => {
                let allLoaded = true;
                _imgs.forEach((img) => {
                    // if (img.name === this.IMAGE_BLANK_KEY) return;
                    if (!this.mScene.textures.exists(img.key)) {
                        allLoaded = false;
                    }
                });

                if (!allLoaded) return;

                const atlas = new Atlas();
                const packer = new MaxRectsPacker();
                packer.padding = 2;
                for (const image of _imgs) {
                    const f = this.mScene.textures.getFrame(image.key, "__BASE");
                    packer.add(f.width, f.height, { name: image.key });
                }

                const { width, height } = packer.bins[0];

                const canvas = this.mScene.textures.createCanvas("GenerateSpriteSheet", width, height);
                packer.bins.forEach((bin) => {
                    bin.rects.forEach((rect) => {
                        canvas.drawFrame(rect.data.name, "__BASE", rect.x, rect.y);
                        atlas.addFrame(rect.data.name, rect);
                    });
                });

                const url = canvas.canvas.toDataURL("image/png", 1);
                canvas.destroy();
                // remove imgs
                _imgs.forEach((one) => {
                    if (this.mScene.textures.exists(one.key)) {
                        this.mScene.textures.remove(one.key);
                        this.mScene.textures.removeKey(one.key);
                    }
                });

                Logger.getInstance().debug("generate sprite sheet: ", url, atlas.toString());
                resolve({ url, json: atlas.toString() });

                // remove listener
                this.mScene.textures.off("onload", onLoadFunc, this, false);
            };
            this.mScene.textures.on("onload", onLoadFunc, this);
        });
    }

    /**
     * 解析sprite sheet
     */
    public deserializeDisplay(): Promise<any[]> {// IImage
        return new Promise<any[]>((resolve, reject) => {
            if (!this.mScene.textures.exists(SPRITE_SHEET_KEY)) {
                reject([]);
            } else {
                const atlasTexture = this.mScene.textures.get(SPRITE_SHEET_KEY);
                const frames = atlasTexture.frames;
                const frameNames = atlasTexture.getFrameNames(false);
                let frame: Phaser.Textures.Frame = null;
                const imgs = [];
                for (const frameName of frameNames) {
                    frame = frames[frameName];
                    let imgName = "NAME_ERROR";
                    const imgHash = frameName.split("?t=");
                    if (imgHash.length > 0) imgName = imgHash[0];

                    const canvas = this.mScene.textures.createCanvas("DeserializeSpriteSheet", frame.width, frame.height);
                    canvas.drawFrame(SPRITE_SHEET_KEY, frameName);
                    const url = canvas.canvas.toDataURL("image/png", 1);
                    imgs.push({ key: frameName, name: imgName, url });
                    canvas.destroy();
                }
                Logger.getInstance().debug("deserialize sprite sheet: ", imgs);
                resolve(imgs);
            }
        });
    }

    public clearResource() {
        if (this.mScene.textures.exists(SPRITE_SHEET_KEY)) {
            this.mResourcesChangeListeners.forEach((listener) => {
                listener.onResourcesCleared();
            });
            this.mScene.textures.remove(SPRITE_SHEET_KEY);
            this.mScene.textures.removeKey(SPRITE_SHEET_KEY);
            this.mScene.cache.json.remove(SPRITE_SHEET_KEY);
        }
    }

    public destroy() {
        this.clearResource();
        this.mResourcesChangeListeners.length = 0;
    }

    private imageLoaded() {
        if (!this.mScene.textures.exists(SPRITE_SHEET_KEY)) {
            return;
        }

        this.mScene.load.removeListener(
            Phaser.Loader.Events.COMPLETE,
            this.imageLoaded,
            this);

        this.mResourcesChangeListeners.forEach((listener) => {
            listener.onResourcesLoaded();
        });

        // Logger.getInstance().debug("imageLoaded");
        this.mEmitter.emit(ElementEditorEmitType.Resource_Loaded, true, "DisplayNode load success");
    }
    private imageLoadError() {
        this.mEmitter.emit(ElementEditorEmitType.Resource_Loaded, false, "DisplayNode load error");
    }
}

export interface ResourcesChangeListener {
    onResourcesLoaded(): void;
    onResourcesCleared(): void;
}

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
    private mAnimations: ElementFramesDisplay | ElementEditorAnimations;

    constructor(config: IEditorCanvasConfig) {
        super(config);
        Logger.getInstance().debug("ElementEditorCanvas.constructor()");
        Url.RES_PATH = `./resources_v${version}/`;

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
        this.mAnimations = new ElementFramesDisplay(scene, this.mData.animations.getDefaultAnimationData(), this.mGrids, this.mEmitter);
        // this.mAnimations = new ElementEditorAnimations(scene, this.mData.animations.getDefaultAnimationData(), this.mGrids, this.mEmitter);
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
export class ElementEditorGrids extends Phaser.GameObjects.Container {
    private mRows = 5;
    private mCols = 5;
    private mAnchor: Phaser.Geom.Point;
    private readonly gridWidth = 30;
    private readonly gridHeight = 15;
    private mPositionManager: Position45Utils;

    private mGridLayer: Phaser.GameObjects.Container;
    private mWalkableLayer: Phaser.GameObjects.Container;
    private mCollisionLayer: Phaser.GameObjects.Container;
    private mInteractiveLayer: Phaser.GameObjects.Container;
    private mWalkableArea: WalkableGrid[][];
    private mBasicWalkableArea: number[][];
    private mCollisionArea: CollisionGrid[][];
    private mBasicCollisionArea: number[][];
    private mInteractiveArea: CollisionGrid[][];
    private mBasicInteractiveArea: any[];// IPoint
    private mCurToolType: ElementEditorBrushType;
    private mAnimationData: any;// AnimationDataNode

    constructor(scene: Phaser.Scene, node: any) {// AnimationDataNode
        super(scene);
        const parentContainer = scene.add.container(0, 0);
        parentContainer.add(this);
        this.mPositionManager = new Position45Utils(
            this.gridWidth,
            this.gridHeight,
            (this.gridWidth * this.mRows) >> 1,
            0
        );

        this.mGridLayer = this.scene.make.container(undefined, false);
        this.mCollisionLayer = this.scene.make.container(undefined, false);
        this.mWalkableLayer = this.scene.make.container(undefined, false);
        this.mInteractiveLayer = this.scene.make.container(undefined, false);
        this.add([this.mGridLayer, this.mWalkableLayer, this.mCollisionLayer, this.mInteractiveLayer]);
        this.scene.input.on("pointerdown", this.onDownHandler, this);
        this.scene.input.on("pointermove", this.onMoveHandler, this);
        this.scene.input.on("pointerup", this.onUpHandler, this);
        this.mCurToolType = ElementEditorBrushType.Drag;

        // init data
        this.setAnimationData(node);
    }

    public setAnimationData(animationData: any) {// AnimationDataNode
        this.clear();
        this.mAnimationData = animationData;
        if (!this.mAnimationData) {
            Logger.getInstance().warn("wrong animation data");
            return;
        }

        this.mBasicCollisionArea = this.mAnimationData.basicCollisionArea;
        this.mBasicWalkableArea = this.mAnimationData.basicWalkableArea;
        this.mBasicInteractiveArea = this.mAnimationData.interactiveArea || [];
        this.setArea(this.mBasicCollisionArea.length, this.mBasicCollisionArea[0].length);

        this.drawFromData(this.mBasicCollisionArea, ElementEditorBrushType.Collision);
        this.drawFromData(this.mBasicWalkableArea, ElementEditorBrushType.Walkable);
        const area = [...this.mBasicInteractiveArea];
        for (const areaPoint of area) {
            this.drawInteractive(
                new Phaser.Geom.Point(
                    areaPoint.x + Math.floor(this.mRows / 2),
                    areaPoint.y + Math.floor(this.mCols / 2)
                )
            );
        }
    }

    public getAnchor90Point() {
        if (!this.mAnimationData) return;
        const baseLoc = this.mAnimationData.collisionOriginPoint || { x: 0, y: 0 };
        const point = new Phaser.Geom.Point(this.mAnchor.y, this.mAnchor.x);
        const p = this.mPositionManager.transformTo90(point);
        p.x += this.x;
        p.y += this.y;
        return p;
    }

    public getOriginPoint() {
        if (!this.mAnimationData) return;
        const baseLoc = this.mAnimationData.collisionOriginPoint || { x: 0, y: 0 };
        const point = new Phaser.Geom.Point(baseLoc.y, baseLoc.x);
        const p = this.mPositionManager.transformTo90(point);
        p.x += this.x;
        p.y += this.y;
        return p;
    }

    public clear() {
        if (this.mWalkableArea) {
            this.mWalkableArea.forEach((rows) => {
                rows.forEach((element) => {
                    if (element) {
                        element.clear();
                        element.destroy();
                    }
                });
            });
        }
        if (this.mCollisionArea) {
            this.mCollisionArea.forEach((rows) => {
                rows.forEach((element) => {
                    if (element) {
                        element.clear();
                        element.destroy();
                    }
                });
            });
        }
        if (this.mInteractiveArea) {
            this.mInteractiveArea.forEach((rows) => {
                rows.forEach((element) => {
                    if (element) {
                        element.clear();
                        element.destroy();
                    }
                });
            });
        }
        this.mGridLayer.removeAll();
        this.mWalkableLayer.removeAll();
        this.mCollisionLayer.removeAll();
        this.mInteractiveLayer.removeAll();
    }

    public changeBrush(val: ElementEditorBrushType) {
        this.mCurToolType = val;
    }

    private setArea(rows: number, cols: number) {
        this.mRows = rows;
        this.mCols = cols;
        this.mWalkableArea = new Array<Grid[]>(this.mRows);
        for (let i = 0; i < this.mRows; i++) {
            this.mWalkableArea[i] = new Array<Grid>(this.mCols);
        }
        this.mCollisionArea = new Array<Grid[]>(this.mRows);
        for (let i = 0; i < this.mRows; i++) {
            this.mCollisionArea[i] = new Array<Grid>(this.mCols);
        }
        this.mInteractiveArea = new Array<Grid[]>(this.mRows);
        for (let i = 0; i < this.mRows; i++) {
            this.mInteractiveArea[i] = new Array<Grid>(this.mCols);
        }
        this.mAnchor = new Phaser.Geom.Point(this.mRows >> 1, this.mCols >> 1);
        if (this.mPositionManager) {
            this.mPositionManager.setOffset((this.gridWidth * this.mRows) >> 1, 0);
        }
        this.drawGrid();
    }

    private drawFromData(area: number[][], type: ElementEditorBrushType) {
        for (let i = 0; i < this.mRows; i++) {
            for (let j = 0; j < this.mCols; j++) {
                if (area[i][j] === 1) {
                    switch (type) {
                        case ElementEditorBrushType.Collision:
                            this.drawCollision(new Phaser.Geom.Point(j, i));
                            break;
                        case ElementEditorBrushType.Walkable:
                            this.drawWalkable(new Phaser.Geom.Point(j, i));
                            break;
                    }
                }
            }
        }
    }

    private onDownHandler(pointer: Phaser.Input.Pointer, event: any) {
        if (pointer.leftButtonDown() || pointer.rightButtonDown())
            this.clickGrid(pointer);
    }

    private onMoveHandler(pointer: Phaser.Input.Pointer) {
        // Logger.getInstance().log("Grids -> onMoveHandler -> pointer.isDown", pointer.isDown);
        if (pointer.leftButtonDown() || pointer.rightButtonDown()) {
            this.clickGrid(pointer);
        } else if (pointer.middleButtonDown()) {
            // this.dragCamera(pointer);
        }
    }

    private onUpHandler(pointer: Phaser.Input.Pointer) {

    }

    private clickGrid(pointer: Phaser.Input.Pointer) {
        const point = new Phaser.Geom.Point();
        point.x = pointer.x - this.x;
        point.y = pointer.y - this.y;
        const p = this.mPositionManager.transformTo45(point);
        if (p.x < 0 || p.y < 0 || p.x > this.mRows - 1 || p.y > this.mCols - 1) {
            return;
        }

        switch (this.mCurToolType) {
            case ElementEditorBrushType.Walkable:
                if (pointer.leftButtonDown())
                    this.drawWalkable(p);
                else if (pointer.rightButtonDown())
                    this.eraseWalkable(p);
                break;
            case ElementEditorBrushType.Collision:
                if (pointer.leftButtonDown())
                    this.drawCollision(p);
                else if (pointer.rightButtonDown())
                    this.eraseCollision(p);
                break;
            case ElementEditorBrushType.Interactive:
                if (pointer.leftButtonDown())
                    this.drawInteractive(p);
                else if (pointer.rightButtonDown())
                    this.eraseInteractive(p);
                break;
        }
        this.mAnimationData.cutBaseArea();
    }

    private dragCamera(pointer: Phaser.Input.Pointer) {
        const cam = this.scene.cameras.main;
        const dragScale = 0.1;
        cam.setPosition(cam.x + pointer.velocity.x * dragScale, cam.y + pointer.velocity.y * dragScale);
    }

    private drawWalkable(loc: Phaser.Geom.Point) {
        let grid = this.mWalkableArea[loc.y][loc.x];

        if (grid) return;
        const point = this.mPositionManager.transformTo90(loc);
        grid = new WalkableGrid(this.scene, { x: point.x, y: point.y });
        grid.x -= grid.width >> 1;
        grid.y += grid.height >> 1;
        this.mWalkableLayer.add(grid);
        this.mWalkableArea[loc.y][loc.x] = grid;
        this.mBasicWalkableArea[loc.y][loc.x] = 1;
    }
    private eraseWalkable(loc: Phaser.Geom.Point) {
        const grid = this.mWalkableArea[loc.y][loc.x];
        if (!grid) return;

        grid.clear();
        this.mWalkableLayer.remove(grid);
        this.mWalkableArea[loc.y][loc.x] = null;
        this.mBasicWalkableArea[loc.y][loc.x] = 0;
    }

    private drawCollision(loc: Phaser.Geom.Point) {
        let grid = this.mCollisionArea[loc.y][loc.x];

        if (grid) return;
        const point = this.mPositionManager.transformTo90(loc);
        grid = new CollisionGrid(this.scene, { x: point.x, y: point.y });
        grid.x -= grid.width >> 1;
        // grid.y += grid.height >> 1;
        this.mCollisionLayer.add(grid);
        this.mCollisionArea[loc.y][loc.x] = grid;
        this.mBasicCollisionArea[loc.y][loc.x] = 1;
    }
    private eraseCollision(loc: Phaser.Geom.Point) {
        const grid = this.mCollisionArea[loc.y][loc.x];
        if (!grid) return;

        grid.clear();
        this.mCollisionLayer.remove(grid);
        this.mCollisionArea[loc.y][loc.x] = null;
        this.mBasicCollisionArea[loc.y][loc.x] = 0;
    }

    private drawInteractive(loc: Phaser.Geom.Point) {
        let grid = this.mInteractiveArea[loc.y][loc.x];
        if (grid) return;

        const x = loc.x - Math.floor(this.mRows / 2);
        const y = loc.y - Math.floor(this.mCols / 2);
        const index = this.mBasicInteractiveArea.findIndex((p) => p.x === x && p.y === y);

        const point = this.mPositionManager.transformTo90(loc);
        grid = new InteractiveGrid(this.scene, { x: point.x, y: point.y });
        grid.x -= grid.width >> 1;
        grid.y += grid.height >> 1;
        this.mInteractiveLayer.add(grid);
        if (index < 0) this.mBasicInteractiveArea.push({ x, y });
        this.mInteractiveArea[loc.y][loc.x] = grid;
    }
    private eraseInteractive(loc: Phaser.Geom.Point) {
        const grid = this.mInteractiveArea[loc.y][loc.x];
        if (!grid) return;

        const x = loc.x - Math.floor(this.mRows / 2);
        const y = loc.y - Math.floor(this.mCols / 2);
        const index = this.mBasicInteractiveArea.findIndex((p) => p.x === x && p.y === y);

        grid.clear();
        this.mInteractiveLayer.remove(grid);
        this.mInteractiveArea[loc.y][loc.x] = null;
        if (index >= 0) this.mBasicInteractiveArea.splice(index, 1);
    }

    private drawGrid() {
        const graphics = this.scene.make.graphics(undefined, false);
        graphics.lineStyle(1, 0xffffff, 0.1);
        graphics.beginPath();
        for (let i = 0; i <= this.mRows; i++) {
            this.drawLine(graphics, 0, i, this.mRows, i);
        }
        for (let i = 0; i <= this.mCols; i++) {
            this.drawLine(graphics, i, 0, i, this.mCols);
        }
        graphics.closePath();
        graphics.strokePath();
        this.mGridLayer.add(graphics);
        const point = this.mPositionManager.transformTo90(this.mAnchor);
        const anchorView = this.scene.make.graphics(undefined, false);
        anchorView.fillStyle(0xff0000);
        anchorView.fillCircle(point.x, point.y, 3);
        anchorView.fillPath();
        // anchorView.beginFill(0xff0000);
        // anchorView.drawCircle(point.x, point.y, 6);
        // anchorView.endFill();
        // this.drawLine(anchorView, this.anchor.x - 1, this.anchor.y, this.anchor.x + 1, this.anchor.y);
        // this.drawLine(anchorView, this.anchor.x, this.anchor.y - 1, this.anchor.x, this.anchor.y + 1);
        this.mGridLayer.add(anchorView);
        // this.x = (this.game.width - this.width) >> 1;
        // this.y = (this.game.height - this.height) >> 1;
        const _w = (this.mRows + this.mCols) * (this.gridWidth / 2);
        const _h = (this.mRows + this.mCols) * (this.gridHeight / 2);
        this.x = (this.scene.game.scale.width - _w) >> 1;
        this.y = (this.scene.game.scale.height - _h) >> 1;
    }

    private drawLine(
        graphics: Phaser.GameObjects.Graphics,
        startX: number,
        endX: number,
        startY: number,
        endY: number
    ) {
        let point = new Phaser.Geom.Point(startX, endX);
        point = this.mPositionManager.transformTo90(point);
        graphics.moveTo(point.x, point.y);
        point = new Phaser.Geom.Point(startY, endY);
        point = this.mPositionManager.transformTo90(point);
        graphics.lineTo(point.x, point.y);
    }
}

class Grid extends Phaser.GameObjects.Graphics {
    constructor(
        scene: Phaser.Scene,
        options: Phaser.Types.GameObjects.Graphics.Options,
        private tileWidth: number = 30,
        private tileHeight: number = 15,
        private color: number = 0
    ) {
        super(scene, options);
        this.drawTile(this.color);
    }

    private drawTile(color: number = 0, alpha: number = 0.5) {
        this.clear();
        this.lineStyle(1, color);
        // this.beginFill(color, alpha);
        this.fillStyle(color, alpha);
        this.moveTo(0, this.tileHeight >> 1);
        this.lineTo(this.tileWidth >> 1, 0);
        this.lineTo(this.tileWidth, this.tileHeight >> 1);
        this.lineTo(this.tileWidth >> 1, this.tileHeight);
        this.lineTo(0, this.tileHeight >> 1);
        this.fillPath();
    }

    get width() {
        return this.tileWidth;
    }

    get height() {
        return this.tileHeight;
    }
}

class WalkableGrid extends Grid {
    constructor(game: Phaser.Scene, options: Phaser.Types.GameObjects.Graphics.Options) {
        super(game, options, 16, 8, 0x00ff00);
    }
}

class CollisionGrid extends Grid {
    constructor(game: Phaser.Scene, options: Phaser.Types.GameObjects.Graphics.Options) {
        super(game, options, 28, 14, 0xff8000);
    }
}

class InteractiveGrid extends Grid {
    constructor(scene: Phaser.Scene, options: Phaser.Types.GameObjects.Graphics.Options) {
        super(scene, options, 16, 8, 0xffff00);
    }
}
export class ElementFramesDisplay extends BaseFramesDisplay implements ResourcesChangeListener {

    private readonly MOUNT_ANIMATION_TIME_SCALE: number = 1000 / 12;

    private mGrids: ElementEditorGrids;
    private mEmitter: Phaser.Events.EventEmitter;
    private mSelectedGameObjects = [];
    private mAnimationData: AnimationDataNode;// AnimationDataNode
    // private mMountArmatureParent: Phaser.GameObjects.Container;
    private mCurFrameIdx: number = 0;
    private mPlaying: boolean = false;
    private mCurMountAnimation: RunningAnimation = { name: "idle", flip: false };

    constructor(scene: Phaser.Scene, node: any, grids: ElementEditorGrids, emitter: Phaser.Events.EventEmitter) {// AnimationDataNode
        super(scene);
        this.mGrids = grids;
        this.mEmitter = emitter;
        this.mMountList = new Map<number, Phaser.GameObjects.Container>();
        const parentContainer = scene.add.container(0, 0);
        parentContainer.add(this);
        // this.mMountArmatureParent = scene.add.container(0, 0);
        // this.add(this.mMountArmatureParent);
        this.scene.input.on("dragstart", this.onDragStartHandler, this);
        this.scene.input.on("drag", this.onDragHandler, this);
        this.scene.input.on("dragend", this.onDragEndHandler, this);
        this.scene.input.keyboard.on("keydown", this.keyboardEvent, this);

        // init data
        this.setAnimationData(node);
    }

    public setAnimationData(data: AnimationDataNode) {// AnimationDataNode
        this.clear();
        this.mAnimationData = data;
        this.mCurFrameIdx = 0;
        this.mPlaying = false;
        this.mIsInteracitve = true;
        if (!this.mAnimationData) {
            Logger.getInstance().warn("选择动画错误!");
            return;
        }

        Logger.getInstance().debug("setAnimationData: ", data);
        // this.play({ name: data.name, flip: false });
        const originPos = this.mGrids.getAnchor90Point();
        this.x = originPos.x;
        this.y = originPos.y;
        this.updatePlay();
    }

    public onResourcesLoaded() {
        this.clearDisplay();
        this.createDisplays();
        this.updatePlay();
    }

    public onResourcesCleared() {
        this.clearDisplay();
    }

    public setFrame(frameIdx: number) {
        this.mCurFrameIdx = frameIdx;

        this.updatePlay();
    }

    public setMountAnimation(aniName: string, idx?: number) {
        this.mCurMountAnimation.name = aniName;
        if (idx !== undefined) {
            if (!this.mMountList.get(idx)) {
                Logger.getInstance().warn("wrong idx: " + idx);
                return;
            }

            const arm: BaseDragonbonesDisplay = this.mMountList.get(idx) as BaseDragonbonesDisplay;
            if (arm) arm.play(this.mCurMountAnimation);
        } else {
            this.mMountList.forEach((val) => {
                (val as BaseDragonbonesDisplay).play(this.mCurMountAnimation);
            });
        }
    }

    public updateMountDisplay() {
        this.updateMountLayerPlay();
    }

    public setPlay(playing: boolean) {
        this.mPlaying = playing;

        this.updatePlay();
    }

    public setInputEnabled(val: boolean) {
        this.mIsInteracitve = val;

        this.updateInputEnabled();

        // clear selected
        if (!val) this.mSelectedGameObjects.length = 0;
    }

    // 根据图层索引设置选中图层
    // public setSelectedGameObjectsByLevelIdx(idxs: number[]) {
    //     let gos = [];
    //     idxs.forEach((idx) => {
    //         const layer = this.getLayerByLayerIdx(idx);
    //         if (layer.length > 0) gos = gos.concat(layer);
    //     });
    //     this.setSelectedGameObjects(gos);
    // }

    public setSelectedAnimationLayer(idxs: number[]) {
        let gos = [];
        idxs.forEach((idx) => {
            if (this.mDisplays.has(idx)) {
                gos = gos.concat(this.mDisplays.get(idx));
            }
        });
        this.setSelectedGameObjects(gos);
    }

    public setSelectedMountLayer(mountPointIndex?: number) {
        if (mountPointIndex !== undefined) {
            if (!this.mMountList.get(mountPointIndex)) {
                Logger.getInstance().warn("wrong idx: " + mountPointIndex);
                return;
            }
            this.setSelectedGameObjects(this.mMountList.get(mountPointIndex));
        } else {
            // 全选所有挂载点
            const arr = Array.from(this.mMountList.values());
            this.setSelectedGameObjects(arr);
        }
    }

    public updateDepth() {
        if (!this.mAnimationData) return;

        this.mAnimationData.layerDict.forEach((val, key) => {
            if (!this.mDisplays.has(key)) return;
            const display = this.mDisplays.get(key);
            if (display && display.parentContainer) {
                display.parentContainer.setDepth(val.depth);
            }
        });

        if (!this.mAnimationData.mountLayer) return;
        // if (this.mMountArmatureParent) {
        //     this.mMountArmatureParent.setDepth(this.mAnimationData.mountLayer.index);
        // }
        if (this.mMountContainer) {
            this.mMountContainer.setDepth(this.mAnimationData.mountLayer.index);
        }

        this.updateChildrenIdxByDepth();
    }

    public updatePerAnimationLayerVisible(idx: number) {
        if (!this.mAnimationData) return;
        if (!this.mAnimationData.layerDict.has(idx) || !this.mDisplays.has(idx)) return;
        if (this.mPlaying) return;

        const display = this.mDisplays.get(idx);
        const data = this.mAnimationData.layerDict.get(idx);
        if (data.frameVisible && this.mCurFrameIdx >= data.frameVisible.length) return;
        if (display) {
            display.visible = data.frameVisible ? data.frameVisible[this.mCurFrameIdx] : true;
        }
    }

    public addAnimationLayer(idx: number) {
        // this.createDisplay(idx);
        throw new Error("todo add AnimationLayer");
        this.updatePlay();
    }

    public updateAnimationLayer() {
        this.clearDisplay();
        this.createDisplays();
        this.updatePlay();
    }

    public updateOffsetLoc(idx: number) {
        const display = this.mDisplays.get(idx);
        if (!display) {
            return;
        }
        if (!this.mAnimationData) {
            return;
        }
        const data = this.mAnimationData.layerDict.get(idx);
        if (!data) {
            return;
        }
        const baseLoc = data.offsetLoc || { x: 0, y: 0 };
        display.x = baseLoc.x;
        display.y = baseLoc.y;
    }

    public generateThumbnail(): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            if (!this.mAnimationData) {
                reject(null);
                return;
            }
            if (this.mAnimationData.layerDict.size === 0) {
                reject(null);
                return;
            }
            const firstLayer = this.mAnimationData.layerDict.values().next().value;
            if (firstLayer.frameName.length === 0) {
                reject(null);
                return;
            }
            const frameName = firstLayer.frameName[0];
            if (!this.scene.textures.exists(SPRITE_SHEET_KEY)) {
                reject(null);
                return;
            }
            if (!this.scene.textures.get(SPRITE_SHEET_KEY).has(frameName)) {
                reject(null);
                return;
            }
            if (frameName === IMAGE_BLANK_KEY) {
                reject(null);
                return;
            }
            const image = this.scene.make.image({ key: SPRITE_SHEET_KEY, frame: frameName }).setOrigin(0, 0);
            let scaleRatio = 1;
            if (image.width > 48 || image.height > 48) {
                if (image.width > image.height) {
                    scaleRatio = 48 / image.width;
                } else {
                    scaleRatio = 48 / image.height;
                }
                image.scale = scaleRatio;
            }

            const render = this.scene.make.renderTexture(
                {
                    width: image.displayWidth >> 0,
                    height: image.displayHeight >> 0
                },
                false
            );
            render.draw(image);
            render.snapshot((img: HTMLImageElement) => {
                resolve(img.src);
                image.destroy();
                render.destroy();
            });
        });
    }

    public clear() {
        this.clearDisplay();

        this.mSelectedGameObjects.length = 0;
        this.mDisplayDatas.clear();
    }

    protected clearDisplay() {
        this.mDisplays.forEach((element) => {
            if (element) {
                element.destroy();
            }
        });
        this.mDisplays.clear();
        this.mMountList.forEach((val) => {
            this.unmount(val as BaseDragonbonesDisplay);
            val.destroy(true);
        });
        this.mMountList.clear();

        super.clearDisplay();
    }

    protected makeAnimation(gen: string, key: string, frameName: string[], frameVisible: boolean[], frameRate: number, loop: boolean, frameDuration?: number[]) {
        if (this.scene.anims.exists(key)) {
            this.scene.anims.remove(key);
        }
        super.makeAnimation(gen, key, frameName, frameVisible, frameRate, loop, frameDuration);
    }

    protected createDisplays(key?: string, ani?: any) {
        if (!this.mAnimationData) return;
        if (!this.scene.textures.exists(SPRITE_SHEET_KEY)) return;

        super.createDisplays(SPRITE_SHEET_KEY, this.mAnimationData.createProtocolObject());
        // this.mAnimationData.layerDict.forEach((val, key) => {
        // this.createDisplay(key);
        // });
    }

    private dragonBoneLoaded() {
        // if (!this.scene.textures.exists(this.MOUNT_DRAGONBONES_KEY)) return;

        // this.scene.load.removeListener(
        //     Phaser.Loader.Events.COMPLETE,
        //     this.dragonBoneLoaded,
        //     this);
        // this.mDragonBonesLoaded = true;

        // this.createMountDisplay();
        // this.updatePlay();
    }

    private keyboardEvent(value) {
        if (!this.mAnimationData || this.mSelectedGameObjects.length <= 0) {
            return;
        }
        let operated = false;
        switch (value.keyCode) {
            case 37:
                this.mSelectedGameObjects.forEach((element) => {
                    element.x--;
                });
                operated = true;
                break;
            case 38:
                this.mSelectedGameObjects.forEach((element) => {
                    element.y--;
                });
                operated = true;
                break;
            case 39:
                this.mSelectedGameObjects.forEach((element) => {
                    element.x++;
                });
                operated = true;
                break;
            case 40:
                this.mSelectedGameObjects.forEach((element) => {
                    element.y++;
                });
                operated = true;
                break;
        }
        if (operated)
            this.syncPositionData();
    }

    private onDragStartHandler(pointer, gameObject) {
        // gameObject.alpha = 1;
        if (!this.mSelectedGameObjects.includes(gameObject)) {
            this.setSelectedGameObjects(gameObject);
        }

        if (gameObject instanceof Phaser.GameObjects.Sprite) {
            const sprite = gameObject as Phaser.GameObjects.Sprite;
            this.mDisplays.forEach((val, key) => {
                if (val === sprite) {
                    this.mEmitter.emit(ElementEditorEmitType.Active_Animation_Layer, key);
                    Logger.getInstance().debug(ElementEditorEmitType.Active_Animation_Layer, key);
                    return;
                }
            });
        } else if (gameObject instanceof dragonBones.phaser.display.ArmatureDisplay) {
            const arm = gameObject as dragonBones.phaser.display.ArmatureDisplay;
            this.mMountList.forEach((val, key) => {
                if (val === arm) {
                    this.mEmitter.emit(ElementEditorEmitType.Active_Mount_Layer, key);
                    Logger.getInstance().debug(ElementEditorEmitType.Active_Mount_Layer, key);
                    return;
                }
            });
        }
    }

    private onDragHandler(pointer, gameObject, dragX, dragY) {
        const delta = { x: 0, y: 0 };
        this.mSelectedGameObjects.forEach((element) => {
            if (element === gameObject) {
                delta.x = dragX - element.x;
                delta.y = dragY - element.y;
            }
        });
        this.mSelectedGameObjects.forEach((element) => {
            element.x = element.x + delta.x;
            element.y = element.y + delta.y;
        });
    }

    private onDragEndHandler(pointer, gameobject) {
        // gameobject.alpha = 0.7;
        this.syncPositionData();

        // if (!this.mPlaying) this.generateFrameSumb();
    }

    private syncPositionData() {
        if (!this.mAnimationData) return;

        this.mDisplays.forEach((val, key) => {
            const data = this.mAnimationData.layerDict.get(key);
            // const point = { x: val.x, y: val.y };
            let { x, y } = val;
            x -= val.width * 0.5;
            y -= val.height * 0.5;
            if (!data.offsetLoc || data.offsetLoc.x !== x || data.offsetLoc.y !== y) {
                data.setOffsetLoc(x, y);
            }
        });

        const mountPoints = this.mAnimationData.mountLayer ? this.mAnimationData.mountLayer.mountPoint : null;
        if (mountPoints) {
            for (let i = 0; i < mountPoints.length; i++) {
                const data = mountPoints[i];
                const mountObject = this.mMountList.get(i);
                const { x, y } = mountObject;
                if (x !== data.x || y !== data.y) {
                    data.x = x;
                    data.y = y;
                }
            }
        }
    }

    private updatePlay() {
        if (!this.mAnimationData) return;
        if (!this.scene) {
            Logger.getInstance().error("no scene created");
            return;
        }
        this.mDisplayDatas.clear();
        const anis = new Map();
        anis.set(this.mAnimationData.name, new AnimationModel(this.mAnimationData.createProtocolObject()));
        this.load({
            discriminator: "FramesModel",
            id: 0,
            gene: SPRITE_SHEET_KEY,
            animations: anis,
            animationName: this.mAnimationData.name
        });
        // this.mCurAnimation = this.mAnimationData.createProtocolObject();
        if (this.scene.textures.exists(SPRITE_SHEET_KEY)) {
            let index = 0;
            this.play({ name: this.mAnimationData.name, flip: false });
            this.mAnimationData.layerDict.forEach((val, key) => {
                const display = this.mDisplays.get(key);
                if (!display) return;
                if (!val.layerVisible) {
                    display.visible = false;
                    return;
                }
                const isSprite = display instanceof Phaser.GameObjects.Sprite;
                if (this.mPlaying) {
                    // const animationName = `${this.framesInfo.gene}_${this.mAnimationData.name}_${index}`;
                    // this.makeAnimation(SPRITE_SHEET_KEY, animationName, val.frameName, val.frameVisible, this.mAnimationData.frameRate, this.mAnimationData.loop, this.mAnimationData.frameDuration);
                    display.visible = true;
                    // if (isSprite) (<Phaser.GameObjects.Sprite>display).play(animationName);
                } else {
                    if (isSprite) (<Phaser.GameObjects.Sprite>display).anims.stop();
                    if (this.mCurFrameIdx >= val.frameName.length) {
                        Logger.getInstance().warn("wrong frame idx: " + this.mCurFrameIdx + "; frameName.length: " + val.frameName.length);
                        display.visible = false;
                        return;
                    }
                    const frameName = val.frameName[this.mCurFrameIdx];
                    if (!this.scene.textures.get(SPRITE_SHEET_KEY).has(frameName)) {
                        Logger.getInstance().warn("donot have frame: " + frameName);
                        display.visible = false;
                        return;
                    }
                    display.setTexture(SPRITE_SHEET_KEY, frameName);
                    // if (display.input) {
                    // display.input.hitArea.setSize(display.displayWidth, display.displayHeight);
                    // } else {
                    display.setInteractive();
                    // this.updateBaseLoc(display, false, val.offsetLoc);
                    // }
                    this.updatePerInputEnabled(display);
                    if (!val.frameVisible || this.mCurFrameIdx < val.frameVisible.length) {
                        display.visible = val.frameVisible ? val.frameVisible[this.mCurFrameIdx] : true;
                    }
                }
                index++;
            });
        }

        this.updateMountLayerPlay();
        // if (!this.mPlaying) this.generateFrameSumb();
    }

    private updateMountLayerPlay() {
        if (!this.mAnimationData) return;
        const mountlayer = this.mAnimationData.mountLayer;

        this.mMountList.forEach((val) => {
            this.unmount(val as BaseDragonbonesDisplay);
            val.destroy(true);
        });
        this.mMountList.clear();

        if (!mountlayer || !mountlayer.mountPoint) return;
        for (let i = 0; i < mountlayer.mountPoint.length; i++) {
            if (this.mMountList.get(i)) continue;
            const arm = new DragonbonesEditorDisplay(this.scene);
            this.mount(arm, i);
            const pos = { x: mountlayer.mountPoint[i].x, y: mountlayer.mountPoint[i].y };
            arm.setPosition(pos.x, pos.y);
            arm.play(this.mCurMountAnimation);

            arm.visible = true;
        }

        // this.mMountArmatureParent.setDepth(data.index);
        this.updateChildrenIdxByDepth();
        const firstLayer = this.mAnimationData.layerDict.values().next().value;
        if (mountlayer.frameVisible && mountlayer.frameVisible.length !== firstLayer.frameName.length) {
            Logger.getInstance().error("wrong data: frameName.length: " + firstLayer.frameName.length + "; mountlayer.frameVisible.length: " + mountlayer.frameVisible.length);
            return;
        }
        for (let i = 0; i < mountlayer.mountPoint.length; i++) {
            if (!this.mMountList.get(i)) continue;
            const armature = this.mMountList.get(i);
            if (this.mPlaying) {
                // this.mMountAnimationTimer = this.scene.time.addEvent({
                //     delay: 0,
                //     timeScale: this.MOUNT_ANIMATION_TIME_SCALE,
                //     callback: this.onMountTimerEvent,
                //     callbackScope: this,
                //     loop: this.mAnimationData.loop
                // });
            } else {
                if (mountlayer.frameVisible && this.mCurFrameIdx < mountlayer.frameVisible.length) {
                    const mountPointsVisible: number = mountlayer.frameVisible[this.mCurFrameIdx];
                    const visible: boolean = this.getMaskValue(mountPointsVisible, i);
                    armature.visible = visible;
                } else {
                    armature.visible = true;
                }
            }
        }
    }

    private onMountTimerEvent() {
        if (!this.mAnimationData || !this.mAnimationData.mountLayer || !this.mAnimationData.mountLayer.mountPoint) {
            Logger.getInstance().error("no data");
            return;
        }

        const mountlayer = this.mAnimationData.mountLayer;
        const frameDuration = [];
        const firstLayer = this.mAnimationData.layerDict.values().next().value;
        if (!firstLayer) {
            Logger.getInstance().error("no layer data");
            return;
        }
        if (firstLayer.frameName.length === 0) {
            Logger.getInstance().error("wrong frame length");
            return;
        }
        if (this.mAnimationData.frameDuration && this.mAnimationData.frameDuration.length !== firstLayer.frameName.length) {
            Logger.getInstance().error("wrong data: frameName.length: " + firstLayer.frameName.length + "; frameDuration.length: " + this.mAnimationData.frameDuration.length);
            return;
        }
        for (let i = 0; i < firstLayer.frameName.length; i++) {
            const dur = this.mAnimationData.frameDuration ? this.mAnimationData.frameDuration[i] : 0;
            frameDuration.push(1 / this.mAnimationData.frameRate + dur);
        }

        const t = 0;
        const f = 0;
        const curFrame = 0;
        // frameDuration.forEach((dur) => {
        //     t += dur;
        //     if (this.mMountAnimationTimer.getElapsedSeconds() < t) {
        //         curFrame = f;
        //         return;
        //     }
        //     f++;
        // });

        // TODO
        // if (mountlayer.frameVisible && mountlayer.frameVisible.length <= curFrame) {
        //     Logger.getInstance().error("wrong frame idx: " + curFrame);
        //     return;
        // }

        for (let i = 0; i < mountlayer.mountPoint.length; i++) {
            if (!this.mMountList.get(i)) continue;
            const armature = this.mMountList.get(i);
            if (mountlayer.frameVisible) {
                const mountPointsVisible: number = mountlayer.frameVisible[curFrame];
                const visible: boolean = this.getMaskValue(mountPointsVisible, i);
                armature.visible = visible;
            } else {
                armature.visible = true;
            }
        }
    }

    private setSelectedGameObjects(gos: Phaser.GameObjects.GameObject | Phaser.GameObjects.GameObject[]) {
        this.mSelectedGameObjects.length = 0;
        this.mSelectedGameObjects = [].concat(gos);
        // 显示选中状态

        Logger.getInstance().debug("select game objects: ", this.mSelectedGameObjects);
    }

    private getMaskValue(mask: number, idx: number): boolean {
        return ((mask >> idx) % 2) === 1;
    }

    private updateInputEnabled() {
        this.mDisplays.forEach((display) => {
            this.updatePerInputEnabled(display);
        });
        this.mMountList.forEach((arm) => {
            (arm as DragonbonesEditorDisplay).setDraggable(this.mIsInteracitve);
        });
    }

    private updatePerInputEnabled(element: DragonbonesEditorDisplay | Phaser.GameObjects.Image | Phaser.GameObjects.Sprite) {
        if (element.input) this.scene.input.setDraggable(element, this.mIsInteracitve);
    }

    private updateChildrenIdxByDepth() {
        this.list = this.list.sort((a, b) => {
            const ac = a as Phaser.GameObjects.Container;
            const bc = b as Phaser.GameObjects.Container;
            return ac.depth - bc.depth;
        });
    }
}
