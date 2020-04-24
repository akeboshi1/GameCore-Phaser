import { WorldService } from "../../game/world.service";
import { ILayerManager } from "../layer.manager";
import { ComponentRankPanel } from "./ComponentRankPanel";
import { BasePanel } from "../components/BasePanel";
import { BaseMediator } from "../../../lib/rexui/lib/ui/baseUI/BaseMediator";
import { UIType } from "../../../lib/rexui/lib/ui/interface/baseUI/UIType";

export class ComponentRankMediator extends BaseMediator {
    public static NAME: string = "ComponentRankMediator";
    readonly world: WorldService;
    private mLayerManager: ILayerManager;
    private mScene: Phaser.Scene;
    constructor(layerManager: ILayerManager, scene: Phaser.Scene, worldService: WorldService) {
        super();
        this.mUIType = UIType.Normal;
        this.mView = new ComponentRankPanel(scene, worldService);
        layerManager.addToUILayer(this.mView.view);
        this.mLayerManager = layerManager;
        this.mScene = scene;
        this.world = worldService;
    }

    getName(): string {
        return "";
    }

    getView(): BasePanel {
        return this.mView.view;
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
        this.mLayerManager.addToUILayer(this.mView.view);
        this.mView.show();
        if (param && param.length > 0) {
            (this.mView as ComponentRankPanel).addItem(param[0]);
        }
        super.show(param);
    }

    destroy() {
        if (this.mView) {
            if (this.mView.view.parentContainer) {
                this.mView.view.parentContainer.remove(this.mView);
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
