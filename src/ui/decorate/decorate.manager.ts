import {DecoratePanel} from "./decorate.panel";
import {LayerManager} from "../../rooms/layer/layer.manager";

export class DecorateManager {
    private mPanel: DecoratePanel;
    private mLayerManager: LayerManager;
    constructor(scene: Phaser.Scene, layerManager: LayerManager) {
        this.mPanel = new DecoratePanel(scene);
        this.mLayerManager = layerManager;
    }

    public setElement(ele) {
        this.mPanel.setElement(ele);
        this.mLayerManager.addToSceneToUI(this.mPanel);
        this.mPanel.show();
    }
}
