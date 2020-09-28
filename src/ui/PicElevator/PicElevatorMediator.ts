import { ILayerManager } from "../layer.manager";
import { WorldService } from "../../game/world.service";
import { op_client, op_pkt_def } from "pixelpai_proto";
import { PicElevatorPanel } from "./PicElevatorPanel";
import { PicElevator } from "./PicElevator";
import { BaseMediator } from "apowophaserui";
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

    show() {
        if ((this.mView && this.mView.isShow()) || this.mShow) {
            return;
        }
        if (!this.mView) {
            this.mView = new PicElevatorPanel(this.scene, this.world);
            this.mView.on("questlist", this.query_ORDER_LIST, this);
            this.mView.on("changeorder", this.query_CHANGE_ORDER_STAGE, this);
            this.mView.on("questprogress", this.query_PLAYER_PROGRESS, this);
            this.mView.on("questreward", this.query_PLAYER_PROGRESS_REWARD, this);
            this.mView.on("hide", this.onHideView, this);
        }
        if (!this.picElevator) {
            this.picElevator = new PicElevator(this.world);
            this.picElevator.on("questlist", this.on_ORDER_LIST, this);
            this.picElevator.on("progresslist", this.on_PLAYER_PROGRESS, this);
            this.picElevator.register();
        }
        this.layerMgr.addToUILayer(this.mView);
        this.mView.show();
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
    get playerData() {
        const user = this.world.user;
        if (!user || !user.bag) {
            return;
        }
        return user.bag.playerData;
    }

    private query_ORDER_LIST() {
        this.picElevator.query_ORDER_LIST();
    }
    private query_CHANGE_ORDER_STAGE(index: number, state: op_pkt_def.PKT_Order_Operator) {
        this.picElevator.query_CHANGE_ORDER_STAGE(index, state);
    }
    private query_PLAYER_PROGRESS() {
        this.picElevator.query_PLAYER_PROGRESS();
    }

    private query_PLAYER_PROGRESS_REWARD(index: number) {
        this.picElevator.query_PLAYER_PROGRESS_REWARD(index);
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

    private on_PLAYER_PROGRESS(content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_QUERY_PLAYER_PROGRESS) {
        this.mView.setOrderProgress(content);
    }

    private onHideView() {
        this.destroy();
    }
}
