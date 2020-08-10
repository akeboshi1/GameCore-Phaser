import { AvatarNode, IImage } from "game-capsule";
import { op_gameconfig_01 } from "pixelpai_proto";
import * as url from "url";
import { AvatarDirEnum, IAvatarSet } from "game-capsule/lib/configobjects/avatar";
import * as _ from "lodash";
import { Logger } from "../../../utils/log";

export class AvatarEditorDragonbone extends Phaser.GameObjects.Container {

    private readonly DRAGONBONENAME = "bones_human01";
    private readonly DRAGONBONEARMATURENAME = "Armature";
    private readonly BACKMAP = {
        ["head_hair"]: ["head_hair", "head_back"],
        ["body_cost"]: ["body_cost", "body_dres"]
    };
    private readonly DEFAULTSETS = [
        { id: "0001", parts: ["head_base", "body_base", "farm_base", "barm_base", "fleg_base", "bleg_base"] },
        { id: "5cd28238fb073710972a73c2", parts: ["head_hair", "head_eyes", "head_mous", "body_cost"] },
    ];
    private readonly MODELSETS = [
        { id: "5f2a52ad958e4b6aaf797913", parts: ["body_base", "barm_base", "farm_base", "bleg_base", "fleg_base", "head_base"] }
    ];
    private readonly ALLPARTS = [
        "barm_cost",
        "barm_spec",
        "bleg_cost",
        "bleg_spec",
        "body_cost",
        "body_dres",
        "body_spec",
        "body_tail",
        "body_wing",
        "farm_cost",
        "farm_spec",
        "fleg_cost",
        "fleg_spec",
        "head_eyes",
        "head_hair",
        "head_mous",
        "head_back",
        "head_hats",
        "head_mask",
        "head_spec",
        "shld_farm",
        "weap_farm",
        "weap_barm",
        "shld_barm"
    ];

    private mArmatureDisplay: dragonBones.phaser.display.ArmatureDisplay;

    private mWebHomePath: string;
    private mCurAnimationName: string = "idle_3";
    private mCurDir: AvatarDirEnum = AvatarDirEnum.Front;
    private mBaseSets: IAvatarSet[] = [];
    private mSets: IAvatarSet[] = [];
    private mParts: { [key: string]: IAvatarSet } = {};

    constructor(scene: Phaser.Scene, webHomePath: string) {
        super(scene);

        this.mWebHomePath = webHomePath;

        const parentContainer = scene.add.container(0, 0);
        parentContainer.add(this);

        this.setBaseSets(this.DEFAULTSETS);
        this.loadDragonbone();
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
        this.mCurAnimationName = null;
        this.mCurDir = null;
        if (this.mBaseSets) this.mBaseSets = [];
        this.mBaseSets = null;
        if (this.mSets) this.mSets = [];
        this.mSets = null;
        this.mParts = {};
        this.mParts = null;
    }

    public loadLocalResources(img: IImage, part: string, dir: string) {
        const uri = this.relativeUri(part, img.key, dir);

        if (this.scene.textures.exists(uri)) {
            this.onResourcesLoaded();
        } else {
            this.scene.textures.addBase64(uri, img.url);
            Logger.getInstance().log("ZW-- load img: ", uri);

            this.scene.textures.on("onload", this.onResourcesLoaded, this);
        }
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
        if (this.mSets) this.mSets = [];
        this.setBaseSets(this.DEFAULTSETS);
        this.reloadParts();
    }

    public mergeParts(sets: IAvatarSet[]) {
        this.addSets(sets);
        this.reloadParts();
    }

    public spliceParts(id: string) {
        this.removeSet(id);
        this.reloadParts();

        // remove local texture

    }

    public generateShopIcon(width: number, height: number): Promise<string> {
        return new Promise((resolve, reject) => {
            if (!this.mArmatureDisplay) {
                reject(null);
            } else {
                this.setBaseSets(this.MODELSETS);
                this.replaceDisplay()
                    .then(() => {
                        const rt = this.scene.make.renderTexture({ x: 0, y: 0, width, height }, false);
                        this.mArmatureDisplay.scaleY *= -1;
                        rt.draw(this.mArmatureDisplay, this.mArmatureDisplay.x, 30);
                        // snapshot
                        rt.snapshot((img: HTMLImageElement) => {
                            resolve(img.src);
                            this.mArmatureDisplay.scaleY *= -1;

                            Logger.getInstance().log("ZW-- generateShopIcon: ", img);

                            // reverse parts
                            this.setBaseSets(this.DEFAULTSETS);
                            this.replaceDisplay();
                        }, "image/png", 1);
                    })
                    .catch(() => {
                        reject(null);
                    });
            }
        });
    }

    public onResourcesLoaded() {
        Logger.getInstance().log("ZW-- dragonbone.onResourcesLoaded");
        this.scene.textures.off("onload", this.onResourcesLoaded, this, false);
        this.replaceDisplay();
    }

