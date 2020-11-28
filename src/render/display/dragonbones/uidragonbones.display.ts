import { RunningAnimation } from "structure";
import { Handler } from "utils";
import { DragonbonesDisplay } from "./dragonbones.display";

export class UIDragonbonesDisplay extends DragonbonesDisplay {
    protected mInteractive: boolean = false;
    private mComplHandler: Handler;
    public play(val: RunningAnimation) {
        super.play(val);
        if (this.mArmatureDisplay) {
            if (this.mArmatureDisplay.hasDBEventListener(dragonBones.EventObject.LOOP_COMPLETE)) {
                this.mArmatureDisplay.removeDBEventListener(dragonBones.EventObject.LOOP_COMPLETE, this.onArmatureLoopComplete, this);
            }
            if (val.times > 0) {
                this.mArmatureDisplay.addDBEventListener(dragonBones.EventObject.LOOP_COMPLETE, this.onArmatureLoopComplete, this);
            }
        }
    }

    public setCompleteHandler(compl: Handler) {
        this.mComplHandler = compl;
    }
    protected onArmatureLoopComplete(event: dragonBones.EventObject) {
        if (!this.mArmatureDisplay || !this.mAnimation) {
            return;
        }
        this.mArmatureDisplay.removeDBEventListener(dragonBones.EventObject.LOOP_COMPLETE, this.onArmatureLoopComplete, this);
        const queue = this.mAnimation.playingQueue;
        if (!queue || queue.name === undefined) {
            if (this.mComplHandler) this.mComplHandler.run();
        } else {
            const runAni: RunningAnimation = {
                name: queue.name,
                times: queue.playTimes,
                flip: this.mAnimation.flip
            };
            this.play(runAni);
        }
    }
    protected showPlaceholder() {
    }
    protected closePlaceholder() {
    }
    protected clearArmatureSlot() {
    }
}
