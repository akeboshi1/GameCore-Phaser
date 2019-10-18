import { IMediator, BaseMediator } from "../baseMediator";
import { WorldService } from "../../game/world.service";
import { ItemDetailView } from "./ItemDetailView";
import { IAbstractPanel } from "../abstractPanel";
import { ILayerManager } from "../layer.manager";

export class ItemDetailMediator extends BaseMediator {
    public static NAME: string = "ItemDetailMediator";
    readonly world: WorldService;
    private mLayerManager: ILayerManager;
    constructor(layerManager: ILayerManager, scene: Phaser.Scene, world: WorldService) {
        super(world);
        this.world = world;
        this.mLayerManager = layerManager;
        this.mView = new ItemDetailView(scene, world);
    }

    public isSceneUI(): boolean {
        return false;
    }

    public isShow(): boolean {
        return this.mView.isShow();
    }
    public resize() {
        this.mView.resize();
    }

    public getView(): IAbstractPanel {
        return this.mView;
    }

    public show(param?: any): void {
        super.show(param);
    }
    public update(param?: any): void {

    }
    public hide(): void {

    }
    public destroy() {

    }

}
