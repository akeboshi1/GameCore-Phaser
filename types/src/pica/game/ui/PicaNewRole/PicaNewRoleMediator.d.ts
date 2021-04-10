import { PicaNewRole } from "./PicaNewRole";
import { BasicMediator, Game } from "gamecore";
export declare class PicaNewRoleMediator extends BasicMediator {
    protected mModel: PicaNewRole;
    private uid;
    constructor(game: Game);
    show(param?: any): void;
    hide(): void;
    destroy(): void;
    panelInit(): void;
    private query_Another_Info;
    private on_Another_Info;
    private onOpeningCharacterHandler;
    private onFollowHandler;
    private onTradingHandler;
    private onPeopleActionHandler;
    private onHideView;
    private onViewInitComplete;
    private checkFollowState;
    private get config();
}
