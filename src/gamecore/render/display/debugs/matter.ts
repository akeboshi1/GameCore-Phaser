import { Render } from "../../render";
import { Logger, SceneName } from "structure";
import { BasicScene } from "baseRender";

export class MatterBodies {
    private mGraphics: Phaser.GameObjects.Graphics;
    constructor(private render: Render) {
        const scene = this.render.sceneManager.getSceneByName(SceneName.PLAY_SCENE);
        if (!scene) {
            Logger.getInstance().error("no matter scene");
            return;
        }
        this.mGraphics = scene.make.graphics(undefined, false);
        (<BasicScene>scene).layerManager.addToLayer("middleLayer", this.mGraphics);
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
            graphics.moveTo(bodie[0].x / dpr, bodie[0].y / dpr);
            for (let j = 1; j < bodie.length; j++) {
                graphics.lineTo(bodie[j].x / dpr, bodie[j].y / dpr);
            }
            graphics.lineTo(bodie[0].x / dpr, bodie[0].y / dpr);

        }
        graphics.strokePath();
    }

    destroy() {
        if (this.mGraphics) {
            this.mGraphics.destroy();
        }
    }
}
