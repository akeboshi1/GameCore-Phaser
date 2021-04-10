import { Render } from "gamecoreRender";
export declare class ElementDetail extends Phaser.GameObjects.Container {
    protected render: Render;
    private mCounter;
    private mBuyBtn;
    private mPriceContainer;
    private mDetailBubble;
    private mSelectedProp;
    private mPriceIcon;
    private mPriceText;
    private mDetailDisplay;
    private readonly key;
    private readonly dpr;
    private zoom;
    constructor(scene: Phaser.Scene, render: Render, $key: string, dpr: number, zoom: number);
    resize(w: number, h: number): void;
    addActionListener(): void;
    removeActionListener(): void;
    setProp(prop: any): void;
    setResource(content: any): void;
    private get serviceTimestamp();
    private updatePrice;
    private onBuyHandler;
    private onChangeCounterHandler;
    private onPointerUpHandler;
}
