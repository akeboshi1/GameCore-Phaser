import { BasePanel, UiManager } from "gamecoreRender";
export declare class DialogPanel extends BasePanel {
    key: string;
    private npcName;
    private npcIcon;
    private content;
    private text;
    private blackBg;
    private listItems;
    private bg;
    constructor(uiManager: UiManager);
    resize(w: number, h: number): void;
    preload(): void;
    show(param?: any): void;
    init(): void;
    setLayoutItems(arr: any): void;
    setDialogData(data: any): void;
    update(param?: any): void;
    private onItemHandler;
    private onNextDialogHandler;
    private onCloseHandler;
}
