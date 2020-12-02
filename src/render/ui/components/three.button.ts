import { BaseUI, ClickEvent, ISoundGroup } from "apowophaserui";
import { ThreeSlicePath } from "./three.slice.path";
export enum ButtonState {
    Normal = "normal",
    Over = "over",
    Select = "select",
    Disable = "disable",
}
export interface IButtonState extends Phaser.Events.EventEmitter {
    changeNormal();
    changeDown();
}
export class ThreeSliceButton extends BaseUI implements IButtonState {
    protected soundGroup: any;
    protected mDownTime: number = 0;
    protected mPressDelay = 1000;
    protected mPressTime: any;
    protected mBackground: ThreeSlicePath;
    protected mKey: string;
    protected mFrame: string[];
    protected mDownFrame: string[];
    protected mText: Phaser.GameObjects.Text;
    protected mIsMove: boolean = false;
    protected mIsDown: boolean;
    private mRectangle: Phaser.Geom.Rectangle;
    private zoom: number;
    private mTweening = false;
    private tweenScale = 0.9;
    private mTweenBoo = true;
    constructor(scene: Phaser.Scene, width: number, height: number, key: string, frame: string[], downFrame: string[], text?: string, dpr?: number, scale?: number, tweenBoo?: boolean, music?: ISoundGroup) {
        super(scene);
        this.dpr = dpr || 1;
        // this.scale = scale || 1;
        this.zoom = scale || 1;
        this.soundGroup = {
            up: {
                key: "click",
                // urls: "./resources/sound/click.mp3"
            }
        };
        if (tweenBoo === undefined) tweenBoo = true;
        this.mTweenBoo = tweenBoo;
        Object.assign(this.soundGroup, music);
        this.mKey = key;
        this.mFrame = frame;
        this.mDownFrame = downFrame;
        this.setSize(width, height);
        this.createBackground();
        if (text) {
            this.mText = this.scene.make.text({ color: "#ffffff", fontSize: 16 * dpr }, false)
                .setOrigin(0.5, 0.5)
                .setText(text);
            if (this.mBackground) {
                this.mText.setSize(this.mBackground.width, this.mBackground.height);
            }
            this.add(this.mText);
        }
        this.setInteractive();
        this.addListen();
    }

    public get background(): ThreeSlicePath {
        return this.mBackground;
    }

    public get text(): Phaser.GameObjects.Text {
        return this.mText;
    }

    public addListen() {
        this.removeListen();
        this.on("pointerdown", this.onPointerDownHandler, this);
        this.on("pointerup", this.onPointerUpHandler, this);
        this.on("pointerout", this.onPointerOutHandler, this);
        this.on("pointermove", this.onPointerMoveHandler, this);
    }

    public removeListen() {
        this.off("pointerdown", this.onPointerDownHandler, this);
        this.off("pointerup", this.onPointerUpHandler, this);
        this.off("pointerout", this.onPointerOutHandler, this);
        this.off("pointermove", this.onPointerMoveHandler, this);
    }

    public setEnable(value, tint: boolean = true) {
        if (value) {
            if (this.mBackground) {
                this.mBackground.clearTint();
                if (this.mText) this.mText.clearTint();
            }
            this.setInteractive();
        } else {
            if (this.mBackground && tint) {
                this.mBackground.setTintFill(0x666666);
                if (this.mText) this.mText.setTintFill(0x777777);
            }
            this.removeInteractive();
        }
    }
    set tweenEnable(value) {
        this.mTweenBoo = value;
    }
    public mute(boo: boolean) {
        this.silent = boo;
    }

    changeNormal() {
        this.setBgFrame(this.mFrame);
    }

    changeDown() {
        if (this.mDownFrame) {
            this.setBgFrame(this.mDownFrame);
        }
    }

    setFrame(frame: string[]) {
        this.setBgFrame(frame);
    }

    setText(val: string) {
        if (this.mText) {
            this.mText.setText(val);
        }
    }

    setTextStyle(style: object) {
        if (this.mText) {
            this.mText.setStyle(style);
        }
    }

    setFontStyle(val: string) {
        if (this.mText) {
            this.mText.setFontStyle(val);
        }
    }

    setTextOffset(x: number, y: number) {
        if (this.mText) {
            this.mText.setPosition(x, y);
        }
    }

