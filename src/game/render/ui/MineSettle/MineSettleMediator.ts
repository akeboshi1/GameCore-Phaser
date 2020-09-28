import { ILayerManager } from "../Layer.manager";
import { WorldService } from "../../game/world.service";
import { MineSettlePanel } from "./MineSettlePanel";
import { op_client } from "pixelpai_proto";
import { MineSettle } from "./MineSettle";
import { BaseMediator } from "apowophaserui";

export class MineSettleMediator extends BaseMediator {
    private scene: Phaser.Scene;
    private world: WorldService;
    private layerMgr: ILayerManager;
    private mineSettle: MineSettle;
    constructor(layerMgr: ILayerManager, scene: Phaser.Scene, worldService: WorldService) {
        super();
        this.scene = scene;
        this.layerMgr = layerMgr;
        this.world = worldService;
        if (!this.mineSettle) {
            this.mineSettle = new MineSettle(this.world);
            this.mineSettle.on("minesettlepacket", this.onMineSettlePacket, this);
            this.mineSettle.register();
        }
    }

    show(param?: any) {
        if ((this.mView && this.mView.isShow()) || this.mShow) {
            return;
        }
        if (!this.mView) {
            this.mView = new MineSettlePanel(this.scene, this.world);
            this.mView.on("hide", this.onHideMineSettle, this);
        }
        super.show(param);
        this.layerMgr.addToUILayer(this.mView);
        if (this.mParam && this.mParam.length > 0)
            this.setMIneSettlePanel(this.mParam[0]);
        this.mView.show();
    }

    destroy() {
        if (this.mineSettle) this.mineSettle.destroy();
        this.mineSettle = undefined;
        super.destroy();
    }

    private onHideMineSettle() {
        this.mineSettle.reqMineSettlePacket();
        super.destroy();
    }

    private onMineSettlePacket(content: op_client.OP_VIRTUAL_WORLD_REQ_CLIENT_MINING_MODE_SHOW_REWARD_PACKAGE) {
        if (!this.mView || !this.mView.visible) {
            this.setParam([content]);
            this.show();
        } else {
            this.setMIneSettlePanel(content);
        }
    }

    private setMIneSettlePanel(content) {
        const panel = this.mView as MineSettlePanel;
        panel.setData("settleData", content);
        panel.setMineSettlePacket(content);
    }

}
