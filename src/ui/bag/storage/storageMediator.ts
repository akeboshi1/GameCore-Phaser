import { BaseMediator } from "../../baseMediator";
import { WorldService } from "../../../game/world.service";
import { StoragePanel } from "./storagePanel";
import { UIType } from "../../ui.manager";
import { ILayerManager } from "../../layer.manager";
import { BasePanel } from "../../components/BasePanel";

export class StorageMediator extends BaseMediator {
    public static NAME: string = "StorageMediator";
    public world: WorldService;
    private mScene: Phaser.Scene;
    private mLayerManager;
    constructor(layerManager: ILayerManager, mworld: WorldService, scene: Phaser.Scene) {
        super(mworld);
        this.mLayerManager = layerManager;
        this.world = mworld;
        this.mScene = scene;
        this.mUIType = UIType.NormalUIType;
    }
    public isShow(): boolean {
        return this.mView.isShow();
    }
    public resize() {
        if (this.mView) this.mView.resize(this.mAddWid, this.mAddHei);
    }
    public getView(): BasePanel {
        return this.mView;
    }

    public show(param?: any): void {
        if (this.mView && this.mView.isShow()) {
            return;
        }
        if (!this.mView) {
            this.mView = new StoragePanel(this.mScene, this.world);
        }
        this.mView.show(param);
        this.world.uiManager.checkUIState(StorageMediator.NAME, false);
        super.show(param);
    }

    public update(param?: any): void {
        if (this.mView) this.mView.update(param);
    }

    public hide(): void {
        if (this.mView) {
            this.mView.hide();
            this.world.uiManager.checkUIState(StorageMediator.NAME, true);
        }
    }

    public destroy() {
        if (this.mView) {
            this.mView.destroy();
            this.mView = null;
        }
    }
}
