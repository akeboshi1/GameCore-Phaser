import { ILayerManager } from "../Layer.manager";
import { WorldService } from "../../game/world.service";
import { BasePanel } from "../Components/BasePanel";
import { PicRoomUpgradePanel } from "./PicRoomUpgradePanel";
import { PicRoomUpgrade } from "./PicRoomUpgrade";
import { BaseMediator } from "apowophaserui";

export class PicRoomUpgradeMediator extends BaseMediator {
    protected mView: PicRoomUpgradePanel;
    private scene: Phaser.Scene;
    private picRoom: PicRoomUpgrade;
    private world: WorldService;
    constructor(
        private layerManager: ILayerManager,
        scene: Phaser.Scene,
        worldService: WorldService
    ) {
        super();
        this.world = worldService;
        this.scene = this.layerManager.scene;
    }

    show() {
        if ((this.mView && this.mView.isShow()) || this.mShow) {
            this.layerManager.addToUILayer(this.mView);
            return;
        }
        if (!this.picRoom) {
            this.picRoom = new PicRoomUpgrade(this.world);
            this.picRoom.register();
        }

        if (!this.mView) {
            this.mView = new PicRoomUpgradePanel(this.scene, this.world);
            this.mView.on("querytargetui", this.onQueryTargetUI, this);
        }

        this.mView.show(this.mParam);
        this.layerManager.addToUILayer(this.mView);
    }

    hide() {
        super.hide();
        this.layerManager.removeToUILayer(this.mView);
    }

    getView(): BasePanel {
        return this.mView;
    }

    destroy() {
        if (this.picRoom) {
            this.picRoom.destroy();
            this.picRoom = undefined;
        }
        super.destroy();
    }

    private onQueryTargetUI(uid: number) {
        this.picRoom.queryTargetUI(uid);
        this.destroy();
    }
}
