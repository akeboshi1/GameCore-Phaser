
import { ProgressNineMaskBar } from "./progress.nine.mask.bar";
import { ThreeSlicePath } from "./three.slice.path";
export class ProgressThreeMaskBar extends ProgressNineMaskBar {
    protected mBackground: Phaser.GameObjects.Image | ThreeSlicePath | any;
    protected mBar: Phaser.GameObjects.Image | ThreeSlicePath | any;
    protected maskGraphics: Phaser.GameObjects.Graphics;
    protected mText: Phaser.GameObjects.Text;
    protected zoom: number = 1;
    constructor(scene: Phaser.Scene, key: string, background: string[], bar: string[], style?: any, barconfig?: any, bgconfig?: any) {
        super(scene, key, <any>background, <any>bar, style, barconfig, bgconfig);
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
