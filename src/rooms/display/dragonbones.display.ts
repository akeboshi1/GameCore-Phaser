import {ResUtils} from "../../utils/resUtil";
import {ElementDisplay} from "./element.display";
import {IAvatar, IDragonbonesModel} from "./dragonbones.model";
import {Logger} from "../../utils/log";
import {IFramesModel} from "./frames.model";

export enum AvatarSlotType {
    BodyCostDres = "body_cost_$_dres",
    BodyCost = "body_cost_$",
    BodyTail = "body_tail_$",
    BodyWing = "body_wing_$",
    BodyBase = "body_base_$",
    BodySpec = "body_spec_$",
    FlegSpec = "fleg_spec_$",
    FlegBase = "fleg_base_$",
    FlegCost = "fleg_cost_$",
    BarmSpec = "barm_spec_$",
    BarmBase = "barm_base_$",
    BarmCost = "barm_cost_$",
    WeapBarm = "weap_barm_$",
    ShldBarm = "shld_barm_$",
    BlegSpec = "bleg_spec_$",
    BlegBase = "bleg_base_$",
    BlegCost = "bleg_cost_$",
    FarmSpec = "farm_spec_$",
    FarmBase = "farm_base_$",
    FarmCost = "farm_cost_$",
    ShldFarm = "shld_farm_$",
    WeapFarm = "weap_farm_$",
    HeadSpec = "head_spec_$",
    HeadMask = "head_mask_$",
    HeadEyes = "head_eyes_$",
    HeadBase = "head_base_$",
    HeadHairBack = "head_hair_$_back",
    HeadMous = "head_mous_$",
    HeadHair = "head_hair_$",
    HeadHats = "head_hats_$",
}

export enum AvatarPartType {
    BarmBase = "barm_base_#_$",
    BarmCost = "barm_cost_#_$",
    BarmSpec = "barm_spec_#_$",
    BlegBase = "bleg_base_#_$",
    BlegCost = "bleg_cost_#_$",
    BlegSpec = "bleg_spec_#_$",
    BodyBase = "body_base_#_$",
    BodyCost = "body_cost_#_$",
    BodyCostDres = "body_cost_#_$_dres",
    BodySpec = "body_spec_#_$",
    BodyTail = "body_tail_#_$",
    BodyWing = "body_wing_#_$",
    FarmBase = "farm_base_#_$",
    FarmCost = "farm_cost_#_$",
    FarmSpec = "farm_spec_#_$",
    FlegBase = "fleg_base_#_$",
    FlegCost = "fleg_cost_#_$",
    FlegSpec = "fleg_spec_#_$",
    HeadBase = "head_base_#_$",
    HeadEyes = "head_eyes_#_$",
    HeadHair = "head_hair_#_$",
    HeadHairBack = "head_hair_#_$_back",
    HeadHats = "head_hats_#_$",
    HeadMask = "head_mask_#_$",
    HeadMous = "head_mous_#_$",
    HeadSpec = "head_spec_#_$",
    ShldFarm = "shld_farm_#_$",
    WeapFarm = "weap_farm_#_$",
    ShldBarm = "shld_barm_#_$",
    WeapBarm = "weap_barm_#_$",
}

/**
 * 龙骨显示对象
 */
export class DragonbonesDisplay extends Phaser.GameObjects.Container implements ElementDisplay {

    public mDisplayInfo: IDragonbonesModel | undefined;
    public frontEffDisplayInfo: IFramesModel;
    public backEffDisplayInfo: IFramesModel;
    protected mAnimationName: string = "Armature";
    protected mDragonbonesName: string = "";
    protected mActionName: string = "";
    protected mArmatureDisplay: dragonBones.phaser.display.ArmatureDisplay | undefined;
    private replaceArr = [];
    private misloading: boolean = false;
    private mloadingList: any[] = [];
    private mFrontEffSprite: Phaser.GameObjects.Sprite;
    private mBackEffSprite: Phaser.GameObjects.Sprite;
    private mBaseLoc = new Phaser.Geom.Point();

    /**
     * 龙骨显示对象包围框
     */
    private mClickCon: Phaser.GameObjects.Container;
    private mClickGraphics: Phaser.GameObjects.Graphics;

    constructor(protected scene: Phaser.Scene) {
        super(scene);
    }

