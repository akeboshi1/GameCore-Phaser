import { Render } from "gamecoreRender";
import { RunningAnimation } from "structure";
import { Handler } from "utils";
export declare class DetailDisplay extends Phaser.GameObjects.Container {
    protected render: Render;
    private mDisplay;
    private mUrl;
    private mImage;
    private mDragonboneDisplay;
    private mFramesDisplay;
    private complHandler;
    private mFrameAni;
    /**
     * 0 -不固定  1 - 固定尺寸，2 - 固定尺寸缩放取整
     */
    private mFixedSize;
    private curLoadType;
    private isLoading;
    private mFixScale;
    constructor(scene: Phaser.Scene, render: Render);
    /**
     *
     * @param fixeScale 整体缩放比例 默认是1;
     * @param fixedSize 0 -不固定  1 - 固定尺寸，2 - 固定尺寸缩放取整
     */
    setFixedScale(fixeScale?: number, fixedSize?: number): this;
    loadDisplay(content: any): void;
    loadElement(content: any): void;
    loadAvatar(content: any, scale?: number, offset?: Phaser.Geom.Point): void;
    loadUrl(url: string, data?: string): void;
    loadSprite(resName: string, textureurl: string, jsonurl: string, scale?: number): void;
    displayLoading(resName: string, textureurl: string, jsonurl: string, scale?: number): void;
    setTexture(key: string, frame: string, scale?: number): void;
    setNearest(): void;
    setComplHandler(handler: Handler): void;
    setPlayAnimation(ani: RunningAnimation, back?: boolean): void;
    get display(): any;
    private onCompleteHandler;
    private clearDisplay;
    private addDisplay;
}
