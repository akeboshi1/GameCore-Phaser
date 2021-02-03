import { InputText } from "apowophaserui";

export class InputField extends InputText {
    constructor(scene: Phaser.Scene, x: any, y?: number, width?: number, height?: number, config?: any) {
        super(scene, x, y, width, height, config);

        this.node.addEventListener("keypress", this.onKeypressHandler.bind(this));
    }

    destroy() {
        if (this.node) this.node.removeEventListener("keypress", this.onKeypressHandler.bind(this));
        super.destroy();
    }

    private onKeypressHandler(e) {
        const keycode = e.keyCode || e.which;
        if (keycode === 13) {
            this.emit("enter", this.text);
        }
    }
}
