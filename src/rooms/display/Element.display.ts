import { IDisplayInfo } from "./Frame.display";

export class ElementsDisplay extends Phaser.GameObjects.Container {
    constructor(scene: Phaser.Scene) {
        super(scene);
    }

    public load(display: IDisplayInfo | undefined) {
    }

    public destory() {
    }
}