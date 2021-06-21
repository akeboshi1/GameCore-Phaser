import { op_client } from "pixelpai_proto";
import { PicaNewFriend } from "./PicaNewFriend";
import { PicaNewFriendRelation } from "./PicaNewFriendRelation";
import { ModuleName, FriendChannel, EventType, RENDER_PEER, FriendData, FriendRelationEnum, FriendRelationAction } from "structure";
import { BasicMediator, Game } from "gamecore";
import { BaseDataConfigManager } from "picaWorker";

export class PicaNewFriendMediator extends BasicMediator {
    protected mView;
    protected mModel: PicaNewFriend;
    constructor(game: Game) {
        super(ModuleName.PICANEWFRIEND_NAME, game);
        this.mModel = new PicaNewFriend(game);
        // this.game.emitter.on(EventType.PLAYER_LIST, this.onPlayerListHandler, this);
        // this.game.emitter.on(EventType.SEARCH_RESULT, this.onSearchResultHandler, this);
        // this.game.emitter.on(this.key + "_other", this.onAnotherPlayerInfoHandler, this);
    }

    show(param?: any) {
        super.show(param);
        this.game.emitter.on(this.key + "_hide", this.hide, this);
        this.game.emitter.on(EventType.FETCH_FRIEND, this.onFetchFriendHandler, this);
        this.game.emitter.on(EventType.UNFOLLOW, this.onUnfollowHandler, this);
        this.game.emitter.on(EventType.FOLLOW, this.onFollowHandler, this);
        this.game.emitter.on(EventType.REMOVE_FROM_BLACKLIST, this.onRemoveBanUserHandler, this);
        this.game.emitter.on(EventType.REQ_FRIEND_ATTRIBUTES, this.onReqFriendAttributesHandler, this);
        this.game.emitter.on(EventType.REQ_BLACKLIST, this.onReqBlacklistHandler, this);
        this.game.emitter.on(EventType.SEARCH_FRIEND, this.onSearchHandler, this);
        this.game.emitter.on(EventType.REQ_PLAYER_LIST, this.onReqPlayerListHanlder, this);
        this.game.emitter.on(EventType.REQ_RELATION, this.onReRelationHandler, this);
        this.game.emitter.on(EventType.REQ_NEW_FANS, this.onReqNewHandler, this);
        this.game.emitter.on(this.key + "_block", this.onBlockUserHandler, this);
        this.game.emitter.on(ModuleName.PICANEWFRIEND_NAME + "_track", this.onTrackHandler, this);
        this.game.emitter.on(ModuleName.PICANEWFRIEND_NAME + "_invite", this.onInviteHandler, this);
        this.game.emitter.on(ModuleName.PICANEWFRIEND_NAME + "_gohome", this.onGoOtherHome, this);
        this.game.emitter.on(EventType.SEARCH_RESULT, this.onSearchResultHandler, this);
    }

    hide() {
        this.game.emitter.off(this.key + "_hide", this.hide, this);
        this.game.emitter.off(EventType.FETCH_FRIEND, this.onFetchFriendHandler, this);
        this.game.emitter.off(EventType.UNFOLLOW, this.onUnfollowHandler, this);
        this.game.emitter.off(EventType.FOLLOW, this.onFollowHandler, this);
        this.game.emitter.off(EventType.REMOVE_FROM_BLACKLIST, this.onRemoveBanUserHandler, this);
        this.game.emitter.off(EventType.REQ_FRIEND_ATTRIBUTES, this.onReqFriendAttributesHandler, this);
        this.game.emitter.off(EventType.REQ_BLACKLIST, this.onReqBlacklistHandler, this);
        this.game.emitter.off(EventType.SEARCH_FRIEND, this.onSearchHandler, this);
        this.game.emitter.off(EventType.REQ_PLAYER_LIST, this.onReqPlayerListHanlder, this);
        this.game.emitter.off(EventType.REQ_RELATION, this.onReRelationHandler, this);
        this.game.emitter.off(EventType.REQ_NEW_FANS, this.onReqNewHandler, this);
        this.game.emitter.off(this.key + "_block", this.onBlockUserHandler, this);
        this.game.emitter.off(ModuleName.PICANEWFRIEND_NAME + "_track", this.onTrackHandler, this);
        this.game.emitter.off(ModuleName.PICANEWFRIEND_NAME + "_invite", this.onInviteHandler, this);
        this.game.emitter.off(ModuleName.PICANEWFRIEND_NAME + "_gohome", this.onGoOtherHome, this);
        this.game.emitter.off(EventType.SEARCH_RESULT, this.onSearchResultHandler, this);
        super.hide();
    }

