import {BaseMediator} from "../baseMediator";
import {WorldService} from "../../game/world.service";
import {ElementStoragePanel} from "./ElementStoragePanel";
import {ILayerManager} from "../layer.manager";
import {DecoratePanel} from "../decorate/decorate.panel";

export class ElementStorageMediator extends BaseMediator {
    public static NAME: string = "ElementStorageMediator";
    private mLayerManager: ILayerManager;
    private mScene: Phaser.Scene;
    constructor(layerManager: ILayerManager, scene: Phaser.Scene, world: WorldService) {
        super(world);
        this.mLayerManager = layerManager;
        this.mScene = scene;
    }

    show(param?: any): void {
        if (this.mView && this.mView.isShow() || this.isShowing) {
            return;
        }
        this.mView = new ElementStoragePanel(this.mScene, this.world);
        this.mLayerManager.addToUILayer(this.mView);
        this.mView.show(param);
    }

    isSceneUI(): boolean {
        return true;
    }

    /**
     * 展开
     */
    expand() {

    }

    /**
     * 收起
     */
    collapse() {

    }
}
