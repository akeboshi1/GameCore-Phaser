import { Render } from "gamecoreRender";
export declare class PicaGiftLaterctPanel extends Phaser.GameObjects.Container {
    private render;
    private key;
    private dpr;
    private giftQueue;
    private isPlaying;
    constructor(scene: Phaser.Scene, render: Render, width: number, height: number, key: string, dpr: number);
    play(data: any[]): void;
    private playNext;
}
