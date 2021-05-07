export declare class PlayCamera extends Phaser.Cameras.Scene2D.Camera {
    private _follow;
    private matrix;
    private rotation;
    private pixelRatio;
    private moveRatio;
    constructor(x: number, y: number, width: number, height: number, pixelRatio: number, moveRatio?: number);
    setPixelRatio(val: number): void;
    startFollow(target: any, roundPixels: boolean, lerpX: number, lerpY: number, offsetX: number, offsetY: number): this;
    preRender(resolution: number): void;
    private linear;
}
