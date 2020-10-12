import { ILayerManager } from "../layer.manager";
import { WorldService } from "../../game/world.service";
import { op_client, op_pkt_def } from "pixelpai_proto";
import { BaseMediator } from "apowophaserui";
import { PicOpenPartyPanel } from "./PicOpenPartyPanel";
import { PicOpenParty } from "./PicOpenParty";
export class PicOpenPartyMediator extends BaseMediator {
    protected mView: PicOpenPartyPanel;
    private scene: Phaser.Scene;
    private world: WorldService;
    private layerMgr: ILayerManager;
    private picOpen: PicOpenParty;
    constructor(layerMgr: ILayerManager, scene: Phaser.Scene, worldService: WorldService) {
        super();
        this.scene = scene;
        this.layerMgr = layerMgr;
        this.world = worldService;
    }

    show() {
        if ((this.mView && this.mView.isShow()) || this.mShow) {
            return;
        }
        if (!this.mView) {
            this.mView = new PicOpenPartyPanel(this.scene, this.world);
            this.mView.on("close", this.onCloseHandler, this);
            this.mView.on("querytheme", this.query_PARTY_REQUIREMENTS, this);
            this.mView.on("queryopen", this.query_CREATE_PARTY, this);
        }
        if (!this.picOpen) {
            this.picOpen = new PicOpenParty(this.world);
            this.picOpen.on("themelist", this.on_PARTY_REQUIREMENTS, this);
            this.picOpen.register();
        }
        this.layerMgr.addToUILayer(this.mView);
        this.mView.show();
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
    private query_CREATE_PARTY(id: string, topic: string, name: string, des: string, ticket: number) {
        this.picOpen.query_CREATE_PARTY(id, topic, name, des, ticket);
    }
}
