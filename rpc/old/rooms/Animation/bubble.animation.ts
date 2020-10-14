import { IAnimationBase, AnimationUrlData } from "./ianimationbase";

export class BubbleAnimation extends Phaser.GameObjects.Container implements IAnimationBase {
    public resName: string;
    public resUrl: string;
    public animUrlData: AnimationUrlData;
    public loaded: boolean = false;
    public isPlaying: boolean = false;
    public loop: boolean = false;
    private frameAnim: Phaser.GameObjects.Image;
    private bubblebg: Phaser.GameObjects.Image;
    constructor(scene: Phaser.Scene) {
        super(scene);
    }
    public load(resName: string, resUrl: string, data?: string) {
        this.resName = resName ? resName : resUrl;
        this.resUrl = resUrl;
        this.animUrlData = new AnimationUrlData();
        if (resName)
            this.animUrlData.setData(this.resName, this.resUrl);
        else this.animUrlData.setDisplayData(resUrl, data);
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
        this.isPlaying = true;
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
        if (this.frameAnim) this.frameAnim.destroy();
        if (this.bubblebg) this.bubblebg.destroy();
        if (this.animUrlData) this.animUrlData.dispose();
        this.frameAnim = null;
        this.animUrlData = null;
        this.bubblebg = null;
    }
    private onLoadComplete(loader?: any, totalComplete?: number, totalFailed?: number) {
        this.loaded = true;
        this.bubblebg = this.scene.add.image(0, 0, this.resName);
        this.frameAnim = this.scene.add.image(0, 0, this.animUrlData.jsonUrl);
        this.add([this.bubblebg, this.frameAnim]);
        if (this.isPlaying) this.play();
    }

}
