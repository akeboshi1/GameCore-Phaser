import { BasicMediator, Game } from "gamecore";
export declare class PicaFriendMediator extends BasicMediator {
    protected mView: any;
    private PicaFriend;
    constructor(game: Game);
    show(param?: any): void;
    hide(): void;
    fetchCurrentFriend(): void;
    protected panelInit(): void;
    private onReRelationHandler;
    private onReqNewHandler;
    private onFetchFriendHandler;
    private getFriends;
    private getFans;
    private getFolloweds;
    private onFollowHandler;
    private onUnfollowHandler;
    private onRemoveBanUserHandler;
    private onReqBlacklistHandler;
    private onRemoveFromBlacklistHandler;
    private fetchPlayerList;
    private onPlayerListHandler;
    private onReqFriendAttributesHandler;
    private onSearchHandler;
    private onSearchResultHandler;
    private onReqPlayerListHanlder;
}
