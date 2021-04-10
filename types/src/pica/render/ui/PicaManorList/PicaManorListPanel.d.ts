import { BasePanel, UiManager } from "gamecoreRender";
export declare class PicaManorListPanel extends BasePanel {
    private content;
    private mBackGround;
    private picScrollPanel;
    constructor(uiManager: UiManager);
    resize(width: number, height: number): void;
    show(param?: any): void;
    addListen(): void;
    removeListen(): void;
    preload(): void;
    init(): void;
    setManorList(content: any): void;
    destroy(): void;
    private openManorList;
    private showScrollPanel;
    private hideScrollPanel;
    private setContentSize;
    private OnCloseHandler;
    private onSelectItemHandler;
}