    get GameObject(): Phaser.GameObjects.Container {
        return this;
    }

    public removeFromParent(): void {
        if (this.parentContainer) {
            this.parentContainer.remove(this);
        }
    }

    public load(display: IDragonbonesModel) {
        this.mDisplayInfo = display;
        if (!this.mDisplayInfo) return;
        this.dragonBonesName = "bones_human01"; // this.mDisplayInfo.avatar.id;
        if (this.scene.cache.obj.has(this.dragonBonesName)) { }
    }

    public loadEff(displayInfo: IFramesModel, isBack: boolean = false) {
        let loadDisplayInfo: IFramesModel;
        let effKey: string;
        loadDisplayInfo = displayInfo;
        if (!loadDisplayInfo) return;
        if (!isBack) {
            this.frontEffDisplayInfo = loadDisplayInfo;
            effKey = this.frontEffKey;
        } else {
            this.backEffDisplayInfo = loadDisplayInfo;
            effKey = this.backEffKey;
        }
        if (effKey) {
            if (this.scene.cache.obj.has(effKey)) {
                if (!isBack) {
                    this.onLoadFrontEffCompleteHandler();
                } else {
                    this.onLoadBackEffCompleteHandler();
                }
            } else {
                const display = loadDisplayInfo.display;
                if (display) {
                    this.scene.load.atlas(effKey, CONFIG.osd + display.texturePath, CONFIG.osd + display.dataPath);
                    if (!isBack) {
                        this.scene.load.once(Phaser.Loader.Events.COMPLETE, this.onLoadFrontEffCompleteHandler, this);
                    } else {
                        this.scene.load.once(Phaser.Loader.Events.COMPLETE, this.onLoadBackEffCompleteHandler, this);
                    }
                    this.scene.load.start();
                } else {
                    Logger.error("display is undefined");
                }
            }
        }
    }

    public getDisplay(): dragonBones.phaser.display.ArmatureDisplay | undefined {
        return this.mArmatureDisplay;
    }

    public play(val: string) {
        if (this.mActionName !== val) {
            let dir: number = this.mDisplayInfo !== undefined ? this.mDisplayInfo.avatarDir : 3;
            dir = dir !== 0 ? dir : 3;
            let trunDir: number;
            if (dir === 3 || dir === 5) {
                this.scaleX = -dir + 4;
                trunDir = 3;
            } else if (dir === 1 || dir === 7) {
                this.scaleX = -(1 / 3) * dir + (4 / 3);
                trunDir = 1;
            }
            this.mActionName = val + "_" + trunDir;
            if (this.mArmatureDisplay) {
                this.mArmatureDisplay.animation.play(this.mActionName);
            }
        }
    }

    public playFrontEff(animationName: string) {
        this.makeEffAnimations(animationName, false);
        this.mFrontEffSprite.on("animationcomplete", () => {
            this.mFrontEffSprite.destroy();
        });
        this.mFrontEffSprite.play(`${this.frontEffDisplayInfo.type}_${animationName}`);
    }

    public playBackEff(animationName: string) {
        this.makeEffAnimations(animationName, true);
        this.mBackEffSprite.on("animationcomplete", () => {
            this.mBackEffSprite.destroy();
        });
        this.mBackEffSprite.play(`${this.frontEffDisplayInfo.type}_${animationName}`);
    }

    public fadeIn() {
    }

    public fadeOut() {
    }

    public destroy() {
        this.mDisplayInfo = null;
        if (this.mArmatureDisplay) {
            this.mArmatureDisplay.dispose(true);
            this.mArmatureDisplay = null;
        }
        if (this.mClickGraphics) {
            this.mClickGraphics.clear();
            this.mClickGraphics.destroy(true);
            this.mClickGraphics = null;
        }
        if (this.mClickCon) {
            this.mClickCon.destroy(true);
            this.mClickCon = null;
        }
        super.destroy();
    }

    protected buildDragbones() {
        if (this.scene.cache.custom.dragonbone.get(this.mDragonbonesName)) {
            this.onLoadCompleteHandler();
        } else {
            const res = "resources/dragonbones";
            this.scene.load.dragonbone(
                this.mDragonbonesName,
                `${res}/${this.mDragonbonesName}_tex.png`,
                `${res}/${this.mDragonbonesName}_tex.json`,
                `${res}/${this.mDragonbonesName}_ske.dbbin`,
                null,
                null,
                { responseType: "arraybuffer" },
            );
            this.scene.load.once(
                Phaser.Loader.Events.COMPLETE,
                this.onLoadCompleteHandler,
                this,
            );
            this.scene.load.start();
        }
    }

