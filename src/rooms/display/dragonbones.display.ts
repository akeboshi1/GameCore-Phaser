import { ResUtils } from "../../utils/resUtil";
import { ElementDisplay } from "./element.display";
import { IAvatar, IDragonbonesModel } from "./dragonbones.model";
import { DisplayObject } from "./display.object";
import { IRoomService } from "../room";
import { IElement } from "../element/element";
import { AnimationData } from "../element/sprite";
import { Logger } from "../../utils/log";

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
    Stalker = "stalker_$"
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
    Stalker = "stalker_#_$",
}

/**
 * 龙骨显示对象
 */
export class DragonbonesDisplay extends DisplayObject implements ElementDisplay {

    public mDisplayInfo: IDragonbonesModel | undefined;
    protected mAnimationName: string = "Armature";
    protected mDragonbonesName: string = "";
    protected mActionName: AnimationData;
    protected mArmatureDisplay: dragonBones.phaser.display.ArmatureDisplay | undefined;
    protected mFadeTween: Phaser.Tweens.Tween;
    private mPreDirection: number;
    private replaceArr = [];
    private mHasLoadMap: Map<string, any> = new Map();
    private mLoadMap: Map<string, any> = new Map();
    private mErrorLoadMap: Map<string, any> = new Map();

    /**
     * 龙骨显示对象包围框
     */
    private mClickCon: Phaser.GameObjects.Container;

    private mDragonBonesRenderTexture: Phaser.GameObjects.RenderTexture;

    public constructor(scene: Phaser.Scene, roomService: IRoomService, element?: IElement, antial: boolean = false) {
        super(scene, roomService, element, antial);
    }

    get spriteWidth(): number {
        if (this.mArmatureDisplay) {
            return this.mArmatureDisplay.width;
        }
        return 0;
    }

    get spriteHeight(): number {
        if (this.mArmatureDisplay) {
            return this.mArmatureDisplay.height;
        }
        return 0;
    }

    get GameObject(): DisplayObject {
        return this;
    }

    public changeAlpha(val?: number) {
        // this.alpha = val;
    }

    public load(display: IDragonbonesModel) {
        this.mDisplayInfo = display;
        this.mCollisionArea = [[1, 1], [1, 1]];
        this.mOriginPoint = new Phaser.Geom.Point(1, 1);
        if (!this.mDisplayInfo) return;
        this.dragonBonesName = "bones_human01"; // this.mDisplayInfo.avatar.id;
        if (this.scene.cache.obj.has(this.dragonBonesName)) { }
    }

    public getDisplay(): dragonBones.phaser.display.ArmatureDisplay | undefined {
        return this.mArmatureDisplay;
    }

    public play(val: AnimationData) {
        this.mActionName = val;
        if (this.mArmatureDisplay) {
            this.mArmatureDisplay.animation.play(val.animationName);
            this.mArmatureDisplay.scaleX = val.flip ? -1 : 1;
        }
    }

    public fadeIn(callback?: () => void) {
        this.clearFadeTween();
        this.alpha = 0;
        this.mFadeTween = this.scene.tweens.add({
            targets: this,
            alpha: 1,
            duration: 1200,
            onComplete: () => {
                if (callback) callback();
            }
        });
    }

    public fadeOut(callback?: () => void) {
        this.clearFadeTween();
        this.mFadeTween = this.scene.tweens.add({
            targets: this,
            alpha: 0,
            duration: 1200,
            onComplete: () => {
                if (callback) callback();
            }
        });
    }

    public destroy() {
        this.mDisplayInfo = null;
        if (this.mArmatureDisplay) {
            this.mArmatureDisplay.dispose(true);
            this.mArmatureDisplay = null;
        }
        if (this.mClickCon) {
            this.mClickCon.destroy(true);
            this.mClickCon = null;
        }

        if (this.mFadeTween) {
            this.clearFadeTween();
            this.mFadeTween = null;
        }
        super.destroy();
    }

    protected buildDragbones() {
        if (this.scene.cache.custom.dragonbone.get(this.mDragonbonesName)) {
            this.onLoadCompleteHandler();
        } else {
            const res = "./resources/dragonbones";
            const pngUrl = `${res}/${this.mDragonbonesName}_tex.png`;
            const jsonUrl = `${res}/${this.mDragonbonesName}_tex.json`;
            const dbbinUrl = `${res}/${this.mDragonbonesName}_ske.dbbin`;
            this.loadDragonBones(res, pngUrl, jsonUrl, dbbinUrl);
        }
    }

