import { UiManager } from "gamecoreRender";
import { PicaBasePanel } from "../pica.base.panel";
export declare class PicaTreasurePanel extends PicaBasePanel {
    private blackGraphic;
    private previewPanel;
    private treasureOpenPanel;
    private treasureAllOpenPanel;
    private content;
    private trasureData;
    constructor(uiManager: UiManager);
    resize(w: number, h: number): void;
    onShow(): void;
    destroy(): void;
    init(): void;
    setTreasureData(data: any): void;
    setPreviewData(data: any): void;
    setTreasureOpenData(datas: any[]): void;
    setTreasureAllOpenData(datas: any[]): void;
    openPreviewPanel(): void;
    hidePreviewPanel(): void;
    openTreasureOpenPanel(): void;
    hideOpenPanel(): void;
    openTreasureAllOpenPanel(): void;
    hideAllOpenPanel(): void;
    private OnCloseHandler;
}
