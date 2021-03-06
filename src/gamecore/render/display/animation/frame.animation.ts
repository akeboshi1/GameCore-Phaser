import { Handler } from "structure";
import { BaseAnimation } from "./base.animation";
import { AnimationUrlData } from "./ianimationbase";
export class FrameAnimation extends BaseAnimation {
    private frameAnim: Phaser.GameObjects.Sprite;
    private complHandler: Handler;
    constructor(scene: Phaser.Scene) {
        super(scene);
    }
    // this.resName = resName;
    //     this.pngUrl = resUrl + "/" + resName + (!isbone ? ".png" : "_tex.png");
    //     this.jsonUrl = resUrl + "/" + resName + (!isbone ? ".json" : "_tex.json");
    //     if (isbone)
    //         this.boneUrl = resUrl + "/" + resName + "_ske" + extension;
    public load(resName: string, textureUrl: string, jsonUrl?: string, compl?: Handler) {
        super.load(resName, textureUrl, jsonUrl);
        this.complHandler = compl;
        this.animUrlData = new AnimationUrlData();
        if (resName)
            this.animUrlData.setData(this.resName,textureUrl,jsonUrl);
        else this.animUrlData.setDisplayData(textureUrl, jsonUrl);
        if (this.scene.textures.exists(this.resName)) {
            this.onLoadComplete();
        } else {
            this.scene.load.atlas(this.resName, this.animUrlData.pngUrl, this.animUrlData.jsonUrl,
                this.animUrlData.textureXhrSettings, this.animUrlData.atlasXhrSettings);
            this.scene.load.once(
                Phaser.Loader.Events.COMPLETE,
                this.onLoadComplete,
                this,
            );
            this.scene.load.start();
        }
    }

    public play(aniName?: string) {
        super.play(aniName);
        if (!this.frameAnim) return;
        this.frameAnim.play(this.curAniName);
    }
    public destroy() {
        this.complHandler = undefined;
        super.destroy();
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
