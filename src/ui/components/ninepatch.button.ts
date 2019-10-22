import { NinePatch } from "./nine.patch";
import { BlueButton } from "../../utils/resUtil";
import { IPatchesConfig } from "./patches.config";

export class NinePatchButton extends Phaser.GameObjects.Container {
    protected mLabel: Phaser.GameObjects.Text;
    protected mNingBg: NinePatch;
    protected mKey: string;
    protected btnData: any;
    constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, key: string, text?: string, config?: IPatchesConfig, data?: any) {
        super(scene, x, y);
        this.mKey = key;
        this.setSize(width, height);
        this.mNingBg = new NinePatch(this.scene, x, y, width, height, key, key + "_normal", config);
        this.add(this.mNingBg);
        if (data) {
            this.btnData = data;
        }

        this.mLabel = this.scene.make.text(undefined, false)
            .setOrigin(0.45, 0.5)
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
        this.setFrame(`${this.mKey}_normal`);
    }

    protected changeOver() {
        // this.setTexture()
        this.setFrame(`${this.mKey}_over`);
    }

    protected changeDown() {
        // this.scale = 0.9;
        this.setFrame(`${this.mKey}_down`);
    }

    get label(): Phaser.GameObjects.Text {
        return this.mLabel;
    }
}
