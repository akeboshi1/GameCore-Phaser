import { ILayerManager } from "../layer.manager";
import { WorldService } from "../../game/world.service";
import { op_client } from "pixelpai_proto";
import { BaseMediator } from "../../../lib/rexui/lib/ui/baseUI/BaseMediator";
import { CutInMenu } from "./CutInMenu";
import { CutInMenuPanel } from "./CutInMenuPanel";

export class CutInMenuMediator extends BaseMediator {
    private scene: Phaser.Scene;
    private world: WorldService;
    private layerMgr: ILayerManager;
    private cutInMenu: CutInMenu;
    constructor(layerMgr: ILayerManager, scene: Phaser.Scene, worldService: WorldService) {
        super();
        this.scene = scene;
        this.layerMgr = layerMgr;
        this.world = worldService;
    }

    show(mParam) {
        if (this.mView) {
            return;
        }
        if (!this.mView) {
            this.mView = new CutInMenuPanel(this.scene, this.world);
            this.mView.on("hide", this.onHideView, this);
            this.mView.on("rightButton", this.onRightButtonHandler, this);
        }
        if (!this.cutInMenu) {
            this.cutInMenu = new CutInMenu(this.world);
            this.cutInMenu.register();
        }
        this.layerMgr.addToUILayer(this.mView);
        this.mView.show(mParam);
    }

    isSceneUI() {
        return true;
    }

    destroy() {
        if (this.cutInMenu) {
            this.cutInMenu.destroy();
            this.cutInMenu = undefined;
        }
        if (this.mView) {
            this.mView.hide();
            this.mView = undefined;
        }
    }

    private onRightButtonHandler(uiid: number, btnid: number) {
        this.cutInMenu.reqRightButton(uiid, btnid);
    }
    private onHideView() {
        this.destroy();
    }

}
