import { Handler } from "utils";
export declare class PicaLevelUpEffectPanel extends Phaser.GameObjects.Container {
    private dpr;
    private zoom;
    private content;
    private maskBlack;
    private lightSprite;
    private yuSprite;
    private wingSprite;
    private levelbg;
    private levelTex;
    private tipTex;
    private tipCon;
    private sendHander;
    private effectQueue;
    private isPlaying;
    constructor(scene: Phaser.Scene, width: number, height: number, dpr: number, zoom: number);
    resize(width: any, height: any): void;
    setHandler(send: Handler): void;
    setLevelUpData(data: any): void;
    playNext(): void;
    destroy(): void;
    protected init(): void;
    private createSprite;
    private onWingAniHandler;
    private onYuAniComplHandler;
}
