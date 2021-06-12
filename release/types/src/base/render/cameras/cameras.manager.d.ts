/// <reference types="tooqinggamephaser" />
import { IPos } from "structure";
export interface ICameraService {
    camera: Phaser.Cameras.Scene2D.Camera | undefined;
    moving: boolean;
    readonly targetFollow: any;
    startRoomPlay(scene: Phaser.Scene): any;
    startFollow(target: any): void;
    stopFollow(): void;
    addCamera(camera: Phaser.Cameras.Scene2D.Camera): void;
    removeCamera(camera: Phaser.Cameras.Scene2D.Camera): void;
    resize(width: number, height: number): void;
    setBounds(x: integer, y: integer, width: integer, height: integer, centerOn?: boolean): void;
    setPosition(x: number, y: number): void;
    setScroll(x: number, y: number): void;
    offsetScroll(x: number, y: number): void;
    scrollTargetPoint(x: number, y: number): any;
    destroy(): void;
}
export declare class BaseCamerasManager implements ICameraService {
    protected mMain: Phaser.Cameras.Scene2D.Camera;
    protected mMoving: boolean;
    protected mTarget: any;
    protected mCameras: Phaser.Cameras.Scene2D.Camera[];
    protected zoom: number;
    constructor();
    /**
     * 检测是否在游戏主摄像头内部
     * @param pos
     */
    checkContains(pos: IPos): boolean;
    startRoomPlay(scene: Phaser.Scene): void;
    pan(x: number, y: number, duration: number, ease?: string | Function, force?: boolean, callback?: Phaser.Types.Cameras.Scene2D.CameraPanCallback, context?: any): Promise<any>;
    resize(width: number, height: number): void;
    setScroll(x: number, y: number): void;
    offsetScroll(x: number, y: number): void;
    startFollow(target: any, roundPixels?: boolean, lerpX?: number, lerpY?: number, offsetX?: number, offsetY?: number): void;
    stopFollow(): void;
    addCamera(camera: Phaser.Cameras.Scene2D.Camera): void;
    removeCamera(camera: Phaser.Cameras.Scene2D.Camera): void;
    setBounds(x: integer, y: integer, width: integer, height: integer, centerOn?: boolean): void;
    setPosition(x: number, y: number): void;
    scrollTargetPoint(x: number, y: number, effect?: string): void;
    destroy(): void;
    set moving(val: boolean);
    get moving(): boolean;
    get targetFollow(): any;
    set camera(camera: Phaser.Cameras.Scene2D.Camera | undefined);
    get camera(): Phaser.Cameras.Scene2D.Camera | undefined;
}
