import { BaseMediator } from "../baseMediator";
import { WorldService } from "../../game/world.service";
import { DebugLogger } from "./debug.logger";
import { UIType } from "../ui.manager";
import { BasePanel } from "../components/BasePanel";

export class DebugLoggerMediator extends BaseMediator {
    public static NAME: string = "DebugLoggerMediator";
    private mScene: Phaser.Scene;
    constructor(scene: Phaser.Scene, world: WorldService) {
        super(world);
        this.mUIType = UIType.BaseUIType;
        this.mScene = scene;
    }

    public isSceneUI(): boolean {
        return true;
    }

    public resize() {
        if (this.mView) return this.mView.resize(this.mAddWid, this.mAddHei);
    }

    public isShow(): boolean {
        return this.mView ? this.mView.isShow() : false;
    }

    public getView(): BasePanel {
        return this.mView;
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
