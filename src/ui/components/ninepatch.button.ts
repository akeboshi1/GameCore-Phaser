import { NinePatch } from "./nine.patch";
import { IPatchesConfig } from "./patches.config";

export class NinePatchButton extends Phaser.GameObjects.Container {
    protected mLabel: Phaser.GameObjects.Text;
    protected mNingBg: NinePatch;
    protected mKey: string;
    protected mFrame: string;
    protected btnData: any;
    private mScene: Phaser.Scene;
    constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, key: string, frame: string, text?: string, config?: IPatchesConfig, data?: any) {
        super(scene, x, y);
        this.mScene = scene;
        this.mKey = key;
        this.mFrame = frame ? frame : "__BASE";
        this.setSize(width, height);
        this.mNingBg = new NinePatch(this.scene, 0, 0, width, height, key, this.mFrame + "_normal", config);
        this.add(this.mNingBg);
        if (data) {
            this.btnData = data;
        }

        this.mLabel = this.scene.make.text(undefined, false)
            .setOrigin(0.5, 0.5)
            .setSize(this.width, this.height)
            .setAlign("center")
            .setText(text);
        this.add(this.mLabel);

        // this.setSize(this.mNingBg.width, this.mNingBg.height);
        this.setInteractive();
        this.on("pointerdown", this.changeDown, this);
        this.on("pointerup", this.changeNormal, this);
        this.on("pointerout", this.changeNormal, this);
        this.on("pointerover", this.changeOver, this);
    }

    public getBtnData(): any {
        return this.btnData;
    }

    public setText(text: string) {
        this.mLabel.setText(text);
    }

    public getText(): string {
        return this.mLabel.text;
    }

    public setTextStyle(style: object) {
        this.mLabel.setStyle(style);
    }

    public setTextOffset(x: number, y: number) {
        this.mLabel.setPosition(x, y);
    }

    public setFrame(frame: string | number): this {
        this.mNingBg.setFrame(frame);
        return this;
    }

    public destroy(fromScene?: boolean): void {
        if (this.mLabel) this.mLabel.destroy();
        super.destroy(fromScene);
    }

    protected changeNormal() {
        const frame = this.mFrame ? this.mFrame : this.mKey;
        this.setFrame(`${frame}_normal`);
    }

    protected changeOver() {
        // this.setTexture()
        const frame = this.mFrame ? this.mFrame : this.mKey;
        this.setFrame(`${frame}_over`);
    }

    protected changeDown(pointer) {
        // this.scale = 0.9;
        const frame = this.mFrame ? this.mFrame : this.mKey;
        this.setFrame(`${frame}_down`);
        this.emit("click", pointer, this);
        // this.scaleHandler();
    }

    get label(): Phaser.GameObjects.Text {
        return this.mLabel;
    }

    private scaleHandler() {
        this.mScene.tweens.add({
            targets: this,
            duration: 50,
            ease: "Linear",
            props: {
                scaleX: { value: .5 },
                scaleY: { value: .5 },
            },
            yoyo: true,
            repeat: 0,
        });
        this.scaleX = this.scaleY = 1;
    }
}
