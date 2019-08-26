import { IDisplayInfo } from "./info";

export class ElementDisplay extends Phaser.GameObjects.Container {
    constructor(protected scene: Phaser.Scene) {
        super(scene);
    }

    public load(display: IDisplayInfo) { }

    public destory() { }
}