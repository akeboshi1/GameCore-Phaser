import { InputLabel } from "gamecoreRender";

export class PicaCommonSearchInput extends Phaser.GameObjects.Container {
    protected background: Phaser.GameObjects.Image;
    protected inputText: InputLabel;
    protected dpr: number;
    protected blur: boolean = false;
    constructor(scene: Phaser.Scene, width: number, height: number, key: string, bg: string, dpr: number, config: any) {
        super(scene);
        this.dpr = dpr;
        this.setSize(width, height);
        this.background = this.scene.make.image({ key, frame: bg });
        this.inputText = new InputLabel(this.scene, config).setOrigin(0, 0.5);
        this.inputText.x = -width * 0.5 + 5 * dpr;
        this.inputText.on("textchange", this.onTextChangeHandler, this);
        this.inputText.on("blur", this.onTextBlurHandler, this);
        this.inputText.on("focus", this.onTextFocusHandler, this);
        this.add([this.background, this.inputText]);
    }
    public hide() {
        this.visible = false;
    }

    public show() {
        this.visible = true;
    }

    public setText(text) {
        this.inputText.setText(text);
    }

    private onTextChangeHandler(input, event) {
        this.emit("textchange");
    }

    private onTextBlurHandler() {
        this.emit("blur");
    }

    private onTextFocusHandler(e) {
        this.emit("focus");
    }

    get text() {
        return this.inputText.text;
    }
}