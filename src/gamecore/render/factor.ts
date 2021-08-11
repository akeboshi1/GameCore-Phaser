import { Bubble, ElementTopDisplay } from "./display";
import { Render } from "./render";

export class RenderFactor {
    constructor(protected render: Render) { }

    bubble(scene: Phaser.Scene, scale: number) {
        return new Bubble(scene, scale, this.render)
    }

    elementTopDisplay(scene: Phaser.Scene, owner: any) {
        return new ElementTopDisplay(scene, owner, this.render);
    }
}