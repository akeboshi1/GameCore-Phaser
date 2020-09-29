import { ILayerManager } from "../layer.manager";
import { WorldService } from "../../game/world.service";
import { op_client, op_pkt_def, op_virtual_world } from "pixelpai_proto";
import { PicElevatorPanel } from "./PicElevatorPanel";
import { PicElevator } from "./PicElevator";
import { BaseMediator } from "apowophaserui";
import { PBpacket } from "net-socket-packet";
export class PicElevatorMediator extends BaseMediator {
    protected mView: PicElevatorPanel;
    private scene: Phaser.Scene;
    private world: WorldService;
    private layerMgr: ILayerManager;
    private picElevator: PicElevator;
    constructor(layerMgr: ILayerManager, scene: Phaser.Scene, worldService: WorldService) {
        super();
        this.scene = scene;
        this.layerMgr = layerMgr;
        this.world = worldService;
    }

    show(param?: any) {
        if ((this.mView && this.mView.isShow()) || this.mShow) {
            return;
        }
        if (!this.mView) {
            this.mView = new PicElevatorPanel(this.scene, this.world);
            this.mView.on("queryui", this.onTargetUIHandler, this);
            this.mView.on("hide", this.onHideView, this);
        }
        if (!this.picElevator) {
            this.picElevator = new PicElevator(this.world);
            this.picElevator.register();
        }
        this.layerMgr.addToUILayer(this.mView);
        this.mView.show(param);
    }

    isSceneUI() {
        return true;
    }

    destroy() {
        if (this.picElevator) {
            this.picElevator.destroy();
            this.picElevator = undefined;
        }
        if (this.mView) {
            this.mView.hide();
            this.mView = undefined;
        }
    }
    private onTargetUIHandler(uiId, componentId) {
        if (!this.world) {
            return;
        }
        this.picElevator.query_TARGET_UI(uiId, componentId);
    }
    private onHideView() {
        this.destroy();
    }
}
