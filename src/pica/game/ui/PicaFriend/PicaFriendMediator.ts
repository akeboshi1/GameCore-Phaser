import { op_client } from "pixelpai_proto";
import { PicaFriend } from "./PicaFriend";
import { PicaFriendRelation } from "./PicaFriendRelation";
import { ModuleName, FriendChannel, EventType } from "structure";
import { BasicMediator, Game } from "gamecore";

export class PicaFriendMediator extends BasicMediator {
    protected mView;
    private PicaFriend: PicaFriend;
    constructor(game: Game) {
        super(ModuleName.PICFRIEND_NAME, game);
        this.PicaFriend = new PicaFriend(game);
        this.game.emitter.on(EventType.PLAYER_LIST, this.onPlayerListHandler, this);
        this.game.emitter.on(EventType.SEARCH_RESULT, this.onSearchResultHandler, this);
    }

    show(param?: any) {
        super.show(param);
    }

    hide() {
        super.hide();
        this.game.emitter.off("hide", this.onHidePanel, this);
        this.game.emitter.off(EventType.FETCH_FRIEND, this.onFetchFriendHandler, this);
        this.game.emitter.off(EventType.UNFOLLOW, this.onUnfollowHandler, this);
        this.game.emitter.off(EventType.FOLLOW, this.onFollowHandler, this);
        this.game.emitter.off(EventType.REMOVE_FROM_BLACKLIST, this.onRemoveBanUserHandler, this);
        this.game.emitter.off(EventType.REQ_FRIEND_ATTRIBUTES, this.onReqFriendAttributesHandler, this);
        this.game.emitter.off(EventType.REQ_BLACKLIST, this.onReqBlacklistHandler, this);
        this.game.emitter.off(EventType.REMOVE_FROM_BLACKLIST, this.onRemoveFromBlacklistHandler, this);
        this.game.emitter.off(EventType.SEARCH_FRIEND, this.onSearchHandler, this);
        this.game.emitter.off(EventType.REQ_PLAYER_LIST, this.onReqPlayerListHanlder, this);
        this.game.emitter.off(EventType.REQ_RELATION, this.onReRelationHandler, this);
        this.game.emitter.off(EventType.REQ_NEW_FANS, this.onReqNewHandler, this);
    }

    destroy() {
        if (this.PicaFriend) {
            this.PicaFriend.destroy();
            this.PicaFriend = undefined;
        }
        if (this.mView) {
            this.mView.hide();
            this.mView = undefined;
        }
        super.destroy();
    }

    fetchCurrentFriend() {
        if (this.mView) {
            this.mView.fetchCurrentFriend();
        }
    }

    protected panelInit() {
        this.game.emitter.on("hide", this.onHidePanel, this);
        this.game.emitter.on(EventType.FETCH_FRIEND, this.onFetchFriendHandler, this);
        this.game.emitter.on(EventType.UNFOLLOW, this.onUnfollowHandler, this);
        this.game.emitter.on(EventType.FOLLOW, this.onFollowHandler, this);
        this.game.emitter.on(EventType.REMOVE_FROM_BLACKLIST, this.onRemoveBanUserHandler, this);
        this.game.emitter.on(EventType.REQ_FRIEND_ATTRIBUTES, this.onReqFriendAttributesHandler, this);
        this.game.emitter.on(EventType.REQ_BLACKLIST, this.onReqBlacklistHandler, this);
        this.game.emitter.on(EventType.REMOVE_FROM_BLACKLIST, this.onRemoveFromBlacklistHandler, this);
        this.game.emitter.on(EventType.SEARCH_FRIEND, this.onSearchHandler, this);
        this.game.emitter.on(EventType.REQ_PLAYER_LIST, this.onReqPlayerListHanlder, this);
        this.game.emitter.on(EventType.REQ_RELATION, this.onReRelationHandler, this);
        this.game.emitter.on(EventType.REQ_NEW_FANS, this.onReqNewHandler, this);
        this.mView = this.game.peer.render[ModuleName.PICFRIEND_NAME];
        if (this.mView && this.mShowData)
            this.mView.setFriend(FriendChannel.Friends, this.mShowData);
    }

