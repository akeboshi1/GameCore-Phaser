
import { IAbstractPanel } from "./abstractPanel";
import { Tweens } from "phaser";

export class LoadingView implements IAbstractPanel {
    private mShowing: boolean = false;
    private mTween: Tweens.Tween;
    private mBg: Phaser.GameObjects.Sprite;
    constructor(private mScene: Phaser.Scene) {
        this.createPanel();
    }
    public isShow(): boolean {
        return this.mShowing;
    }
    public show(param: any) {
        this.mTween = this.mScene.tweens.add({
            targets: this.mBg,
            duration: 2000000,
            ease: "Linear",
            props: {
                rotation: 360,
            }
        });
    }
    public update(param: any) {

    }
    public hide() {
        if (this.mTween) {
            this.mTween.stop();
            this.mTween.remove();
            // this.mTween = null;
        }
    }

    public tweenView(show: boolean) {
    }

    public resize() {
    }

    public destroy() {
        if (this.mBg) {
            this.mBg.destroy();
        }
    }
    private createPanel() {
        const size: Phaser.Structs.Size = this.mScene.game.scale.gameSize;
        this.mBg = this.mScene.add.sprite(size.width >> 1, size.height >> 1, "stars");
        this.mBg.scaleX = this.mBg.scaleY = 1.3;

    }
}
