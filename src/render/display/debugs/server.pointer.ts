import { Render } from "gamecoreRender";
import { PlayScene } from "../../scenes/play.scene";

export class ServerPosition {
    private mGridhics: Phaser.GameObjects.Graphics;
    private dpr: number;
    constructor(render: Render) {
        const scene = render.sceneManager.getSceneByName(PlayScene.name);
        this.dpr = render.scaleRatio;

        this.mGridhics = scene.make.graphics(undefined, false);
        (<PlayScene>scene).layerManager.addToLayer("middleLayer", this.mGridhics);
    }

    public draw(x: number, y: number) {
        this.mGridhics.clear();
        this.mGridhics.fillStyle(0x00FF00, 1);
        this.mGridhics.fillCircle(x, y, 2 * this.dpr);
    }

    destroy() {
        if (this.mGridhics) this.mGridhics.destroy();
    }
}
