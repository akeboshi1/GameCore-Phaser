import { UiManager } from "gamecoreRender";
import { PicaBasePanel } from "../pica.base.panel";
export declare class PicaEffectMgrPanel extends PicaBasePanel {
    private content;
    private furniEffectPanel;
    private levelupEffectPanel;
    private tempQueue;
    constructor(uiManager: UiManager);
    resize(w: number, h: number): void;
    init(): void;
    play(data: any[], type: string): void;
    protected onShow(): void;
}
