import { BaseMediator } from "../../../lib/rexui/lib/ui/baseUI/BaseMediator";
import { WorldService } from "../../game/world.service";
import { ILayerManager } from "../layer.manager";
import { FriendInvitePanel } from "./FriendInvitePanel";

export class FriendInviteMediator extends BaseMediator {
    private world: WorldService;
    private mLayerManager: ILayerManager;
    private mScene: Phaser.Scene;
    constructor(layerManager: ILayerManager, scene: Phaser.Scene, worldService: WorldService) {
        super();
        this.world = worldService;
        this.mLayerManager = layerManager;
        this.mScene = scene;
    }

    show(param?: any): void {
        if (this.mView && this.mView.isShow()) {
            this.mView.show(param);
            return;
        }
        this.mView = new FriendInvitePanel(this.mScene, this.world);
        this.mView.on("hide", this.onHideHandler, this);
        this.mView.on("agree", this.onAgreeHandler, this);
        this.mView.show(param);
        this.mLayerManager.addToDialogLayer(this.mView);
    }

    private onAgreeHandler() {
        // TODO
    }

    private onHideHandler() {
        this.destroy();
    }
}
