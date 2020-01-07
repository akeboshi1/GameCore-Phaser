import {BaseMediator} from "../baseMediator";
import {WorldService} from "../../game/world.service";
import {ElementStoragePanel} from "./ElementStoragePanel";
import {ILayerManager} from "../layer.manager";
import {DecoratePanel} from "../decorate/decorate.panel";
import { ElementStorage } from "./ElementStorate";

export class ElementStorageMediator extends BaseMediator {
    public static NAME: string = "ElementStorageMediator";
    private mLayerManager: ILayerManager;
    private mScene: Phaser.Scene;
    private mStorage: ElementStorage;
    constructor(layerManager: ILayerManager, scene: Phaser.Scene, world: WorldService) {
        super(world);
        this.mStorage = new ElementStorage(world);
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
        const view = this.getView();
        if (view) {
            view.expand();
        }
    }

    /**
     * 收起
     */
    collapse() {
        const view = this.getView();
        if (view) {
            view.collapse();
        }
    }

    getView(): ElementStoragePanel {
        return <ElementStoragePanel> this.mView;
    }
}
