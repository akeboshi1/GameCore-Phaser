import { SceneName } from "structure";
import { Render } from "../../render";
export class ServerPosition {
    private mGridhics: Phaser.GameObjects.Graphics;
    private dpr: number;
    constructor(render: Render) {
        const scene = render.sceneManager.getSceneByName(SceneName.PLAY_SCENE);
        this.dpr = render.scaleRatio;

        this.mGridhics = scene.make.graphics(undefined, false);
        (<any>scene).layerManager.addToLayer("middleLayer", this.mGridhics);
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
