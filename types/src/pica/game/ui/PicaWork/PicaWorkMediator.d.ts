import { PicaWork } from "./PicaWork";
import { BasicMediator, Game, PlayerProperty } from "gamecore";
export declare class PicaWorkMediator extends BasicMediator {
    protected mModel: PicaWork;
    private mPlayerInfo;
    constructor(game: Game);
    show(param?: any): void;
    hide(): void;
    destroy(): void;
    panelInit(): void;
    get playerInfo(): PlayerProperty;
    private query_WORK_LIST;
    private query_WORK_ON_JOB;
    private on_Work_LIST;
    private onUpdatePlayerInfo;
    private checkCanDoJob;
    private onHideView;
    private onViewInitComplete;
}
