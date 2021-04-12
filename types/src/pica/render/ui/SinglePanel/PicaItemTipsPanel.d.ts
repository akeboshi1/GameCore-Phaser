import { UiManager } from "gamecoreRender";
import { PicaBasePanel } from "../pica.base.panel";
import { ICountablePackageItem } from "../../../structure";
export declare class PicaItemTipsPanel extends PicaBasePanel {
    static get Inst(): PicaItemTipsPanel;
    private static mInstance;
    private itemTips;
    constructor(uimgr: UiManager);
    showTips(gameobj: any, data: ICountablePackageItem): void;
    destroy(): void;
    protected onShow(): void;
    protected init(): void;
    protected displayTips(gameobj: Phaser.GameObjects.Container, data: ICountablePackageItem): void;
    private setTipsPosition;
}
