import NinePatch from "../../../lib/rexui/plugins/gameobjects/ninepatch/NinePatch";

export class Button extends Phaser.GameObjects.Container {
    protected mLabel: Phaser.GameObjects.Text;
    protected mNingBg: NinePatch;
    constructor(scene: Phaser.Scene, x: number, y: number, config?: object, text?: string) {
        super(scene, x, y);
        this.mNingBg = new NinePatch(this.scene, 0, 0, config);
        this.add(this.mNingBg);

        this.mLabel = this.scene.make.text(undefined, false)
            .setOrigin(0.45, 0.5)
            .setSize(this.mNingBg.width, this.mNingBg.height)
            .setAlign("center")
            .setText(text);
        this.add(this.mLabel);

        this.setSize(this.mNingBg.width, this.mNingBg.height);
        this.setInteractive(new Phaser.Geom.Rectangle(0, 0, this.mNingBg.width, this.mNingBg.height), Phaser.Geom.Rectangle.Contains);
        this.on("pointerdown", this.changeDown, this);
        this.on("pointerup", this.changeNormal, this);
        this.on("pointerout", this.changeNormal, this);
    }

    public setTextStyle(style: object) {
        this.mLabel.setStyle(style);
    }

    public setTextOffset(x: number, y: number) {
        this.mLabel.setPosition(x, y);
    }

    protected changeNormal() {
        this.scale = 1;
    }

    protected changeDown() {
        this.scale = 0.9;
    }

    get label(): Phaser.GameObjects.Text {
        return this.mLabel;
    }
}
