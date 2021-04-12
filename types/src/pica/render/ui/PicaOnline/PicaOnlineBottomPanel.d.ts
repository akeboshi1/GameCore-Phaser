import { Handler } from "utils";
export declare class PicaOnlineBottomPanel extends Phaser.GameObjects.Container {
    private key;
    private dpr;
    roleData: any;
    private blackGraphic;
    private bg;
    private headIcon;
    private content;
    private nameText;
    private reportBtn;
    private blackBtn;
    private sendHandler;
    private isblack;
    constructor(scene: Phaser.Scene, width: number, height: number, key: string, dpr: number);
    init(): void;
    setRoleData(data: any, isblock: boolean): void;
    refreshBlack(isblack: boolean): void;
    setHandler(handler: Handler): void;
    addListen(): void;
    removeListen(): void;
    show(): void;
    hide(): void;
    private playMove;
    private onReportHandler;
    private onBlockHandler;
    private onCloseHandler;
}
