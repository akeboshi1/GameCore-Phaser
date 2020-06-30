import { ILayerManager } from "../layer.manager";
import { WorldService } from "../../game/world.service";
import { op_client } from "pixelpai_proto";
import { Logger } from "../../utils/log";
import { BasePanel } from "../components/BasePanel";
import { BaseMediator } from "../../../lib/rexui/lib/ui/baseUI/BaseMediator";
import { PicFurniFunPanel } from "./PicFurniFunPanel";
import { PicFurniFun } from "./PicFurniFun";

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
    }

    show() {
        if ((this.mView && this.mView.isShow()) || this.mShow) {
            this.layerManager.addToUILayer(this.mView);
            return;
        }
        if (!this.picFurni) {
            this.picFurni = new PicFurniFun(this.world);
            this.picFurni.register();
        }

        if (!this.mView) {
            this.mView = new PicFurniFunPanel(this.scene, this.world);
            this.mView.on("close", this.onCloseHandler, this);
        }

        this.mView.show();
        this.layerManager.addToUILayer(this.mView);
    }

    getView(): BasePanel {
        return this.mView;
    }

    destroy() {
        if (this.picFurni) {
            this.picFurni.destroy();
        }
        if (this.mView) {
            this.mView.destroy();
            this.mView = undefined;
        }
        super.destroy();
    }

    private onCloseHandler() {
        this.destroy();
    }

    private updatepicFurniHandler(content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_EDIT_MODE_ROOM_LIST) {
        if (!this.mView) {
            return;
        }
    }

    private updateMypicFurniHandler(content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_EDIT_MODE_GET_PLAYER_ENTER_ROOM_HISTORY) {
        if (!this.mView) {
            return;
        }
    }
}
