import { IAnimationBase, AnimationUrlData } from "./ianimationbase";
import { Logger } from "../../utils/log";
export class FrameAnimation extends Phaser.GameObjects.Container implements IAnimationBase {
    public resName: string;
    public resUrl: string;
    public animUrlData: AnimationUrlData;
    public loaded: boolean = false;
    public isPlaying: boolean = false;
    public loop: boolean = false;
    public curAniName: string;
    private frameAnim: Phaser.GameObjects.Sprite;
    constructor(scene: Phaser.Scene) {
        super(scene);
    }

    public load(resName: string, resUrl: string) {
        this.resName = resName;
        this.resUrl = resUrl;
        this.animUrlData = new AnimationUrlData();
        this.animUrlData.setData(this.resName, this.resUrl);
        this.scene.load.atlas(this.resName, this.animUrlData.pngUrl, this.animUrlData.jsonUrl,
            this.animUrlData.textureXhrSettings, this.animUrlData.atlasXhrSettings);
        this.scene.load.once(
            Phaser.Loader.Events.COMPLETE,
            this.onLoadComplete,
            this,
        );
        this.scene.load.start();
    }

    public play(aniName?: string) {
        this.curAniName = aniName ? aniName : this.resName;
        this.isPlaying = true;
        if (!this.frameAnim) return;
        this.frameAnim.play(this.curAniName);
    }
    public destroy() {
        if (this.frameAnim) this.frameAnim.destroy();
        if (this.animUrlData) this.animUrlData.dispose();
        this.frameAnim = null;
        this.animUrlData = null;
    }

    private onLoadComplete(loader?: any, totalComplete?: number, totalFailed?: number) {
        this.loaded = true;
        // this.scene.anims.generateFrameNames(this.resName, { prefix: "diamond_", end: 15, zeroPad: 4 }),
        this.scene.anims.create({
            key: this.resName,
            frames: this.scene.anims.generateFrameNames(this.resName),
            repeat: -1
        });
        this.frameAnim = this.scene.add.sprite(0, 0, this.resName);
        this.add(this.frameAnim);
        const scale = this.width / this.frameAnim.width;
        this.frameAnim.setScale(scale);
        if (this.isPlaying) this.play(this.curAniName);
    }
}
