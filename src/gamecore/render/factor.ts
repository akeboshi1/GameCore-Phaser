import { Bubble } from "./display";
import { Render } from "./render";

export class RenderFactor {
    constructor(protected render: Render) { }

    bubble(scene: Phaser.Scene, scale: number) {
        return new Bubble(scene, scale, this.render)
    }
}