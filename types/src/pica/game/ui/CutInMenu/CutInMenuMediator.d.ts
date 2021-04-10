import { BasicMediator, Game, PlayerProperty } from "gamecore";
import { CutInMenu } from "./CutInMenu";
export declare class CutInMenuMediator extends BasicMediator {
    protected mModel: CutInMenu;
    constructor(game: Game);
    show(param?: any): void;
    hide(): void;
    panelInit(): void;
    get playerInfo(): PlayerProperty;
    private onUpdatePlayerInfo;
    private onRightButtonHandler;
    private openPanelMediator;
    private openSurveyMediator;
    private onOpenEditorHandler;
    private onHideView;
    private get buttonType();
    private get cacheMgr();
}
