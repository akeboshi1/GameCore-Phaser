import { Handler } from "../../../utils";
import { BaseAnimation } from "./base.animation";
import { AnimationUrlData } from "./ianimationbase";
export class FrameAnimation extends BaseAnimation {
    private frameAnim: Phaser.GameObjects.Sprite;
    private complHandler: Handler;
    constructor(scene: Phaser.Scene) {
        super(scene);
    }

    public load(resName: string, resUrl: string, data?: string, compl?: Handler) {
        super.load(resName, resUrl, data);
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
        super.play(aniName);
        if (!this.frameAnim) return;
        this.frameAnim.play(this.curAniName);
    }
    public destroy() {
        super.destroy();
        if (this.frameAnim) this.frameAnim.destroy();
        this.frameAnim = null;
        this.complHandler = undefined;
    }

    public onLoadComplete(loader?: any, totalComplete?: number, totalFailed?: number) {
        this.loaded = true;
        // this.scene.anims.generateFrameNames(this.resName, { prefix: "diamond_", end: 15, zeroPad: 4 }),

        if (!this.scene.anims.exists(this.curAniName)) {
            this.scene.anims.create({
                key: this.curAniName,
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
