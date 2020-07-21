import { WorldService } from "../../game/world.service";
import { ILayerManager } from "../layer.manager";
import { ComponentRankPanel } from "./ComponentRankPanel";
import { BasePanel } from "../components/BasePanel";
import { UIType } from "apowophaserui";
import { BaseMediator } from "../../ui/components";
export class ComponentRankMediator extends BaseMediator {
    public static NAME: string = "ComponentRankMediator";
    readonly world: WorldService;
    private mLayerManager: ILayerManager;
    private mScene: Phaser.Scene;
    constructor(layerManager: ILayerManager, scene: Phaser.Scene, worldService: WorldService) {
        super();
        this.mUIType = UIType.Normal;
        this.mView = new ComponentRankPanel(scene, worldService);
        layerManager.addToUILayer(this.mView);
        this.mLayerManager = layerManager;
        this.mScene = scene;
        this.world = worldService;
    }

    getName(): string {
        return "";
    }

    hide(): void {
        this.mShow = false;
        if (this.mView) {
            this.mView.hide();
            this.mView = null;
        }
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
        }
        super.destroy();
    }

    update(param?: any): void {
        if (param && param.length > 0) {
            (this.mView as ComponentRankPanel).addItem(param[0]);
        }
    }
}
