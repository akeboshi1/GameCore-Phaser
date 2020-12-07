
import { BaseUI, NineSlicePatch } from "apowophaserui";
export class ProgressMaskBar extends BaseUI {
    protected mBackground: Phaser.GameObjects.Image;
    protected mBar: Phaser.GameObjects.Image | NineSlicePatch;
    protected maskGraphics: Phaser.GameObjects.Graphics;
    protected mText: Phaser.GameObjects.Text;
    protected zoom: number = 1;
    constructor(scene: Phaser.Scene, key: string, background: string, bar: string, style?: any, config?: any) {
        super(scene);
        this.mBackground = scene.make.image({ key, frame: background });
        this.setSize(this.mBackground.width, this.mBackground.height);
        if (config) {
            const barW = config.width || this.width;
            const barH = config.height || this.height;
            this.mBar = new NineSlicePatch(scene, 0, -2 * this.dpr, barW, barH, key, bar, config);
        } else
            this.mBar = scene.make.image({ key, frame: bar });
        if (style) {
            this.mText = scene.make.text({
                style
            }, false);
        }

        this.maskGraphics = this.scene.make.graphics(undefined, false);
        this.maskGraphics.fillStyle(0, 1);
        this.maskGraphics.fillRect(0, 0, this.width, this.height);
        // this.mBarSkin.mask = this.mBarMaskGraphics.createGeometryMask();
        this.mBar.setMask(this.maskGraphics.createGeometryMask());
        this.add([this.mBackground, this.mBar]);
        if (this.mText) this.add(this.mText);
        this.disInteractive();
    }

    setProgress(curVal, maxVal) {
        let value = curVal / maxVal;
        if (value > 1) value = 1;
        else if (value < 0) value = 0;
        const world = this.getWorldTransformMatrix();
        if (this.zoom !== world.scaleX) {
            this.zoom = world.scaleX;
            this.maskGraphics.clear();
            this.maskGraphics.fillRect(0, 0, this.width * this.zoom, this.height * this.zoom);
        }
        const offsetx = world.tx - this.width * this.zoom * 1.5;
        const tx = offsetx + this.width * this.zoom * value;
        const ty = world.ty - this.height * this.zoom * 0.5;
        this.maskGraphics.setPosition(tx, ty);
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
}
