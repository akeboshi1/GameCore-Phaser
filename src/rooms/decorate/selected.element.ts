import {FramesDisplay} from "../display/frames.display";
import {DragonbonesDisplay} from "../display/dragonbones.display";
import {DecorateManager} from "../../ui/decorate/decorate.manager";
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
        display.showRefernceArea();
        this.mDecorateManager.setElement(display);
        this.mDisplay = display;
    }

    remove() {
        this.mDecorateManager.remove();
        if (this.mDisplay) {
            this.mDisplay.hideRefernceArea();
            this.mDisplay = null;
        }
    }

    update(time: number, delta: number) {
        if (this.mDisplay) {
            this.mDecorateManager.updatePos(this.mDisplay.x, this.mDisplay.y);
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
