import { BaseMediator } from "../../baseMediator";
import { ILayerManager } from "../../layer.manager";
import { WorldService } from "../../../game/world.service";
import { MineSettlePanel } from "./MineSettlePanel";
import { op_client, op_def, op_gameconfig } from "pixelpai_proto";
import { MineSettle } from "./MineSettle";
import { Logger } from "../../../utils/log";

export class MineSettleMediator extends BaseMediator {
    private scene: Phaser.Scene;
    private layerMgr: ILayerManager;
    private mineSettle: MineSettle;
    constructor(layerMgr: ILayerManager, scene: Phaser.Scene, worldService: WorldService) {
        super(worldService);
        this.scene = scene;
        this.layerMgr = layerMgr;
    }

    show() {
        if ((this.mView && this.mView.isShow()) || this.isShowing) {
            return;
        }
        if (!this.mView) {
            this.mView = new MineSettlePanel(this.scene, this.world);
            this.mView.on("hide", this.onHideMineSettle, this);
        }
        if (!this.mineSettle) {
            this.mineSettle = new MineSettle(this.world);
            this.mineSettle.on("minesettlepacket", this.onMineSettlePacket, this);
            this.mineSettle.register();
        }
        this.mView.show();
        this.layerMgr.addToUILayer(this.mView);
        if (!this.mParam || this.mParam.length === 0)
            this.mineSettle.reqMineSettlePacket();
        else this.onMineSettlePacket(this.mParam[0]);
    }

    isSceneUI() {
        return true;
    }

    destroy() {
        if (this.mineSettle) {
            this.mineSettle.destroy();
            this.mineSettle = undefined;
        }
        if (this.mView) {
            this.mView.hide();
            this.mView = undefined;
        }
    }

    private onHideMineSettle() {
        this.destroy();
    }

    private onMineSettlePacket(content: op_client.OP_VIRTUAL_WORLD_REQ_CLIENT_MINING_MODE_SHOW_REWARD_PACKAGE) {
        const panel = this.mView as MineSettlePanel;
        this.mView.setData("settleData", content);
        panel.setMineSettlePacket(content);
    }

}
