import { WorldService } from "../../game/world.service";
import { Font } from "../../utils/font";
import { InputText } from "apowophaserui";
import { Logger } from "../../utils/log";

export class InputPanel extends Phaser.Events.EventEmitter {
    private mBackground: Phaser.GameObjects.Graphics;
    private mInput;
    private scene: Phaser.Scene;
    private mTextArea: Phaser.GameObjects.Text;
    private world: WorldService;
    constructor(scene: Phaser.Scene, world: WorldService, text?: string) {
        super();
        this.scene = scene;
        this.world = world;
        const width = scene.cameras.main.width;
        const height = scene.cameras.main.height;
        this.mBackground = scene.add.graphics();
        this.mBackground.fillStyle(0x0, 0.6);
        this.mBackground.fillRect(0, 0, width, height).setInteractive(new Phaser.Geom.Rectangle(0, 0, width, height), Phaser.Geom.Rectangle.Contains);
        this.mTextArea = this.scene.add.text(width / 2, height, "", { fontSize: 11 * world.uiRatio, bold: true, fontFamily: Font.DEFULT_FONT, color: "#356EE3" }).setOrigin(1, 0);
        this.mInput = new InputText(scene, 6 * world.uiRatio, 6 * world.uiRatio, width - 12 * world.uiRatio, 40 * world.uiRatio, {
            fontSize: `${20 * world.uiRatio}px`,
            color: "#0",
            text,
            backgroundColor: "#FFFFFF",
            borderColor: "#FF9900"
        }).setOrigin(0, 0);
        // (<any>scene.add).rexInputText(6 * world.uiRatio, 6 * world.uiRatio, width - 12 * world.uiRatio, 40 * world.uiRatio, {
        //     fontSize: `${20 * world.uiRatio}px`,
        //     color: "#0",
        //     text,
        //     backgroundColor: "#FFFFFF",
        //     borderColor: "#FF9900"
        // }).setOrigin(0, 0);
        // this.mInput.y = -height / 2;
        this.mInput.node.addEventListener("keypress", (e) => {
            const keycode = e.keyCode || e.which;
            if (keycode === 13) {
                this.onCloseHandler();
            }
        });
        this.scene.input.on("pointerdown", this.onFoucesHandler, this);
        // if (this.world.game.device.os.iOS) {
        //     this.mInput.on("click", this.onFoucesHandler, this);
        // } else {
        //     this.mInput.on("focus", this.onFoucesHandler, this);
        // }
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
        Logger.getInstance().log("fouces----log");
        this.mInput.node.focus();
        // setTimeout(() => {
        //     const node = <HTMLInputElement>this.mInput.node;
        //     //  node.scrollIntoView();

        //     setTimeout(() => {
        //         const height = document.documentElement.clientHeight;
        //         const viewHeight = document.body.scrollHeight;
        //         const scrollHieght = document.documentElement.scrollTop;
        //         const pHeight = this.scene.cameras.main.height;
        //         this.mInput.text = height - viewHeight + "     " + viewHeight + "     " + scrollHieght + "   " + window.innerHeight + "   " + height + "   " + document.body.offsetHeight;
        //         this.mTextArea.y = pHeight - (scrollHieght) * this.world.uiRatio * this.world.uiScale;
        //     }, 600);
        // }, 600);
    }
}
