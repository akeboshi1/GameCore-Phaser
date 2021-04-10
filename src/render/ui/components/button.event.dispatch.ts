import { BaseUI, ClickEvent, ISoundGroup } from "apowophaserui";
export class ButtonEventDispatcher extends BaseUI {
    protected soundGroup: any;
    protected mDownTime: number = 0;
    protected mPressDelay = 1000;
    protected mPressTime: any;
    protected mIsMove: boolean = false;
    protected mIsDown: boolean;
    protected mRectangle: Phaser.Geom.Rectangle;
    protected mTweening = false;
    protected tweenScale = 0.9;
    protected mTweenBoo = true;
    protected mDuration = 45;
    constructor(scene: Phaser.Scene, x: number, y: number, tweenBoo?: boolean, music?: ISoundGroup) {
        super(scene, x, y);
        this.soundGroup = {
            up: {
                key: "click",
                // urls: "./resources/sound/click.mp3"
            }
        };
        if (tweenBoo === undefined) tweenBoo = true;
        this.mTweenBoo = tweenBoo;
        Object.assign(this.soundGroup, music);
    }
    addListen() {
        this.removeListen();
        this.on("pointerdown", this.onPointerDownHandler, this);
        this.on("pointerup", this.onPointerUpHandler, this);
        this.on("pointerout", this.onPointerOutHandler, this);
        this.on("pointermove", this.onPointerMoveHandler, this);
    }

    removeListen() {
        this.off("pointerdown", this.onPointerDownHandler, this);
        this.off("pointerup", this.onPointerUpHandler, this);
        this.off("pointerout", this.onPointerOutHandler, this);
        this.off("pointermove", this.onPointerMoveHandler, this);
    }
    set enable(value) {
        if (value) {
            this.addListen();
            this.setInteractive();
        } else {
            this.removeListen();
            this.removeInteractive();
        }
    }

    protected onPointerMoveHandler(pointer: Phaser.Input.Pointer) {
        if (this.soundGroup && this.soundGroup.move)
            this.playSound(this.soundGroup.move);
        if (!this.interactiveBoo)
            return;
        this.mIsMove = true;
        this.EventStateChange(ClickEvent.Move);
        this.emit(ClickEvent.Move);
    }

    protected onPointerUpHandler(pointer: Phaser.Input.Pointer) {
        if (!this.interactiveBoo) {
            if (this.soundGroup && this.soundGroup.disabled)
                this.playSound(this.soundGroup.disabled);
            return;
        }
        if (this.mTweenBoo) {
            this.tween(false, this.pointerUp.bind(this, pointer));
        } else {
            this.pointerUp(pointer);
        }
    }

    protected pointerUp(pointer) {
        const isdown = this.checkPointerInBounds(this, pointer.worldX, pointer.worldY);
        this.EventStateChange(ClickEvent.Up);
        this.emit(ClickEvent.Up, this);
        if (isdown && this.mIsDown) {
            if (this.soundGroup && this.soundGroup.up)
                this.playSound(this.soundGroup.up);
            this.EventStateChange(ClickEvent.Tap);
            this.emit(ClickEvent.Tap, pointer, this);
        }
        clearTimeout(this.mPressTime);
        this.mIsMove = false;
        this.mIsDown = false;
        this.mDownTime = 0;
    }

    protected onPointerOutHandler(pointer) {
        if (this.mTweenBoo && pointer.isDown) {
            this.tween(false);
        }
        const isint = this.checkPointerInBounds(this, pointer.worldX, pointer.worldY);
        if (!isint)
            this.EventStateChange(ClickEvent.Out);
    }

    protected onPointerDownHandler(pointer: Phaser.Input.Pointer) {
        if (this.mTweening) return;
        if (!this.interactiveBoo) {
            if (this.soundGroup && this.soundGroup.disabled)
                this.playSound(this.soundGroup.disabled);
            return;
        }
        if (this.soundGroup && this.soundGroup.down)
            this.playSound(this.soundGroup.down);
        this.mDownTime = Date.now();
        this.mPressTime = setTimeout(() => {
            this.EventStateChange(ClickEvent.Hold);
            this.emit(ClickEvent.Hold, this);
        }, this.mPressDelay);
        if (this.mTweenBoo) this.tween(true);
        this.EventStateChange(ClickEvent.Down);
        this.emit(ClickEvent.Down, this);
        this.mIsDown = true;
    }

    protected checkPointerInBounds(gameObject: any, pointerx: number, pointery: number): boolean {
        if (!this.mRectangle) {
            this.mRectangle = new Phaser.Geom.Rectangle(0, 0, 0, 0);
        }
        const worldMatrix: Phaser.GameObjects.Components.TransformMatrix = gameObject.getWorldTransformMatrix();

        const zoom = worldMatrix.scaleX;
        this.mRectangle.left = -gameObject.width / 2;
        this.mRectangle.right = gameObject.width / 2;
        this.mRectangle.top = -gameObject.height / 2;
        this.mRectangle.bottom = gameObject.height / 2;
        const x: number = (pointerx - worldMatrix.tx) / zoom;
        const y: number = (pointery - worldMatrix.ty) / zoom;
        if (this.mRectangle.left <= x && this.mRectangle.right >= x && this.mRectangle.top <= y && this.mRectangle.bottom >= y) {
            return true;
        }
        return false;
    }
    protected EventStateChange(state: ClickEvent) {

    }
    protected tween(show, callback?: any) {
        this.mTweening = true;
        const scale = show ? this.tweenScale : 1;
        if (this.mTween) {
            this.mTween.stop();
            this.mTween.remove();
            this.mTween = undefined;
        }
        this.mTween = this.scene.tweens.add({
            targets: this,
            duration: this.mDuration,
            ease: "Linear",
            props: {
                scaleX: { value: scale },
                scaleY: { value: scale },
            },
            onComplete: () => {
                this.tweenComplete(show);
                if (callback) callback();
            },
            onCompleteParams: [this]
        });
    }

    protected tweenComplete(show) {
        this.mTweening = false;
        if (this.mTween) {
            this.mTween.stop();
            this.mTween.remove();
            this.mTween = undefined;
        }
    }
}
