
import { BaseUI, NineSlicePatch } from "apowophaserui";
export class ProgressMaskBar extends BaseUI {
    public value: number = 0;
    public max: number = 1;
    protected mBackground: Phaser.GameObjects.Image | NineSlicePatch;
    protected mBar: Phaser.GameObjects.Image | NineSlicePatch;
    protected maskGraphics: Phaser.GameObjects.Graphics;
    protected mText: Phaser.GameObjects.Text;
    protected zoom: number = 1;
    constructor(scene: Phaser.Scene, key: string, background: string, bar: string, style?: any, barconfig?: any, bgconfig?: any) {
        super(scene);
        this.createBackgroundBar(key, background, bar, style, barconfig, bgconfig);
        this.maskGraphics = this.scene.make.graphics(undefined, false);
        this.maskGraphics.fillStyle(0, 1);
        this.maskGraphics.fillRect(0, 0, this.width, this.height);
        this.mBar.setMask(this.maskGraphics.createGeometryMask());
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
        const world = this.getWorldTransformMatrix();
        if (this.zoom !== world.scaleX) {
            this.zoom = world.scaleX;
            this.maskGraphics.clear();
            this.maskGraphics.fillRect(0, 0, this.width * this.zoom, this.height * this.zoom);
        }
        const offsetx = world.tx - this.width * this.zoom * 1.5;
        const tx = offsetx + this.width * this.zoom * this.value;
        const ty = world.ty - this.height * this.zoom * 0.5;
        this.maskGraphics.setPosition(tx, ty);
    }
    destroy() {
        super.destroy();
        this.maskGraphics.destroy();
    }
    get text() {
        return this.mText;
    }

    get bar() {
        return this.mBar;
    }

    protected createBackgroundBar(key: string, background: string, bar: string, style?: any, barconfig?: any, bgconfig?: any) {
        if (bgconfig) {
            const bgW = bgconfig.width || this.width;
            const bgH = bgconfig.height || this.height;
            this.mBackground = new NineSlicePatch(this.scene, 0, -2 * this.dpr, bgW, bgH, key, bar, bgconfig);
            this.setSize(bgW, bgH);
        } else {
            this.mBackground = this.scene.make.image({ key, frame: background });
            this.setSize(this.mBackground.width, this.mBackground.height);
        }
        if (barconfig) {
            const barW = barconfig.width || this.width;
            const barH = barconfig.height || this.height;
            this.mBar = new NineSlicePatch(this.scene, 0, -2 * this.dpr, barW, barH, key, bar, barconfig);
        } else
            this.mBar = this.scene.make.image({ key, frame: bar });
        if (style) {
            this.mText = this.scene.make.text({
                style
            }, false);
        }
    }
}
