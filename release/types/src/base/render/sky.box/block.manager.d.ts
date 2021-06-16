import { IScenery } from "structure";
import { IRender } from "../render";
export interface IBlockManager {
    startPlay(scene: Phaser.Scene): any;
    check(time?: number, delta?: number): any;
}
export declare class BlockManager implements IBlockManager {
    private render;
    private mContainer;
    private mRows;
    private mCols;
    private mGridWidth;
    private mGridHeight;
    private mGrids;
    private mUris;
    private mMainCamera;
    private mScaleRatio;
    private mSceneName;
    private scene;
    private mScenery;
    private mCameras;
    private mStateMap;
    private _bound;
    private tween;
    constructor(scenery: IScenery, render: IRender);
    startPlay(scene: Phaser.Scene): void;
    check(time?: number, delta?: number): void;
    update(scenery: IScenery): void;
    setSize(imageW: number, imageH: number, gridW?: number, gridH?: number): void;
    resize(width: number, height: number): void;
    updateScale(val: number): void;
    getLayer(): Phaser.GameObjects.Container;
    updatePosition(): Promise<void>;
    destroy(): void;
    setState(state: any): void;
    playSkyBoxAnimation(packet: any): Promise<void>;
    protected handlerState(state: any): void;
    protected updateDepth(): void;
    protected initBlock(): void;
    protected move(targets: any, props: any, duration?: number, resetProps?: any, resetDuration?: number): void;
    protected initCamera(): void;
    protected clear(): void;
    get scenery(): IScenery;
    get scaleRatio(): number;
    protected fixPosition(props: any): Promise<any>;
    protected getOffset(): Promise<{
        x: any;
        y: any;
    }>;
}
