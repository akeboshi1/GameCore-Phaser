import { BasicMediator, Game } from "gamecore";
import { PicaExploreLog } from "./PicaExploreLog";
export declare class PicaExploreLogMediator extends BasicMediator {
    protected mModel: PicaExploreLog;
    constructor(game: Game);
    show(param?: any): void;
    hide(): void;
    protected panelInit(): void;
    private onHidePanel;
    private onQueryExploreHint;
    private onEXPLORE_REQUIRE_LIST;
    private onQUERY_CHAPTER_RESULT;
    private onEXPLORE_SUMMARY;
    private onGoHomeHandler;
    private onTipsLayoutHandler;
    private onShowExploreList;
    private onShowPanelHandler;
    private onSHOW_COUNTDOWN;
    private onSHOW_GUIDE_TEXT;
    private get cacheMgr();
}
