import { InputText } from "apowophaserui";

export class InputField extends InputText {
    constructor(scene: Phaser.Scene, x: any, y?: number, width?: number, height?: number, config?: any) {
        super(scene, x, y, width, height, config);

        this.node.addEventListener("keypress", this.onKeypressHandler.bind(this));
        this.on("focus", this.onFocusHandler, this);
        this.on("blur", this.onBlurHandler, this);
    }

    destroy() {
        if (this.node) this.node.removeEventListener("keypress", this.onKeypressHandler.bind(this));
        this.off("focus", this.onFocusHandler, this);
        this.off("blur", this.onBlurHandler, this);
        super.destroy();
    }

    private onKeypressHandler(e) {
        const keycode = e.keyCode || e.which;
        if (keycode === 13) {
            this.emit("enter", this.text);
        }
    }

    private onFocusHandler() {
        this.scene.input.on("gameobjectdown", this.onGameobjectDown, this);
    }

    private onBlurHandler() {
        this.scene.input.off("gameobjectdown", this.onGameobjectDown, this);
    }

    private onGameobjectDown() {
        this.setBlur();
    }
}
