import { DragonbonesModel } from "baseGame";
import { BaseDragonbonesDisplay } from "baseRender";
import { Logger } from "structure";
import version from "../../../../version";
export class DragonbonesEditorDisplay extends BaseDragonbonesDisplay {

    constructor(scene: Phaser.Scene, mWebHomePath: string) {
        super(scene, { resPath: `./resources_v${version}/`, osdPath: mWebHomePath });
    }

    public load(): Promise<any> {
        const display = new DragonbonesModel({
            id: 0, avatar: {
                id: "0",
                headBaseId: "0001",
                headHairId: "5cd28238fb073710972a73c2",
                headEyesId: "5cd28238fb073710972a73c2",
                headMousId: "5cd28238fb073710972a73c2",
                bodyBaseId: "0001",
                bodyCostId: "5cd28238fb073710972a73c2",
                farmBaseId: "0001",
                barmBaseId: "0001",
                flegBaseId: "0001",
                blegBaseId: "0001"
            }
        });
        return super.load(display, undefined, false);
    }

    public displayCreated() {
        super.displayCreated();
        this.clearArmatureUnusedSlots();
        this.setDraggable(this.mInteractive);
        if (this.mAnimation) {
            this.play(this.mAnimation);
        }
    }

    public setDraggable(val: boolean) {
        if (this.input) this.scene.input.setDraggable(this, val);
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
