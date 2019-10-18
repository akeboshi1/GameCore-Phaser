import { ToolTip } from "./toolTip";
import { WorldService } from "../../game/world.service";

export class ToolTipContainer extends Phaser.GameObjects.Container {
    protected mToolTipData: string;
    // protected mToolTipBoo: boolean = true;
    protected mToolTip: ToolTip;
    constructor(private mScene: Phaser.Scene, private world: WorldService) {
        super(mScene);
    }

    public setUiScale(value: number) {
        this.scaleX = this.scaleY = value;
    }

    public setToolTip(resStr: string, resJson: string, resUrl: string) {
        if (!this.mToolTip) {
            this.mToolTip = new ToolTip(this.mScene, resStr, resJson, resUrl);
        }
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

    public destroy() {
        this.removeAll();
        this.removeAllListeners();
        if (this.mToolTip) {
            this.mToolTip.destroy();
            this.mToolTip = null;
        }
        this.mToolTipData = undefined;
        super.destroy();
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
                this.off("pointerdown", this.overHandler, this);
                this.off("pointerup", this.outHandler, this);
                this.off("pointerdown", this.overHandler, this);
                this.off("pointerup", this.outHandler, this);
                this.mToolTip.parentContainer.remove(this.mToolTip);
            }
        }
    }

}
