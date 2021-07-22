import { IAnimationBase, AnimationUrlData } from "./ianimationbase";

export class BaseAnimation extends Phaser.GameObjects.Container implements IAnimationBase {
    public resName: string;
    public textureUrl: string;
    public animUrlData: AnimationUrlData;
    public loaded: boolean = false;
    public isPlaying: boolean = false;
    public loop: boolean = false;
    public curAniName: string;
    constructor(scene: Phaser.Scene) {
        super(scene);
    }
    public load(resName: string, textureUrl: string, jsonUrl?: string) {
        this.destroy();
        this.resName = resName ? resName : textureUrl;
        this.curAniName = resName;
        this.textureUrl = textureUrl;
    }

    public play(aniName?: string) {
        if (aniName) this.curAniName = aniName;
        this.isPlaying = true;
    }
    public destroy() {
        if (this.animUrlData) this.animUrlData.dispose();
        this.animUrlData = undefined;
        this.curAniName = undefined;
        this.isPlaying = false;
        this.loaded = false;
        this.loop = false;
    }
    public onLoadComplete(loader?: any, totalComplete?: number, totalFailed?: number) {

    }

}
