import { IMediator, BaseMediator } from "../baseMediator";
import { WorldService } from "../../game/world.service";
import { IAbstractPanel } from "../abstractPanel";
import { ILayerManager } from "../layer.manager";
import { ComponentRankPanel } from "./ComponentRankPanel";

export class ComponentRankMediator extends BaseMediator {
    readonly world: WorldService;
    private mLayerManager: ILayerManager;
    private mScene: Phaser.Scene;
    constructor(layerManager: ILayerManager, scene: Phaser.Scene, worldService: WorldService) {
        super(worldService);
        this.mView = new ComponentRankPanel(scene, worldService);
        layerManager.addToUILayer(this.mView);
        this.mLayerManager = layerManager;
        this.mScene = scene;
    }

    getName(): string {
        return "";
    }

    getView(): IAbstractPanel {
        return this.mView;
    }

    hide(): void {
        this.mView.hide();
    }

    isSceneUI(): boolean {
        return false;
    }

    isShow(): boolean {
        return false;
    }

    resize() {
        this.mView.resize();
    }

    show(param?: any): void {
        if (this.mView && this.mView.isShow()) {
            return;
        }
        this.mView = new ComponentRankPanel(this.mScene, this.world);
        this.mLayerManager.addToUILayer(this.mView);
        this.mView.show();
        if (param && param.length > 0) {
            (this.mView as ComponentRankPanel).addItem(param[0]);
        }
        super.show(param);
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

    update(param?: any): void {
        if (param && param.length > 0) {
            (this.mView as ComponentRankPanel).addItem(param[0]);
        }
    }
}
