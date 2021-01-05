import { BaseUI } from "apowophaserui";

export class ThreeSlicePath extends BaseUI {
    protected imgs: Phaser.GameObjects.Image[];
    protected mCorrection: number = 4;
    protected internalTint: number;
    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        width: number,
        height: number,
        key: string, frame: string[], dpr?: number, scale?: number, correct?: number) {
        super(scene, dpr, scale);
        this.dpr = dpr || 1;
        this.scale = scale || 1;
        this.mCorrection = correct === undefined ? 4 : correct;
        this.imgs = [];
        this.setTexture(key, frame);
        this.setSize(width, height);
        this.setPosition(x, y);
    }

    public resize(width: number, height: number) {
        width = Math.round(width);
        height = Math.round(height);
        if (this.width === width && this.height === height) {
            return this;
        }
        this.setSize(width, height);
        return;
    }

    public set correctValue(value) {
        this.mCorrection = value;
    }

    public setTexture(key: string, frame: string[]): this {
        if (!this.imgs[0]) {
            this.imgs[0] = this.scene.make.image({ key, frame: frame[0] });
            this.add(this.imgs[0]);
        } else this.imgs[0].setTexture(key, frame[0]);

        if (!this.imgs[2]) {
            this.imgs[2] = this.scene.make.image({ key, frame: frame[2] });
            this.add(this.imgs[2]);
        } else this.imgs[2].setTexture(key, frame[2]);

        if (!this.imgs[1]) {
            this.imgs[1] = this.scene.make.image({ key, frame: frame[1] });
            this.add(this.imgs[1]);
        } else this.imgs[1].setTexture(key, frame[1]);

        return this;
    }

    public setFrame(frame: string[]): this {
        this.imgs[0].setFrame(frame[0]);
        this.imgs[1].setFrame(frame[1]);
        this.imgs[2].setFrame(frame[2]);
        return this;
    }

    public setSize(width: number, height: number): this {
        super.setSize(width, height);
        this.imgs[0].scale = 1;
        this.imgs[2].scale = 1;
        let midWidth = width - (this.imgs[0].displayWidth + this.imgs[2].displayWidth) + this.mCorrection;
        if (midWidth < 0) {
            midWidth = 0;
            this.imgs[0].displayWidth = width * 0.5;
            this.imgs[2].displayWidth = width * 0.5;
        }
        this.imgs[0].x = -width * 0.5 + this.imgs[0].displayWidth * 0.5;
        this.imgs[2].x = width * 0.5 - this.imgs[2].displayWidth * 0.5;
        this.imgs[1].displayWidth = midWidth;
        return this;
    }

    public setTint(tint: number): this {
        this.tint = tint;
        return this;
    }

    public setTintFill(tint: number): this {
        this.tint = tint;
        this.tintFill = true;
        return this;
    }

    public get tintFill(): boolean {
        return this.first && (this.first as Phaser.GameObjects.Image).tintFill;
    }

    public set tintFill(value: boolean) {
        this.imgs.forEach((patch: Phaser.GameObjects.Image) => patch.tintFill = value);
    }

    public set tint(value: number) {
        this.imgs.forEach((patch: Phaser.GameObjects.Image) => patch.setTint(value));
        this.internalTint = value;
    }

    public get isTinted(): boolean {
        return this.first && (this.first as Phaser.GameObjects.Image).isTinted;
    }

    public clearTint() {
        this.each((patch: Phaser.GameObjects.Image) => patch.clearTint());
        this.internalTint = undefined;
        this.tintFill = false;
    }

    public destroy() {
        super.destroy();
        if (this.imgs)
            this.imgs.length = 0;
        this.imgs = undefined;
    }
}
