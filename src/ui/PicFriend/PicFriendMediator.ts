import { ILayerManager } from "../layer.manager";
import { op_client, op_pkt_def } from "pixelpai_proto";
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
        }
        if (!this.picFriend) {
            this.picFriend = new PicFriend(this.world);
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
            this.mView.setFriend(FriendChannel.Fans, response.data);
        });
    }

    private getFolloweds() {
        this.picFriend.getFolloweds().then((response) => {
            this.mView.setFriend(FriendChannel.Followes, response.data);
        });
    }

    private onFollowHandler(id: string) {
        this.picFriend.follow(id).then((response) => {
            this.mView.filterById(id);
        });
    }

    private onUnfollowHandler(id: string) {
        this.picFriend.unfollow(id).then((response) => {
            this.mView.filterById(id);
        });
    }

    private onBanUserHandler(fuid: string) {
        this.picFriend.banUser(fuid).then(() => {
            this.mView.filterById(fuid);
        });
    }

    private onRemoveBanUserHandler(fuid: string) {
        this.picFriend.removeBanUser(fuid).then((response) => {
            this.mView.filterById(fuid);
        });
    }

    private onReqFriendAttributesHandler(id: string) {
        // TODO 点击好友头像，显示属性面板
        Logger.getInstance().log("Req friend attributes: ", id);
    }

    private onHidePanel() {
        this.destroy();
    }
}
