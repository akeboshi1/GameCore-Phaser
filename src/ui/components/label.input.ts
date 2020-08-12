import InputText from "../../../lib/rexui/lib/plugins/gameobjects/inputtext/InputText";
import { Font } from "../../utils/font";

export class LabelInput extends Phaser.GameObjects.Container {
    private mLabel: Phaser.GameObjects.Text;
    private mInputText: InputText;
    private mInputConfig: any;
    constructor(scene: Phaser.Scene, config: any) {
        super(scene);

        const labelConfig = {
            fontFamily: Font.DEFULT_FONT
        };
        const clickW = config.width || 100;
        const clickH = config.height || 100;
        this.mLabel = this.scene.make.text({
            text: config.placeholder,
            style: Object.assign(labelConfig, config)
        }, false).setInteractive(new Phaser.Geom.Rectangle(-(clickW >> 1), -(clickH >> 1), clickW, clickH), Phaser.Geom.Rectangle.Contains);
        this.mLabel.on("pointerup", this.onShowInputHandler, this);
        this.add(this.mLabel);

        this.mInputConfig = config;
    }

    setText(val: string) {
        this.mLabel.setText(val);
        if (this.mInputText) {
            this.mInputText.text = val;
        }
    }

    setOrigin(x?: number, y?: number) {
        this.mLabel.setOrigin(x, y);
        if (this.mInputText) this.mInputText.setOrigin(x, y);
    }

    public setBlur() {
        this.onShowLabel();
    }

    destroy() {
        this.mLabel.destroy();
        this.destroyInput();
        super.destroy();
    }

    private createInputText() {
        if (this.mInputText) {
            this.mInputText.destroy();
        }
        this.mInputText = new InputText(this.scene, Object.assign({}, this.mInputConfig));
        this.mInputText.on("textchange", this.onTextChangeHandler, this);
        this.mInputText.on("blur", this.onTextBlurHandler, this);
        this.mInputText.node.addEventListener("keypress", (e) => {
            const keycode = e.keyCode || e.which;
            if (keycode === 13) {
                this.onShowLabel();
            }
        });
    }

    private onShowInputHandler() {
        this.createInputText();

        this.remove(this.mLabel);
        this.add(this.mInputText);
        if (this.mInputConfig.placeholder !== this.mLabel.text)
            this.mInputText.setText(this.mLabel.text);
        this.mInputText.setFocus();
    }

    private onShowLabel() {
        if (this.mInputText) {
            if (!this.mInputText.text && this.mInputConfig.placeholder) {
                this.mLabel.setText(this.mInputConfig.placeholder);
            } else {
                this.mLabel.setText(this.mInputText.text);
            }
            this.destroyInput();
        }
        this.add(this.mLabel);
    }

    private destroyInput() {
        if (this.mInputText) {
            this.mInputText.destroy();
            this.mInputText = undefined;
        }
    }

    private onTextChangeHandler(input, event) {
        this.emit("textchange");
    }

    private onTextBlurHandler() {
        this.emit("blur");
    }

    get object(): Phaser.GameObjects.Text | InputText {
        return this.mInputText || this.mLabel;
    }

    get text(): string {
        if (this.mInputText) {
            return this.mInputText.text;
        }
        return this.mLabel.text;
    }
}
