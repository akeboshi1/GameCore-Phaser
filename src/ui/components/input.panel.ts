import { WorldService } from "../../game/world.service";
import { InputText } from "@apowo/phaserui";

export class InputPanel extends Phaser.Events.EventEmitter {
    private mBackground: Phaser.GameObjects.Graphics;
    private mInput;
    constructor(scene: Phaser.Scene, world: WorldService, text?: string) {
        super();
        const width = scene.cameras.main.width;
        const height = scene.cameras.main.height;
        this.mBackground = scene.add.graphics();
        this.mBackground.fillStyle(0x0, 0.6);
        this.mBackground.fillRect(0, 0, width, height).setInteractive(new Phaser.Geom.Rectangle(0, 0, width, height), Phaser.Geom.Rectangle.Contains);

        this.mInput = new InputText(scene, 0, 6 * world.uiRatio, width - 12 * world.uiRatio, 40 * world.uiRatio, {
            fontSize: `${20 * world.uiRatio}px`,
            color: "#0",
            text: "",
            backgroundColor: "#FFFFFF",
            borderColor: "#FF9900"
        }).setOrigin(0, 0).setFocus();
        // this.mInput.y = -height / 2;
        this.mInput.node.addEventListener("keypress", (e) => {
            const keycode = e.keyCode || e.which;
            if (keycode === 13) {
                this.onCloseHandler();
            }
        });
    }

    private onCloseHandler() {
        this.emit("close", this.mInput.text);
        this.mBackground.destroy();
        this.mInput.destroy();
        this.destroy();
    }
}
