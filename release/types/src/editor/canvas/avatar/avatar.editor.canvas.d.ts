/// <reference types="tooqinggamephaser" />
import { EditorCanvas, IEditorCanvasConfig } from "../editor.canvas";
/**
 * api:https://dej4esdop1.feishu.cn/docs/doccn2zhhTyXaB3HYm69a0sIYhh
 * 尺寸规范链接：https://dej4esdop1.feishu.cn/docs/doccn5QVnqQ9XQz5baCBayOy49f?from=from_copylink
 */
export declare class AvatarEditorCanvas extends EditorCanvas {
    mData: any;
    private readonly SCENEKEY;
    private readonly SCENEKEY_SNAPSHOT;
    private mDragonbone;
    constructor(config: IEditorCanvasConfig);
    destroy(): void;
    getScene(): Phaser.Scene;
    onSceneCreated(scene: Phaser.Scene): void;
    update(): void;
    onSceneDestroy(): void;
    loadLocalResources(img: any, part: string, dir: string, layer?: string): Promise<string>;
    toggleFacing(dir: number): void;
    play(animationName: string): void;
    clearParts(): void;
    mergeParts(sets: any[]): void;
    cancelParts(sets: any[]): void;
    generateShopIcon(width: number, height: number): Promise<string>;
    generateHeadIcon(width: number, height: number): Promise<string>;
    on(event: AvatarEditorEmitType, fn: Function, context?: any): void;
    off(event: AvatarEditorEmitType, fn?: Function, context?: any, once?: boolean): void;
}
export declare class AvatarEditorScene extends Phaser.Scene {
    private onSceneCreated;
    private onSceneUpdate;
    private onSceneDestroy;
    preload(): void;
    init(data: {
        onCreated?: (scene: Phaser.Scene) => any;
        onUpdate?: () => any;
        onDestroy?: () => any;
    }): void;
    create(): void;
    update(): void;
    destroy(): void;
}
export declare enum AvatarEditorEmitType {
    ERROR = "error"
}
