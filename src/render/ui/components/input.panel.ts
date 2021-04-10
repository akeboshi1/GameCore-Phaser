import { InputText } from "apowophaserui";
import { Render } from "../../../../src/render/render";

export class InputPanel extends Phaser.Events.EventEmitter {
    private mBackground: Phaser.GameObjects.Graphics;
    private mInput;
    private scene: Phaser.Scene;
    constructor(scene: Phaser.Scene, private render: Render, text?: string) {
        super();
        this.scene = scene;
        const width = scene.cameras.main.width;
        const height = scene.cameras.main.height;
        this.mBackground = scene.add.graphics();
        this.mBackground.fillStyle(0x0, 0.6);
        this.mBackground.fillRect(0, 0, width, height).setInteractive(new Phaser.Geom.Rectangle(0, 0, width, height), Phaser.Geom.Rectangle.Contains);
        this.mInput = new InputText(scene, 6 * render.uiRatio, 6 * render.uiRatio, width - 12 * render.uiRatio, 40 * render.uiRatio, {
            fontSize: `${20 * render.uiRatio}px`,
            color: "#0",
            text,
            backgroundColor: "#FFFFFF",
            borderColor: "#FF9900"
        }).setOrigin(0, 0);

        this.mInput.node.addEventListener("keypress", (e) => {
            const keycode = e.keyCode || e.which;
            if (keycode === 13) {
                this.onCloseHandler();
            }
        });
        this.mInput.x = 6 * render.uiRatio;
        this.scene.input.on("pointerdown", this.onFoucesHandler, this);
        if (this.render.game.device.os.iOS) {
            this.mInput.on("click", this.onFoucesHandler, this);
        } else {
            this.mInput.on("focus", this.onFoucesHandler, this);
        }
        this.mInput.setFocus();
    }

    private onCloseHandler() {
        this.emit("close", this.mInput.text);
        this.mBackground.destroy();
        this.mInput.destroy();
        this.destroy();
        this.scene.input.off("pointerdown", this.onFoucesHandler, this);
        this.scene = undefined;
    }
    private onFoucesHandler() {
        this.mInput.node.focus();
    }
}