    setTextColor(color: string) {
        if (this.mText) {
            this.mText.setColor(color);
        }
    }
    public setFrameNormal(normal: string[], down?: string[]) {
        this.mFrame = normal;
        this.mDownFrame = (down ? down : normal);
        this.changeNormal();
        return this;
    }
    protected createBackground() {
        if (this.mFrame) {
            this.mBackground = new ThreeSlicePath(this.scene, 0, 0, this.width, this.height, this.mKey, this.mFrame, this.dpr, this.zoom, 4);
            this.add(this.mBackground);
        }
    }
    protected setBgFrame(frame: string[]) {
        if (this.mBackground) {
            this.mBackground.setFrame(frame);
            this.setSize(this.mBackground.width, this.mBackground.height);
        }
    }

    protected buttonStateChange(state: ButtonState) {
        switch (state) {
            case ButtonState.Normal:
                this.changeNormal();
                break;
            case ButtonState.Over:
                break;
            case ButtonState.Select:
                this.changeDown();
                break;
            case ButtonState.Disable:
                break;
        }
    }

    protected onPointerMoveHandler(pointer: Phaser.Input.Pointer) {
        if (this.soundGroup && this.soundGroup.move)
            this.playSound(this.soundGroup.move);
        if (!this.interactiveBoo)
            return;
        this.mIsMove = true;
        this.emit(ClickEvent.Move);
    }

    protected onPointerUpHandler(pointer: Phaser.Input.Pointer) {
        // if (this.mTweening) return;
        if (!this.interactiveBoo) {
            if (this.soundGroup && this.soundGroup.disabled)
                this.playSound(this.soundGroup.disabled);
            return;
        }
        if (this.mTweenBoo) {
            // this.tween(false).then(() => {
            //     this.pointerDown(pointer);
            // });
            this.tween(false, this.pointerUp.bind(this, pointer));
        } else {
            this.pointerUp(pointer);
        }
    }

    protected pointerUp(pointer) {
        this.buttonStateChange(ButtonState.Normal);
        // if (!this.mIsMove || (Date.now() - this.mDownTime > this.mPressTime)) {
        const isdown = this.checkPointerInBounds(this, pointer.worldX, pointer.worldY);
        this.emit(ClickEvent.Up, this);
        // if (Math.abs(pointer.downX - pointer.upX) < this.width && Math.abs(pointer.downY - pointer.upY) < this.height) {
        if (isdown && this.mIsDown) {
            if (this.soundGroup && this.soundGroup.up)
                this.playSound(this.soundGroup.up);
            this.emit(ClickEvent.Tap, pointer, this);
        }
        // }
        clearTimeout(this.mPressTime);
        this.mIsMove = false;
        this.mIsDown = false;
        this.mDownTime = 0;
    }

    protected onPointerOutHandler(pointer) {
        if (this.mTweenBoo && pointer.isDown) {
            this.tween(false);
        }
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
        this.buttonStateChange(ButtonState.Select);
        this.mDownTime = Date.now();
        this.mPressTime = setTimeout(() => {
            this.emit(ClickEvent.Hold, this);
        }, this.mPressDelay);
        if (this.mTweenBoo) this.tween(true);
        this.emit(ClickEvent.Down, this);
        // this.mIsDownObject = this.checkPointerInBounds(this, pointer.worldX, pointer.worldY);
        this.mIsDown = true;
    }

    protected checkPointerInBounds(gameObject: any, pointerx: number, pointery: number): boolean {
        if (!this.mRectangle) {
            this.mRectangle = new Phaser.Geom.Rectangle(0, 0, 0, 0);
        }
        const zoom = this.zoom ? this.zoom : 1;
        this.mRectangle.left = -gameObject.width / 2;
        this.mRectangle.right = gameObject.width / 2;
        this.mRectangle.top = -gameObject.height / 2;
        this.mRectangle.bottom = gameObject.height / 2;
        const worldMatrix: Phaser.GameObjects.Components.TransformMatrix = gameObject.getWorldTransformMatrix();
        const x: number = (pointerx - worldMatrix.tx) / zoom;
        const y: number = (pointery - worldMatrix.ty) / zoom;
        if (this.mRectangle.left <= x && this.mRectangle.right >= x && this.mRectangle.top <= y && this.mRectangle.bottom >= y) {
            return true;
        }
        return false;
    }

    private tween(show, callback?: any) {
        this.mTweening = true;
        const scale = show ? this.tweenScale : 1;
        if (this.mTween) {
            this.mTween.stop();
            this.mTween.remove();
            this.mTween = undefined;
        }
        this.mTween = this.scene.tweens.add({
            targets: this.list,
            duration: 45,
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

    private tweenComplete(show) {
        this.mTweening = false;
        if (this.mTween) {
            this.mTween.stop();
            this.mTween.remove();
            this.mTween = undefined;
        }
    }
}
