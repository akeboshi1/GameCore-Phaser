import { Render } from "../../render";
import { BaseBatchPanel } from "./base.batch.panel";
export class BasePanel extends BaseBatchPanel {
    constructor(scene: Phaser.Scene, render: Render) {
        super(scene, render);
    }

    public hide(boo: boolean = false) {
        this.onHide();
        if (!boo) this.render.uiManager.hideBasePanel(this.key);
        if (this.soundGroup && this.soundGroup.close)
            this.playSound(this.soundGroup.close);
        if (!this.mTweening && this.mTweenBoo) {
            this.showTween(false);
        } else {
            this.destroy();
        }
    }

    protected onHide() {
    }
}
