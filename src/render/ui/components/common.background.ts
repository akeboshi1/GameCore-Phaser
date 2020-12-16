import { UIAtlasName } from "picaRes";

export class CommonBackground extends Phaser.GameObjects.Container {
    private background: Phaser.GameObjects.Image;
    private graphic: Phaser.GameObjects.Graphics;
    constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number) {
        super(scene, x, y);
        this.setSize(width, height);
        this.init();
    }

    public resize(width: number, height: number) {
        this.setSize(width, height);
        this.background.y = -height * 0.5 + this.background.height * 0.5;
        this.graphic.clear();
        this.graphic.fillStyle(0x01CDFF, 1);
        this.graphic.fillRect(0, 0, width, height);
        this.graphic.x = -width * 0.5;
        this.graphic.y = -height * 0.5;
    }
    protected init() {
        this.background = this.scene.make.image({ key: UIAtlasName.uicommon, frame: "online_bg" });
        this.background.displayWidth = this.width;
        this.graphic = this.scene.make.graphics(undefined, false);
        this.add([this.graphic, this.background]);
        this.resize(this.width, this.height);
    }
}
