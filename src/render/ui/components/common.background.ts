import { UIAtlasName } from "picaRes";

export class CommonBackground extends Phaser.GameObjects.Container {
    private background: Phaser.GameObjects.Image;
    private graphic: Phaser.GameObjects.Graphics;
    private bgFrame: string;
    private key: string;
    private bottomColor: number;
    constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, key?: string, bgframe?: string, color?: number) {
        super(scene, x, y);
        this.setSize(width, height);
        this.key = key || UIAtlasName.uicommon;
        this.bgFrame = bgframe || "online_bg";
        this.bottomColor = color === undefined ? 0x01CDFF : color;
        this.init();
    }

    public resize(width: number, height: number) {
        this.setSize(width, height);
        this.background.y = -height * 0.5 + this.background.height * 0.5;
        this.graphic.clear();
        this.graphic.fillStyle(this.bottomColor, 1);
        this.graphic.fillRect(0, 0, width, height);
        this.graphic.x = -width * 0.5;
        this.graphic.y = -height * 0.5;
    }
    protected init() {
        this.background = this.scene.make.image({ key: this.key, frame: this.bgFrame });
        this.background.displayWidth = this.width * 1.2;
        this.graphic = this.scene.make.graphics(undefined, false);
        this.add([this.graphic, this.background]);
        this.resize(this.width, this.height);
    }
}
