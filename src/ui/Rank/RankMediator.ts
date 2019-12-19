import { IMediator, BaseMediator } from "../baseMediator";
import { IAbstractPanel } from "../abstractPanel";
import { WorldService } from "../../game/world.service";
import { RankPanel } from "./RankPanel";
import { ILayerManager } from "../layer.manager";

export class RankMediator extends BaseMediator {
    readonly world: WorldService;
    private mScene: Phaser.Scene;
    private mlayerManager: ILayerManager;
    constructor(layerManager: ILayerManager, scene: Phaser.Scene, world: WorldService) {
        super(world);
        this.world = world;
        this.mScene = scene;
        this.mlayerManager = layerManager;
    }

    getName(): string {
        return "";
    }

    getView(): IAbstractPanel {
        return this.mView;
    }

    hide(): void {
        this.isShowing = false;
        if (this.mView) this.mView.hide();
    }

    isSceneUI(): boolean {
        return false;
    }

    isShow(): boolean {
        return false;
    }

    resize() {
        if (this.mView) this.mView.resize();
    }

    show(param?: any): void {
        if (this.mView && this.mView.isShow()) {
            return;
        }
        this.mView = new RankPanel(this.mScene, this.world);
        this.mlayerManager.addToUILayer(this.mView);
        if (param && param.length > 0) {
            (this.mView as RankPanel).addItem(param[0]);
        }
        this.mView.show();
        super.show(param);
    }

    update(param?: any): void {
        if (!this.mView) return;
        if (param && param.length > 0) {
            this.mView.update(param[0]);
        }
    }

    destroy() {
        if (this.mView) {
            if (this.mView.parentContainer) {
                this.mView.parentContainer.remove(this.mView);
            }
            this.mView.destroy();
            this.mView = null;
        }
        this.mScene = null;
    }

}
