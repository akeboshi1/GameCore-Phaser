import {DecoratePanel} from "./decorate.panel";
import {LayerManager} from "../../rooms/layer/layer.manager";
import { FramesDisplay } from "../../rooms/display/frames.display";
import { DragonbonesDisplay } from "../../rooms/display/dragonbones.display";

export class DecorateManager {
    private mPanel: DecoratePanel;
    private mLayerManager: LayerManager;
    constructor(scene: Phaser.Scene, layerManager: LayerManager) {
        this.mPanel = new DecoratePanel(scene);
        this.mLayerManager = layerManager;
    }

    public setElement(ele: FramesDisplay | DragonbonesDisplay) {
        this.mPanel.setElement(ele);
        this.mLayerManager.addToSceneToUI(this.mPanel);
        this.mPanel.show();
    }

    public remove() {
        // TODO panel只有destroy。需要封装个仅移除的方法
        if (this.mPanel.parentContainer) {
            this.mPanel.parentContainer.remove(this.mPanel);
        }
    }

    public updatePos(x: number, y: number) {
        if (!this.mPanel) {
            return;
        }
        this.mPanel.setPosition(x, y);
    }
}
