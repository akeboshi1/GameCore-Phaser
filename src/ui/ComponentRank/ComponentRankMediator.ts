import { IMediator } from "../baseMediator";
import { WorldService } from "../../game/world.service";
import { IAbstractPanel } from "../abstractPanel";
import { ILayerManager } from "../layer.manager";
import { ComponentRankPanel } from "./ComponentRankPanel";

export class ComponentRankMediator implements IMediator {
    readonly world: WorldService;
    private mLayerManager: ILayerManager;
    private mScene: Phaser.Scene;
    private mRank: ComponentRankPanel;
    constructor(layerManager: ILayerManager, scene: Phaser.Scene, worldService: WorldService) {
        this.mRank = new ComponentRankPanel(scene, worldService);
        layerManager.addToUILayer(this.mRank);
        this.mLayerManager = layerManager;
        this.mScene = scene;
    }

    getName(): string {
        return "";
    }

    getView(): IAbstractPanel {
        return this.mRank;
    }

    hide(): void {
        this.mRank.hide();
    }

    isSceneUI(): boolean {
        return false;
    }

    isShow(): boolean {
        return false;
    }

    resize() {
        this.mRank.resize();
    }

    show(param?: any): void {
        if (this.mRank && this.mRank.isShow()) {
            return;
        }
        this.mRank = new ComponentRankPanel(this.mScene, this.world);
        this.mLayerManager.addToUILayer(this.mRank);
        this.mRank.show();
        if (param && param.length > 0) {
            this.mRank.addItem(param[0]);
        }
    }

    destroy() {
        if (this.mRank) {
            if (this.mRank.parentContainer) {
                this.mRank.parentContainer.remove(this.mRank);
            }
            this.mRank.destroy();
            this.mRank = null;
        }
        this.mScene = null;
    }

    update(param?: any): void {
        if (param && param.length > 0) {
            this.mRank.addItem(param[0]);
        }
    }
}
