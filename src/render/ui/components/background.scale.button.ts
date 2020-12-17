import { ButtonState, ClickEvent, ISoundGroup } from "apowophaserui";
import { ButtonEventDispatcher } from "./button.event.dispatch";

export class BackgroundScaleButton extends ButtonEventDispatcher {
    protected soundGroup: any;
    protected mDownTime: number = 0;
    protected mBackground: Phaser.GameObjects.Image;
    protected mKey: string;
    protected mFrame: string;
    protected mDownFrame: string;
    protected mText: Phaser.GameObjects.Text;
    private zoom: number;
    constructor(scene: Phaser.Scene, width: number, height: number, key: string, frame: string, downFrame: string, text?: string, dpr?: number, scale?: number, tweenBoo?: boolean, music?: ISoundGroup) {
        super(scene, 0, 0);
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

    public get background(): Phaser.GameObjects.Image {
        return this.mBackground;
    }

    public get text(): Phaser.GameObjects.Text {
        return this.mText;
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

    setFrame(frame: string) {
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
    public setFrameNormal(normal: string, down?: string) {
        this.mFrame = normal;
        this.mDownFrame = (down ? down : normal);
        this.changeNormal();
        return this;
    }
    protected createBackground() {
        if (this.mFrame) {
            this.mBackground = this.scene.make.image({ key: this.mKey, frame: this.mFrame });
            this.mBackground.displayWidth = this.width;
            this.mBackground.displayHeight = this.height;
            this.add(this.mBackground);
        }
    }
    protected setBgFrame(frame: string) {
        if (this.mBackground) {
            this.mBackground.setFrame(frame);
            this.mBackground.displayWidth = this.width;
            this.mBackground.displayHeight = this.height;
        }
    }

    protected EventStateChange(state: ClickEvent) {
        switch (state) {
            case ClickEvent.Up:
                this.changeNormal();
                break;
            case ClickEvent.Down:
                this.changeDown();
                break;
            case ClickEvent.Tap:
                this.changeNormal();
                break;
            case ClickEvent.Out:
                this.changeNormal();
                break;
        }
    }
}
