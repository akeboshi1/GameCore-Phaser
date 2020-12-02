export class MatterBodies {
    private mGraphics: Phaser.GameObjects.Graphics;
    constructor(scene: Phaser.Scene) {
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
        for (const bodie of bodies) {
            graphics.moveTo(bodie[0].x / 2, bodie[0].y / 2);
            for (let j = 1; j < bodie.length; j++) {
                graphics.lineTo(bodie[j].x / 2, bodie[j].y / 2);
            }
            graphics.lineTo(bodie[0].x / 2, bodie[0].y / 2);

        }
        graphics.strokePath();
    }

    get graphics() {
        return this.mGraphics;
    }
}
