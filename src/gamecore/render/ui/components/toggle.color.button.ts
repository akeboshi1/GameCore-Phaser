import { ClickEvent } from "apowophaserui";
import { Font } from "structure";
import { ButtonEventDispatcher } from "./button.event.dispatch";
export class ToggleColorButton extends ButtonEventDispatcher {
    private mText: Phaser.GameObjects.Text;
    private normalColor: string = "#FFFFFF";
    private changeColor: string = "#0099cc";
    private mIsOn: boolean = false;
    constructor(scene: Phaser.Scene, width: number, height: number, dpr: number, text?: string, style?: any) {
        super(scene, dpr);
        this.setSize(width, height);
        style = style ||  {
            fontSize: 15 * dpr + "px",
            fontFamily: Font.DEFULT_FONT,
            color: "#ffffff"
        };
        this.mText = this.scene.make.text({
            text,
            style
        }, false).setOrigin(0.5, 0.5);
        this.mText.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
        this.add(this.mText);
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
    }

    setChangeColor(color: string) {
        this.changeColor = color;
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
    }

    changeNormal() {
        this.mText.setFill(this.normalColor);
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
                this.changeDown();
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
