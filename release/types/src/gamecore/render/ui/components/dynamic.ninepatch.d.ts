/// <reference types="phaser" />
import { NineSlicePatch } from "apowophaserui";
export declare class DynamicNinepatch {
    private mScene;
    private mParent?;
    protected mUrl: string;
    protected mLoadCompleteCallBack?: Function;
    protected mLoadContext?: any;
    protected mImage: NineSlicePatch;
    protected mConfig: any;
    constructor(mScene: Phaser.Scene, mParent?: Phaser.GameObjects.Container);
    load(value: string, config: object, completeCallBack?: Function, loadContext?: any): void;
    private onLoadCompleteHandler;
    get image(): NineSlicePatch;
}
