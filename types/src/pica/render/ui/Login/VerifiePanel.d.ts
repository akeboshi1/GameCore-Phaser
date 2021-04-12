import { NineSliceButton } from "apowophaserui";
import { BasePanel, Render } from "gamecoreRender";
export declare class VerifiedPanel extends BasePanel {
    private mVerifiedBtn;
    private mNameInput;
    private mIDCardInput;
    private isIDCard;
    constructor(scene: Phaser.Scene, render: Render);
    setVerifiedEnable(val: boolean): void;
    protected preload(): void;
    protected init(): void;
    private onVerifiedHandler;
    private onVerifiedDownHandler;
    private createInput;
    private checkIdCard;
    get verifiedBtn(): NineSliceButton;
}