    protected onLoadCompleteHandler(loader?: any, totalComplete?: number, totalFailed?: number) {
        if (this.mArmatureDisplay) {
            this.mArmatureDisplay.dbClear();
        }
        this.mArmatureDisplay = this.scene.add.armature(
            this.mAnimationName,
            this.dragonBonesName,
        );
        // ==========只有在创建龙骨时才会调用全部清除，显示通过后续通信做处理
        this.clearArmature();

        // ==========替换相应格位的display，服务端通信后可调用
        this.getReplaceArr();
        this.showReplaceArmatrue();

        // this.play("idle");
        this.mArmatureDisplay.x = this.mBaseLoc.x;
        this.mArmatureDisplay.y = this.mBaseLoc.y;
        this.add(this.mArmatureDisplay);
        const rect: Phaser.Geom.Rectangle = new Phaser.Geom.Rectangle(0, 0, 50, 70);
        if (!this.mClickGraphics) {

            this.mClickGraphics = this.scene.add.graphics();
            this.mClickGraphics.fillStyle(0xff0000);
            this.mClickGraphics.fillRectShape(rect);
            this.mClickGraphics.visible = false;
            this.add(this.mClickGraphics);
        }
        if (!this.mClickCon) {
            this.mClickCon = this.scene.add.container(0, 0, this.mClickGraphics);
            this.mClickCon.setInteractive(rect, Phaser.Geom.Rectangle.Contains);
            this.mClickCon.x = -rect.width >> 1;
            this.mClickCon.y = -rect.height;
        }
        this.mClickCon.setData("id", this.mDisplayInfo.id);
        this.add(this.mClickCon);
        this.emit("initialized");
    }

    private onLoadFrontEffCompleteHandler() {
        if (!this.mFrontEffSprite) {
            this.mFrontEffSprite = this.scene.make.sprite(undefined, false).setOrigin(0, 0);
            this.addAt(this.mFrontEffSprite, 2);
        } else {
            this.mFrontEffSprite.setTexture(this.frontEffKey);
        }
        this.playFrontEff(this.frontEffDisplayInfo.animationName);
        this.emit("frontEffinitialized");
    }

    private onLoadBackEffCompleteHandler() {
        if (!this.mBackEffSprite) {
            this.mBackEffSprite = this.scene.make.sprite(undefined, false).setOrigin(0, 0);
            this.addAt(this.mBackEffSprite, 0);
        } else {
            this.mBackEffSprite.setTexture(this.backEffKey);
        }
        this.playBackEff(this.backEffDisplayInfo.animationName);
        this.emit("backEffinitialized");
    }

    private clearArmature() {
        // const conList: Phaser.GameObjects.GameObject[] = this.mArmatureDisplay.getAll();
        // const len1: number = conList.length;
        // for (let j: number = 0; j < len1; j++) {
        //     const obj: Phaser.GameObjects.GameObject = conList[j];
        //     obj.setInteractive({ pixelPerfect: true });
        //     obj.on("pointerdown", () => {
        //         console.log("dragonBones" + j);
        //     });
        // }
        const slotList: dragonBones.Slot[] = this.mArmatureDisplay.armature.getSlots();
        const len: number = slotList.length;
        for (let i: number = 0; i < len; i++) {
            const slot: dragonBones.Slot = slotList[i];
            Logger.log(i + ":" + slot.display.frame.name);
            slot.display.visible = false;
            // slot.replaceDisplay(null);
        }
    }

    private clearReplaceArmature() {
        this.mArmatureDisplay.armature.animation.stop();
        if (!this.replaceArr || this.replaceArr.length === 0) {
            return;
        }
        const len = this.replaceArr.length;
        for (let i = 0; i < len; i++) {
            const part: string = this.replaceArr[i].slot.replace("$", this.replaceArr[i].dir.toString());
            const slot: dragonBones.Slot = this.mArmatureDisplay.armature.getSlot(part);

            slot.replaceDisplay(null);
        }

    }

