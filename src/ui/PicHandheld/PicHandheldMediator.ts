import { ILayerManager } from "../layer.manager";
import { WorldService } from "../../game/world.service";
import { op_client } from "pixelpai_proto";
import { BasePanel } from "../components/BasePanel";
import { BaseMediator } from "../../../lib/rexui/lib/ui/baseUI/BaseMediator";
import { PicHandheld } from "./PicHandheld";
import { PicHandheldPanel } from "./PicHandheldPanel";
import { PicaChatMediator } from "../PicaChat/PicaChatMediator";

export class PicHandheldMediator extends BaseMediator {
    protected mView: PicHandheldPanel;
    private scene: Phaser.Scene;
    private picHand: PicHandheld;
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
        if (!this.picHand) {
            this.picHand = new PicHandheld(this.world);
            this.picHand.register();
        }

        if (!this.mView) {
            this.mView = new PicHandheldPanel(this.scene, this.world);
            this.mView.on("openeqiped", this.openEquipedPanel, this);
        }

        this.mView.show();
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
        if (this.picHand) {
            this.picHand.destroy();
            this.picHand = undefined;
        }
        super.destroy();
    }

    isSceneUI() {
        return true;
    }

    private openEquipedPanel(state: boolean) {
        const uiManager = this.world.uiManager;
        const mediator = uiManager.getMediator(PicaChatMediator.name);
        if (mediator) {
            if (state)
                mediator.hide();
            else {
                mediator.show();
                this.layerManager.removeToUILayer(this.mView);
                this.layerManager.addToUILayer(this.mView);
            }
        }
    }

}
