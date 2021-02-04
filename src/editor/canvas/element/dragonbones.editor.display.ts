import { DragonbonesModel } from "baseModel";
import { BaseDragonbonesDisplay } from "baseRender";
import { Logger } from "utils";

export class DragonbonesEditorDisplay extends BaseDragonbonesDisplay {
    constructor(scene: Phaser.Scene) {
        super(scene);
        this.load(new DragonbonesModel({ id: 0, avatar: { } }));
    }

    public created() {
        super.created();
        this.clearArmatureUnusedSlots();
    }

    public stop() {
        if (!this.mArmatureDisplay) return;
        this.mArmatureDisplay.animation.stop();
    }

    private clearArmatureUnusedSlots() {
        if (!this.mArmatureDisplay) return Logger.getInstance().error("display does not exist. clear ArmatureUnused slots error");
        const slots = this.mArmatureDisplay.armature.getSlots();
        for (const slot of slots) {
            if (slot) {
                const visible: boolean = slot.name.includes("base") ||
                slot.name.includes("eyes") ||
                slot.name.includes("mous") ||
                (slot.name.includes("hair") && !slot.name.includes("back"));
                slot.display.visible = visible;
            }
        }
    }
}