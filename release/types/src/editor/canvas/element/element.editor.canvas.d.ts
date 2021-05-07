/// <reference types="tooqinggamephaser" />
import { EditorCanvas, IEditorCanvasConfig } from "../editor.canvas";
import { ElementEditorBrushType, ElementEditorEmitType } from "./element.editor.type";
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
