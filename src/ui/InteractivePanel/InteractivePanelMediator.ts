import { BaseMediator } from "../baseMediator";
import { ILayerManager } from "../layer.manager";
import { WorldService } from "../../game/world.service";
import { op_client } from "pixelpai_proto";
import { InteractivePanel } from "./InteractivePanel";
import { UIType } from "../ui.manager";
import { BasePanel } from "../components/BasePanel";

export class InteractivePanelMediator extends BaseMediator {
    public static NAME: string = "InteractivePanelMediator";
    public world: WorldService;
    private mScene: Phaser.Scene;
    constructor(layerManager: ILayerManager, scene: Phaser.Scene, world: WorldService) {
        super(world);
        this.mUIType = UIType.MonopolyUIType;
        this.mScene = scene;
    }

    public isShow(): boolean {
        if (!this.mView) return false;
        return this.mView.isShow();
    }

    public isSceneUI(): boolean {
        return false;
    }

    public resize() {
        if (this.mView && this.mView.isShow) return this.mView.resize(this.mAddWid, this.mAddHei);
    }

    public getView(): BasePanel {
        return this.mView;
    }

    public show(param?: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_SHOW_UI) {
        if (this.mView && this.isShow()) {
            return;
        }
        this.mView = new InteractivePanel(this.mScene, this.world);
        this.mView.show(param);
        super.show(param);
    }

    public update(param?: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_UPDATE_UI) {
        if (!this.mView || !this.mView.isShow) {
            return;
        }
        super.update(param);
    }

    public hide() {
        this.isShowing = false;
        if (this.mView) {
            this.mView.hide();
            this.mView = null;
        }
    }

    public destroy() {
        this.world = null;
        this.mScene = null;
        this.mParam = null;
        super.destroy();
    }

    public componentClick(componentID: number) {
        if (this.mParam) {
            this.world.roomManager.currentRoom.playerManager.actor.getInteractive().requestTargetUI(this.mParam[0].id, componentID);
        }
    }
}
