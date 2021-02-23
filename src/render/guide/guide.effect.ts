import { IPos } from "utils";

export class GuideEffect extends Phaser.GameObjects.Container {
    private mGuideEffect: Phaser.GameObjects.Graphics;
    private mMask: Phaser.GameObjects.Graphics;
    private mScaleTween;
    private mScale: number = 1;
    constructor(scene: Phaser.Scene) {
        super(scene);
    }

    public createGuideEffect(pos: IPos) {
        const width = this.scene.cameras.main.width;
        const height = this.scene.cameras.main.height;
        this.setSize(width, height);
        if (!this.mGuideEffect) {
            this.mGuideEffect = this.scene.make.graphics(undefined);
            this.mGuideEffect.fillStyle(0, .5);
            this.mGuideEffect.fillRect(0, 0, this.width, this.height);
        }
        if (this.mMask) {
            this.mMask = this.scene.make.graphics(undefined);
            this.mMask.fillStyle(0);
            this.mMask.fillCircle(0, 0, 100);
            this.mMask.setPosition(pos.x, pos.y);
            const geometryMask = this.mMask.createGeometryMask().setInvertAlpha(true);
            this.mMask.setMask(geometryMask);
        } else {
            const self = this;
            this.scene.tweens.add({
                targets: self.mMask,
                duration: 200,
                ease: "Linear",
                props: {
                    x: { value: pos.x },
                    y: { value: pos.y },
                },
            });
        }
        this.start();
    }

    public start() {
        this.scaleTween();
    }

    public stop() {
        if (this.mScaleTween) {
            this.mScaleTween.stop();
            this.mScaleTween.destroy();
            this.mScaleTween = null;
        }
    }

    public scaleTween() {
        if (this.mScaleTween || !this.scene) {
            return;
        }
        const self = this;
        this.mScaleTween = this.scene.tweens.add({
            targets: self.mMask,
            duration: 1000,
            ease: "Linear",
            props: {
                scaleX: { value: self.mScale > 0.5 ? 0.5 : 1 },
                scaleY: { value: self.mScale > 0.5 ? 0.5 : 1 },
            },
            onComplete: () => {
                self.mScale = self.mScale > 0.5 ? 0.5 : 1;
                if (self.mScaleTween) {
                    self.mScaleTween = undefined;
                }
                self.scaleTween();
            },
        });
    }

    public destroy() {
        this.stop();
        if (this.mGuideEffect) {
            this.mGuideEffect.clear();
            this.mGuideEffect.destroy();
            this.mGuideEffect = null;
        }
        if (this.mMask) {
            this.mMask.clear();
            this.mMask.destroy();
            this.mMask = null;
        }
        super.destroy();
    }
}
