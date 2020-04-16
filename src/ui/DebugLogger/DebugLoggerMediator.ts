import { BaseMediator } from "../baseMediator";
import { WorldService } from "../../game/world.service";
import { DebugLogger } from "./DebugLoggerPanel";
import { UIType } from "../ui.manager";
import { ILayerManager } from "../layer.manager";

export class DebugLoggerMediator extends BaseMediator {
    public static NAME: string = "DebugLoggerMediator";
    private mScene: Phaser.Scene;
    constructor(uiManager: ILayerManager, scene: Phaser.Scene, world: WorldService) {
        super(world);
        this.mUIType = UIType.BaseUIType;
        this.mScene = scene;
    }

    public resize() {
        if (this.mView) return this.mView.resize(this.mAddWid, this.mAddHei);
    }

    public isShow(): boolean {
        return this.mView ? this.mView.isShow() : false;
    }

    public show(param?: any) {
        if (this.mView && this.isShow()) {
            return;
        }
        this.mView = new DebugLogger(this.mScene, this.world);
        this.mView.show(param);
        super.show(param);
    }

    public hide() {
        this.isShowing = false;
        if (this.mView) {
            this.mView.hide();
            this.mView = null;
        }
    }

    public destroy() {
        this.mScene = null;
        super.destroy();
    }
}
