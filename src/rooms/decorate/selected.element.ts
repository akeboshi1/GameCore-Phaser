import {FramesDisplay} from "../display/frames.display";
import {DragonbonesDisplay} from "../display/dragonbones.display";

export class SelectedElement extends Phaser.GameObjects.Container {
    private mDisplay: FramesDisplay | DragonbonesDisplay;
    constructor(scene: Phaser.Scene) {
        super(scene);
    }

    setElement(display: FramesDisplay | DragonbonesDisplay) {
        if (this.mDisplay) {
            this.mDisplay.hideRefernceArea();
            this.mDisplay.showNickname("");
        }
        this.mDisplay = display;
    }
}
