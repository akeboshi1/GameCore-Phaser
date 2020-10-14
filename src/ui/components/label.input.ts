import { Font } from "../../utils/font";
import { InputText } from "apowophaserui";

export class LabelInput extends Phaser.GameObjects.Container {
    private mBackground: Phaser.GameObjects.Graphics;
    private mLabel: Phaser.GameObjects.Text;
    private mInputText: InputText;
    private mInputConfig: any;
    private mOriginX: number;
    private mOriginY: number;
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
        }, false).setInteractive(new Phaser.Geom.Rectangle(-clickW * 0.5, -clickH * 0.5, clickW, clickH), Phaser.Geom.Rectangle.Contains);
        this.mOriginX = this.mLabel.originX;
        this.mOriginY = this.mLabel.originY;
        this.mLabel.on("pointerup", this.onShowInputHandler, this);
        this.add(this.mLabel);

        this.setSize(clickW, clickH);

        this.mInputConfig = config;
    }

    setText(val: string) {
        this.mLabel.setText(val);
        if (this.mInputText) {
            this.mInputText.text = val;
        }
        return this;
    }

    setOrigin(x?: number, y?: number) {
        if (y === undefined) y = x;
        this.mLabel.setOrigin(x, y);
        this.mOriginX = x;
        this.mOriginY = y;
        if (this.mInputText) this.mInputText.setOrigin(x, y);
        this.mLabel.input.hitArea = new Phaser.Geom.Rectangle(-this.width * x, -this.height * y, this.width, this.height);
        return this;
    }

    createBackground(padding: number, radius: number) {
        if (!this.mBackground) {
            this.mBackground = this.scene.make.graphics(undefined, false);
        }
        this.mBackground.clear();
        this.mBackground.fillStyle(0xFFFFFF);
        this.mBackground.fillRoundedRect(-padding + this.width * this.mLabel.originX, -padding + this.height * this.mLabel.originY, this.width + padding * 2, this.height + padding * 2, radius);
        this.addAt(this.mBackground, 0);
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
        this.mInputText = new InputText(this.scene, Object.assign({}, this.mInputConfig)).setOrigin(this.mOriginX, this.mOriginY);
        this.mInputText.on("textchange", this.onTextChangeHandler, this);
        this.mInputText.on("blur", this.onTextBlurHandler, this);
        this.mInputText.on("focus", this.onTextFocusHandler, this);
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
    private onTextFocusHandler() {
        this.emit("focus");
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