    private onReRelationHandler(ids: number[]) {
        const relations = [];
        this.game.peer.render[ModuleName.ACCOUNT_NAME].getAccountData().then((accountData) => {
            for (const id of ids) {
                relations.push({
                    userA: accountData.id,
                    userB: id
                });
            }
            this.game.httpService.post("user/check_relation", { relations }).then((response: any) => {
                const { code, data } = response;
                if (code === 200) {
                    const result = [];
                    for (const key in data) {
                        const users = key.split("_");
                        result.push(PicaFriendRelation.check(users[0], users[1], data[key]));
                    }
                    if (this.mView) this.mView.updateRelation(result);
                }
            });
        });
    }

    private onReqNewHandler() {
        this.PicaFriend.getFans().then((response) => {
            const data = response.data;
            if (!data) {
                return;
            }
            this.mView.setFriend(FriendChannel.Notice, data.filter((friend) => friend.user));
        });
    }

    private onFetchFriendHandler(type: FriendChannel) {
        switch (type) {
            case FriendChannel.Friends:
                this.getFriends();
                break;
            case FriendChannel.Fans:
                this.getFans();
                break;
            case FriendChannel.Followes:
                this.getFolloweds();
                break;
        }
    }

    private getFriends() {
        this.PicaFriend.getFriends().then((response) => {
            if (!this.mPanelInit) {
                this.mShowData = response.data;
                return;
            }
            this.mView.setFriend(FriendChannel.Friends, response.data);
        });
    }

    private getFans() {
        this.PicaFriend.getFans().then((response) => {
            const data = response.data;
            if (!data) {
                return;
            }
            if (!this.mPanelInit) {
                this.mShowData = data;
                return;
            }
            this.mView.setFriend(FriendChannel.Fans, data.filter((friend) => friend.user));
        });
    }

    private getFolloweds() {
        this.PicaFriend.getFolloweds().then((response) => {
            const data = response.data;
            if (!data) {
                return;
            }
            if (!this.mPanelInit) {
                this.mShowData = data;
                return;
            }
            this.mView.setFriend(FriendChannel.Followes, data.filter((friend) => friend.followed_user));
        });
    }

    private onFollowHandler(args: string) {
        if (!args || args.length < 0) return;
        const id = args[0];
        this.game.httpService.follow(id).then((response) => {
            this.mView.filterById(id);
        });
    }

    private onUnfollowHandler(args: string) {
        if (!args || args.length < 0) return;
        const id = args[0];
        this.game.httpService.unfollow(id).then((response) => {
            this.mView.filterById(id);
        });
    }

    private onRemoveBanUserHandler(args) {
        if (!args || args.length < 1) {
            return;
        }
        this.game.httpService.removeBanUser(args[0]).then((response: any) => {
            if (response.code === 201) {
                this.mView.filterById(args[0]);
            }
        });
    }

    private onReqBlacklistHandler() {
        this.PicaFriend.getBanlist().then((response) => {
            this.mView.setFriend(FriendChannel.Blacklist, response.data);
        });
    }

    private onRemoveFromBlacklistHandler(args) {
        if (!args || args.length < 1) {
            return;
        }
        this.game.httpService.removeBanUser(args[0]).then((response) => {
            this.mView.filterById(args[0]);
        });
    }

    private fetchPlayerList(data) {
        if (!data) return;
        const ids = data.map((friend: any) => friend.id);
        this.PicaFriend.fetchFriendList(ids);
    }

    private onPlayerListHandler(content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_PKT_PLAYER_LIST) {
        this.mView.updateFriend(content);
    }

    private onReqFriendAttributesHandler(id: string) {
        const uimanager = this.game.uiManager;
        uimanager.showMed(ModuleName.CHARACTERINFO_NAME);
        this.PicaFriend.fetchFriendInfo(id);
    }

    private onSearchHandler(text) {
        if (text && text.length > 0) this.PicaFriend.searchFriend(text[0]);
    }

    private onSearchResultHandler(content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_PKT_SEARCH_PLAYER) {
        // this.mView.setFriend(FriendChannel.Search, content.playerInfos);
        this.mView.setFriend(FriendChannel.Search, content.playerInfos);
    }

    private onReqPlayerListHanlder(ids) {
        this.PicaFriend.fetchFriendList(ids);
    }

    private onHidePanel() {
        if (this.mView) {
            this.mView.hide();
        }
        this.mView = undefined;
        this.hide();
    }
}
