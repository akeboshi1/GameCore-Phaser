import { Button, ClickEvent } from "apowophaserui";
import { UIAtlasName } from "picaRes";
import { Handler } from "utils";

export class PicaNewLeftPanel extends Phaser.GameObjects.Container {
    private dpr: number;
    private key: string;
    private sendHandler: Handler;
    constructor(scene: Phaser.Scene, width: number, height: number, key: string, dpr: number) {
        super(scene);
        this.setSize(width, height);
        this.dpr = dpr;
        this.key = key;
        this.init();
    }

    public init() {
        const mapButton = new Button(this.scene, UIAtlasName.iconcommon, "home_map", "home_map");
        mapButton.y = -this.height * 0.5 + mapButton.height * 0.5;
        mapButton.on(ClickEvent.Tap, this.onMapButtonHandler, this);
        const taskButton = new Button(this.scene, UIAtlasName.iconcommon, "home_task", "home_task");
        taskButton.y = mapButton.y + mapButton.height * 0.5 + 20 * this.dpr + taskButton.height * 0.5;
        taskButton.on(ClickEvent.Tap, this.onTaskButtonHandler, this);
        this.add([mapButton, taskButton]);
    }

    public setHandler(send: Handler) {
        this.sendHandler = send;
    }

    private onMapButtonHandler() {
        if (this.sendHandler) this.sendHandler.runWith(["maphome"]);
    }
    private onTaskButtonHandler() {
        if (this.sendHandler) this.sendHandler.runWith(["task"]);
    }
}
