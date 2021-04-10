import { BasePanel, UiManager } from "gamecoreRender";
export declare class PicaNoticePanel extends BasePanel {
    private mContent;
    private isbigbg;
    private bg;
    private imageIcon;
    constructor(uiManager: UiManager);
    show(param: any): void;
    resize(): void;
    protected preload(): void;
    protected init(): void;
}
