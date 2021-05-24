/// <reference types="phaser" />
export declare class DynamicImage extends Phaser.GameObjects.Image {
    private mLoadCompleteCallbak;
    private mLoadContext;
    private mLoadErrorCallback;
    private mUrl;
    constructor(scene: Phaser.Scene, x: number, y: number, key?: string, frame?: string);
    load(value: string, loadContext?: any, completeCallBack?: Function, errorCallBack?: Function): void;
    destroy(fromScene?: boolean): void;
    protected onLoadComplete(file?: string): void;
    protected onLoadError(file: Phaser.Loader.File): void;
}
