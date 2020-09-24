import { ILayerManager } from "../layer.manager";
import { WorldService } from "../../game/world.service";
import { op_client, op_pkt_def } from "pixelpai_proto";
import { BasePanel } from "../components/BasePanel";
import { PicFurniFunPanel } from "./PicFurniFunPanel";
import { PicFurniFun } from "./PicFurniFun";
import { BaseMediator } from "apowophaserui";

export class PicFurniFunMediator extends BaseMediator {
    protected mView: PicFurniFunPanel;
    private scene: Phaser.Scene;
    private picFurni: PicFurniFun;
    private world: WorldService;
    constructor(
        private layerManager: ILayerManager,
        scene: Phaser.Scene,
        worldService: WorldService
    ) {
        super();
        this.world = worldService;
        this.scene = this.layerManager.scene;
        if (!this.picFurni) {
            this.picFurni = new PicFurniFun(this.world);
            this.picFurni.register();
            this.picFurni.on("openview", this.onOpenView, this);
        }
    }

    show() {
        if ((this.mView && this.mView.isShow()) || this.mShow) {
            this.layerManager.addToUILayer(this.mView);
            return;
        }

        if (!this.mView) {
            this.mView = new PicFurniFunPanel(this.scene, this.world);
            this.mView.on("close", this.onCloseHandler, this);
            this.mView.on("queryunlock", this.queryUnlockElement, this);
        }
        this.mView.show(this.mParam);
        this.layerManager.addToUILayer(this.mView);
    }

    getView(): BasePanel {
        return this.mView;
    }

    destroy() {
        if (this.picFurni) {
            this.picFurni.destroy();
        }
        super.destroy();
    }

    get playerData() {
        const user = this.world.user;
        if (!user || !user.bag) {
            return;
        }
        return user.bag.playerData;
    }

    private onCloseHandler() {
        super.destroy();
    }

    private onOpenView(content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_UNLOCK_ELEMENT_REQUIREMENT) {
        if (content.materials) this.updateMaterials(content.materials);
        this.setParam(content);
        this.show();
    }
    private queryUnlockElement(ids: number[]) {
        this.picFurni.queryUnlockElement(ids);
    }
    private updateMaterials(materials: op_client.ICountablePackageItem[]) {
        if (this.playerData) {
            if (materials) {
                for (const data of materials) {
                    const count = this.playerData.getItemsCount(op_pkt_def.PKT_PackageType.PropPackage, data.id, data.subcategory);
                    data.count = count;
                }
            }
        }
    }
}
