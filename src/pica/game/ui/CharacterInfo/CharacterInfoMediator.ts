import { op_client } from "pixelpai_proto";
import { CharacterInfo } from "./CharacterInfo";
import { ModuleName } from "structure";
import { PicaFriendRelation } from "../PicaFriend/PicaFriendRelation";
import { PicaFriendMediator } from "../PicaFriend/PicaFriendMediator";
import { BasicMediator, Game } from "gamecore";

export class CharacterInfoMediator extends BasicMediator {
    constructor(game: Game) {
        super(ModuleName.CHARACTERINFO_NAME, game);
        this.mModel = new CharacterInfo(this.game);
        this.game.emitter.on("ownerInfo", this.onOwnerCharacterInfo, this);
        this.game.emitter.on("otherInfo", this.onOtherCharacterInfo, this);
    }

    show(param?: any) {
        super.show(param);
        this.game.emitter.on("hide", this.onHidePanel, this);
        this.game.emitter.on("queryOwnerInfo", this.onQueryOwnerInfo, this);
        this.game.emitter.on("track", this.onTrackHandler, this);
        this.game.emitter.on("invite", this.onInviteHandler, this);
        this.game.emitter.on("follow", this.onFollowHandler, this);
        this.game.emitter.on("unfollow", this.onUnfollowHandler, this);
        this.game.emitter.on("addBlack", this.onAddBlackHandler, this);
        this.game.emitter.on("removeBlack", this.onRemoveBlackHandler, this);
    }

    hide() {
        super.hide();
        this.game.emitter.off("hide", this.onHidePanel, this);
        this.game.emitter.off("queryOwnerInfo", this.onQueryOwnerInfo, this);
        this.game.emitter.off("track", this.onTrackHandler, this);
        this.game.emitter.off("invite", this.onInviteHandler, this);
        this.game.emitter.off("follow", this.onFollowHandler, this);
        this.game.emitter.off("unfollow", this.onUnfollowHandler, this);
        this.game.emitter.off("addBlack", this.onAddBlackHandler, this);
        this.game.emitter.off("removeBlack", this.onRemoveBlackHandler, this);
    }

    isSceneUI() {
        return false;
    }

    destroy() {
        this.game.emitter.off("ownerInfo", this.onOwnerCharacterInfo, this);
        this.game.emitter.off("otherInfo", this.onOtherCharacterInfo, this);
        super.destroy();
    }

    protected panelInit() {
        super.panelInit();
        if (this.mShowData) {
            if (this.mShowData.isUser) {
                this.onOwnerCharacterInfo(this.mShowData);
            } else {
                this.onOtherCharacterInfo(this.mShowData);
            }

            this.mShowData = null;
        }
    }

    private onHidePanel() {
        this.hide();
    }

    private onOwnerCharacterInfo(content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_SELF_PLAYER_INFO) {
        if (!this.mPanelInit) {
            this.mShowData = content;
            this.mShowData.isUser = true;
            return;
        }
        if (this.mView)
            this.mView.setPlayerData(content);
    }

    private onOtherCharacterInfo(content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_ANOTHER_PLAYER_INFO) {
        if (!this.mPanelInit) {
            this.mShowData = content;
            this.mShowData.isUser = false;
            return;
        }
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
        const me = await this.game.peer.render[ModuleName.ACCOUNT_NAME].getAccountData();
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
                    this.mView.setFriendRelation(PicaFriendRelation.check(ids[0], ids[1], data[key]).relation);
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
        this.model.queryPlayerInfo();
    }

    private onTrackHandler(id: string) {
        this.model.track(id);
    }

    private onInviteHandler(id: string) {
        this.model.invite(id);
    }

    private updateFrind() {
        const uimanager = this.game.uiManager;
        const PicaFriend: PicaFriendMediator = <PicaFriendMediator>uimanager.getMed(ModuleName.PICAFRIEND_NAME);
        if (PicaFriend) {
            PicaFriend.fetchCurrentFriend();
        }
    }

    private get model(): CharacterInfo {
        return <CharacterInfo>this.mModel;
    }
}
