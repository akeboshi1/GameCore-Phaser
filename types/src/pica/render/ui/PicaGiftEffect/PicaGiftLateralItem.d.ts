import { Handler } from "utils";
export declare class PicaGiftLateralItem extends Phaser.GameObjects.Container {
    private bg;
    private headicon;
    private titletext;
    private giftIcon;
    private countTex;
    private giftCount;
    private key;
    private dpr;
    private compl;
    constructor(scene: Phaser.Scene, key: string, dpr: number);
    setItemData(compl: Handler): void;
    playMove(from: number, to: number): void;
    playCount(): void;
    playAlpha(): void;
    private getCountTweenData;
}
