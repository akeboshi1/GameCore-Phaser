import { ToolTip } from "./toolTip";
import { WorldService } from "../../game/world.service";

export class ToolTipManager extends Phaser.Events.EventEmitter {
    private curToolTip: ToolTip;
    constructor(private world: WorldService) {
        super();
    }

    public getToolTip(): ToolTip {
        return this.curToolTip;
    }

    public setToolTip(target: Phaser.GameObjects.Container | Phaser.GameObjects.Image, scene: Phaser.Scene, resStr: string, resJson: string, resUrl: string) {
        this.curToolTip = ToolTip.getInstance(scene, resStr, resJson, resUrl);
        if (this.world.game.device.os.desktop) {
            target.on("pointerover", this.overHandler, this);
            target.on("pointerout", this.outHandler, this);
        } else {
            target.on("pointerdown", this.overHandler, this);
            target.on("pointerup", this.outHandler, this);
        }
    }

    public removeToolTip(target: Phaser.GameObjects.Container | Phaser.GameObjects.Image) {
        target.off("pointerover", this.overHandler, this);
        target.off("pointerout", this.outHandler, this);
        target.off("pointerdown", this.overHandler, this);
        target.off("pointerup", this.outHandler, this);
    }

    private overHandler(pointer, target) {
        if (this.curToolTip) {
            if (!this.curToolTip.parentContainer) {
                this.world.uiManager.getUILayerManager().addToToolTipsLayer(this.curToolTip);
                this.curToolTip.x = pointer.x;
                this.curToolTip.y = pointer.y;
            }
        }
    }

    private outHandler() {
        if (this.curToolTip) {
            if (this.curToolTip.parentContainer) {
                this.curToolTip.parentContainer.remove(this.curToolTip);
            }
        }
    }
}
