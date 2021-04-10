export class TweenCompent {
    private mTweening: boolean = false;
    private mScale: number = 1;
    private mX: number;
    private mY: number;
    private mTween: Phaser.Tweens.Tween;
    private mScene: Phaser.Scene;
    private mTarget: Phaser.GameObjects.GameObject;
    private mPingpang: boolean = false;
    private mTempPing: boolean = false;
    private tempData: { scale: number, x: number, y: number };
    private mOnce: boolean;
    constructor(scene: Phaser.Scene, gameobject: any, config: { scale?: number, x?: number, y?: number, pingpang?: boolean, once?: boolean }) {
        this.mScene = scene;
        this.mTarget = gameobject;
        this.mScale = config.scale || gameobject.scale;
        this.mX = config.x === undefined ? gameobject.x : config.x;
        this.mY = config.y === undefined ? gameobject.y : config.y;
        this.mPingpang = config.pingpang || false;
        this.mOnce = config.once || false;
        this.tempData = { scale: gameobject.scale, x: gameobject.x, y: gameobject.y };
    }
    setObject(obj: any) {
        this.mTarget = obj;
    }
    zoomIn() {
        this.mTempPing = false;
        this.tween();
    }
    zoomOut(once?: boolean) {
        this.mOnce = once || false;
        this.mTempPing = true;
        this.tween();
    }
    tween() {
        this.mTweening = true;
        if (this.mTween) {
            this.mTween.stop();
            this.mTween.remove();
            this.mTween = undefined;
        }
        const tempScale = this.mTempPing ? this.tempData.scale : this.mScale;
        const tempX = this.mTempPing ? this.tempData.x : this.mX;
        const tempY = this.mTempPing ? this.tempData.y : this.mY;
        this.mTween = this.mScene.tweens.add({
            targets: this.mTarget,
            x: { value: tempX, duration: 45, ease: "Bounce.easeOut" },
            y: { value: tempY, duration: 45, ease: "Bounce.easeOut" },
            scaleX: { value: tempScale, duration: 45, ease: "Bounce.easeOut" },
            scaleY: { value: tempScale, duration: 45, ease: "Bounce.easeOut" },
            onComplete: () => {
                this.tweenComplete();
            },
            onCompleteParams: [this.mTarget]
        });
    }

    tweenComplete() {
        this.mTweening = false;
        if (this.mPingpang && !this.mTempPing) {
            this.mTempPing = true;
            this.tween();
        } else {
            if (this.mTween) {
                this.mTween.stop();
                this.mTween.remove();
                this.mTween = undefined;
            }
            this.mTempPing = false;
            if (this.mOnce) {
                this.mTarget = undefined;
                this.tempData = undefined;
            }
        }
    }
}
