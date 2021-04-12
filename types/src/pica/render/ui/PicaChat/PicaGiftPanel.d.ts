export declare class PicaGiftPanel extends Phaser.GameObjects.Container {
    private mPropGrid;
    private curGiftItem;
    private key;
    private dpr;
    private zoom;
    private giftName;
    private giftPriceImage;
    private giftValue;
    private sendButton;
    private giftDescr;
    private curGiftData;
    constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, key: string, dpr: number, zoom: number);
    resize(): void;
    destroy(): void;
    hide(): void;
    show(): void;
    setGiftDatas(datas: any[]): void;
    setGiftActive(active: boolean): void;
    onUsePropHandler(data: any, tempdata: any, count: number): void;
    protected init(): void;
    private onSelectItemHandler;
    private onSendHandler;
    private getBuyPackageData;
}
