import { Handler } from "utils";
export declare class PicaOldPartyNavigationPanel extends Phaser.GameObjects.Container {
    private mGameGrid;
    private signProgressPanel;
    private itemtips;
    private hotelBtn;
    private picatownBtn;
    private key;
    private dpr;
    private zoom;
    private sendHandler;
    private partyData;
    private progressData;
    private noPartyImg;
    private noPartyText;
    constructor(scene: Phaser.Scene, width: number, height: number, key: string, dpr: number, zoom: number);
    create(): void;
    refreshMask(): void;
    setHandler(handler: Handler): void;
    setPartyDataList(content: any): void;
    setSignProgress(content: any): void;
    destroy(): void;
    private onGridTableHandler;
    private onHotelHandler;
    private onPicatownHandler;
    private onSendHandler;
    private onProgressHandler;
    private showItemTipsState;
    private setTipsPosition;
}
