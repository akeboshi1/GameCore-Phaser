import { PicaPlayerInfo } from "./PicaPlayerInfo";
import { BasicMediator, Game } from "gamecore";
export declare class PicaPlayerInfoMediator extends BasicMediator {
    protected mModel: PicaPlayerInfo;
    constructor(game: Game);
    show(param?: any): void;
    hide(): void;
    isSceneUI(): boolean;
    destroy(): void;
    protected panelInit(): void;
    private onHidePanel;
    private onOwnerCharacterInfo;
    private onOtherCharacterInfo;
    private setItemBases;
    private onFollowHandler;
    private onUnfollowHandler;
    private checkRelation;
    private onAddBlackHandler;
    private onRemoveBlackHandler;
    private onQueryOwnerInfo;
    private onTrackHandler;
    private onInviteHandler;
    private onGoOtherHome;
    private updateFrind;
}