    private showReplaceArmatrue() {
        for (const obj of this.replaceArr) {
            this.replacePartDisplay(obj.slot, obj.part, obj.dir, obj.skin);
            const part: string = obj.slot.replace("$", obj.dir.toString());
            Logger.log(part);
        }
        this.replaceArr.splice(0);
    }

    private getReplaceArr() {
        this.replaceArr.length = 0;
        const avater: IAvatar = this.mDisplayInfo.avatar;
        if (avater.bodyBaseId) {
            this.replaceArr.push({
                slot: AvatarSlotType.BodyBase,
                part: AvatarPartType.BodyBase,
                dir: 3,
                skin: avater.bodyBaseId,
            });
            this.replaceArr.push({
                slot: AvatarSlotType.BodyBase,
                part: AvatarPartType.BodyBase,
                dir: 1,
                skin: avater.bodyBaseId,
            });
        }

        if (avater.bodySpecId) {
            this.replaceArr.push({
                slot: AvatarSlotType.BodySpec,
                part: AvatarPartType.BodySpec,
                dir: 3,
                skin: avater.bodySpecId,
            });
            this.replaceArr.push({
                slot: AvatarSlotType.BodySpec,
                part: AvatarPartType.BodySpec,
                dir: 1,
                skin: avater.bodySpecId,
            });
        }

        if (avater.bodyWingId) {
            this.replaceArr.push({
                slot: AvatarSlotType.BodyWing,
                part: AvatarPartType.BodyWing,
                dir: 3,
                skin: avater.bodyWingId,
            });
            this.replaceArr.push({
                slot: AvatarSlotType.BodyWing,
                part: AvatarPartType.BodyWing,
                dir: 1,
                skin: avater.bodyWingId,
            });
        }

        if (avater.bodyTailId) {
            this.replaceArr.push({
                slot: AvatarSlotType.BodyTail,
                part: AvatarPartType.BodyTail,
                dir: 3,
                skin: avater.bodyTailId,
            });
            this.replaceArr.push({
                slot: AvatarSlotType.BodyTail,
                part: AvatarPartType.BodyTail,
                dir: 1,
                skin: avater.bodyTailId,
            });
        }

        if (avater.bodyCostId) {
            this.replaceArr.push({
                slot: AvatarSlotType.BodyCost,
                part: AvatarPartType.BodyCost,
                dir: 3,
                skin: avater.bodyCostId,
            });
            this.replaceArr.push({
                slot: AvatarSlotType.BodyCost,
                part: AvatarPartType.BodyCost,
                dir: 1,
                skin: avater.bodyCostId,
            });
            this.replaceArr.push({
                slot: AvatarSlotType.BodyCostDres,
                part: AvatarPartType.BodyCostDres,
                dir: 3,
                skin: avater.bodyCostId,
            });
            this.replaceArr.push({
                slot: AvatarSlotType.BodyCostDres,
                part: AvatarPartType.BodyCostDres,
                dir: 1,
                skin: avater.bodyCostId,
            });
        }

        if (avater.farmBaseId) {
            this.replaceArr.push({
                slot: AvatarSlotType.FarmBase,
                part: AvatarPartType.FarmBase,
                dir: 3,
                skin: avater.farmBaseId,
            });
            this.replaceArr.push({
                slot: AvatarSlotType.FarmBase,
                part: AvatarPartType.FarmBase,
                dir: 1,
                skin: avater.farmBaseId,
            });
        }

        if (avater.farmSpecId) {
            this.replaceArr.push({
                slot: AvatarSlotType.FarmSpec,
                part: AvatarPartType.FarmSpec,
                dir: 3,
                skin: avater.farmSpecId,
            });
            this.replaceArr.push({
                slot: AvatarSlotType.FarmSpec,
                part: AvatarPartType.FarmSpec,
                dir: 1,
                skin: avater.farmSpecId,
            });
        }

        if (avater.farmCostId) {
            this.replaceArr.push({
                slot: AvatarSlotType.FarmCost,
                part: AvatarPartType.FarmCost,
                dir: 3,
                skin: avater.farmCostId,
            });
            this.replaceArr.push({
                slot: AvatarSlotType.FarmCost,
                part: AvatarPartType.FarmCost,
                dir: 1,
                skin: avater.farmCostId,
            });
        }

        if (avater.barmBaseId) {
            this.replaceArr.push({
                slot: AvatarSlotType.BarmBase,
                part: AvatarPartType.BarmBase,
                dir: 3,
                skin: avater.barmBaseId,
            });
            this.replaceArr.push({
                slot: AvatarSlotType.BarmBase,
                part: AvatarPartType.BarmBase,
                dir: 1,
                skin: avater.barmBaseId,
            });
        }

        if (avater.barmSpecId) {
            this.replaceArr.push({
                slot: AvatarSlotType.BarmSpec,
                part: AvatarPartType.BarmSpec,
                dir: 3,
                skin: avater.barmSpecId,
            });
            this.replaceArr.push({
                slot: AvatarSlotType.BarmSpec,
                part: AvatarPartType.BarmSpec,
                dir: 1,
                skin: avater.barmSpecId,
            });
        }

        if (avater.barmCostId) {
            this.replaceArr.push({
                slot: AvatarSlotType.BarmCost,
                part: AvatarPartType.BarmCost,
                dir: 3,
                skin: avater.barmCostId,
            });
            this.replaceArr.push({
                slot: AvatarSlotType.BarmCost,
                part: AvatarPartType.BarmCost,
                dir: 1,
                skin: avater.barmCostId,
            });
        }

        if (avater.blegBaseId) {
            this.replaceArr.push({
                slot: AvatarSlotType.BlegBase,
                part: AvatarPartType.BlegBase,
                dir: 3,
                skin: avater.blegBaseId,
            });
            this.replaceArr.push({
                slot: AvatarSlotType.BlegBase,
                part: AvatarPartType.BlegBase,
                dir: 1,
                skin: avater.blegBaseId,
            });
        }

        if (avater.blegSpecId) {
            this.replaceArr.push({
                slot: AvatarSlotType.BlegSpec,
                part: AvatarPartType.BlegSpec,
                dir: 3,
                skin: avater.blegSpecId,
            });
            this.replaceArr.push({
                slot: AvatarSlotType.BlegSpec,
                part: AvatarPartType.BlegSpec,
                dir: 1,
                skin: avater.blegSpecId,
            });
        }

        if (avater.blegCostId) {
            this.replaceArr.push({
                slot: AvatarSlotType.BlegCost,
                part: AvatarPartType.BlegCost,
                dir: 3,
                skin: avater.blegCostId,
            });
            this.replaceArr.push({
                slot: AvatarSlotType.BlegCost,
                part: AvatarPartType.BlegCost,
                dir: 1,
                skin: avater.blegCostId,
            });
        }

        if (avater.flegBaseId) {
            this.replaceArr.push({
                slot: AvatarSlotType.FlegBase,
                part: AvatarPartType.FlegBase,
                dir: 3,
                skin: avater.flegBaseId,
            });
            this.replaceArr.push({
                slot: AvatarSlotType.FlegBase,
                part: AvatarPartType.FlegBase,
                dir: 1,
                skin: avater.flegBaseId,
            });
        }

        if (avater.flegSpecId) {
            this.replaceArr.push({
                slot: AvatarSlotType.FlegSpec,
                part: AvatarPartType.FlegSpec,
                dir: 3,
                skin: avater.flegSpecId,
            });
            this.replaceArr.push({
                slot: AvatarSlotType.FlegSpec,
                part: AvatarPartType.FlegSpec,
                dir: 1,
                skin: avater.flegSpecId,
            });
        }

        if (avater.flegCostId) {
            this.replaceArr.push({
                slot: AvatarSlotType.FlegCost,
                part: AvatarPartType.FlegCost,
                dir: 3,
                skin: avater.flegCostId,
            });
            this.replaceArr.push({
                slot: AvatarSlotType.FlegCost,
                part: AvatarPartType.FlegCost,
                dir: 1,
                skin: avater.flegCostId,
            });
        }

        if (avater.headBaseId) {
            this.replaceArr.push({
                slot: AvatarSlotType.HeadBase,
                part: AvatarPartType.HeadBase,
                dir: 3,
                skin: avater.headBaseId,
            });
            this.replaceArr.push({
                slot: AvatarSlotType.HeadBase,
                part: AvatarPartType.HeadBase,
                dir: 1,
                skin: avater.headBaseId,
            });
        }
        if (avater.barmWeapId) {
            this.replaceArr.push({
                slot: AvatarSlotType.WeapBarm,
                part: AvatarPartType.WeapBarm,
                dir: 3,
                skin: avater.barmWeapId,
            });
            this.replaceArr.push({
                slot: AvatarSlotType.WeapBarm,
                part: AvatarPartType.WeapBarm,
                dir: 1,
                skin: avater.barmWeapId,
            });
        }

        if (avater.headHairId) {
            this.replaceArr.push({
                slot: AvatarSlotType.HeadHair,
                part: AvatarPartType.HeadHair,
                dir: 3,
                skin: avater.headHairId,
            });
            this.replaceArr.push({
                slot: AvatarSlotType.HeadHair,
                part: AvatarPartType.HeadHair,
                dir: 1,
                skin: avater.headHairId,
            });
            this.replaceArr.push({
                slot: AvatarSlotType.HeadHairBack,
                part: AvatarPartType.HeadHairBack,
                dir: 3,
                skin: avater.headHairId,
            });
            this.replaceArr.push({
                slot: AvatarSlotType.HeadHairBack,
                part: AvatarPartType.HeadHairBack,
                dir: 1,
                skin: avater.headHairId,
            });
        }

        if (avater.headHatsId) {
            this.replaceArr.push({
                slot: AvatarSlotType.HeadHats,
                part: AvatarPartType.HeadHats,
                dir: 3,
                skin: avater.headHatsId,
            });
            this.replaceArr.push({
                slot: AvatarSlotType.HeadHats,
                part: AvatarPartType.HeadHats,
                dir: 1,
                skin: avater.headHatsId,
            });
        }

        if (avater.headSpecId) {
            this.replaceArr.push({
                slot: AvatarSlotType.HeadSpec,
                part: AvatarPartType.HeadSpec,
                dir: 3,
                skin: avater.headSpecId,
            });
            this.replaceArr.push({
                slot: AvatarSlotType.HeadSpec,
                part: AvatarPartType.HeadSpec,
                dir: 1,
                skin: avater.headSpecId,
            });
        }

        if (avater.headEyesId) {
            this.replaceArr.push({
                slot: AvatarSlotType.HeadEyes,
                part: AvatarPartType.HeadEyes,
                dir: 3,
                skin: avater.headEyesId,
            });
        }

        if (avater.headMousId) {
            this.replaceArr.push({
                slot: AvatarSlotType.HeadMous,
                part: AvatarPartType.HeadMous,
                dir: 3,
                skin: avater.headMousId,
            });
        }

        if (avater.headMaskId) {
            this.replaceArr.push({
                slot: AvatarSlotType.HeadMask,
                part: AvatarPartType.HeadMask,
                dir: 3,
                skin: avater.headMaskId,
            });
        }

        if (avater.farmShldId) {
            this.replaceArr.push({
                slot: AvatarSlotType.ShldFarm,
                part: AvatarPartType.ShldFarm,
                dir: 3,
                skin: avater.farmShldId,
            });
            this.replaceArr.push({
                slot: AvatarSlotType.ShldFarm,
                part: AvatarPartType.ShldFarm,
                dir: 1,
                skin: avater.farmShldId,
            });
            this.replaceArr.push({
                slot: AvatarSlotType.ShldBarm,
                part: AvatarPartType.ShldBarm,
                dir: 3,
                skin: avater.farmShldId,
            });
            this.replaceArr.push({
                slot: AvatarSlotType.ShldBarm,
                part: AvatarPartType.ShldBarm,
                dir: 1,
                skin: avater.farmShldId,
            });
        }

        if (avater.farmWeapId) {
            this.replaceArr.push({
                slot: AvatarSlotType.WeapFarm,
                part: AvatarPartType.WeapFarm,
                dir: 3,
                skin: avater.farmWeapId,
            });
            this.replaceArr.push({
                slot: AvatarSlotType.WeapFarm,
                part: AvatarPartType.WeapFarm,
                dir: 1,
                skin: avater.farmWeapId,
            });
            this.replaceArr.push({
                slot: AvatarSlotType.WeapBarm,
                part: AvatarPartType.WeapBarm,
                dir: 3,
                skin: avater.farmWeapId,
            });
            this.replaceArr.push({
                slot: AvatarSlotType.WeapBarm,
                part: AvatarPartType.WeapBarm,
                dir: 1,
                skin: avater.farmWeapId,
            });
        }
    }

