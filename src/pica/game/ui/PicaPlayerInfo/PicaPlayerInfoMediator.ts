import { op_client } from "pixelpai_proto";
import { PicaPlayerInfo } from "./PicaPlayerInfo";
import { ModuleName } from "structure";
import { BasicMediator, Game } from "gamecore";
import { BaseDataConfigManager } from "../../config";
import { PicaPlayerFriendRelation } from "./PicaPlayerFriendRelation";
export class PicaPlayerInfoMediator extends BasicMediator {
    protected mModel: PicaPlayerInfo;
    constructor(game: Game) {
        super(ModuleName.PICAPLAYERINFO_NAME, game);
        this.mModel = new PicaPlayerInfo(this.game);
    }

    show(param?: any) {
        super.show(param);
        this.game.emitter.on(ModuleName.PICAPLAYERINFO_NAME + "_hide", this.onHidePanel, this);
        this.game.emitter.on(ModuleName.PICAPLAYERINFO_NAME + "_queryOwnerInfo", this.onQueryOwnerInfo, this);
        this.game.emitter.on(ModuleName.PICAPLAYERINFO_NAME + "_track", this.onTrackHandler, this);
        this.game.emitter.on(ModuleName.PICAPLAYERINFO_NAME + "_invite", this.onInviteHandler, this);
        this.game.emitter.on(ModuleName.PICAPLAYERINFO_NAME + "_follow", this.onFollowHandler, this);
        this.game.emitter.on(ModuleName.PICAPLAYERINFO_NAME + "_unfollow", this.onUnfollowHandler, this);
        this.game.emitter.on(ModuleName.PICAPLAYERINFO_NAME + "_gohome", this.onGoOtherHome, this);
        this.game.emitter.on(ModuleName.PICAPLAYERINFO_NAME + "_addBlack", this.onAddBlackHandler, this);
        this.game.emitter.on(ModuleName.PICAPLAYERINFO_NAME + "_removeBlack", this.onRemoveBlackHandler, this);
    }

    hide() {
        super.hide();
        this.game.emitter.off(ModuleName.PICAPLAYERINFO_NAME + "_hide", this.onHidePanel, this);
        this.game.emitter.off(ModuleName.PICAPLAYERINFO_NAME + "_queryOwnerInfo", this.onQueryOwnerInfo, this);
        this.game.emitter.off(ModuleName.PICAPLAYERINFO_NAME + "_track", this.onTrackHandler, this);
        this.game.emitter.off(ModuleName.PICAPLAYERINFO_NAME + "_invite", this.onInviteHandler, this);
        this.game.emitter.off(ModuleName.PICAPLAYERINFO_NAME + "_follow", this.onFollowHandler, this);
        this.game.emitter.off(ModuleName.PICAPLAYERINFO_NAME + "_unfollow", this.onUnfollowHandler, this);
        this.game.emitter.off(ModuleName.PICAPLAYERINFO_NAME + "_gohome", this.onGoOtherHome, this);
        this.game.emitter.off(ModuleName.PICAPLAYERINFO_NAME + "_addBlack", this.onAddBlackHandler, this);
        this.game.emitter.off(ModuleName.PICAPLAYERINFO_NAME + "_removeBlack", this.onRemoveBlackHandler, this);
    }

    isSceneUI() {
        return false;
    }

    protected onEnable() {
        this.proto.on("SELF_PLAYER_INFO", this.onOwnerCharacterInfo, this);
        this.proto.on("ANOTHER_PLAYER_INFO", this.onOtherCharacterInfo, this);
    }
    protected onDisable() {
        this.proto.off("SELF_PLAYER_INFO", this.onOwnerCharacterInfo, this);
        this.proto.off("ANOTHER_PLAYER_INFO", this.onOtherCharacterInfo, this);
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

    private onOwnerCharacterInfo(proto: any) {
        const content = proto.content;
        if (!this.mPanelInit) {
            this.mShowData = proto;
            this.mShowData.isUser = true;
            return;
        }
        if (this.mView) {
            const property = this.game.user.userData.playerProperty;
            const pros = [property.energy, property.getProperty("IV0000014")];
            content["pros"] = pros;
            content["isUser"] = true;
            this.setItemBases(pros);
            this.setItemBases(content.properties);
            this.setItemBases(content.avatarSuit);
            this.mView.setPlayerData(content);
        }
    }

    private onOtherCharacterInfo(proto: any) {
        const content = proto.content;
        if (!this.mPanelInit) {
            this.mShowData = proto;
            this.mShowData.isUser = false;
            return;
        }
        if (this.mView) {
            content["isUser"] = false;
            this.setItemBases(content.properties);
            this.setItemBases(content.avatarSuit);
            this.mView.setPlayerData(content);
            this.checkRelation(content.cid);
        }
    }

    private setItemBases(datas: any[]) {
        const configMgr = <BaseDataConfigManager>this.game.configManager;
        configMgr.getBatchItemDatas(datas);
    }

    private onFollowHandler(id: string) {
        this.game.httpService.follow(id).then((response: any) => {
            const { code, data } = response;
            if (code === 200 || code === 201) {
                if (this.mView) {
                    this.checkRelation(id);
                }
            }
        });
    }

    private onUnfollowHandler(id: string) {
        this.game.httpService.unfollow(id).then((response: any) => {
            const { code, data } = response;
            if (code === 200 || code === 201) {
                this.checkRelation(id);
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
                    this.mView.setFriendRelation(PicaPlayerFriendRelation.check(ids[0], ids[1], data[key]).relation);
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
        this.mModel.queryPlayerInfo();
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
