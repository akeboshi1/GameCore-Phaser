import { BasicMediator, Game } from "gamecore";
export declare class FriendInviteMediator extends BasicMediator {
    constructor(game: Game);
    targetUI(uiId: any, componentId: any): void;
    private onHideHandler;
}
