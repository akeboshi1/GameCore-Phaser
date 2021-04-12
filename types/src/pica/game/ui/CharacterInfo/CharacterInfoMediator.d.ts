import { BasicMediator, Game } from "gamecore";
export declare class CharacterInfoMediator extends BasicMediator {
    constructor(game: Game);
    show(param?: any): void;
    hide(): void;
    isSceneUI(): boolean;
    destroy(): void;
    protected panelInit(): void;
    private onHidePanel;
    private onOwnerCharacterInfo;
    private onOtherCharacterInfo;
    private onFollowHandler;
    private onUnfollowHandler;
    private checkRelation;
    private onAddBlackHandler;
    private onRemoveBlackHandler;
    private onQueryOwnerInfo;
    private onTrackHandler;
    private onInviteHandler;
    private updateFrind;
    private get model();
}
