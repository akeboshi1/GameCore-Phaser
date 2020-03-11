import { Panel } from "./panel";
import { InputTextField, InputTextFieldEvent } from "./inputTextFactory";
import { WorldService } from "../../game/world.service";

export class InputPanel extends Phaser.GameObjects.Container {
    private mInputText: InputTextField;
    private mBg: Phaser.GameObjects.Graphics;
    constructor(scene: Phaser.Scene, world: WorldService) {
        super(scene);
        const width: number = world.getSize().width;
        const height: number = world.getSize().height;
        this.mBg.clear();
        this.mBg.fillStyle(0x0000, .5);
        this.mBg.fillRect(0, 0, width, height);
        this.setInteractive(new Phaser.Geom.Rectangle(0, 0, width, height), Phaser.Geom.Rectangle.Contains);
        this.mInputText = world.uiManager.getInputTextFactory().getInputText(scene);
        this.mInputText.on(InputTextFieldEvent.textExit, this.hide, this);
        this.add(this.mBg);
        this.add(this.mInputText.getSkin());
    }

    public get text(): string {
        return this.mInputText.getText();
    }

    public hide() {
        if (this.mInputText) {
            this.mInputText.off(InputTextFieldEvent.textExit, this.hide, this);
            this.mInputText.destroy();
            this.mInputText = null;
        }
        if (this.mBg) {
            this.mBg.destroy();
            this.mBg = null;
        }
        super.destroy();
    }

}
