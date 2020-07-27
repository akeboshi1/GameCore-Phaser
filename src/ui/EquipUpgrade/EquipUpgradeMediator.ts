import { ILayerManager } from "../layer.manager";
import EquipUpgradePanel from "./EquipUpgradePanel";
import { WorldService } from "../../game/world.service";
import { EquipUpgrade } from "./EquipUpgrade";
import { op_client } from "pixelpai_proto";
import { BaseMediator } from "../../../lib/rexui/lib/ui/baseUI/BaseMediator";

export class EquipUpgradeMediator extends BaseMediator {
    private scene: Phaser.Scene;
    private layerMgr: ILayerManager;
    private equipUpgrade: EquipUpgrade;
    private world: WorldService;
    constructor(layerMgr: ILayerManager, scene: Phaser.Scene, worldService: WorldService) {
        super();
        this.scene = scene;
        this.layerMgr = layerMgr;
        this.world = worldService;
        if (!this.equipUpgrade) {
            this.equipUpgrade = new EquipUpgrade(this.world);
            this.equipUpgrade.on("activeEquip", this.onActiveEquipment, this);
            this.equipUpgrade.on("showopen", this.onShowEquipPanel, this);
            this.equipUpgrade.register();
        }
    }

    show() {
        if ((this.mView && this.mView.isShow()) || this.mShow) {
            return;
        }
        if (!this.mView) {
            this.mView = new EquipUpgradePanel(this.scene, this.world);
            this.mView.on("hide", this.onHidePanel, this);
            this.mView.on("reqActive", this.onReqActiveEquipment, this);
            this.mView.on("reqEquiped", this.onReqEquipedEquipment, this);
        }

        this.layerMgr.addToUILayer(this.mView);
        if (this.mParam && this.mParam.length > 0)
            this.onEquipUpgradePacket(this.mParam[0]);
        this.mView.show();
    }

    destroy() {
        if (this.equipUpgrade) this.equipUpgrade.destroy();
        this.equipUpgrade = undefined;
        super.destroy();
    }

    private onHidePanel() {
        super.destroy();
    }

    private onEquipUpgradePacket(content: op_client.OP_VIRTUAL_WORLD_REQ_CLIENT_MINING_MODE_SHOW_SELECT_EQUIPMENT_PANEL) {
        const panel = this.mView as EquipUpgradePanel;
        if (!panel) return;
        panel.setData("upgradeData", content);
        panel.setEquipDatas(content);
    }

    private onActiveEquipment(data: op_client.IMiningEquipment) {
        if (this.mView) {
            const panel = this.mView as EquipUpgradePanel;
            panel.setActiveEquipment(data);
        }
    }

    private onReqEquipedEquipment(id: string) {
        if (this.equipUpgrade) this.equipUpgrade.reqEquipedEquipment(id);
    }

    private onReqActiveEquipment(id: string) {
        if (this.equipUpgrade) this.equipUpgrade.reqActiveEquipment(id);
    }

    private onShowEquipPanel(content: any) {
        this.setParam([content]);
        this.show();
    }

}
