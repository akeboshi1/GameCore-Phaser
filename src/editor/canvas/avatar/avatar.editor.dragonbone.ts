import { AvatarNode } from "game-capsule";
import { op_gameconfig_01 } from "pixelpai_proto";
import * as url from "url";
import { AvatarDirEnum, IAvatarSet } from "game-capsule/lib/configobjects/avatar";
import * as _ from "lodash";
import { Logger } from "../../../utils/log";
import { ResourcesChangeListener, SPRITE_SHEET_KEY } from "./avatar.editor.resource.manager";

export const WEB_AVATAR_PATH = "https://osd.tooqing.com/avatar/part";

export class AvatarEditorDragonbone extends Phaser.GameObjects.Container implements ResourcesChangeListener {

    private readonly DRAGONBONERESOURCEMAP = {
        [AvatarDragonboneResType.default]: { dbName: "bones_human01", armatureName: "Armature" },
        [AvatarDragonboneResType.model]: { dbName: "bones_human01", armatureName: "Armature" },
    };
    private readonly BACKMAP = {
        ["head_hair"]: ["head_hair", "head_back"],
        ["body_cost"]: ["body_cost", "body_dres"]
    };

    private mDragonboneRes;
    private mArmatureDisplay: dragonBones.phaser.display.ArmatureDisplay;

    private mCurAnimationName: string = "idle_3";
    private mCurDir: AvatarDirEnum = AvatarDirEnum.Front;
    private mSets: IAvatarSet[] = [];
    private mParts: { [key: string]: IAvatarSet } = {};

    constructor(scene: Phaser.Scene, resType: AvatarDragonboneResType) {
        super(scene);

        const parentContainer = scene.add.container(0, 0);
        parentContainer.add(this);

        this.setDefaultParts();

        if (resType in this.DRAGONBONERESOURCEMAP) {
            this.mDragonboneRes = this.DRAGONBONERESOURCEMAP[resType];
            this.loadDragonbone();
        } else {
            Logger.getInstance().error(`resType <${resType}> error`);
        }
    }

    public destroy() {
        super.destroy();
        this.removeAll(true);
        if (this.mArmatureDisplay) {
            this.mArmatureDisplay.dbClear();
            this.mArmatureDisplay.destroy();
            this.remove(this.mArmatureDisplay);
            this.mArmatureDisplay = null;
        }
        this.mDragonboneRes = null;
        this.mCurAnimationName = null;
        this.mCurDir = null;
        this.mSets = [];
        this.mSets = null;
        this.mParts = {};
        this.mParts = null;
    }

    public setDir(dir: AvatarDirEnum) {
        const re = this.mCurDir === AvatarDirEnum.Front ? /3/gi : /1/gi;
        this.mCurAnimationName = this.mCurAnimationName.replace(re, `${dir}`);
        this.mCurDir = dir;

        this.reloadParts();
    }

    public play(animationName: string) {
        this.mCurAnimationName = animationName;

        if (this.mArmatureDisplay) {
            this.mArmatureDisplay.animation.play(this.mCurAnimationName);
        }
    }

    public clearParts() {
        this.mParts = {};
        this.mSets.length = 0;
        this.setDefaultParts();
        this.reloadParts();
    }

    public mergeParts(sets: IAvatarSet[]) {
        this.addSets(sets);
        this.reloadParts();
    }

    public spliceParts(set: IAvatarSet) {
        this.removeSet(set);
        this.reloadParts();
    }

    public snapshoot(): Promise<string> {
        return new Promise((resolve, reject) => {
            if (!this.mArmatureDisplay) {
                reject(null);
            } else {
                this.scene.game.renderer.snapshot((img: HTMLImageElement) => {
                    resolve(img.src);
                });
            }
        });
    }

    public onResourcesLoaded() {
        this.replaceDisplay();
    }
    public onResourcesCleared() {
        this.clearParts();
    }

    private loadDragonbone() {
        const root = "assets/avatar/";
        const dbName = this.mDragonboneRes.dbName;
        this.scene.load.dragonbone(
            dbName,
            `${root}/${dbName}_tex.png`,
            `${root}/${dbName}_tex.json`,
            `${root}/${dbName}_ske.dbbin`,
            null,
            null,
            { responseType: "arraybuffer" }
        );
        this.scene.load.once(Phaser.Loader.Events.COMPLETE, this.buildBones, this);
        this.scene.load.start();
    }

    private buildBones(): void {
        if (this.mArmatureDisplay) {
            this.mArmatureDisplay.destroy();
        }
        this.mArmatureDisplay = this.scene.add.armature(this.mDragonboneRes.armatureName, this.mDragonboneRes.dbName);
        this.mArmatureDisplay.animation.play(this.mCurAnimationName);
        this.mArmatureDisplay.scale = 2;
        this.mArmatureDisplay.x = this.scene.scale.width >> 1;
        this.mArmatureDisplay.y = this.scene.scale.height - 30;
        this.add(this.mArmatureDisplay);

        this.reloadParts();
    }

