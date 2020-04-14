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
    constructor(layerMgr: ILayerManager, worldService: WorldService) {
        super(worldService);
        this.scene = layerMgr.scene;
        this.layerMgr = layerMgr;
    }

    show() {
        if ((this.mView && this.mView.isShow()) || this.isShowing) {
            return;
        }
        if (!this.mView) {
            this.mView = new MineSettlePanel(this.scene, this.world);
        }
        if (!this.mineSettle) {
            this.mineSettle = new MineSettle(this.world);
            this.mineSettle.on("minesettlepacket", this.onMineSettlePacket, this);
        }
        this.mView.show();
        this.layerMgr.addToUILayer(this.mView);
        this.mineSettle.reqMineSettlePacket();
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
            this.mView.destroy();
            this.mView = undefined;
        }
        super.destroy();
        this.scene = null;
        this.layerMgr = null;
    }

    private onMineSettlePacket(content: op_client.CountablePackageItem[]) {
        const panel = this.mView as MineSettlePanel;
        panel.setMineSettlePacket(content);
    }

}
