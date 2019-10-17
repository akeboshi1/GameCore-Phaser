import { IMediator } from "../baseMediator";
import { IAbstractPanel } from "../abstractPanel";
import { WorldService } from "../../game/world.service";
import { RankPanel } from "./RankPanel";
import { ILayerManager } from "../layer.manager";

export class RankMediator implements IMediator {
    readonly world: WorldService;
    private mRankPanel: RankPanel;
    private mScene: Phaser.Scene;
    private mlayerManager: ILayerManager;
    constructor(layerManager: ILayerManager, scene: Phaser.Scene, world: WorldService) {
        this.world = world;
        this.mScene = scene;
        this.mlayerManager = layerManager;
    }

    getName(): string {
        return "";
    }

    getView(): IAbstractPanel {
        return this.mRankPanel;
    }

    hide(): void {
        this.mRankPanel.hide();
    }

    isSceneUI(): boolean {
        return false;
    }

    isShow(): boolean {
        return false;
    }

    resize() {
        this.mRankPanel.resize();
    }

    show(param?: any): void {
        if (this.mRankPanel && this.mRankPanel.isShow()) {
            return;
        }
        this.mRankPanel = new RankPanel(this.mScene, this.world);
        this.mlayerManager.addToUILayer(this.mRankPanel);
        this.mRankPanel.show();
        if (param && param.length > 0) {
            this.mRankPanel.addItem(param[0]);
        }
    }

    update(param?: any): void {
        if (param && param.length > 0) {
            this.mRankPanel.update(param[0]);
        }
    }

    destroy() {
        if (this.mRankPanel) {
            if (this.mRankPanel.parentContainer) {
                this.mRankPanel.parentContainer.remove(this.mRankPanel);
            }
            this.mRankPanel.destroy();
            this.mRankPanel = null;
        }
        this.mScene = null;
    }

}
