import { op_client, op_def, op_pkt_def } from "pixelpai_proto";
import { PicaNewRole } from "./PicaNewRole";
import { BasicMediator, Game, UIType } from "gamecore";
import { ModuleName } from "structure";
import { BaseDataConfigManager } from "../../config";
import { Logger } from "utils";
import { ISocial } from "picaStructure";
export class PicaNewRoleMediator extends BasicMediator {
    protected mModel: PicaNewRole;
    private uid: string;
    constructor(game: Game) {
        super(ModuleName.PICANEWROLE_NAME, game);
        this.mModel = new PicaNewRole(game);
        this.mUIType = UIType.Scene;
    }

    show(param?: any) {
        super.show(param);
        this.game.emitter.on(ModuleName.PICANEWROLE_NAME + "_queryanotherinfo", this.query_Another_Info, this);
        this.game.emitter.on(ModuleName.PICANEWROLE_NAME + "_hide", this.onHideView, this);
        this.game.emitter.on(ModuleName.PICANEWROLE_NAME + "_initialized", this.onViewInitComplete, this);
        this.game.emitter.on(ModuleName.PICANEWROLE_NAME + "_anotherinfo", this.on_Another_Info, this);
        this.game.emitter.on(ModuleName.PICANEWROLE_NAME + "_openingcharacter", this.onOpeningCharacterHandler, this);
        this.game.emitter.on(ModuleName.PICANEWROLE_NAME + "_followcharacter", this.onFollowHandler, this);
        this.game.emitter.on(ModuleName.PICANEWROLE_NAME + "_tradingcharacter", this.onTradingHandler, this);
        this.game.emitter.on(ModuleName.PICANEWROLE_NAME + "_peopleaction", this.onPeopleActionHandler, this);
    }

    hide() {
        super.hide();
        this.game.emitter.off(ModuleName.PICANEWROLE_NAME + "_queryanotherinfo", this.query_Another_Info, this);
        this.game.emitter.off(ModuleName.PICANEWROLE_NAME + "_hide", this.onHideView, this);
        this.game.emitter.off(ModuleName.PICANEWROLE_NAME + "_initialized", this.onViewInitComplete, this);
        this.game.emitter.off(ModuleName.PICANEWROLE_NAME + "_anotherinfo", this.on_Another_Info, this);
        this.game.emitter.off(ModuleName.PICANEWROLE_NAME + "_openingcharacter", this.onOpeningCharacterHandler, this);
        this.game.emitter.off(ModuleName.PICANEWROLE_NAME + "_followcharacter", this.onFollowHandler, this);
        this.game.emitter.off(ModuleName.PICANEWROLE_NAME + "_tradingcharacter", this.onTradingHandler, this);
        this.game.emitter.off(ModuleName.PICANEWROLE_NAME + "_peopleaction", this.onPeopleActionHandler, this);
    }

    destroy() {
        super.destroy();
    }
    panelInit() {
        super.panelInit();
        this.uid = this.mShowData;
        this.query_Another_Info(this.uid);
        this.checkFollowState(this.uid);
    }

    private query_Another_Info(id: string) {
        this.mModel.fetchAnotherInfo(id);
    }

    private on_Another_Info(content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_ANOTHER_PLAYER_INFO) {
        if (this.panelInit) {
            this.mShowData = content;
            this.config.getBatchItemDatas(content.avatarSuit);
            if (this.mView) {
                const socails = this.config.getSocails();
                this.mView.setRoleData(content);
                this.mView.setActionDatas(socails);
            }
        }
    }
    private onOpeningCharacterHandler(roleData: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_ANOTHER_PLAYER_INFO) {
        const uimanager = this.game.uiManager;
        uimanager.showMed(ModuleName.PICAPLAYERINFO_NAME, this.mShowData);
    }

    private onFollowHandler(data: { uid: string, follow: boolean }) {
        if (this.uid !== data.uid) return;
        if (!data.follow) {
            this.game.httpService.follow(data.uid).then((response: any) => {
                const { code, tdata } = response;
                if (code === 200 || code === 201) {
                    if (this.mView) {
                        this.mView.setFollowButton(true);
                    }
                }
            });
        } else {
            this.game.httpService.unfollow(data.uid).then((response: any) => {
                const { code, tdata } = response;
                if (code === 200 || code === 201) {
                    if (this.mView) {
                        this.mView.setFollowButton(false);
                    }
                }
            });
        }

    }

    private onTradingHandler(roleData: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_ANOTHER_PLAYER_INFO) {

    }

    private onPeopleActionHandler(action: ISocial) {
        Logger.getInstance().log(action);
        this.mModel.queryAction(op_def.FrontEndUniqueUIEnum.PicaNewRole, this.uid, action.id);
        const tempdata = { animation: action.tag.type, times: action.tag.repeat, action: action.tag.action, id: action.tag.bulletId };
        let activeEnable = true;
        if (action.tag.propUseId) {
            const count = this.game.user.userData.playerBag.getItemsCount(op_pkt_def.PKT_PackageType.PropPackage, action.tag.propUseId);
            activeEnable = count > 0;
            if (!activeEnable) {
                const item = (<any> this.game.configManager).getItemBaseByID(action.tag.propUseId);
                if (item) {
                    // TODO i18n.t("common.notEnough");
                    this.game.renderPeer.showAlert(`${item.name}数量不足`);
                    return;
                }
            }
        }
        if (activeEnable) {
            this.game.user.tryActiveAction(this.mShowData.id, tempdata, true);
            this.onHideView();
        }
    }
    private onHideView() {
        this.hide();
    }
    private onViewInitComplete() {
    }
    private checkFollowState(uid: string) {
        this.game.httpService.checkFollowed([uid]).then((response: any) => {
            const { code, data } = response;
            if (code === 200) {
                if (data.length > 0) {
                    this.mView.setFollowButton(true);
                } else {
                    this.mView.setFollowButton(false);
                }
            }
        });
    }

    private get config(): BaseDataConfigManager {
        return <BaseDataConfigManager>this.game.configManager;
    }
}
