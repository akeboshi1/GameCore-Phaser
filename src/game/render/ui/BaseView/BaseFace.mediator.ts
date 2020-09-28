import { BaseMediator, UIType, Panel } from "apowophaserui";
import { WorldService } from "../../world.service";
import { Size } from "../../../../utils/size";

/**
 * 场景UImediator
 */
export class BaseFaceMediator extends BaseMediator {
    protected mScene: Phaser.Scene;
    protected world: WorldService;
    constructor(world: WorldService, scene: Phaser.Scene) {
        super();
        this.mScene = scene;
        this.world = world;
        this.mUIType = UIType.Scene;
    }

    public getView(): Panel {
        return this.mView;
    }

    public isSceneUI(): boolean {
        return true;
    }

    public isShow(): boolean {
        if (!this.mView) return false;
        return this.mView.isShow();
    }

    public resize() {
        const size: Size = this.world.getSize();
        const view = this.getView();
        if (this.mView && view.isShow()) {
            return this.mView.resize(size.width, size.height);
        }
    }

    public hide() {
        this.mShow = false;
        if (this.mView) this.mView.hide();
    }

    public destroy() {
        super.destroy();
    }
}
