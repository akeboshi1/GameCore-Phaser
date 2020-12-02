import { Render } from "gamecoreRender";

export class MatterBodies {
    private mGraphics: Phaser.GameObjects.Graphics;
    constructor(scene: Phaser.Scene, private render: Render) {
        this.mGraphics =  scene.make.graphics(undefined, false);
    }

    update() {
        this.mGraphics.clear();
    }

    renderWireframes(bodies) {
        const graphics = this.mGraphics;
        graphics.clear();
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

    get graphics() {
        return this.mGraphics;
    }
}
