/// <reference types="tooqingphaser" />
export declare class DynamicSprite extends Phaser.GameObjects.Sprite {
    private mLoadCompleteCallbak;
    private mLoadContext;
    private mLoadErrorCallback;
    private mUrl;
    constructor(scene: Phaser.Scene, x: number, y: number);
    load(textureURL: string, atlasURL: string, loadContext?: any, completeCallBack?: Function, errorCallBack?: Function): void;
    destroy(fromScene?: boolean): void;
    private onLoadComplete;
    private onLoadError;
}
