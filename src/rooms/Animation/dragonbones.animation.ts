import { IAnimationBase, AnimationUrlData } from "./ianimationbase";
import { Logger } from "../../utils/log";

export class DragonbonesAnimation extends Phaser.GameObjects.Container implements IAnimationBase {

    public resName: string;
    public resUrl: string;
    public animUrlData: AnimationUrlData;
    public loaded: boolean = false;
    public isPlaying: boolean = false;
    public loop: boolean = false;
    public curAniName: string;
    private armatureDisplay: dragonBones.phaser.display.ArmatureDisplay;
    constructor(scene: Phaser.Scene) {
        super(scene);
    }

    public load(resName: string, resUrl: string) {
        this.resName = resName;
        this.resUrl = resUrl;
        this.animUrlData = new AnimationUrlData();
        this.animUrlData.setData(this.resName, this.resUrl, true, ".dbbin");
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
        this.curAniName = aniName;
        this.isPlaying = true;
        if (!this.armatureDisplay) return;
        this.armatureDisplay.animation.play(aniName);
    }

    public destroy() {
        if (this.armatureDisplay) this.armatureDisplay.destroy();
        if (this.animUrlData) this.animUrlData.dispose();
        this.armatureDisplay = null;
        this.animUrlData = null;
    }
    // TODO ：功能暂未完成 armature->规格暂定
    private onLoadComplete(loader?: any, totalComplete?: number, totalFailed?: number) {
        this.loaded = true;
        this.armatureDisplay = this.scene.add.armature("mecha_1002_101d", this.resName);
        this.add(this.armatureDisplay);
        // const scale = this.width / this.armatureDisplay.width;
        // this.armatureDisplay.setScale(scale);
        if (this.isPlaying) this.play(this.curAniName);
    }
}
