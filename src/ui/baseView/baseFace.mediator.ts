import { BaseMediator } from "../baseMediator";
import { WorldService } from "../../game/world.service";
import { UIType } from "../ui.manager";
import { Panel } from "../components/panel";
/**
 * 场景UImediator
 */
export class BaseFaceMediator extends BaseMediator {
    protected mScene: Phaser.Scene;
    constructor(mWorld: WorldService, scene: Phaser.Scene) {
        super(mWorld);
        this.mScene = scene;
        this.mUIType = UIType.BaseUIType;
    }

    public getView(): Panel {
        return this.mView;
    }

    public isSceneUI(): boolean {
        return true;
    }

    public tweenView(show: boolean) {
    }

    public isShow(): boolean {
        if (!this.mView) return false;
        return this.mView.isShow();
    }

    public resize() {
        if (this.mView) return this.mView.resize(this.mAddWid, this.mAddHei);
    }

    public hide() {
        this.isShowing = false;
        if (this.mView) this.mView = null;
    }

    public destroy() {
        if (this.mView) this.mView.destroy();
        super.destroy();
    }
}
