import { ILayerManager } from "../layer.manager";
import { op_client } from "pixelpai_proto";
import { BaseMediator } from "../../../lib/rexui/lib/ui/baseUI/BaseMediator";
import { WorldService } from "../../game/world.service";
import CharacterInfoPanel, { FriendRelation } from "./CharacterInfoPanel";
import { CharacterInfo } from "./CharacterInfo";
import { Logger } from "../../utils/log";

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
                }
            }
        });
    }

    private onUnfollowHandler(id: string) {
        this.world.httpService.unfollow(id).then((response: any) => {
            const { code, data } = response;
            if (code === 200 || code === 201) {
                this.checkRelation(id);
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
                    if (data[0].followed_user === cid) {
                        this.mView.setFriendRelation(FriendRelation.Followed);
                    }
                    if (data[0].followed_user === me) {
                        this.mView.setFriendRelation(FriendRelation.Fans);
                    }
                    if (data.length >= 2) {
                        if (data[0].user === data[1].followed_user && data[1].followed_user === data[0].user) {
                            this.mView.setFriendRelation(FriendRelation.Friend);
                        }
                    }
                }
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
}
