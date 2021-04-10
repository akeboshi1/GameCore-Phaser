import { BasePanel, UiManager } from "gamecoreRender";
export declare class PicaGiftEffectPanel extends BasePanel {
    private laterctPanel;
    private playerPanel;
    private content;
    constructor(uiManager: UiManager);
    resize(w: number, h: number): void;
    show(param?: any): void;
    preload(): void;
    init(): void;
    destroy(): void;
    play(data: any[]): void;
}
