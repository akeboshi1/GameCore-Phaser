import { IMediator, BaseMediator } from "../baseMediator";
import { WorldService } from "../../game/world.service";
import { ItemDetailView } from "./ItemDetailView";
import { IAbstractPanel } from "../abstractPanel";
import { ILayerManager } from "../layer.manager";

export class ItemDetailMediator extends BaseMediator {
    public static NAME: string = "ItemDetailMediator";
    readonly world: WorldService;
    private mLayerManager: ILayerManager;
    private mScene: Phaser.Scene;
    private mParam: any;
    constructor(layerManager: ILayerManager, scene: Phaser.Scene, world: WorldService) {
        super(world);
        this.world = world;
        this.mScene = scene;
        this.mLayerManager = layerManager;

    }

    public isSceneUI(): boolean {
        return false;
    }

    public show(param?: any): void {
        if (this.mView) {
            return;
        }
        this.mView = new ItemDetailView(this.mScene, this.world);
        this.mView.show(param);
        this.mParam = param;
        this.mLayerManager.addToUILayer(this.mView);
        super.show(param);
    }
    public update(param?: any): void {
        super.update(param);
    }
}
