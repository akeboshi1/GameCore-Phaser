
import { BaseUI, NineSlicePatch } from "apowophaserui";
export class ProgressMaskBar extends BaseUI {
    public value: number = 0;
    public max: number = 1;
    protected mBackground: Phaser.GameObjects.Image;
    protected mBar: Phaser.GameObjects.Image;
    protected mText: Phaser.GameObjects.Text;
    protected zoom: number = 1;
    constructor(scene: Phaser.Scene, key: string, background: string, bar: string, style?: any) {
        super(scene);
        this.createBackgroundBar(key, background, bar, style);
        if (this.mBackground) this.add(this.mBackground);
        if (this.mBar) this.add(this.mBar);
        if (this.mText) this.add(this.mText);
        this.disInteractive();
    }

    setProgress(curVal, maxVal) {
        let value = curVal / maxVal;
        // tslint:disable-next-line: use-isnan
        if (value > 1 || isNaN(value)) value = 1;
        else if (value < 0) value = 0;
        this.value = value;
        this.max = 1;
        this.refreshMask();
    }

    setText(val) {
        if (this.mText) {
            this.mText.text = val;
            if (!this.mText.parentContainer)
                this.add(this.mText);
        }
    }

    refreshMask() {
        if (this.mBar) this.mBar.setCrop(new Phaser.Geom.Rectangle(0, 0, this.value / this.max * this.width, this.height));
    }
    destroy() {
        super.destroy();
        // this.maskGraphics.destroy();
    }
    get text() {
        return this.mText;
    }

    get bar() {
        return this.mBar;
    }

    protected createBackgroundBar(key: string, background: string, bar: string, style?: any) {
        if (background) {
            this.mBackground = this.scene.make.image({ key, frame: background });
            this.setSize(this.mBackground.width, this.mBackground.height);
        }
        this.mBar = this.scene.make.image({ key, frame: bar });
        this.mBar.isCropped = true;

        if (style) {
            this.mText = this.scene.make.text({
                style
            }, false).setOrigin(0.5);
        }
    }
}
