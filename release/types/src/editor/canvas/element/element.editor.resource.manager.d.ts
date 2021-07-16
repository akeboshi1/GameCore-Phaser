/// <reference types="tooqingphaser" />
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
