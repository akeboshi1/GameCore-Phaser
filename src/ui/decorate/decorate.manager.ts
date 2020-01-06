import {DecoratePanel} from "./decorate.panel";
import {LayerManager} from "../../rooms/layer/layer.manager";
import { FramesDisplay } from "../../rooms/display/frames.display";
import { DragonbonesDisplay } from "../../rooms/display/dragonbones.display";
import { EditorRoomService } from "../../rooms/editor.room";
import { DisplayObject } from "../../rooms/display/display.object";
import { IRoomService } from "../../rooms/room";
import { DecorateRoom } from "../../rooms/decorate.room";

export class DecorateManager {
    private mPanel: DecoratePanel;
    private mLayerManager: LayerManager;
    constructor(scene: Phaser.Scene, roomService: IRoomService) {
        this.mPanel = new DecoratePanel(scene, <DecorateRoom> roomService);
        this.mLayerManager = roomService.layerManager;
    }

    public setElement(ele: DisplayObject) {
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
