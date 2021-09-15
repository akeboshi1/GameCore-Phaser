import { ClickEvent, InputText } from "apowophaserui";
import { Font, Logger } from "structure";
import { InputField } from "./input.field";
import { Tap } from "./tap";
export class InputLabel extends Phaser.GameObjects.Container {
    protected background: Phaser.GameObjects.Graphics | any;
    private mLabel: Phaser.GameObjects.Text;
    private mInputText: InputField;
    private mInputConfig: any;
    private mOriginX: number;
    private mOriginY: number;
    private mPlaceholder: string;
    private mAutoBlur: boolean = true;

    constructor(scene: Phaser.Scene, config: any) {
        super(scene);

        let labelConfig = config.label;
        if (!labelConfig) {
            labelConfig = { fontFamily: Font.DEFULT_FONT };
            Object.assign(labelConfig, config);
        }
        const clickW = config.width || 100;
        const clickH = config.height || 100;
        this.mPlaceholder = config.placeholder;
        this.mLabel = this.scene.make.text({
            text: this.mPlaceholder,
            style: labelConfig
        }, false).setInteractive(new Phaser.Geom.Rectangle(-clickW * 0.5, -clickH * 0.5, clickW, clickH), Phaser.Geom.Rectangle.Contains);
        this.mLabel.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
        this.mOriginX = this.mLabel.originX;
        this.mOriginY = this.mLabel.originY;
        const tap = new Tap(this.mLabel);
        this.mLabel.on(ClickEvent.Tap, this.onShowInputHandler, this);
        this.add(this.mLabel);

        this.setSize(clickW, clickH);

        this.mInputConfig = config;
    }

    setText(val: string) {
        this.mLabel.setText(this.mPlaceholder ? val ? val : this.mPlaceholder : val);
        if (this.mInputText) {
            this.mInputText.text = val;
        }
        return this;
    }
    setPlaceholder(val: string) {
        this.mPlaceholder = val || this.mPlaceholder;
        this.mInputConfig.placeholder = this.mPlaceholder;
        this.mLabel.setText(this.mPlaceholder);
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
        if (!this.background) {
            this.background = this.scene.make.graphics(undefined, false);
        }
        this.background.clear();
        this.background.fillStyle(0xFFFFFF);
        this.background.fillRoundedRect(-padding + this.width * this.mLabel.originX, -padding + this.height * this.mLabel.originY, this.width + padding * 2, this.height + padding * 2, radius);
        this.addAt(this.background, 0);
    }

    setSize(w: number, h: number) {
        super.setSize(w, h);
        this.mLabel.input.hitArea = new Phaser.Geom.Rectangle(-this.width * this.mLabel.originX, -this.height * this.mLabel.originX, this.width, this.height);
        return this;
    }

    setAutoBlur(val: boolean) {
        this.mAutoBlur = val;
        return this;
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
            return;
        }
        const obj: any = {};
        Object.assign(obj, this.mInputConfig);
        obj.placeholder = "";
        this.mInputText = new InputField(this.scene, obj).setOrigin(this.mOriginX, this.mOriginY);
        this.mInputText.on("textchange", this.onTextChangeHandler, this);
        this.mInputText.on("blur", this.onTextBlurHandler, this);
        this.mInputText.on("focus", this.onTextFocusHandler, this);
        this.add(this.mInputText);
        this.mInputText.x = this.mLabel.x;
        this.mInputText.y = this.mLabel.y;
        this.mInputText.node.addEventListener("keypress", (e) => {
            const keycode = e.keyCode || e.which;
            if (keycode === 13) {
                this.emit("enter", this.mInputText.text);
                if (this.mAutoBlur) this.onShowLabel();
            }
        });
    }

    private onShowInputHandler() {
        this.createInputText();
        this.mLabel.visible = false;
        if (this.mInputConfig.placeholder !== this.mLabel.text)
            this.mInputText.setText(this.mLabel.text);
        this.mInputText.setFocus();
    }

    private onPointerDownHandler() {
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
        this.mLabel.visible = true;
    }

    private destroyInput() {
        if (this.mInputText) {
            this.mInputText.off("textchange", this.onTextChangeHandler, this);
            this.mInputText.off("blur", this.onTextBlurHandler, this);
            this.mInputText.off("focus", this.onTextFocusHandler, this);
            this.mInputText.destroy();
            this.mInputText = undefined;
        }
    }

    private onTextChangeHandler(input, event) {
        this.emit("textchange");
    }

    private onTextBlurHandler() {
        this.emit("blur");
        this.onShowLabel();
    }

    private onTextFocusHandler(e) {
        this.emit("focus");
    }

    private onTapHandler() {
        Logger.getInstance().log("tap ================");
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
