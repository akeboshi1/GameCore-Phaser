import {IMediator} from "../baseMediator";
import {WorldService} from "../../game/world.service";
import { IAbstractPanel } from "../abstractPanel";
import {ILayerManager} from "../layer.manager";
import {ComponentRankPanel} from "./ComponentRankPanel";

export class ComponentRankMediator implements IMediator  {
    readonly world: WorldService;
    private mRank: ComponentRankPanel;
    constructor(layerManager: ILayerManager, scene: Phaser.Scene, worldService: WorldService) {
        this.mRank = new ComponentRankPanel(scene, worldService);
        layerManager.addToUILayer(this.mRank);
    }

    getName(): string {
        return "";
    }

    getView(): IAbstractPanel {
        return this.mRank;
    }

    hide(): void {
    }

    isSceneUI(): boolean {
        return false;
    }

    isShow(): boolean {
        return false;
    }

    resize() {
    }

    show(param?: any): void {
    }

    update(param?: any): void {
    }
}
