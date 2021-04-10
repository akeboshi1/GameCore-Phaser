import { BasicMediator } from "gamecore";
import { PicaGame } from "../../pica.game";
export declare class PicaOrderMediator extends BasicMediator {
    private mListData;
    private mProgressData;
    constructor(game: PicaGame);
    isSceneUI(): boolean;
    show(param?: any): void;
    hide(): void;
    destroy(): void;
    protected panelInit(): void;
    get playerData(): import("../../../../game").PlayerBag;
    private query_ORDER_LIST;
    private query_CHANGE_ORDER_STAGE;
    private query_PLAYER_PROGRESS;
    private query_PLAYER_PROGRESS_REWARD;
    private on_ORDER_LIST;
    private on_PLAYER_PROGRESS;
    private onHideView;
    private get model();
}
