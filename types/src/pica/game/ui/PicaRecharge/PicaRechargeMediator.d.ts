import { BasicMediator, Game, PlayerProperty } from "gamecore";
export declare class PicaRechargeMediator extends BasicMediator {
    private picaRecharge;
    private mPlayerInfo;
    constructor(game: Game);
    show(param?: any): void;
    hide(): void;
    isSceneUI(): boolean;
    destroy(): void;
    get playerInfo(): PlayerProperty;
    private query_ORDER_LIST;
    private query_WORK_ON_JOB;
    private on_ORDER_LIST;
    private onHideView;
}