    private replacePartDisplay(soltName: string, soltPart: string, soltDir: number, skin: number): void {
        const part: string = soltName.replace("$", soltDir.toString());
        const slot: dragonBones.Slot = this.mArmatureDisplay.armature.getSlot(part);
        const key = soltPart.replace("#", skin.toString()).replace("$", soltDir.toString());
        if (this.scene.cache.custom.dragonbone.get(this.dragonBonesName)) {
            const partName: string = ResUtils.getPartName(key);
            if (!this.scene.game.cache.obj.has(partName)) {
                this.mloadingList.push([slot.name, key]);
                if (!this.misloading) {
                    this.misloading = true;
                    this.startLoad();
                }
            } else {
                const resKey: string = ResUtils.getPartName(key);
                const img: dragonBones.phaser.display.SlotImage = new dragonBones.phaser.display.SlotImage(this.scene, 0, 0, resKey);
                slot.replaceDisplay(img);
            }
        }
    }

    private startLoad() {
        const nextLoad: string[] = this.mloadingList.shift();
        if (nextLoad) {
            const partUrl: string = ResUtils.getPartUrl(nextLoad[1]);
            const partName: string = ResUtils.getPartName(nextLoad[1]);
            const resKey: string = nextLoad[1];
            this.scene.load.once(Phaser.Loader.Events.COMPLETE, (loader: Phaser.Loader.LoaderPlugin, totalComplete: integer, totalFailed: integer) => {
                const name: string = ResUtils.getPartName(nextLoad[1]);
                const slot: dragonBones.Slot = this.mArmatureDisplay.armature.getSlot(nextLoad[0]);
                const img: dragonBones.phaser.display.SlotImage = new dragonBones.phaser.display.SlotImage(this.scene, 0, 0, name);
                if (img.texture.key === name) {
                    slot.replaceDisplay(img);
                    Logger.log("success:" + resKey);
                }
                this.misloading = false;
                this.startLoad();
            }, this);
            this.scene.load.once(Phaser.Loader.Events.FILE_LOAD_ERROR, (e: Event) => {
                this.misloading = false;
                this.startLoad();
                Logger.log("fail:" + nextLoad[1]);
            }, this);
            this.scene.load.image(partName, partUrl);
            this.scene.load.start();
        } else {
            this.misloading = false;
            Logger.log("load complete");
        }
    }
    private makeEffAnimations(name: string, isBack: boolean = false) {
        let displayInfo: IFramesModel;
        if (isBack) {
            displayInfo = this.frontEffDisplayInfo;
        } else {
            displayInfo = this.backEffDisplayInfo;
        }
        if (displayInfo) {
            const animations = displayInfo.animations;
            const resKey = isBack ? this.frontEffKey : this.backEffKey;
            const animation = animations.find((ani) => {
                return ani.name === name;
            });
            if (!animation) {
                return;
            }
            const frames = [];
            animation.frameName.forEach((frame) => {
                frames.push({ key: resKey, frame });
            });
            const config: Phaser.Types.Animations.Animation = {
                key: displayInfo.type + "_" + animation.name,
                frames,
                frameRate: animation.frameRate,
                repeat: -1,
            };
            this.scene.anims.create(config);
            // }
        }
    }

    set dragonBonesName(val: string) {
        if (this.mDragonbonesName !== val) {
            this.mDragonbonesName = val;
            this.buildDragbones();
        }
    }

    get dragonBonesName(): string {
        return this.mDragonbonesName;
    }

    get baseLoc(): Phaser.Geom.Point {
        return this.mBaseLoc;
    }
    get frontEffKey(): string | undefined {
        if (!this.frontEffDisplayInfo) {
            return;
        }
        const display = this.frontEffDisplayInfo.display;
        if (display && display.texturePath && display.dataPath) {
            return display.texturePath + display.dataPath;
        }
    }

    get backEffKey(): string | undefined {
        if (!this.backEffDisplayInfo) {
            return;
        }
        const display = this.backEffDisplayInfo.display;
        if (display && display.texturePath && display.dataPath) {
            return display.texturePath + display.dataPath;
        }
    }
}
