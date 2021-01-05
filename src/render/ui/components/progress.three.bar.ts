
import { BaseUI, NineSlicePatch } from "apowophaserui";
import { ThreeSlicePath } from ".";
export class ProgressThreeBar extends BaseUI {
    public value: number = 0;
    public max: number = 1;
    protected mBackground: ThreeSlicePath | any;
    protected mBar: ThreeSlicePath | any;
    protected mText: Phaser.GameObjects.Text;
    protected zoom: number = 1;
    constructor(scene: Phaser.Scene, key: string, background: string[], bar: string[], style?: any, barconfig?: any, bgconfig?: any) {
        super(scene);
        this.createBackgroundBar(key, background, bar, style, barconfig, bgconfig);
        this.add([this.mBackground, this.mBar]);
        if (this.mText) this.add(this.mText);
        this.disInteractive();
    }

    setProgress(curVal, maxVal) {
        let value = curVal / maxVal;
        if (value > 1) value = 1;
        else if (value < 0) value = 0;
        this.value = value;
        this.max = maxVal;
        const width = this.width * this.zoom * this.value;
        this.bar.resize(width, this.height);
        this.bar.x = -this.width * 0.5 + width * 0.5;
    }

    setText(val) {
        if (this.mText) {
            this.mText.text = val;
            if (!this.mText.parentContainer)
                this.add(this.mText);
        }
    }

    get text() {
        return this.mText;
    }

    get bar() {
        return this.mBar;
    }

    protected createBackgroundBar(key: string, background: any, bar: any, style?: any, barconfig?: any, bgconfig?: any) {
        if (bgconfig) {
            const bgW = bgconfig.width || this.width;
            const bgH = bgconfig.height || this.height;
            const correct = barconfig.correct;
            this.mBackground = new ThreeSlicePath(this.scene, 0, -2 * this.dpr, bgW, bgH, key, background, 1, 1, correct);
            this.setSize(bgW, bgH);
        } else {
            this.mBackground = this.scene.make.image({ key, frame: background });
            this.setSize(this.mBackground.width, this.mBackground.height);
        }
        if (barconfig) {
            const barW = barconfig.width || this.width;
            const barH = barconfig.height || this.height;
            const correct = barconfig.correct;
            this.mBar = new ThreeSlicePath(this.scene, 0, -2 * this.dpr, barW, barH, key, bar, 1, 1, correct);
        } else
            this.mBar = this.scene.make.image({ key, frame: bar });
        if (style) {
            this.mText = this.scene.make.text({
                style
            }, false);
        }
    }
}