    private loadDragonbone() {
        const root = "assets/avatar/";
        const dbName = this.DRAGONBONENAME;
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
        this.mArmatureDisplay = this.scene.add.armature(this.DRAGONBONEARMATURENAME, this.DRAGONBONENAME);
        this.mArmatureDisplay.animation.play(this.mCurAnimationName);
        this.mArmatureDisplay.scale = 2;
        this.mArmatureDisplay.x = this.scene.scale.width >> 1;
        this.mArmatureDisplay.y = this.scene.scale.height - 30;
        this.add(this.mArmatureDisplay);

        this.reloadParts();
    }

    private setBaseSets(sets: IAvatarSet[]) {
        if (this.mBaseSets) this.mBaseSets = [];
        this.mBaseSets = sets;

        this.applySets(true);
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
        this.applySets();
    }

    private applySets(reset: boolean = false) {
        if (reset) {
            this.mParts = {};

            for (const part of this.ALLPARTS) {
                this.mParts[part] = null;
            }

            for (const set of this.mBaseSets) {
                for (const part of set.parts) {
                    this.mParts[part] = set;
                }
            }
        }
        for (const set of this.mSets) {
            for (const part of set.parts) {
                this.mParts[part] = set;
            }
        }
    }

    private removeSet(id: string) {
        const idx = this.mSets.findIndex((x) => x.id === id);
        if (idx >= 0) {
            this.mSets.splice(idx, 1);
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
            this.loadPart(resource, url.resolve(this.mWebHomePath, resource));
        }
        this.scene.load.once(Phaser.Loader.Events.COMPLETE, this.replaceDisplay, this);
        this.scene.load.start();
    }

    private replaceSlotDisplay(soltName: string, key: string) {
        if (!!this.mArmatureDisplay === false) return;
        const slot: dragonBones.Slot = this.mArmatureDisplay.armature.getSlot(`${soltName}`);
        if (!slot) return;
        if (!this.scene.textures.exists(key)) {
            const display = slot.display;
            if (display) display.setTexture(undefined);
            return;
        }
        slot.display = new dragonBones.phaser.display.SlotImage(
            this.scene,
            slot.display.x,
            slot.display.y,
            key
        );
    }

    private replaceDisplay(): Promise<boolean> {
        return new Promise((resolve, reject) => {
            Logger.getInstance().log("ZW-- replaceDisplay() mParts: ", this.mParts);
            const parts = this.mParts;
            let slotName = "";
            let uri = "";
            for (const partName in parts) {
                if (!parts.hasOwnProperty(partName)) {
                    continue;
                }
                slotName = this.slotName(partName, this.mCurDir + "");
                const avatarSet: IAvatarSet = parts[partName];
                if (avatarSet) {
                    uri = this.relativeUri(partName, avatarSet.id, this.mCurDir + "");
                } else {
                    uri = "";
                }
                this.replaceSlotDisplay(`${slotName}`, uri);
                Logger.getInstance().log("ZW-- replaceSlot() ", slotName, uri);
            }

            this.mArmatureDisplay.animation.play(this.mCurAnimationName);

            setTimeout(resolve, 100, true);
        });
    }

    private cleanUp() {
        for (const p of this.ALLPARTS) {
            this.replaceSlotDisplay(this.slotName(p, "1"), "");
            this.replaceSlotDisplay(this.slotName(p, "3"), "");
        }
    }

    private loadPart(key: string, path: string) {
        Logger.getInstance().log("ZW-- loadPart() ", key, path);
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
                if (set) {
                    // eyes mous 没有背面素材
                    if (dir === 1 && key === "head_eyes") {
                        // Do nothing
                    } else if (dir === 1 && key === "head_mous") {
                        // Do nothing
                    } else {
                        res.push(this.relativeUri(key, set.id, dir + ""));
                    }
                }
            }
        }

        // add model resources
        for (const set of this.MODELSETS) {
            for (const part of set.parts) {
                res.push(this.relativeUri(part, set.id, dir + ""));
            }
        }

        return res;
    }
    // 从部件ID转换为资源相对路径 同时也是TextureManager中的key
    private relativeUri(part: string, id: string, dir: string) {
        let _layer = null;
        let _part = part;
        if (part === "head_back") {
            _part = "head_hair";
            _layer = "back";
        } else if (part === "body_dres") {
            _part = "body_cost";
            _layer = "dres";
        }

        if (_layer) {
            return `/avatar/part/${_part}_${id}_${dir}_${_layer}.png`;
        }
        return `/avatar/part/${_part}_${id}_${dir}.png`;
    }
    // 部件名转换为插槽名
    private slotName(part: string, dir: string) {
        let _layer = null;
        let _part = part;
        if (part === "head_back") {
            _part = "head_hair";
            _layer = "back";
        } else if (part === "body_dres") {
            _part = "body_cost";
            _layer = "dres";
        }

        if (_layer) {
            return `${_part}_${dir}_${_layer}`;
        }
        return `${_part}_${dir}`;
    }

    private findPartSet(part: string, sets: IAvatarSet[]): IAvatarSet {
        for (const set of sets) {
            if (set.parts.includes(part)) {
                return set;
            }
        }

        return null;
    }
}
