import { ILayerManager } from "../layer.manager";
import { op_client } from "pixelpai_proto";
import { BaseMediator } from "../../../lib/rexui/lib/ui/baseUI/BaseMediator";
import { WorldService } from "../../game/world.service";
import PicFriendPanel, { FriendChannel } from "./PicFriendPanel";
import { PicFriend } from "./PicFriend";
import { Logger } from "../../utils/log";
import { PicFriendEvent } from "./PicFriendEvent";

export class PicFriendMediator extends BaseMediator {
    protected mView: PicFriendPanel;
    private scene: Phaser.Scene;
    private layerMgr: ILayerManager;
    private picFriend: PicFriend;
    private world: WorldService;
    constructor(layerMgr: ILayerManager, scene: Phaser.Scene, worldService: WorldService) {
        super();
        this.scene = scene;
        this.layerMgr = layerMgr;
        this.world = worldService;
    }

    show() {
        if (this.mView) {
            return;
        }
        if (!this.mView) {
            this.mView = new PicFriendPanel(this.scene, this.world);
            this.mView.on("hide", this.onHidePanel, this);
            this.mView.on(PicFriendEvent.FETCH_FRIEND, this.onFetchFriendHandler, this);
            this.mView.on(PicFriendEvent.UNFOLLOW, this.onUnfollowHandler, this);
            this.mView.on(PicFriendEvent.FOLLOW, this.onFollowHandler, this);
            this.mView.on(PicFriendEvent.BanUser, this.onBanUserHandler, this);
            this.mView.on(PicFriendEvent.REMOVE_BAN_USER, this.onRemoveBanUserHandler, this);
            this.mView.on(PicFriendEvent.REQ_FRIEND_ATTRIBUTES, this.onReqFriendAttributesHandler, this);
            this.mView.on(PicFriendEvent.REQ_BLACKLIST, this.onReqBlacklistHandler, this);
            this.mView.on(PicFriendEvent.REMOVE_FROM_BLACKLIST, this.onRemoveFromBlacklistHandler, this);
            this.mView.on(PicFriendEvent.SEARCH_FRIEND, this.onSearchHandler, this);
            this.mView.on(PicFriendEvent.REQ_PLAYER_LIST, this.onReqPlayerListHanlder, this);
        }
        if (!this.picFriend) {
            this.picFriend = new PicFriend(this.world);
            this.picFriend.on(PicFriendEvent.PLAYER_LIST, this.onPlayerListHandler, this);
            this.picFriend.on(PicFriendEvent.SEARCH_RESULT, this.onSearchResultHandler, this);
            this.picFriend.register();
        }
        this.layerMgr.addToUILayer(this.mView);
        this.mView.show();
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

    private getBanlist() {
        this.picFriend.getBanlist().then((response) => {
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
        this.world.httpService.follow(id).then((response) => {
            this.mView.filterById(id);
        });
    }

    private onUnfollowHandler(args: string) {
        if (!args || args.length < 0) return;
        const id = args[0];
        this.world.httpService.unfollow(id).then((response) => {
            this.mView.filterById(id);
        });
    }

    private onBanUserHandler(fuid: string) {
        this.world.httpService.banUser(fuid).then(() => {
            this.mView.filterById(fuid);
        });
    }

    private onRemoveBanUserHandler(fuid: string) {
        this.world.httpService.removeBanUser(fuid).then((response) => {
            this.mView.filterById(fuid);
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
        this.world.httpService.removeBanUser(args[0]).then((response) => {
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
        // TODO 点击好友头像，显示属性面板
        this.picFriend.fetchFriendInfo(id);
        // Logger.getInstance().log("Req friend attributes: ", id);
    }

    private onSearchHandler(text) {
        if (text && text.length > 0) this.picFriend.searchFriend(text[0]);
    }

    private onSearchResultHandler(content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_PKT_SEARCH_PLAYER) {
        this.mView.setFriend(FriendChannel.Search, content.playerInfos);
    }

    private onReqPlayerListHanlder(ids) {
        this.picFriend.fetchFriendList(ids);
    }

    private onHidePanel() {
        this.destroy();
    }
}
