import { DebugLogger } from "./DebugLoggerPanel";
import { ILayerManager } from "../Layer.manager";
import { BaseMediator, UIType } from "apowophaserui";
import { WorldService } from "../../world.service";

export class DebugLoggerMediator extends BaseMediator {
    public static NAME: string = "DebugLoggerMediator";
    private mScene: Phaser.Scene;
    private world: WorldService;
    constructor(uiManager: ILayerManager, scene: Phaser.Scene, world: WorldService) {
        super();
        this.mUIType = UIType.Scene;
        this.mScene = scene;
        this.world = world;
    }

    public resize() {
        if (this.mView) return this.mView.resize();
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
        this.mShow = false;
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
