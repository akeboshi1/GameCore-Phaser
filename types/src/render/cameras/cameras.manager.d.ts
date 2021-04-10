import { BaseCamerasManager } from "baseRender";
import { Render } from "../render";
export declare class CamerasManager extends BaseCamerasManager {
    protected render: Render;
    readonly MINI_VIEW_SIZE = 50;
    readonly VIEW_PORT_SIZE = 50;
    protected viewPort: Phaser.Geom.Rectangle;
    protected miniViewPort: Phaser.Geom.Rectangle;
    constructor(render: Render);
    startRoomPlay(scene: Phaser.Scene): void;
    pan(x: number, y: number, duration: number): Promise<any>;
    set camera(camera: Phaser.Cameras.Scene2D.Camera | undefined);
    get camera(): Phaser.Cameras.Scene2D.Camera | undefined;
    resize(width: number, height: number): void;
    scrollTargetPoint(x: number, y: number, effect?: string): void;
    destroy(): void;
    private resetCameraSize;
    private setViewPortSize;
}
