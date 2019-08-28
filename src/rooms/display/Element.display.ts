import { IDisplayInfo } from "./display.info";
import { DragonBonesDisplay } from "./dragonBones.display";
import { FramesDisplay } from "./frames.display";

export class ElementDisplay extends Phaser.GameObjects.Container {

    constructor(protected scene: Phaser.Scene) {
        super(scene);
    }

    public load(displayInfo: IDisplayInfo, callBack?: () => void) {
    }

    public destory() { }
}
