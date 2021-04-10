export declare class MarketItem extends Phaser.GameObjects.Container {
    private mBackground;
    private mBorder;
    private mPropImage;
    private mNickName;
    private mCoinIcon;
    private mPriceText;
    private mTagIcon;
    private starImg;
    private mProp;
    private zoom;
    private readonly dpr;
    constructor(scene: Phaser.Scene, x: any, y: any, dpr: any, zoom: any);
    setProp(content: any): void;
    private onPropLoadComplete;
    private onPointerUpHandler;
}
