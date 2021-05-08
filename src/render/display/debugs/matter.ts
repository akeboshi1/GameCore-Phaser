import { Render } from "gamecoreRender";
import { Logger } from "utils";
import { PlayScene } from "../../scenes/play.scene";

export class MatterBodies {
    private mGraphics: Phaser.GameObjects.Graphics;
    constructor(private render: Render) {
        const scene = this.render.sceneManager.getSceneByName(PlayScene.name);
        if (!scene) {
            Logger.getInstance().error("no matter scene");
            return;
        }
        this.mGraphics = scene.make.graphics(undefined, false);
        (<PlayScene>scene).layerManager.addToLayer("middleLayer", this.mGraphics);
    }

    update() {
        if (this.mGraphics) this.mGraphics.clear();
    }

    renderWireframes(bodies) {
        const graphics = this.mGraphics;
        if (!graphics) return;
        graphics.clear();
        if (!bodies) return;
        graphics.lineStyle(1, 0xFF0000);
        graphics.beginPath();
        const dpr = this.render.scaleRatio;
        for (const bodie of bodies) {
            const { points, pos, offset } = bodie;
            graphics.moveTo(points[0].x + pos.x + offset.x, points[0].y + pos.y + offset.y);
            for (let j = 1; j < points.length; j++) {
                graphics.lineTo(points[j].x + pos.x + offset.x, points[j].y + pos.y + offset.y);
            }
            graphics.lineTo(points[0].x + pos.x + offset.x, points[0].y + pos.y + offset.y);

        }
        graphics.strokePath();
    }

    destroy() {
        if (this.mGraphics) {
            this.mGraphics.destroy();
        }
    }
}
