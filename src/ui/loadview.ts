
import { IAbstractPanel } from "./abstractPanel";
import { Tweens } from "phaser";

export class LoadingView implements IAbstractPanel {
    private mTween: Tweens.Tween;
    constructor(private mScene: Phaser.Scene) {
        this.createPanel();
    }

    public createPanel() {
        const size: Phaser.Structs.Size = this.mScene.game.scale.gameSize;
        const bg: Phaser.GameObjects.Sprite = this.mScene.add.sprite(size.width >> 1, size.height >> 1, "stars");
        bg.scaleX = bg.scaleY = 1.3;
        this.mTween = this.mScene.tweens.add({
            targets: bg,
            duration: 2000000,
            ease: "Linear",
            props: {
                rotation: 360,
            }
        });
    }
    public show() {

    }
    public close() {
        if (this.mTween) {
            this.mTween.stop();
            this.mTween.destroy();
            this.mTween = null;
        }
    }

    public resize() {
    }

    public destroy() {
        this.close();
    }
}
