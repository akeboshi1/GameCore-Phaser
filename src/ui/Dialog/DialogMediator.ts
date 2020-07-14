import { WorldService } from "../../game/world.service";
import { ILayerManager } from "../layer.manager";
import { Dialog } from "./Dialog";
import { DialogPanel } from "./DialogPanel";
import { op_client } from "pixelpai_proto";
import { BaseMediator } from "tooqingui";
export class DialogMediator extends BaseMediator {
    private scene: Phaser.Scene;
    private world: WorldService;
    private layerMgr: ILayerManager;
    private dialog: Dialog;
    constructor(layerMgr: ILayerManager, scene: Phaser.Scene, worldService: WorldService) {
        super();
        this.scene = scene;
        this.layerMgr = layerMgr;
        this.world = worldService;
    }

    show(param?: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_SHOW_UI) {
        if ((this.mView && this.mView.isShow()) || this.mShow) {
            return;
        }
        if (!this.mView) {
            this.mView = new DialogPanel(this.scene, this.world);
            this.mView.on("querydialog", this.onQueryNextDialog, this);
            this.mView.on("hide", this.onHideHandler, this);
        }
        if (!this.dialog) {
            this.dialog = new Dialog(this.world);
            this.dialog.register();
        }
        this.layerMgr.addToUILayer(this.mView);
        this.mView.show(param);
        super.show(param);
    }
    public update(param?: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_UPDATE_UI) {
        if (!this.mView || !this.mView.isShow) {
            return;
        }
        super.update(param);
    }
    isSceneUI() {
        return true;
    }

    destroy() {
        if (this.dialog) {
            this.dialog.destroy();
            this.dialog = undefined;
        }
        if (this.mView) {
            this.mView.hide();
            this.mView = undefined;
        }
    }

    hide() {
        super.hide();
        this.destroy();
    }

    private onQueryNextDialog(uiid: number, comid: number, data?: number[]) {
        this.dialog.queryNextDialog(uiid, comid, data);
    }

    private onHideHandler() {
        this.hide();
        this.destroy();
    }

}
