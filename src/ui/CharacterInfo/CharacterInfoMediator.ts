import { ILayerManager } from "../layer.manager";
import { op_client } from "pixelpai_proto";
import { BaseMediator } from "../../../lib/rexui/lib/ui/baseUI/BaseMediator";
import { WorldService } from "../../game/world.service";
import CharacterInfoPanel, { FriendRelation } from "./CharacterInfoPanel";
import { CharacterInfo } from "./CharacterInfo";
import { PicFriendMediator } from "../PicFriend/PicFriendMediator";

export class CharacterInfoMediator extends BaseMediator {
    protected mView: CharacterInfoPanel;
    private scene: Phaser.Scene;
    private layerMgr: ILayerManager;
    private characterInfo: CharacterInfo;
    private world: WorldService;
    constructor(layerMgr: ILayerManager, scene: Phaser.Scene, worldService: WorldService) {
        super();
        this.scene = scene;
        this.layerMgr = layerMgr;
        this.world = worldService;
        this.characterInfo = new CharacterInfo(this.world);
        this.characterInfo.on("ownerInfo", this.onOwnerCharacterInfo, this);
        this.characterInfo.on("otherInfo", this.onOtherCharacterInfo, this);
        this.characterInfo.register();
    }

    show(params?: any) {
        if (this.mView) {
            this.mView.show(params);
            return;
        }
        if (!this.mView) {
            this.mView = new CharacterInfoPanel(this.scene, this.world);
            this.mView.on("hide", this.onHidePanel, this);
            this.mView.on("queryOwnerInfo", this.onQueryOwnerInfo, this);
            this.mView.on("track", this.onTrackHandler, this);
            this.mView.on("invite", this.onInviteHandler, this);
            this.mView.on("follow", this.onFollowHandler, this);
            this.mView.on("unfollow", this.onUnfollowHandler, this);
            this.mView.on("addBlack", this.onAddBlackHandler, this);
            this.mView.on("removeBlack", this.onRemoveBlackHandler, this);
        }
        this.layerMgr.addToUILayer(this.mView);
        this.mView.show(params);
    }

    isSceneUI() {
        return false;
    }

    destroy() {
        if (this.characterInfo) {
            this.characterInfo.destroy();
            this.characterInfo = undefined;
        }
        if (this.mView) {
            this.mView.hide();
            this.mView = undefined;
        }
    }

    private onHidePanel() {
        if (this.mView) {
            this.mView.hide();
        }
        this.mView = undefined;
        this.hide();
    }

    private onOwnerCharacterInfo(content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_SELF_PLAYER_INFO) {
        this.show(content);
        // this.mView.setPlayerData(content);
    }

    private onOtherCharacterInfo(content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_ANOTHER_PLAYER_INFO) {
        this.show(content);

        this.checkRelation(content.cid);
        // this.mView.setPlayerData(content);
    }

    private onFollowHandler(id: string) {
        this.world.httpService.follow(id).then((response: any) => {
            const { code, data } = response;
            if (code === 200 || code === 201) {
                if (this.mView) {
                    this.checkRelation(id);
                    this.updateFrind();
                }
            }
        });
    }

    private onUnfollowHandler(id: string) {
        this.world.httpService.unfollow(id).then((response: any) => {
            const { code, data } = response;
            if (code === 200 || code === 201) {
                this.checkRelation(id);
                this.updateFrind();
            }
        });
    }

    private checkRelation(cid: string) {
        const me = this.world.account.accountData.id;
        this.world.httpService.post("user/check_relation", {
            userA: me,
            userB: cid
        }).then((response: any) => {
            const { code, data } = response;
            if (code === 200) {
                if (data.length >= 1) {
                    let relation = FriendRelation.Null;
                    const isBan = data[0].ban;
                    if (isBan) {
                        this.mView.setFriendRelation(FriendRelation.Blacklist);
                        return;
                    }
                    if (data[0].followed_user === cid) {
                        relation = FriendRelation.Followed;
                    } else if (data[0].followed_user === me) {
                        relation = FriendRelation.Fans;
                    }
                    if (data.length >= 2) {
                        if (data[0].user === data[1].followed_user && data[1].followed_user === data[0].user) {
                            relation = FriendRelation.Friend;
                        }
                    }
                    if (relation) {
                        this.mView.setFriendRelation(relation);
                    }
                } else {
                    this.mView.setFriendRelation(FriendRelation.Null);
                }
            }
        });
    }

    private onAddBlackHandler(id: string) {
        this.world.httpService.banUser(id).then((response: any) => {
            const { code, data } = response;
            if (code === 200 || code === 201) {
                this.checkRelation(id);
            }
        });
    }

    private onRemoveBlackHandler(id: string) {
        this.world.httpService.removeBanUser(id).then((response: any) => {
            const { code, data } = response;
            if (code === 200 || code === 201) {
                this.checkRelation(id);
            }
        });
    }

    private onQueryOwnerInfo() {
        this.characterInfo.queryPlayerInfo();
    }

    private onTrackHandler(id: string) {
        this.characterInfo.track(id);
    }

    private onInviteHandler(id: string) {
        this.characterInfo.invite(id);
    }

    private updateFrind() {
        const uimanager = this.world.uiManager;
        const picFriend: PicFriendMediator = <PicFriendMediator> uimanager.getMediator(PicFriendMediator.name);
        if (picFriend) {
            picFriend.fetchCurrentFriend();
        }
    }
}
