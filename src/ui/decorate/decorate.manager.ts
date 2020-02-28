import {DecoratePanel} from "./decorate.panel";
import {LayerManager} from "../../rooms/layer/layer.manager";
import { FramesDisplay } from "../../rooms/display/frames.display";
import { DragonbonesDisplay } from "../../rooms/display/dragonbones.display";
import { EditorRoomService } from "../../rooms/editor.room";
import { DisplayObject } from "../../rooms/display/display.object";
import { IRoomService } from "../../rooms/room";
import { DecorateRoom } from "../../rooms/decorate.room";
import { Pos } from "../../utils/pos";

export class DecorateManager extends Phaser.Events.EventEmitter {
    private mPanel: DecoratePanel;
    private mLayerManager: LayerManager;
    constructor(scene: Phaser.Scene, roomService: IRoomService) {
        super();
        this.mPanel = new DecoratePanel(scene, <DecorateRoom> roomService);
        this.mPanel.on("moveElement", this.onMoveElementHandler, this);
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
        this.mPanel.close();
    }

    public updatePos(x: number, y: number) {
        if (!this.mPanel) {
            return;
        }
        this.mPanel.updatePos(x, y);
    }

    private onMoveElementHandler(pos: Pos) {
        this.emit("moveElement", pos);
    }
}
