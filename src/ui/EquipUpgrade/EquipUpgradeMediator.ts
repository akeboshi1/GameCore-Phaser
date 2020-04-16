import { BaseMediator } from "../baseMediator";
import { ILayerManager } from "../layer.manager";
import EquipUpgradePanel from "./EquipUpgradePanel";
import { WorldService } from "../../game/world.service";
import { EquipUpgrade } from "./EquipUpgrade";

export class EquipUpgradeMediator extends BaseMediator {
    private scene: Phaser.Scene;
    private layerMgr: ILayerManager;
    private equipUpgrade: EquipUpgrade;
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
            this.mView = new EquipUpgradePanel(this.scene, this.world);
            this.mView.on("hide", this.onHidePanel, this);
        }
        if (!this.equipUpgrade) {
            this.equipUpgrade = new EquipUpgrade(this.world);
        }
        this.mView.show();
        this.layerMgr.addToUILayer(this.mView);
        // if (!this.mParam || this.mParam.length === 0)
        //     this.mineSettle.reqMineSettlePacket();
        // else this.onMineSettlePacket(this.mParam[0]);
    }

    isSceneUI() {
        return true;
    }

    destroy() {
        if (this.equipUpgrade) {
            this.equipUpgrade.destroy();
            this.equipUpgrade = undefined;
        }
        if (this.mView) {
            this.mView.hide();
            this.mView = undefined;
        }
    }

    private onHidePanel() {
        this.destroy();
    }

}
