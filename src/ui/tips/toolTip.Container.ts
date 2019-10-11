import { ToolTip } from "./toolTip";
import { WorldService } from "../../game/world.service";

export class ToolTipContainer extends Phaser.GameObjects.Container {
    protected mToolTipData: string;
    // protected mToolTipBoo: boolean = true;
    protected mToolTip: ToolTip;
    constructor(private mScene: Phaser.Scene, private world: WorldService) {
        super(mScene);

    }

    public setToolTip(resStr: string, resJson: string, resUrl: string) {
        this.mToolTip = ToolTip.getInstance(this.mScene, resStr, resJson, resUrl);
    }

    public setToolTipData(text: string) {
        this.mToolTipData = text;
        if (this.world.game.device.os.desktop) {
            this.on("pointerover", this.overHandler, this);
            this.on("pointerout", this.outHandler, this);
        } else {
            this.on("pointerdown", this.overHandler, this);
            this.on("pointerup", this.outHandler, this);
        }
    }

    private overHandler(pointer, target) {
        if (this.mToolTip) {
            if (!this.mToolTip.parentContainer) {
                if (this.mToolTipData) {
                    this.mToolTip.setText(this.mToolTipData);
                }
                this.world.uiManager.getUILayerManager().addToToolTipsLayer(this.mToolTip);
                this.mToolTip.x = pointer.x;
                this.mToolTip.y = pointer.y;
            }
        }
    }

    private outHandler() {
        if (this.mToolTip) {
            if (this.mToolTip.parentContainer) {
                this.mToolTip.parentContainer.remove(this.mToolTip);
            }
        }
    }

}
