import { ILayerManager } from "../Layer.manager";
import { op_client } from "pixelpai_proto";
import { CharacterInfo } from "./CharacterInfo";
import { PicFriendMediator } from "../PicFriend/PicFriendMediator";
import { PicFriendRelation } from "../PicFriend/PicFriendRelation";
import CharacterInfoPanel from "./CharacterInfoPanel";
import { BaseMediator } from "apowophaserui";
import { WorldService } from "../../world.service";

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
            this.mView.show();
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
        this.mView.show();
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
        if (this.mView)
            this.mView.setPlayerData(content);
    }

    private onOtherCharacterInfo(content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_ANOTHER_PLAYER_INFO) {
        if (this.mView) {
            this.mView.setPlayerData(content);
            this.checkRelation(content.cid);
        }
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
        this.world.httpService.post("user/check_relation", {relations: [{
            userA: me,
            userB: cid
        }]}).then((response: any) => {
            const { code, data } = response;
            if (code === 200) {
                for (const key in data) {
                    const ids = key.split("_");
                    this.mView.setFriendRelation(PicFriendRelation.check(ids[0], ids[1], data[key]).relation);
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
        const picFriend: PicFriendMediator = <PicFriendMediator>uimanager.getMediator(PicFriendMediator.name);
        if (picFriend) {
            picFriend.fetchCurrentFriend();
        }
    }
}
