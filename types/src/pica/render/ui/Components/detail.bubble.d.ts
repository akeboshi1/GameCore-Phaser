export declare class DetailBubble extends Phaser.GameObjects.Container {
    private dpr;
    private key;
    private timeID;
    private tipsbg;
    private tipsText;
    private mExpires;
    private mixWidth;
    private mixHeight;
    constructor(scene: Phaser.Scene, key: string, dpr: number, zoom?: number, mixWidth?: number, mixHeight?: number);
    setTipsText(text: string): void;
    setProp(prop: any, servertime: number, property: any): this;
    private resize;
    private getDataFormat;
    private stringFormat;
}
