import { BaseMediator } from "../baseMediator";
import { WorldService } from "../../game/world.service";
import { RankPanel } from "./RankPanel";
import { ILayerManager } from "../layer.manager";
import { UIType } from "../ui.manager";
import { BasePanel } from "../components/BasePanel";

export class RankMediator extends BaseMediator {
    public static NAME: string = "RankMediator";
    readonly world: WorldService;
    private mScene: Phaser.Scene;
    private mlayerManager: ILayerManager;
    constructor(layerManager: ILayerManager, scene: Phaser.Scene, world: WorldService) {
        super(world);
        this.world = world;
        this.mScene = scene;
        this.mlayerManager = layerManager;
        this.mUIType = this.world.game.device.os.desktop ? UIType.BaseUIType : UIType.NormalUIType;
    }

    public tweenView(show: boolean) {
        if (!this.mView || !this.world.game.device.os.desktop) return;
        (this.mView as RankPanel).tweenView(show);
    }

    getName(): string {
        return "";
    }

    getView(): BasePanel {
        return this.mView;
    }

    hide(): void {
        this.isShowing = false;
        if (this.mView) {
            this.mView.hide();
            this.mView = null;
            if (!this.world.game.device.os.desktop) {
                this.world.uiManager.checkUIState(RankMediator.NAME, true);
            }
        }
    }

    isSceneUI(): boolean {
        return false;
    }

    isShow(): boolean {
        return false;
    }

    resize() {
        if (this.mView) this.mView.resize(this.mAddWid, this.mAddHei);
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
        if (!this.world.game.device.os.desktop) {
            this.world.uiManager.checkUIState(RankMediator.NAME, false);
        }
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
