import { ILayerManager } from "../Layer.manager";
import { WorldService } from "../../game/world.service";
import { GMToolsPanel } from "./GMToolsPanel";
import { op_virtual_world } from "pixelpai_proto";
import { PBpacket } from "net-socket-packet";
import { BaseMediator } from "apowophaserui";

export class GMToolsMediator extends BaseMediator  {
    private scene: Phaser.Scene;
    private layerMgr: ILayerManager;
    private world: WorldService;

    constructor(layerMgr: ILayerManager, scene: Phaser.Scene, worldService: WorldService) {
        super();
        this.scene = scene;
        this.layerMgr = layerMgr;
        this.world = worldService;
    }

    public show(params?: any) {
        super.show(params);
        if (this.mView) {
            this.mView.show(params);
            this.layerMgr.addToUILayer(this.mView);
            return;
        }
        this.mView = new GMToolsPanel(this.scene, this.world);
        this.mView.on("close", this.onCloseHandler, this);
        this.mView.on("targetUI", this.onTargetUIHandler, this);
        this.mView.show(params);
        this.layerMgr.addToUILayer(this.mView);
    }

    public update(params?: any) {
        if (this.mView) {
            this.mView.show(params);
        }
    }

    public hide() {
        this.destroy();
    }

    private onCloseHandler() {
        this.hide();
    }

    private onTargetUIHandler(uiId, componentId, str?) {
        if (!this.world) {
            return;
        }
        // const param: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_SHOW_UI = this.mParam[0];
        const pkt: PBpacket = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_TARGET_UI);
        const content: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_TARGET_UI = pkt.content;
        content.uiId = uiId;
        content.componentId = componentId;
        content.strData = str;
        this.world.connection.send(pkt);
    }
}
