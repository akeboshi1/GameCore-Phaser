import { op_client } from "pixelpai_proto";
import { PicaNewRole } from "./PicaNewRole";
import { BasicMediator, Game, PlayerProperty } from "gamecore";
import { EventType, ModuleName } from "structure";
export class PicaNewRoleMediator extends BasicMediator {
    private picaNewRole: PicaNewRole;
    constructor(game: Game) {
        super(ModuleName.PICANEWROLE_NAME, game);
        this.picaNewRole = new PicaNewRole(game);
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
        this.query_Another_Info(this.mShowData);
    }
    private query_Another_Info(id: string) {
        this.picaNewRole.fetchAnotherInfo(id);
    }

    private on_Another_Info(content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_ANOTHER_PLAYER_INFO) {
        if (this.panelInit) {
            this.mShowData = content;
            this.mView.setRoleData(content);
        }
    }
    private onOpeningCharacterHandler(roleData: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_ANOTHER_PLAYER_INFO) {
        const uimanager = this.game.uiManager;
        uimanager.showMed("CharacterInfo", this.mShowData);
        this.destroy();
    }

    private onFollowHandler(roleData: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_ANOTHER_PLAYER_INFO) {

    }

    private onTradingHandler(roleData: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_ANOTHER_PLAYER_INFO) {

    }
    private onHideView() {
        const uimanager = this.game.uiManager;
        uimanager.showMed("PicaChat");
        this.destroy();
    }
    private onViewInitComplete() {
        const uimanager = this.game.uiManager;
        uimanager.hideMed("PicHandheld");
    }
}
