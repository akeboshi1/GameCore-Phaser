import {FramesDisplay} from "../display/frames.display";
import {DragonbonesDisplay} from "../display/dragonbones.display";
import {DecorateManager} from "../../ui/decorate/decorate.manager";
import { LayerManager } from "../layer/layer.manager";
import { Logger } from "../../utils/log";
import { EditorRoomService } from "../editor.room";
import { IRoomService } from "../room";

export class SelectedElement {
    private mDisplay: FramesDisplay | DragonbonesDisplay;
    private mDecorateManager: DecorateManager;
    constructor(scene: Phaser.Scene, roomService: IRoomService) {
        this.mDecorateManager = new DecorateManager(scene, roomService);
    }

    setElement(display: FramesDisplay | DragonbonesDisplay) {
        if (this.mDisplay) {
            this.mDisplay.hideRefernceArea();
            this.mDisplay.showNickname("");
            this.mDecorateManager.remove();
        }
        this.mDisplay = display;
        this.mDecorateManager.setElement(display);
        display.showRefernceArea();
        this.mDisplay = display;
    }

    remove() {
        this.mDecorateManager.remove();
        if (this.mDisplay) {
            this.mDisplay.hideRefernceArea();
            this.mDisplay = null;
        }
    }

    setDisplayPos(x: number, y: number) {
        if (!this.mDisplay) {
            return;
        }
        this.mDisplay.x = x;
        this.mDisplay.y = y;
        this.mDecorateManager.updatePos(x, y);
        // this.mLayerManager.depthSurfaceDirty = true;
    }
}
