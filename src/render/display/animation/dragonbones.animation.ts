import { BaseAnimation } from "./base.animation";
import { AnimationUrlData } from "./ianimationbase";

export class DragonbonesAnimation extends BaseAnimation {

    private armatureDisplay: dragonBones.phaser.display.ArmatureDisplay;
    constructor(scene: Phaser.Scene) {
        super(scene);
    }

    public load(resName: string, resUrl: string, data?: string) {
        super.load(resName, resUrl, data);
        this.animUrlData = new AnimationUrlData();
        if (resName)
            this.animUrlData.setData(this.resName, this.resUrl, true, ".dbbin");
        else this.animUrlData.setDisplayData(resUrl, data);
        this.scene.load.dragonbone(this.resName, this.animUrlData.pngUrl, this.animUrlData.jsonUrl, this.animUrlData.boneUrl,
            this.animUrlData.textureXhrSettings, this.animUrlData.atlasXhrSettings, this.animUrlData.boneXhrSettings);
        this.scene.load.once(
            Phaser.Loader.Events.COMPLETE,
            this.onLoadComplete,
            this,
        );
        this.scene.load.start();
    }

    public play(aniName?: string) {
        super.play(aniName);
        if (!this.armatureDisplay) return;
        this.armatureDisplay.animation.play(aniName);
    }

    public destroy() {
        super.destroy();
        if (this.armatureDisplay) this.armatureDisplay.destroy();
        this.armatureDisplay = null;
    }
    // TODO ：功能暂未完成 armature->规格暂定
    public onLoadComplete(loader?: any, totalComplete?: number, totalFailed?: number) {
        this.loaded = true;
        this.armatureDisplay = this.scene.add.armature("mecha_1002_101d", this.resName);
        this.add(this.armatureDisplay);
        if (this.isPlaying) this.play(this.curAniName);
    }
}
