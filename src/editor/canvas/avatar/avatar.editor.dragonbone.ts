import { AvatarNode } from "game-capsule";
import AvatarModel from "./avatar.model";
import { op_gameconfig_01 } from "pixelpai_proto";
import * as url from "url";
import { IAvatarComponent } from "./avatar.manager";

export const WEB_AVATAR_PATH = "https://osd.tooqing.com/avatar/part";

export class AvatarEditorDragonbone extends Phaser.GameObjects.Container {

    private readonly ARMATURENAME = "Armature";
    private readonly DRAGONBONESNAME = "bones_human01";

    private mData: AvatarNode;
    private mAvatarModel: AvatarModel;
    private mArmatureDisplay: dragonBones.phaser.display.ArmatureDisplay;

    constructor(scene: Phaser.Scene, data: AvatarNode) {
        super(scene);

        this.mData = data;
        const parentContainer = scene.add.container(0, 0);
        parentContainer.add(this);

        this.mAvatarModel = new AvatarModel();
        this.mAvatarModel.initial();

        this.loadModel();
    }

    public update() {
        if (this.mData && this.mArmatureDisplay) {
            if (this.mData.dirty) {
                this.reloadPart();
                this.mData.dirty = false;
            }
        }
    }

    public setAvatar(avatar: op_gameconfig_01.IAvatar) {
        this.mAvatarModel.avatar = avatar;
    }

    public destroy() {
        super.destroy();
        this.removeAll(true);
        if (this.mArmatureDisplay) {
            this.mArmatureDisplay.destroy();
            this.remove(this.mArmatureDisplay);
        }
        this.clearDragonBones();
    }

    private buildBones(): void {
        if (this.mArmatureDisplay) {
            this.mArmatureDisplay.destroy();
        }
        this.mArmatureDisplay = this.scene.add.armature(this.ARMATURENAME, this.DRAGONBONESNAME);
        this.mArmatureDisplay.animation.play(this.mData.getCurAnimation());
        this.mArmatureDisplay.scale = 2;
        this.mArmatureDisplay.x = this.scene.scale.width >> 1;
        this.mArmatureDisplay.y = this.scene.scale.height - 30;
        this.add(this.mArmatureDisplay);

        this.mData.dirty = true;
    }

    private reloadPart() {
        if (!this.scene.load) {
            return;
        }
        this.cleanUp();
        const resources = this.mData.resources(this.mData.dir);
        for (const resource of resources) {
            this.loadPart(resource, url.resolve(WEB_AVATAR_PATH, resource));
        }
        this.scene.load.once(Phaser.Loader.Events.COMPLETE, this.replaceDisplay, this);
        this.scene.load.start();
    }

    private loadModel() {
        const res = "assets/avatar/";
        this.scene.load.dragonbone(
            this.DRAGONBONESNAME,
            `${res}/${this.mAvatarModel.id}_tex.png`,
            `${res}/${this.mAvatarModel.id}_tex.json`,
            `${res}/${this.mAvatarModel.id}_ske.dbbin`,
            null,
            null,
            { responseType: "arraybuffer" }
        );
        this.scene.load.once(Phaser.Loader.Events.COMPLETE, this.buildBones, this);
        this.scene.load.start();
    }

    private replaceSlotDisplay(soltName: string, key: string): void {
        if (!!this.mArmatureDisplay === false) return;
        const slot: dragonBones.Slot = this.mArmatureDisplay.armature.getSlot(`${soltName}`);
        if (!slot) return;
        if (!this.scene.textures.exists(key)) {
            const display = slot.display;
            if (display) display.setTexture(undefined);
            return;
        }
        const dis = new dragonBones.phaser.display.SlotImage(
            this.scene,
            slot.display.x,
            slot.display.y,
            key
        );
        slot.display = dis;
    }

    private replaceDisplay() {
        const parts = this.mData.parts;
        let slotName = "";
        let uri = "";
        for (const partName in parts) {
            if (!parts.hasOwnProperty(partName)) {
                continue;
            }
            slotName = `${partName}_${this.mData.dir}`;
            if (partName === "head_back") {
                slotName = `head_hair_${this.mData.dir}_back`;
            }
            if (partName === "body_dres") {
                slotName = `body_cost_${this.mData.dir}_dres`;
            }
            const avatarSet: IAvatarComponent = parts[partName];
            if (avatarSet) {
                uri = `/avatar/part/${partName}_${avatarSet.id}_${this.mData.dir}.png`;
                if (partName === "head_back") {
                    uri = `/avatar/part/head_hair_${avatarSet.id}_${this.mData.dir}_back.png`;
                }
                if (partName === "body_dres") {
                    uri = `/avatar/part/body_cost_${avatarSet.id}_${this.mData.dir}_dres.png`;
                }
                this.replaceSlotDisplay(`${slotName}`, uri);
            }
        }
        this.mArmatureDisplay.animation.play(this.mData.getCurAnimation());
    }

    private cleanUp() {
        const slots = [
            "barm_cost",
            "barm_spec",
            "bleg_cost",
            "bleg_spec",
            // "body_cost",
            ["body_cost", "_dres"],
            "body_spec",
            "body_tail",
            "body_wing",
            "farm_cost",
            "farm_spec",
            "fleg_cost",
            "fleg_spec",
            // "head_eyes",
            // "head_hair",
            ["head_hair", "_back"],
            "head_hats",
            "head_mask",
            // "head_mous",
            "head_spec",
            "shld_farm",
            "weap_farm",
            "weap_barm",
            "shld_barm",
            []
        ];

        for (const p of slots) {
            let part = "",
                subPart = "";
            if (typeof p === "string") {
                part = p;
            } else if (typeof p === "object") {
                part = p.shift();
                subPart = p.shift();
            }
            if (part) {
                this.replaceSlotDisplay(`${part}_1${subPart}`, "");
                this.replaceSlotDisplay(`${part}_3${subPart}`, "");
            }
        }
    }

    private loadPart(key: string, path: string) {
        if (!this.scene.cache.obj.has(key)) {
            this.scene.load.image(key, path);
        }
    }

    private clearDragonBones() {
        if (this.mArmatureDisplay) {
            this.mArmatureDisplay.dbClear();
            this.mArmatureDisplay.destroy();
            this.mArmatureDisplay = null;
        }
    }
}
