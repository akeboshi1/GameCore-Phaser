import {IMediator} from "../baseMediator";
import {IAbstractPanel} from "../abstractPanel";
import { WorldService } from "../../game/world.service";
import {RankPanel} from "./RankPanel";
import {ILayerManager} from "../layer.manager";

export class RankMediator implements IMediator {
    readonly world: WorldService;
    private mRankPanel: RankPanel;
    constructor(layerManager: ILayerManager, scene: Phaser.Scene, world: WorldService) {
        this.world = world;
        this.mRankPanel = new RankPanel(scene, world);
        layerManager.addToUILayer(this.mRankPanel);
    }

    getName(): string {
        return "";
    }

    getView(): IAbstractPanel {
        return undefined;
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
        this.mRankPanel.show();
        if (param && param.length > 0) {
            this.mRankPanel.addItem(param[0]);
        }
    }

    update(param?: any): void {
    }

}