    protected onLoadCompleteHandler(loader?: any, totalComplete?: number, totalFailed?: number) {
        if (!this.scene) return;
        if (this.mArmatureDisplay) {
            this.mArmatureDisplay.dbClear();
        }
        this.mArmatureDisplay = this.scene.add.armature(
            this.mAnimationName,
            this.dragonBonesName,
        );
        this.mArmatureDisplay.visible = false;
        this.add(this.mArmatureDisplay);
        // ==========只有在创建龙骨时才会调用全部清除，显示通过后续通信做处理
        this.clearArmatureSlot();

        // ==========替换相应格位的display，服务端通信后可调用
        this.getReplaceArr();
        this.showReplaceArmatrue();

        // this.play("idle");
        this.mArmatureDisplay.x = this.baseLoc.x;
        this.mArmatureDisplay.y = this.baseLoc.y;
        const rect: Phaser.Geom.Rectangle = new Phaser.Geom.Rectangle(0, 0, 50, 70);

        if (!this.mClickCon) {
            this.mClickCon = this.scene.make.container(undefined, false);
            this.mClickCon.setInteractive(rect, Phaser.Geom.Rectangle.Contains);
            this.mClickCon.x = -rect.width >> 1;
            this.mClickCon.y = -rect.height;
        }
        this.setData("id", this.mDisplayInfo.id);
        this.add(this.mClickCon);
        this.emit("initialized");
    }

