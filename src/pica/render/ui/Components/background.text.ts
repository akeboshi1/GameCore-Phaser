import { UIHelper } from "utils";

export class BackgroundText extends Phaser.GameObjects.Container {
    protected background: Phaser.GameObjects.Image;
    protected text: Phaser.GameObjects.Text;
    protected dpr: number;
    constructor(scene: Phaser.Scene, key: string, frame: string, text: string, dpr: number, style?: any) {
        super(scene);
        this.dpr = dpr;
        style = style || UIHelper.whiteStyle(dpr, 14);
        this.background = this.scene.make.image({ key, frame });
        this.text = this.scene.make.text({ text, style }).setOrigin(0.5);
        this.add([this.background, this.text]);
        this.setSize(this.background.width, this.background.height);
    }
    public setText(text: string) {
        this.text.text = text;
    }
    public setStyle(style: any) {
        this.text.setFontStyle(style);
    }
    public setFontStyle(style: any) {
        this.text.setFontStyle(style);
    }
    public setColor(color: string) {
        this.text.setColor(color);
    }
}
