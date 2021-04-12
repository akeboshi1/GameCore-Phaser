import { BasicMediator, Game, PlayerProperty } from "gamecore";
import { PicaSurvey } from "./PicaSurvey";
export declare class PicaSurveyMediator extends BasicMediator {
    protected mModel: PicaSurvey;
    private mPlayerInfo;
    constructor(game: Game);
    show(param?: any): void;
    hide(): void;
    destroy(): void;
    panelInit(): void;
    get playerInfo(): PlayerProperty;
    private onUpdatePlayerInfo;
    private onSurveySuccessHandler;
    private get cacheMgr();
}