    private loadDragonBones(resUrl: string, pngUrl: string, jsonUrl: string, dbbinUrl: string) {
        this.scene.load.dragonbone(
            this.mDragonbonesName,
            pngUrl,
            jsonUrl,
            dbbinUrl,
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

    private clearArmatureSlot() {
        const slotList: dragonBones.Slot[] = this.mArmatureDisplay.armature.getSlots();
        slotList.forEach((slot: dragonBones.Slot) => {
            if (slot) slot.display.visible = false;
        });
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
        }
        if (this.mLoadMap && this.mLoadMap.size > 0) {
            this.startLoad();
        } else {
            this.refreshAvatar();
        }
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
        if (avater.stalkerId) {
            this.replaceArr.push({
                slot: AvatarSlotType.Stalker,
                part: AvatarSlotType.Stalker,
                dir: 3,
                skin: AvatarSlotType.Stalker
            });
            this.replaceArr.push({
                slot: AvatarSlotType.Stalker,
                part: AvatarSlotType.Stalker,
                dir: 1,
                skin: AvatarSlotType.Stalker
            });
        }
    }

    private replacePartDisplay(soltName: string, soltPart: string, soltDir: number, skin: number): void {
        const part: string = soltName.replace("$", soltDir.toString());
        const slot: dragonBones.Slot = this.mArmatureDisplay.armature.getSlot(part);
        const key = soltPart.replace("#", skin.toString()).replace("$", soltDir.toString());
        const dragonBonesTexture = this.scene.game.textures.get(this.mDragonbonesName);
        if (this.scene.cache.custom.dragonbone.get(this.dragonBonesName)) {
            const partName: string = ResUtils.getPartName(key);
            const frameName: string = "test resources/" + key;
            if (this.mErrorLoadMap.get(partName)) return;
            if (!this.scene.textures.exists(partName)) {
                if (!dragonBonesTexture.frames[frameName]) {
                    // ==============新资源需从外部加载，之后要重新打图集
                    this.mLoadMap.set(slot.name, [slot.name, key]);
                } else {
                    this.mHasLoadMap.set(key, this.scene.textures.get(partName));
                }
            } else {
                //     // ==============贴图集上的资源 / 单个替换资源
                // this.mHasLoadMap.set(slot.name,this.scene.textures.exists(partName));
                // let img: dragonBones.phaser.display.SlotImage;
                // if (dragonBonesTexture.frames[frameName]) {// && this.scene.game.textures.exists(this.mDisplayInfo.id + "")) {
                //     if (!this.scene.textures.exists(partName)) {
                //         this.mLoadMap.set(slot.name, [slot.name, key]);
                //         return;
                //     }
                //     img = new dragonBones.phaser.display.SlotImage(this.scene, slot.display.x, slot.display.y, partName);
                // } else {
                //     img = new dragonBones.phaser.display.SlotImage(this.scene, slot.display.x, slot.display.y, partName);
                // }
                // if (this.mAntial) {
                //     // 用于设置边缘抗锯齿
                //     img.texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
                // }
                // slot.replaceDisplay(img);
            }
        }
    }

    private startLoad() {
        const configList: Phaser.Types.Loader.FileTypes.ImageFileConfig[] = [];
        // ============只有check到新资源时才会重新load，否则直接从当前龙骨的贴图资源上，获取对应贴图
        this.scene.load.once(Phaser.Loader.Events.COMPLETE, (data, totalComplete: integer, totalFailed: integer) => {
            if (!configList || !this.scene) return;
            this.refreshAvatar();
            this.mLoadMap.clear();
        }, this);

        this.scene.load.once(Phaser.Loader.Events.FILE_LOAD_ERROR, (e: any) => {
            // ==============为了防止404资源重复请求加载，在加载失败后直接将其索引放置加载失败列表中，并从加载map中删除
            this.mLoadMap.delete(e.key);
            this.mErrorLoadMap.set(e.key, e);
        }, this);

        this.mLoadMap.forEach((data) => {
            const nextLoad: string[] = data;
            const partUrl: string = ResUtils.getPartUrl(nextLoad[1]);
            const partName: string = ResUtils.getPartName(nextLoad[1]);
            configList.push({ key: partName, url: partUrl });
        });
        this.scene.load.image(configList);
        this.scene.load.start();
    }

    private refreshAvatar() {
        const dragonBonesTexture: Phaser.Textures.Texture = this.scene.game.textures.get(this.mDragonbonesName);
        const frames = dragonBonesTexture.getFrameNames();
        // ==============重绘贴图方式
        // if (this.mLoadMap.size > 0) {
        const renderTextureKey = "bones_" + this.mDisplayInfo.id;// "bones_" + this.mDisplayInfo.id;// "bones_human01";
        const renderTexture = this.scene.textures.get(renderTextureKey);
        if (!this.mDragonBonesRenderTexture) this.mDragonBonesRenderTexture = this.scene.make.renderTexture(
            { x: 0, y: 0, width: dragonBonesTexture.source[0].width, height: dragonBonesTexture.source[0].height }, false);
        const checkID = 1;
        this.mDragonBonesRenderTexture.clear();
        this.scene.add.existing(this.mDragonBonesRenderTexture);
        for (let i: number = 0, len = frames.length; i < len; i++) {
            // =============龙骨贴图资源frames里面的key "test resources/xxxxx"
            const name = frames[i];
            // =============龙骨part资源key 带图片资源名及方向
            const key = name.split("/")[1].split("_");
            // =============front || back单独也有格位
            const slotKey = key[4] ? key[0] + "_" + key[1] + "_" + key[3] + "_" + key[4] : key[0] + "_" + key[1] + "_" + key[3];
            const slot: dragonBones.Slot = this.mArmatureDisplay.armature.getSlot(slotKey);
            const dat = dragonBonesTexture.get(name);
            const loadArr = this.mLoadMap.get(slotKey);
            // if (!this.mDragonBonesRenderTexture.frames) this.mDragonBonesRenderTexture.frames = {};
            // 原始资源
            if (!loadArr) {
                for (const obj of this.replaceArr) {
                    const tmpKey = obj.part.replace("#", obj.skin.toString()).replace("$", obj.dir.toString());
                    const partName: string = ResUtils.getPartName(tmpKey);
                    const frameName: string = "test resources/" + tmpKey;
                    const part: string = obj.slot.replace("$", obj.dir.toString());
                    if (part === slotKey) {
                        if (dragonBonesTexture.frames[frameName]) {
                            this.mDragonBonesRenderTexture.drawFrame(this.mDragonbonesName, name, dat.cutX, dat.cutY);
                            break;
                        } else {
                            const texture = this.scene.textures.get(frameName);
                            this.mDragonBonesRenderTexture.drawFrame(frameName, texture.firstFrame, dat.cutX, dat.cutY);
                            break;
                        }
                    }
                }
                // this.mDragonBonesRenderTexture.drawFrame(this.mDragonbonesName, name, dat.cutX, dat.cutY);
            } else {
                const drawTextureKey = loadArr[1] + "_png";
                const drawTexture = this.scene.game.textures.get(drawTextureKey);
                this.mDragonBonesRenderTexture.drawFrame(drawTextureKey, drawTexture.firstFrame, dat.cutX, dat.cutY);
            }
        }
        this.mDragonBonesRenderTexture.snapshotArea(0, 0, dragonBonesTexture.source[0].width, dragonBonesTexture.source[0].height, (snapshot: Phaser.Display.Color | HTMLImageElement) => {
            if (snapshot instanceof HTMLImageElement) {
                const changeTexture: Phaser.Textures.Texture = this.scene.game.textures.exists(renderTextureKey) ?
                    this.scene.textures.get(renderTextureKey) : this.scene.game.textures.create(renderTextureKey, snapshot, dragonBonesTexture.source[0].width, dragonBonesTexture.source[0].height);
                this.mArmatureDisplay.armature.replacedTexture = changeTexture;
            }
        });
        // }

        this.mArmatureDisplay.visible = true;
    }

    private clearFadeTween() {
        if (this.mFadeTween) {
            this.mFadeTween.stop();
            this.mFadeTween.remove();
        }
    }

    set dragonBonesName(val: string) {
        // if (this.mDragonbonesName !== val) {
        this.mDragonbonesName = val;
        this.buildDragbones();
        // }
    }

    get dragonBonesName(): string {
        return this.mDragonbonesName;
    }
}
