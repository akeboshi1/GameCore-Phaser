import { ILayerManager } from "../layer.manager";
import { WorldService } from "../../game/world.service";
import { op_client, op_pkt_def } from "pixelpai_proto";
import { BaseMediator } from "../../../lib/rexui/lib/ui/baseUI/BaseMediator";
import { PicOrderPanel } from "./PicOrderPanel";
import { PicOrder } from "./PicOrder";
export class PicOrderMediator extends BaseMediator {
    protected mView: PicOrderPanel;
    private scene: Phaser.Scene;
    private world: WorldService;
    private layerMgr: ILayerManager;
    private picOrder: PicOrder;
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
            this.mView = new PicOrderPanel(this.scene, this.world);
            this.mView.on("questlist", this.query_ORDER_LIST, this);
            this.mView.on("changeorder", this.query_CHANGE_ORDER_STAGE, this);
            this.mView.on("hide", this.onHideView, this);
        }
        if (!this.picOrder) {
            this.picOrder = new PicOrder(this.world);
            this.picOrder.on("questlist", this.on_ORDER_LIST, this);
            this.picOrder.register();
        }
        this.layerMgr.addToUILayer(this.mView);
        this.mView.show();
    }

    isSceneUI() {
        return true;
    }

    destroy() {
        if (this.picOrder) {
            this.picOrder.destroy();
            this.picOrder = undefined;
        }
        if (this.mView) {
            this.mView.hide();
            this.mView = undefined;
        }
    }
    get playerData() {
        if (this.world.playerDataManager) {
            return this.world.playerDataManager.playerData;
        }
        return null;
    }
    private query_ORDER_LIST() {
        this.picOrder.query_ORDER_LIST();
    }
    private query_CHANGE_ORDER_STAGE(index: number, state: op_pkt_def.PKT_Order_Operator) {
        this.picOrder.query_CHANGE_ORDER_STAGE(index, state);
    }
    private on_ORDER_LIST(content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_ORDER_LIST) {
        const list = content.orders;
        for (const order of list) {
            const materials = order.targets;
            if (materials) {
                for (const material of materials) {
                    const count = this.playerData.getItemsCount(op_pkt_def.PKT_PackageType.PropPackage, material.id, material.subcategory);
                    material.count = count;
                }
            }
        }
        this.mView.setOrderDataList(content);
    }

    private onHideView() {
        this.destroy();
    }
}