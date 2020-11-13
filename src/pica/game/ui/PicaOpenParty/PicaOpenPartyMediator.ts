import { op_client } from "pixelpai_proto";
import { PicaOpenParty } from "./PicaOpenParty";
import { BasicMediator, Game } from "gamecore";
import { ModuleName } from "structure";
export class PicaOpenPartyMediator extends BasicMediator {
    private picOpen: PicaOpenParty;
    constructor(game: Game) {
        super(ModuleName.PICAOPENPARTY_NAME, game);
        this.picOpen = new PicaOpenParty(game);
    }

    hide() {
        if (!this.mView) this.mView = this.game.peer.render[ModuleName.PICAOPENPARTY_NAME];
        super.hide();
        this.game.emitter.off(ModuleName.PICAOPENPARTY_NAME + "_close", this.onCloseHandler, this);
        this.game.emitter.off(ModuleName.PICAOPENPARTY_NAME + "_querytheme", this.query_PARTY_REQUIREMENTS, this);
        this.game.emitter.off(ModuleName.PICAOPENPARTY_NAME + "_queryopen", this.query_CREATE_PARTY, this);
        this.game.emitter.off("themelist", this.on_PARTY_REQUIREMENTS, this);
    }

    isSceneUI() {
        return true;
    }

    destroy() {
        if (this.picOpen) {
            this.picOpen.destroy();
            this.picOpen = undefined;
        }
        super.destroy();
    }

    protected panelInit() {
        super.panelInit();
        this.game.emitter.on(ModuleName.PICAOPENPARTY_NAME + "_close", this.onCloseHandler, this);
        this.game.emitter.on(ModuleName.PICAOPENPARTY_NAME + "_querytheme", this.query_PARTY_REQUIREMENTS, this);
        this.game.emitter.on(ModuleName.PICAOPENPARTY_NAME + "_queryopen", this.query_CREATE_PARTY, this);
        this.game.emitter.on("themelist", this.on_PARTY_REQUIREMENTS, this);
    }

    private onCloseHandler() {
        this.hide();
    }
    private on_PARTY_REQUIREMENTS(content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_CREATE_PARTY_REQUIREMENTS) {
        this.mView.setPartyData(content, this.game.user.userData.isSelfRoom);
    }
    private query_PARTY_REQUIREMENTS() {
        this.picOpen.query_PARTY_REQUIREMENTS(this.game.user.userData.curRoomID);
    }
    private query_CREATE_PARTY(data: any) {
        const id: string = this.game.user.userData.curRoomID;
        this.picOpen.query_CREATE_PARTY(id, data.topic, data.name, data.des, data.ticket);
    }
}