    // 将一组AvatatSet整合到一起形成一个完整的Avatar，并保存到self._parts里
    private addSets(newSets: IAvatarSet[]) {
        // 解决替换发型，后发分层存在的问题
        for (const set of newSets) {
            for (const key in this.BACKMAP) {
                if (this.BACKMAP.hasOwnProperty(key)) {
                    const parts = set.parts;
                    for (const part of parts) {
                        if (part === key) {
                            _.remove(this.mSets, (n) => {
                                return part === key;
                            });
                            this.mParts = _.omit(this.mParts, this.BACKMAP[key]);
                        }
                    }
                }
            }
        }

        this.mSets = this.mSets.concat(newSets);
        for (const set of this.mSets) {
            for (const part of set.parts) {
                this.mParts[part] = set;
            }
        }
    }

    private removeSet(set: IAvatarSet) {
        const idx = this.mSets.indexOf(set);
        if (idx >= 0) {
            this.mSets.splice(idx, 1);
            for (const one of this.mSets) {
                for (const part of one.parts) {
                    this.mParts[part] = one;
                }
            }
        }
    }

    private reloadParts() {
        if (!this.scene.load) {
            return;
        }
        if (!this.mArmatureDisplay) {
            return;
        }
        this.cleanUp();
        const resources = this.getResourcesByDir(this.mCurDir);
        for (const resource of resources) {
            this.loadPart(resource, url.resolve(WEB_AVATAR_PATH, resource));
        }
        this.scene.load.once(Phaser.Loader.Events.COMPLETE, this.replaceDisplay, this);
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
        let _k = key;
        let _f = null;
        if (this.scene.textures.exists(SPRITE_SHEET_KEY)) {
            const localTex = this.scene.textures.get(SPRITE_SHEET_KEY);
            if (localTex.has(key)) {
                _k = SPRITE_SHEET_KEY;
                _f = key;
            }
        }
        const dis = _f ? new dragonBones.phaser.display.SlotImage(
            this.scene,
            slot.display.x,
            slot.display.y,
            _k,
            _f
        ) : new dragonBones.phaser.display.SlotImage(
            this.scene,
            slot.display.x,
            slot.display.y,
            _k
        );
        slot.display = dis;
    }

    private replaceDisplay() {
        const parts = this.mParts;
        let slotName = "";
        let uri = "";
        for (const partName in parts) {
            if (!parts.hasOwnProperty(partName)) {
                continue;
            }
            slotName = `${partName}_${this.mCurDir}`;
            if (partName === "head_back") {
                slotName = `head_hair_${this.mCurDir}_back`;
            }
            if (partName === "body_dres") {
                slotName = `body_cost_${this.mCurDir}_dres`;
            }
            const avatarSet: IAvatarComponent = parts[partName];
            if (avatarSet) {
                uri = `/avatar/part/${partName}_${avatarSet.id}_${this.mCurDir}.png`;
                if (partName === "head_back") {
                    uri = `/avatar/part/head_hair_${avatarSet.id}_${this.mCurDir}_back.png`;
                }
                if (partName === "body_dres") {
                    uri = `/avatar/part/body_cost_${avatarSet.id}_${this.mCurDir}_dres.png`;
                }
                this.replaceSlotDisplay(`${slotName}`, uri);
            }
        }
        this.mArmatureDisplay.animation.play(this.mCurAnimationName);
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

    // 获取整个avatar的部件标签对应的资源相对路径
    private getResourcesByDir(dir: number): string[] {
        const res: string[] = [];
        const parts = this.mParts;

        for (const key in parts) {
            if (parts.hasOwnProperty(key)) {
                const set: IAvatarSet = parts[key];
                if (!set.hasOwnProperty("localImages")) {
                    // eyes mous 没有背面素材
                    if (dir === 1 && key === "head_eyes") {
                        // Do nothing
                    } else if (dir === 1 && key === "head_mous") {
                        // Do nothing
                    } else if (key === "head_back") {
                        res.push(
                            this.relativeUri("head_hair", set.id, dir, "back")
                        );
                    } else if (key === "body_dres") {
                        res.push(
                            this.relativeUri("body_cost", set.id, dir, "dres")
                        );
                    } else {
                        res.push(this.relativeUri(key, set.id, dir));
                    }
                }
            }
        }
        return res;
    }
    // 从部件ID转换为资源相对路径
    private relativeUri(
        part: string,
        id: string,
        dir: number,
        layer?: string
    ) {
        if (layer) {
            return `/avatar/part/${part}_${id}_${dir}_${layer}.png`;
        }
        return `/avatar/part/${part}_${id}_${dir}.png`;
    }
    private setDefaultParts() {
        const defaulAvatar = [
            { id: "0001", parts: ["head_base"] },
            { id: "5cd28238fb073710972a73c2", parts: ["head_hair"] },
            { id: "5cd28238fb073710972a73c2", parts: ["head_eyes"] },
            { id: "5cd28238fb073710972a73c2", parts: ["head_mous"] },
            { id: "0001", parts: ["body_base"] },
            { id: "5cd28238fb073710972a73c2", parts: ["body_cost"] },
            { id: "0001", parts: ["farm_base"] },
            { id: "0001", parts: ["barm_base"] },
            { id: "0001", parts: ["fleg_base"] },
            { id: "0001", parts: ["bleg_base"] },
            { id: "0001", parts: ["farm_base"] },
        ];
        this.addSets(defaulAvatar);
    }
}

export enum AvatarDragonboneResType {
    default = 0,
    model = 1
}

export interface IAvatarComponent {
    id: string;
    parts: string[];
    name?: string;
}
