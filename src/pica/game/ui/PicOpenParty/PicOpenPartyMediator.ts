import { op_client, op_pkt_def } from "pixelpai_proto";
import { BaseMediator } from "apowophaserui";
import { PicOpenParty } from "./PicOpenParty";
import { BasicMediator, Game } from "gamecore";
import { ModuleName } from "structure";
export class PicOpenPartyMediator extends BasicMediator {
    private picOpen: PicOpenParty;
    constructor(key: string, game: Game) {
        super(key, game);
        this.picOpen = new PicOpenParty(game);
    }

    show(param?: any) {
        super.show(param);
        if ((this.mView && this.mView.isShow()) || this.mShow) {
            return;
        }
        if (!this.mView) {
            this.mView = new PicOpenPartyPanel(this.scene, this.world);
            
        }
        if (!this.picOpen) {
            this.picOpen = new PicOpenParty(this.world);
           
            this.picOpen.register();
        }
        this.layerMgr.addToUILayer(this.mView);
        this.mView.show();
    }

    protected panelInit(){
        super.panelInit();
        this.game.emitter.on(ModuleName.Pic"close", this.onCloseHandler, this);
        this.game.emitter.on("querytheme", this.query_PARTY_REQUIREMENTS, this);
        this.game.emitter.on("queryopen", this.query_CREATE_PARTY, this);

        this.game.emitter.on("themelist", this.on_PARTY_REQUIREMENTS, this);
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
    private onCloseHandler() {
        this.destroy();
    }
    private on_PARTY_REQUIREMENTS(content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_CREATE_PARTY_REQUIREMENTS) {
        this.mView.setPartyData(content, this.world.user.userData.isSelfRoom);
    }
    private query_PARTY_REQUIREMENTS() {
        this.picOpen.query_PARTY_REQUIREMENTS(this.world.user.userData.curRoomID);
    }
    private query_CREATE_PARTY(topic: string, name: string, des: string, ticket: number) {
        const id: string = this.world.user.userData.curRoomID;
        this.picOpen.query_CREATE_PARTY(id, topic, name, des, ticket);
    }
}
