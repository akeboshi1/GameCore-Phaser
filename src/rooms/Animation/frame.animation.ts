import { IAnimationBase, AnimationUrlData } from "./ianimationbase";
import { Logger } from "../../utils/log";
import { Handler } from "../../Handler/Handler";
export class FrameAnimation extends Phaser.GameObjects.Container implements IAnimationBase {
    public resName: string;
    public resUrl: string;
    public animUrlData: AnimationUrlData;
    public loaded: boolean = false;
    public isPlaying: boolean = false;
    public loop: boolean = false;
    public curAniName: string;
    private frameAnim: Phaser.GameObjects.Sprite;
    private complHandler: Handler;
    constructor(scene: Phaser.Scene) {
        super(scene);
    }

    public load(resName: string, resUrl: string, data?: string, compl?: Handler) {
        this.resName = resName ? resName : resUrl;
        this.resUrl = resUrl;
        this.complHandler = compl;
        this.animUrlData = new AnimationUrlData();
        if (resName)
            this.animUrlData.setData(this.resName, this.resUrl);
        else this.animUrlData.setDisplayData(resUrl, data);
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
        this.complHandler = undefined;
    }

    private onLoadComplete(loader?: any, totalComplete?: number, totalFailed?: number) {
        this.loaded = true;
        // this.scene.anims.generateFrameNames(this.resName, { prefix: "diamond_", end: 15, zeroPad: 4 }),

        if (!this.scene.anims.exists(this.resName)) {
            this.scene.anims.create({
                key: this.resName,
                frames: this.scene.anims.generateFrameNames(this.resName),
                // frames: this.scene.anims.generateFrameNames(this.resName, { prefix: "loading_ui_", start: 1, end: 45, zeroPad: 2 }),
                repeat: -1
            });
        }
        if (!this.frameAnim) {
            this.frameAnim = this.scene.add.sprite(0, 0, this.resName);
            this.add(this.frameAnim);
        }
        if (this.width === 0) {
            this.setSize(this.frameAnim.width, this.frameAnim.height);
            this.scale = 1;
        } else {
            this.scale = this.width / this.frameAnim.displayWidth;
        }
        if (!this.isPlaying) this.play(this.curAniName);
        if (this.complHandler) this.complHandler.run();
    }
}
