import {FramesDisplay} from "../display/frames.display";
import {DragonbonesDisplay} from "../display/dragonbones.display";
import {DecorateManager} from "../../ui/decorate/decorate.manager";

export class SelectedElement extends Phaser.GameObjects.Container {
    private mDisplay: FramesDisplay | DragonbonesDisplay;
    private mDecorateManager: DecorateManager;
    constructor(scene: Phaser.Scene) {
        super(scene);
        // this.mDecorateManager = new DecorateManager();
    }

    setElement(display: FramesDisplay | DragonbonesDisplay) {
        if (this.mDisplay) {
            this.mDisplay.hideRefernceArea();
            this.mDisplay.showNickname("");
        }
        this.mDisplay = display;
    }
}
