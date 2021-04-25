/// <reference types="tooqinggamephaser" />
import { EditorCanvas, IEditorCanvasConfig } from "../editor.canvas";
import { BaseFramesDisplay } from "baseRender";
import { AnimationDataNode } from "game-capsule";
export declare const WEB_HOME_PATH: string;
export declare const SPRITE_SHEET_KEY: string;
export declare const IMAGE_BLANK_KEY: string;
export default class ElementEditorResourceManager {
    private mElementNode;
    private mScene;
    private mEmitter;
    private mResourcesChangeListeners;
    private mLocalHomePath;
    constructor(data: any, emitter: Phaser.Events.EventEmitter, localHomePath: string);
    init(scene: Phaser.Scene): void;
    addResourcesChangeListener(listener: ResourcesChangeListener): void;
    removeResourcesChangeListener(listener: ResourcesChangeListener): void;
    loadResources(): void;
    generateSpriteSheet(images: any[]): Promise<{
        url: string;
        json: string;
    }>;
    /**
     * 解析sprite sheet
     */
    deserializeDisplay(): Promise<any[]>;
    clearResource(): void;
    destroy(): void;
    private imageLoaded;
    private imageLoadError;
}
export interface ResourcesChangeListener {
    onResourcesLoaded(): void;
    onResourcesCleared(): void;
}
export declare enum ElementEditorBrushType {
    Drag = 0,
    Walkable = 1,
    Collision = 2,
    Interactive = 3
}
export declare enum ElementEditorEmitType {
    Resource_Loaded = "resourceLoaded",
    Active_Animation_Layer = "activeAnimationLayer",
    Active_Mount_Layer = "activeMountLayer",
    Update_Frame_Sumb = "updateFrameSumb"
}
/**
 * api:https://dej4esdop1.feishu.cn/docs/doccn1Ez79LjYywnNiAGbaP35Tc
 */
export declare class ElementEditorCanvas extends EditorCanvas {
    mData: any;
    private readonly SCENEKEY;
    private readonly ERROR_UNINITED;
    private readonly GAME_SIZE;
    private mResManager;
    private mGrids;
    private mAnimations;
    constructor(config: IEditorCanvasConfig);
    destroy(): void;
    getScene(): Phaser.Scene;
    onSceneCreated(): void;
    onSceneDestroy(): void;
    on(event: ElementEditorEmitType, fn: Function, context?: any): void;
    off(event: ElementEditorEmitType, fn?: Function, context?: any, once?: boolean): void;
    deserializeDisplay(): Promise<any[]>;
    generateSpriteSheet(images: any[]): Promise<{
        url: string;
        json: string;
    }>;
    reloadDisplayNode(): void;
    changeAnimationData(animationDataId: number): void;
    selectFrame(frameIndex: number): void;
    playAnimation(): void;
    stopAnimation(): void;
    changeBrush(mode: ElementEditorBrushType): void;
    selectAnimationLayer(layerIndexs: number[]): void;
    selectMountLayer(mountPointIndex?: number): void;
    updateDepth(): void;
    updateAnimationLayer(): void;
    toggleMountPointAnimationPlay(playerAnimationName: string, mountPointIndex?: number): void;
    updateMountLayer(): void;
    updateOffsetLoc(layerIndexs: number): void;
    generateThumbnail(): Promise<string>;
    private initCameraPosition;
}
export declare class ElementEditorGrids extends Phaser.GameObjects.Container {
    private mRows;
    private mCols;
    private mAnchor;
    private readonly gridWidth;
    private readonly gridHeight;
    private mPositionManager;
    private mGridLayer;
    private mWalkableLayer;
    private mCollisionLayer;
    private mInteractiveLayer;
    private mWalkableArea;
    private mBasicWalkableArea;
    private mCollisionArea;
    private mBasicCollisionArea;
    private mInteractiveArea;
    private mBasicInteractiveArea;
    private mCurToolType;
    private mAnimationData;
    constructor(scene: Phaser.Scene, node: any);
    setAnimationData(animationData: any): void;
    getAnchor90Point(): Phaser.Geom.Point;
    getOriginPoint(): Phaser.Geom.Point;
    clear(): void;
    changeBrush(val: ElementEditorBrushType): void;
    private setArea;
    private drawFromData;
    private onDownHandler;
    private onMoveHandler;
    private onUpHandler;
    private clickGrid;
    private dragCamera;
    private drawWalkable;
    private eraseWalkable;
    private drawCollision;
    private eraseCollision;
    private drawInteractive;
    private eraseInteractive;
    private drawGrid;
    private drawLine;
}
export declare class ElementFramesDisplay extends BaseFramesDisplay implements ResourcesChangeListener {
    private readonly MOUNT_ANIMATION_TIME_SCALE;
    private mGrids;
    private mEmitter;
    private mSelectedGameObjects;
    private mAnimationData;
    private mCurFrameIdx;
    private mPlaying;
    private mCurMountAnimation;
    constructor(scene: Phaser.Scene, node: any, grids: ElementEditorGrids, emitter: Phaser.Events.EventEmitter);
    setAnimationData(data: AnimationDataNode): void;
    onResourcesLoaded(): void;
    onResourcesCleared(): void;
    setFrame(frameIdx: number): void;
    setMountAnimation(aniName: string, idx?: number): void;
    updateMountDisplay(): void;
    setPlay(playing: boolean): void;
    setInputEnabled(val: boolean): void;
    setSelectedAnimationLayer(idxs: number[]): void;
    setSelectedMountLayer(mountPointIndex?: number): void;
    updateDepth(): void;
    updatePerAnimationLayerVisible(idx: number): void;
    addAnimationLayer(idx: number): void;
    updateAnimationLayer(): void;
    updateOffsetLoc(idx: number): void;
    generateThumbnail(): Promise<string>;
    clear(): void;
    protected clearDisplay(): void;
    protected makeAnimation(gen: string, key: string, frameName: string[], frameVisible: boolean[], frameRate: number, loop: boolean, frameDuration?: number[]): void;
    protected createDisplays(key?: string, ani?: any): void;
    private dragonBoneLoaded;
    private keyboardEvent;
    private onDragStartHandler;
    private onDragHandler;
    private onDragEndHandler;
    private syncPositionData;
    private updatePlay;
    private updateMountLayerPlay;
    private onMountTimerEvent;
    private setSelectedGameObjects;
    private getMaskValue;
    private updateInputEnabled;
    private updatePerInputEnabled;
    private updateChildrenIdxByDepth;
}
