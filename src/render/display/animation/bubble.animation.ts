import { BaseAnimation } from "./base.animation";
import { AnimationUrlData } from "./ianimationbase";
export class BubbleAnimation extends BaseAnimation {
    private frameAnim: Phaser.GameObjects.Image;
    private bubblebg: Phaser.GameObjects.Image;
    constructor(scene: Phaser.Scene) {
        super(scene);
    }
    public load(resName: string, textureUrl: string, jsonUrl?: string,) {
        super.load(resName, textureUrl, jsonUrl);
        this.animUrlData = new AnimationUrlData();
        if (resName)
            this.animUrlData.setData(this.resName, this.textureUrl, jsonUrl);
        else this.animUrlData.setDisplayData(textureUrl, jsonUrl);
        this.scene.load.image(this.resName, this.animUrlData.pngUrl);
        this.scene.load.image(this.animUrlData.jsonUrl, this.animUrlData.jsonUrl);
        this.scene.load.once(
            Phaser.Loader.Events.COMPLETE,
            this.onLoadComplete,
            this,
        );
        this.scene.load.start();
    }

    public play(aniName?: string) {
        super.play(aniName);
        if (!this.frameAnim) return;
        this.setScale(0.2, 0.2);
        this.y = 50;
        this.scene.tweens.add({
            targets: this,
            y: { value: -100, duration: 300, ease: "Bounce.easeOut" },
            scaleX: { value: 1, duration: 300, ease: "Bounce.easeOut" },
            scaleY: { value: 1, duration: 300, ease: "Bounce.easeOut" },
        });
    }
    public destroy() {
        super.destroy();
        if (this.frameAnim) this.frameAnim.destroy();
        if (this.bubblebg) this.bubblebg.destroy();
        this.frameAnim = null;
        this.bubblebg = null;
    }
    public onLoadComplete(loader?: any, totalComplete?: number, totalFailed?: number) {
        this.loaded = true;
        this.bubblebg = this.scene.add.image(0, 0, this.resName);
        this.frameAnim = this.scene.add.image(0, 0, this.animUrlData.jsonUrl);
        this.add([this.bubblebg, this.frameAnim]);
        if (this.isPlaying) this.play();
    }

}
