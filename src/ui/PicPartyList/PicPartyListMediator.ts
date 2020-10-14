import { ILayerManager } from "../layer.manager";
import { WorldService } from "../../game/world.service";
import { op_client, op_pkt_def } from "pixelpai_proto";
import { BaseMediator } from "apowophaserui";
import { PicPartyList } from "./PicPartyList";
import { PicPartyListPanel } from "./PicPartyListPanel";
export class PicPartyListMediator extends BaseMediator {
    protected mView: PicPartyListPanel;
    private scene: Phaser.Scene;
    private world: WorldService;
    private layerMgr: ILayerManager;
    private picList: PicPartyList;
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
            this.mView = new PicPartyListPanel(this.scene, this.world);
            this.mView.on("close", this.onCloseHandler, this);
            this.mView.on("querylist", this.query_PARTY_LIST, this);
            this.mView.on("queryenter", this.queryEnterRoom, this);
        }
        if (!this.picList) {
            this.picList = new PicPartyList(this.world);
            this.picList.on("questlist", this.on_PARTY_LIST, this);
            this.picList.register();
        }
        this.layerMgr.addToUILayer(this.mView);
        this.mView.show();
    }

    isSceneUI() {
        return true;
    }

    destroy() {
        super.destroy();
        if (this.picList) {
            this.picList.destroy();
            this.picList = undefined;
        }
    }
    private onCloseHandler() {
        this.destroy();
    }
    private on_PARTY_LIST(content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_PARTY_LIST) {
        this.mView.setPartyListData(content, this.world.user.userData.isSelfRoom);
    }
    private query_PARTY_LIST() {
        this.picList.query_PARTY_LIST();
    }
    private queryEnterRoom(roomID: string, password?: string) {
        this.picList.queryEnterRoom(roomID);
    }
}
