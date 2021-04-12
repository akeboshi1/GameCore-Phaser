import { BasicMediator, Game } from "gamecore";
import { PicaCompose } from "./PicaCompose";
export declare class PicaComposeMediator extends BasicMediator {
    protected mModel: PicaCompose;
    constructor(game: Game);
    show(param?: any): void;
    hide(): void;
    private onSyncFinishHandler;
    private onUpdateHandler;
    get playerBag(): import("../../../../game").PlayerBag;
    private onReqUseFormula;
    private onRetFormulaDetial;
    private onShowPanel;
    private onHideView;
    private updateSkills;
    private isQualified;
    get userData(): import("../../../../game").UserDataManager;
}