    protected onEnable() {
        this.proto.on("PLAYER_LIST", this.onPlayerListHandler, this);
        this.proto.on("ANOTHER_PLAYER_INFO", this.onAnotherPlayerInfoHandler, this);
        this.proto.on("RES_PKT_SEARCH", this.onSearchResultHandler, this);
    }
    protected onDisable() {
        this.proto.off("PLAYER_LIST", this.onPlayerListHandler, this);
        this.proto.off("ANOTHER_PLAYER_INFO", this.onAnotherPlayerInfoHandler, this);
        this.proto.on("RES_PKT_SEARCH", this.onSearchResultHandler, this);
    }
    protected panelInit() {
        super.panelInit();
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
                        result.push(PicaNewFriendRelation.check(users[0], users[1], data[key]));
                    }
                    if (this.mView) this.mView.updateRelation(result);
                }
            });
        });
    }

    private onReqNewHandler() {
        this.mModel.getFans().then((response) => {
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
        this.mModel.getFriends().then((response) => {
            if (!this.mPanelInit) {
                this.mShowData = response.data;
                return;
            }
            this.mView.setFriend(FriendChannel.Friends, response.data);
        });
    }

    private getFans() {
        this.mModel.getFans().then((response) => {
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
        this.mModel.getFolloweds().then((response) => {
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

    private onFollowHandler(id: string) {
        if (!id || id === "") return;
        this.game.httpService.follow(id).then((response) => {
            this.mView.filterById(id, FriendRelationAction.FOLLOW);
        });
    }

    private onUnfollowHandler(id: string) {
        if (!id || id === "") return;
        this.game.httpService.unfollow(id).then((response) => {
            this.mView.filterById(id, FriendRelationAction.UNFOLLOW);
        });
    }

    private onRemoveBanUserHandler(id) {
        if (!id || id === "") return;
        this.game.httpService.removeBanUser(id).then((response: any) => {
            if (response.code === 201) {
                this.mView.filterById(id, FriendRelationAction.UNBAN);
            }
        });
    }

    private onReqBlacklistHandler() {
        this.mModel.getBanlist().then((response) => {
            this.mView.setFriend(FriendChannel.Blacklist, response.data);
        });
    }

    private onBlockUserHandler(id) {
        if (!id || id === "") return;
        this.game.httpService.banUser(id).then((response: any) => {
            const { code, temp } = response;
            if (code === 200 || code === 201) {
                this.mView.filterById(id, FriendRelationAction.BAN);
            }
        });

    }
    private fetchPlayerList(data) {
        if (!data) return;
        const ids = data.map((friend: any) => friend.id);
        this.mModel.fetchFriendList(ids);
    }

    // private onPlayerListHandler(content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_PKT_PLAYER_LIST) {
    //     this.mView.updateFriend(content);
    // }
    private onPlayerListHandler(proto: any) {
        const content = proto.content;
        this.mView.updateFriend(content);
    }

    private onReqFriendAttributesHandler(id: string) {
        this.mModel.fetchFriendInfo(id);
    }

    private onSearchHandler(text) {
        if (text && text.length > 0) this.mModel.searchFriend(text);
    }

    private onSearchResultHandler(packet: any) {
        // this.mView.setFriend(FriendChannel.Search, content.playerInfos);
        const content = packet.content;
        this.mView.setFriend(FriendChannel.Search, content.playerInfos);
        const uids = [];
        for (const data of content.playerInfos) {
            uids.push(data.platformId);
        }
        const avatars = [];
        this.mModel.getHeadImgList(uids).then((response) => {
            if (response.code === 200) {
                const datas: any[] = response.data;
                for (const data of datas) {
                    avatars.push(data);
                }
                this.mView.updateFriend(avatars);
            }
        });
    }

    private onReqPlayerListHanlder(ids) {
        this.mModel.fetchFriendList(ids);
    }

    // private onOtherPlayerInfoHandler(content) {
    //     this.setItemBases(content.properties);
    //     this.setItemBases(content.avatarSuit);
    //     this.mView.setPlayerInfo(content);
    // }
    private onAnotherPlayerInfoHandler(proto: any) {
        const content = proto.content;
        this.setItemBases(content.properties);
        this.setItemBases(content.avatarSuit);
        this.mView.setPlayerInfo(content);
    }
    private setItemBases(datas: any[]) {
        const configMgr = <BaseDataConfigManager>this.game.configManager;
        configMgr.getBatchItemDatas(datas);
    }
    private onTrackHandler(id: string) {
        this.mModel.track(id);
    }

    private onInviteHandler(id: string) {
        this.mModel.invite(id);
    }

    private onGoOtherHome(id: string) {
        this.mModel.goOtherHome(id);
    }

}
