import { ClickEvent } from "apowophaserui";
import { UIHelper } from "utils";
import { ButtonEventDispatcher } from "./button.event.dispatch";

export class ToggleButton extends ButtonEventDispatcher {
    private mText: Phaser.GameObjects.Text;
    private normalColor: string = "#FFFFFF";
    private changeColor: string = "#0099cc";
    private mBackground: Phaser.GameObjects.Image;
    private mIsOn: boolean = false;
    private key: string;
    private mNormal: string;
    private mDown: string;
    constructor(scene: Phaser.Scene, width: number, height: number, key: string, frame: string, down: string, dpr: number, text?: string) {
        super(scene, 0, 0);
        this.mBackground = this.scene.make.image({ key, frame });
        this.mText = this.scene.make.text({
            text,
            style: UIHelper.whiteStyle(dpr, 15)
        }, false).setOrigin(0.5, 0.5);
        this.add([this.mBackground, this.mText]);
        this.mNormal = frame;
        this.mDown = down;
        this.width = width > this.mBackground.width ? width : this.mBackground.width;
        this.height = height > this.mBackground.height ? height : this.mBackground.height;
        this.enable = true;
    }

    setText(val: string) {
        this.mText.text = val;
    }

    setFontSize(size: number) {
        this.mText.setFontSize(size);
    }
    setFontStyle(val: string) {
        this.mText.setFontStyle(val);
    }

    setStyle(style: object) {
        this.mText.setStyle(style);
    }

    setNormalColor(color: string) {
        this.normalColor = color;
        this.isOn = this.mIsOn;
    }

    setChangeColor(color: string) {
        this.changeColor = color;
        this.isOn = this.mIsOn;
    }

    setNormalFrame(normal: string, down: string) {
        if (normal) this.mNormal = normal;
        if (down) this.mDown = down;
        this.isOn = this.mIsOn;
    }

    set isOn(value: boolean) {
        this.mIsOn = value;
        if (this.mIsOn) this.changeDown();
        else this.changeNormal();
    }

    get isOn() {
        return this.mIsOn;
    }

    changeDown() {
        this.mText.setFill(this.changeColor);
        this.mBackground.setFrame(this.mDown);
    }

    changeNormal() {
        this.mText.setFill(this.normalColor);
        this.mBackground.setFrame(this.mNormal);
    }
    get text(): Phaser.GameObjects.Text {
        return this.mText;
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
                this.isOn = true;
                break;
            case ClickEvent.Out:
                if (this.isOn) {
                    this.changeDown();
                } else {
                    this.changeNormal();
                }
                break;
        }
    }
}
