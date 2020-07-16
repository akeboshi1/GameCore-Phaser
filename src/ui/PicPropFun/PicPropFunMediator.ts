import { ILayerManager } from "../layer.manager";
import { WorldService } from "../../game/world.service";
import { BasePanel } from "../components/BasePanel";
import { BaseMediator } from "../../../lib/rexui/lib/ui/baseUI/BaseMediator";
import { PicPropFunPanel } from "./PicPropFunPanel";
export class PicPropFunMediator extends BaseMediator {
    protected mView: PicPropFunPanel;
    private scene: Phaser.Scene;
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
        if (!this.mView) {
            this.mView = new PicPropFunPanel(this.scene, this.world);
            this.mView.on("close", this.onCloseHandler, this);
        }
        this.mView.show(this.mParam);
        this.layerManager.addToUILayer(this.mView);
    }

    getView(): BasePanel {
        return this.mView;
    }

    private onCloseHandler() {
        this.destroy();
    }
}
