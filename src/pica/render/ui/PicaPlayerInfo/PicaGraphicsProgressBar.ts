export class PicaGraphicsProgressBar extends Phaser.GameObjects.Container {
    private bgGraphics: Phaser.GameObjects.Graphics;
    private barGraphics: Phaser.GameObjects.Graphics;
    private barColor: number;
    private bgColor: number;
    private isHorizontal: boolean;
    private value: number = 0.5;
    constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, isHorizontal: boolean = true) {
        super(scene, x, y);
        this.bgGraphics = this.scene.make.graphics(undefined, false);
        this.barGraphics = this.scene.make.graphics(undefined, false);
        this.add([this.bgGraphics, this.barGraphics]);
        this.setSize(width, height);
        this.bgColor = 0x000000;
        this.barColor = 0xff00000;
        this.bgGraphics.clear();
        this.bgGraphics.fillStyle(this.bgColor, 1);
        this.bgGraphics.fillRect(0, 0, this.width, this.height);
        this.setValue(this.value);
    }
    public setColor(barColor: number, bgColor?: number) {
        this.barColor = barColor;
        if (bgColor) this.bgColor = bgColor;
        this.bgGraphics.clear();
        this.bgGraphics.fillStyle(this.bgColor, 1);
        this.bgGraphics.fillRect(0, 0, this.width, this.height);
        this.setValue(this.value);
    }

    public setValue(value: number) {
        this.value = value;
        const width = this.width * (this.isHorizontal ? value : 1);
        const height = this.height * (!this.isHorizontal ? value : 1);
        this.barGraphics.clear();
        this.barGraphics.fillStyle(this.barColor, 1);
        this.barGraphics.fillRect(0, 0, width, height);
    }
    public setRoundedRectValue(value: number, radius: number) {
        this.value = value;
        const width = this.width * (this.isHorizontal ? value : 1);
        const height = this.height * (!this.isHorizontal ? value : 1);
        this.barGraphics.clear();
        this.barGraphics.fillStyle(this.barColor, 1);
        this.barGraphics.fillRoundedRect(0, 0, width, height, radius);
    }
}
