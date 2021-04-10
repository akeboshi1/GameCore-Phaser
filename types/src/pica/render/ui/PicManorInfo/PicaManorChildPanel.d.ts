import { Render } from "gamecoreRender";
import { Handler } from "utils";
import { PicaManorBasePanel } from "./PicaManorBasePanel";
export declare class PicaManorChildPanel extends PicaManorBasePanel {
    private editorButton;
    private shopButton;
    private buyButton;
    private headbg;
    private headIcon;
    private nameTitle;
    private contentbg;
    private detailText;
    private zoom;
    private sendHandler;
    private render;
    constructor(scene: Phaser.Scene, render: Render, x: number, y: number, width: number, height: number, dpr: number, zoom: number, key: string);
    setManorInfoData(data: any): void;
    setHandler(send: Handler): void;
    protected create(): void;
    /**
     *
     * @param type 1 - 自己的庄园，2 -无主的庄园 ，3 -别人的庄园
     */
    protected setLayout(type: any, data: any): void;
    protected setButtonActive(type: any): void;
    protected getDetailText(type: any, data: any): string;
    private createNineButton;
    private onEditorButtonHandler;
    private onShopButtonHandler;
    private onBuyButtonHandler;
}
