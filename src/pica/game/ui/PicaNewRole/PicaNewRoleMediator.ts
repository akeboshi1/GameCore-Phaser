import { op_client } from "pixelpai_proto";
import { PicaNewRole } from "./PicaNewRole";
import { BasicMediator, Game, UIType } from "gamecore";
import { ModuleName } from "structure";
export class PicaNewRoleMediator extends BasicMediator {
    private picaNewRole: PicaNewRole;
    private uid: string;
    constructor(game: Game) {
        super(ModuleName.PICANEWROLE_NAME, game);
        this.picaNewRole = new PicaNewRole(game);
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
        this.picaNewRole.fetchAnotherInfo(id);
    }

    private on_Another_Info(content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_ANOTHER_PLAYER_INFO) {
        if (this.panelInit) {
            this.mShowData = content;
            if (this.mView) this.mView.setRoleData(content);
        }
    }
    private onOpeningCharacterHandler(roleData: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_ANOTHER_PLAYER_INFO) {
        const uimanager = this.game.uiManager;
        uimanager.showMed(ModuleName.CHARACTERINFO_NAME, this.mShowData);
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
    private onHideView() {
        // const uimanager = this.game.uiManager;
        // uimanager.showMed(ModuleName.PICANEWMAIN_NAME);
        this.hide();
    }
    private onViewInitComplete() {
        // const uimanager = this.game.uiManager;
        // uimanager.hideMed(ModuleName.PICANEWMAIN_NAME);
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
}
