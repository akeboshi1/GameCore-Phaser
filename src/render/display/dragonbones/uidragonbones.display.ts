import { AvatarSuit, RunningAnimation } from "structure";
import { Handler } from "utils";
import { DragonbonesDisplay } from "./dragonbones.display";

export class UIDragonbonesDisplay extends DragonbonesDisplay {
    protected mInteractive: boolean = false;
    private mComplHandler: Handler;
    private AniAction: any[];
    private isBack: boolean = false;
    public play(val: RunningAnimation) {
        val.name = this.getAnimationName(val.name) + this.isBack ? "_back" : "";
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
    public setBack(back: boolean) {
        this.isBack = back;
    }
    public setCompleteHandler(compl: Handler) {
        this.mComplHandler = compl;
    }
    public setSuits(suits: AvatarSuit[]) {
        if (suits) {
            for (const suit of suits) {
                if (suit.suit_type === "weapon") {
                    if (suit.tag) {
                        this.AniAction = JSON.parse(suit.tag).action;
                        return;
                    }
                }
            }
        }
        this.AniAction = undefined;
    }

    public getAnimationName(name) {
        if (this.AniAction) {
            if (name === "idle") return this.AniAction[0];
            else if (name === "walk") return this.AniAction[1];
        }
        return name;
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
