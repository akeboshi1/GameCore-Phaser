import { op_client } from "pixelpai_proto";
import { CharacterInfo } from "./CharacterInfo";
import { ModuleName } from "structure";
import { PicFriendRelation } from "../PicFriend/PicFriendRelation";
import { PicFriendMediator } from "../PicFriend/PicFriendMediator";
import { BasicMediator, Game } from "gamecore";

export class CharacterInfoMediator extends BasicMediator {
    public static NAME: string = ModuleName.CHARACTERINFO_NAME;
    private characterInfo: CharacterInfo;
    private mView;
    constructor(game: Game) {
        super(game);
        this.characterInfo = new CharacterInfo(this.game);
        this.game.emitter.on("ownerInfo", this.onOwnerCharacterInfo, this);
        this.game.emitter.on("otherInfo", this.onOtherCharacterInfo, this);
    }

    show(params?: any) {
        this.__exportProperty(() => {
            this.game.renderPeer.showPanel(ModuleName.CHARACTERINFO_NAME, params);
            if (!this.mView) {
                this.mView = this.game.peer.render[ModuleName.CHARACTERINFO_NAME];
                // this.mView = new CharacterInfoPanel(this.scene, this.game);
                // this.mView.on("hide", this.onHidePanel, this);
                // this.mView.on("queryOwnerInfo", this.onQueryOwnerInfo, this);
                // this.mView.on("track", this.onTrackHandler, this);
                // this.mView.on("invite", this.onInviteHandler, this);
                // this.mView.on("follow", this.onFollowHandler, this);
                // this.mView.on("unfollow", this.onUnfollowHandler, this);
                // this.mView.on("addBlack", this.onAddBlackHandler, this);
                // this.mView.on("removeBlack", this.onRemoveBlackHandler, this);
            }
        });
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
            this.mView.destroy();
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
        this.game.httpService.follow(id).then((response: any) => {
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
        this.game.httpService.unfollow(id).then((response: any) => {
            const { code, data } = response;
            if (code === 200 || code === 201) {
                this.checkRelation(id);
                this.updateFrind();
            }
        });
    }

    private async checkRelation(cid: string) {
        const me = await this.game.peer.render[ModuleName.ACCOUNT_NAME].accountData();
        this.game.httpService.post("user/check_relation", {
            relations: [{
                userA: me.id,
                userB: cid
            }]
        }).then((response: any) => {
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
        this.game.httpService.banUser(id).then((response: any) => {
            const { code, data } = response;
            if (code === 200 || code === 201) {
                this.checkRelation(id);
            }
        });
    }

    private onRemoveBlackHandler(id: string) {
        this.game.httpService.removeBanUser(id).then((response: any) => {
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
        const uimanager = this.game.uiManager;
        const picFriend: PicFriendMediator = <PicFriendMediator>uimanager.getMed(ModuleName.PICFRIEND_NAME);
        if (picFriend) {
            picFriend.fetchCurrentFriend();
        }
    }
}
