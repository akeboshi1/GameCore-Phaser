import { Button, ClickEvent } from "apowophaserui";
import { UIAtlasName } from "../../../res";
import { Handler } from "utils";
import { MainUIRedType } from "picaStructure";

export class PicaNewLeftPanel extends Phaser.GameObjects.Container {
    public taskButton: Button;
    public mapButton: Button;
    private dpr: number;
    private key: string;
    private sendHandler: Handler;
    private redButtonMap: Map<number, Button> = new Map();
    constructor(scene: Phaser.Scene, width: number, height: number, key: string, dpr: number) {
        super(scene);
        this.setSize(width, height);
        this.dpr = dpr;
        this.key = key;
        this.init();
    }

    public init() {
        this.mapButton = new Button(this.scene, UIAtlasName.iconcommon, "home_map", "home_map");
        this.mapButton.y = -this.height * 0.5 + this.mapButton.height * 0.5;
        this.mapButton.on(ClickEvent.Tap, this.onMapButtonHandler, this);
        this.taskButton = new Button(this.scene, UIAtlasName.iconcommon, "home_task", "home_task");
        this.taskButton.y = this.mapButton.y + this.mapButton.height * 0.5 + 20 * this.dpr + this.taskButton.height * 0.5;
        this.taskButton.on(ClickEvent.Tap, this.onTaskButtonHandler, this);
        this.add([this.mapButton, this.taskButton]);
        this.redButtonMap.set(MainUIRedType.TASK, this.taskButton);
        this.redButtonMap.set(MainUIRedType.MAP, this.mapButton);
    }
    public updateUIState(data: any) {
        const button = this.getButton(data.name);
        if (button) button.visible = data.visible;
    }
    public setHandler(send: Handler) {
        this.sendHandler = send;
    }
    public get redMap() {
        return this.redButtonMap;
    }
    private onMapButtonHandler() {
        if (this.sendHandler) this.sendHandler.runWith(["maphome"]);
    }
    private onTaskButtonHandler() {
        if (this.sendHandler) this.sendHandler.runWith(["task"]);
    }
    private getButton(name: string) {
        if (name === "mainui.maphome") {
            return this.mapButton;
        } else if (name === "mainui.task") {
            return this.taskButton;
        }
    }
}
