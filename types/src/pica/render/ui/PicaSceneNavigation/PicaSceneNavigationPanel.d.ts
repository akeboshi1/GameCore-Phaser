import { UiManager } from "gamecoreRender";
import { PicaBasePanel } from "../pica.base.panel";
export declare class PicaSceneNavigationPanel extends PicaBasePanel {
    private content;
    private blackBg;
    private bg;
    private townPanel;
    private mNavigationData;
    constructor(uiManager: UiManager);
    resize(w: number, h: number): void;
    onShow(): void;
    setNavigationListData(content: any[]): void;
    protected init(): void;
    protected onHide(): void;
    private openTownNavigationPanel;
    private hideTownNavigationPanel;
    private onTownHandler;
    private onEnterRoomHandler;
    private onCloseHandler;
    private playMove;
}
