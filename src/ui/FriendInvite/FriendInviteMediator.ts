import { BaseMediator } from "../../../lib/rexui/lib/ui/baseUI/BaseMediator";
import { WorldService } from "../../game/world.service";
import { ILayerManager } from "../layer.manager";
import { FriendInvitePanel } from "./FriendInvitePanel";
import { op_virtual_world } from "pixelpai_proto";
import { PBpacket } from "net-socket-packet";

export class FriendInviteMediator extends BaseMediator {
    private world: WorldService;
    private mLayerManager: ILayerManager;
    private mScene: Phaser.Scene;
    constructor(layerManager: ILayerManager, scene: Phaser.Scene, worldService: WorldService) {
        super();
        this.world = worldService;
        this.mLayerManager = layerManager;
        this.mScene = scene;
    }

    show(param?: any): void {
        if (this.mView) {
            this.mView.show(param);
            this.mLayerManager.addToDialogLayer(this.mView);
            return;
        }
        this.mView = new FriendInvitePanel(this.mScene, this.world);
        this.mView.on("hide", this.onHideHandler, this);
        this.mView.on("agree", this.onAgreeHandler, this);
        this.mView.on("targetUI", this.onTargetUIHandler, this);
        this.mView.show(param);
        this.mLayerManager.addToDialogLayer(this.mView);
    }

    private onTargetUIHandler(uiId, componentId) {
        if (!this.world) {
            return;
        }
        // const param: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_SHOW_UI = this.mParam[0];
        const pkt: PBpacket = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_TARGET_UI);
        const content: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_TARGET_UI = pkt.content;
        content.uiId = uiId;
        content.componentId = componentId;
        this.world.connection.send(pkt);
        this.destroy();
    }

    private onAgreeHandler() {
        // TODO
    }

    private onHideHandler() {
        this.destroy();
    }
}
