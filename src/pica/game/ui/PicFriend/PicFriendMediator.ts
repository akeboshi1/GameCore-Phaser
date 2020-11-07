import { op_client } from "pixelpai_proto";
import { PicFriend } from "./PicFriend";
import { PicFriendEvent } from "./PicFriendEvent";
import { PicFriendRelation } from "./PicFriendRelation";
import { ModuleName, FriendChannel } from "structure";
import { BasicMediator, Game } from "gamecore";

export class PicFriendMediator extends BasicMediator {
    public static NAME: string = ModuleName.PICFRIEND_NAME;
    protected mView;
    private picFriend: PicFriend;
    constructor(game: Game) {
        super(game);
        this.picFriend = new PicFriend(game);
        this.game.emitter.on(PicFriendEvent.PLAYER_LIST, this.onPlayerListHandler, this);
        this.game.emitter.on(PicFriendEvent.SEARCH_RESULT, this.onSearchResultHandler, this);
    }

    show(param?: any) {
        this.__exportProperty(() => {
            this.game.peer.render.showPanel(ModuleName.PICFRIEND_NAME, param);
            if (!this.mView) {
                this.mView = this.game.peer.render[ModuleName.PICFRIEND_NAME];
                this.mView.on("hide", this.onHidePanel, this);
                this.mView.on(PicFriendEvent.FETCH_FRIEND, this.onFetchFriendHandler, this);
                this.mView.on(PicFriendEvent.UNFOLLOW, this.onUnfollowHandler, this);
                this.mView.on(PicFriendEvent.FOLLOW, this.onFollowHandler, this);
                this.mView.on(PicFriendEvent.REMOVE_FROM_BLACKLIST, this.onRemoveBanUserHandler, this);
                this.mView.on(PicFriendEvent.REQ_FRIEND_ATTRIBUTES, this.onReqFriendAttributesHandler, this);
                this.mView.on(PicFriendEvent.REQ_BLACKLIST, this.onReqBlacklistHandler, this);
                this.mView.on(PicFriendEvent.REMOVE_FROM_BLACKLIST, this.onRemoveFromBlacklistHandler, this);
                this.mView.on(PicFriendEvent.SEARCH_FRIEND, this.onSearchHandler, this);
                this.mView.on(PicFriendEvent.REQ_PLAYER_LIST, this.onReqPlayerListHanlder, this);
                this.mView.on(PicFriendEvent.REQ_RELATION, this.onReRelationHandler, this);
                this.mView.on(PicFriendEvent.REQ_NEW_FANS, this.onReqNewHandler, this);
            }
        });
    }

    destroy() {
        if (this.picFriend) {
            this.picFriend.destroy();
            this.picFriend = undefined;
        }
        if (this.mView) {
            this.mView.hide();
            this.mView = undefined;
        }
    }

    fetchCurrentFriend() {
        if (this.mView) {
            this.mView.fetchCurrentFriend();
        }
    }

    private onReRelationHandler(ids: number[]) {
        const relations = [];
        this.game.peer.render[ModuleName.ACCOUNT_NAME].accountData().then((accountData) => {
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
                        result.push(PicFriendRelation.check(users[0], users[1], data[key]));
                    }
                    this.mView.updateRelation(result);
                }
            });
        });
    }

    private onReqNewHandler() {
        this.picFriend.getFans().then((response) => {
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
        this.picFriend.getFriends().then((response) => {
            this.mView.setFriend(FriendChannel.Friends, response.data);
        });
    }

    private getFans() {
        this.picFriend.getFans().then((response) => {
            const data = response.data;
            if (!data) {
                return;
            }
            this.mView.setFriend(FriendChannel.Fans, data.filter((friend) => friend.user));
        });
    }

    private getFolloweds() {
        this.picFriend.getFolloweds().then((response) => {
            const data = response.data;
            if (!data) {
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
        this.picFriend.getBanlist().then((response) => {
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
        this.picFriend.fetchFriendList(ids);
    }

    private onPlayerListHandler(content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_PKT_PLAYER_LIST) {
        this.mView.updateFriend(content);
    }

    private onReqFriendAttributesHandler(id: string) {
        const uimanager = this.game.uiManager;
        uimanager.showMed("CharacterInfo");
        this.picFriend.fetchFriendInfo(id);
    }

    private onSearchHandler(text) {
        if (text && text.length > 0) this.picFriend.searchFriend(text[0]);
    }

    private onSearchResultHandler(content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_PKT_SEARCH_PLAYER) {
        // this.mView.setFriend(FriendChannel.Search, content.playerInfos);
        this.mView.setFriend(FriendChannel.Search, content.playerInfos);
    }

    private onReqPlayerListHanlder(ids) {
        this.picFriend.fetchFriendList(ids);
    }

    private onHidePanel() {
        this.destroy();
    }
}
