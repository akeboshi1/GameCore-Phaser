import { BaseMediator } from "../baseMediator";
import { IAbstractPanel } from "../abstractPanel";
import { ILayerManager } from "../layer.manager";
import { WorldService } from "../../game/world.service";
import { op_client } from "pixelpai_proto";
import { InteractivePanel } from "./pc/InteractivePanel";

export class InteractivePanelMediator extends BaseMediator {
    public static NAME: string = "InteractivePanelMediator";
    public world: WorldService;
    private mScene: Phaser.Scene;
    private mParam: any;
    constructor(layerManager: ILayerManager, scene: Phaser.Scene, world: WorldService) {
        super(world);
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
        if (this.mView) return this.mView.resize();
    }

    public getView(): IAbstractPanel {
        return this.mView;
    }

    public show(param?: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_SHOW_UI) {
        if (this.mView && this.isShow()) {
            return;
        }
        this.mParam = param;
        if (this.world.game.device.os.desktop) {
            this.mView = new InteractivePanel(this.mScene, this.world);
        } else {

        }
        (this.mView as InteractivePanel).show(param);
        super.show(param);
    }

    public update(param?: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_UPDATE_UI) {
        if (!this.mView || !this.mView.isShow) {
            return;
        }
        this.mParam = param;
        super.update(param);
    }

    public hide() {
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
            this.world.roomManager.currentRoom.getHero().getInteractive().requestTargetUI(this.mParam[0].id, componentID);
        }
    }
}
