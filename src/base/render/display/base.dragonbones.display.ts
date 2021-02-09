import { Logger, ResUtils, Url, ValueResolver } from "utils";
import { IAvatar, IDragonbonesModel, RunningAnimation, SlotSkin } from "structure";
import { BaseDisplay } from "./base.display";

export enum AvatarSlotType {
    BodyCostDres = "body_cost_dres_$",
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
    BarmWeap = "barm_weap_$",
    ShldBarm = "barm_shld_$",
    BlegSpec = "bleg_spec_$",
    BlegBase = "bleg_base_$",
    BlegCost = "bleg_cost_$",
    FarmSpec = "farm_spec_$",
    FarmBase = "farm_base_$",
    FarmCost = "farm_cost_$",
    ShldFarm = "farm_shld_$",
    FarmWeap = "farm_weap_$",
    HeadSpec = "head_spec_$",
    HeadMask = "head_mask_$",
    HeadEyes = "head_eyes_$",
    HeadBase = "head_base_$",
    HeadHairBack = "head_hair_back_$",
    HeadMous = "head_mous_$",
    HeadHair = "head_hair_$",
    HeadHats = "head_hats_$",
    HeadFace = "head_face_$"
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
    BodyCostDres = "body_cost_dres_#_$",
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
    HeadHairBack = "head_hair_back_#_$",
    HeadHats = "head_hats_#_$",
    HeadFace = "head_face_#_$",
    HeadMask = "head_mask_#_$",
    HeadMous = "head_mous_#_$",
    HeadSpec = "head_spec_#_$",
    ShldFarm = "farm_shld_#_$",
    WeapFarm = "farm_weap_#_$",
    ShldBarm = "barm_shld_#_$",
    WeapBarm = "barm_weap_#_$",
}

/**
 * 龙骨显示对象
 */
export class BaseDragonbonesDisplay extends BaseDisplay {
    protected mArmatureName: string = "Armature";
    protected mResourceName: string = "bones_human01";
    protected mArmatureDisplay: dragonBones.phaser.display.ArmatureDisplay | undefined;
    protected mFadeTween: Phaser.Tweens.Tween;
    protected mInteractive: boolean = true;
    /***
     * 是否合图 & 单图替换
     */
    protected isRenderTexture: boolean = false;
    protected mPlaceholder: Phaser.GameObjects.Image;
    private replaceArr = [];
    private mHasLoadMap: Map<string, any> = new Map();
    private mLoadMap: Map<string, any> = new Map();
    private mErrorLoadMap: Map<string, any> = new Map();
    private mNeedReplaceTexture: boolean = false;
    private mBoardPoint: Phaser.Geom.Point;
    private readonly UNPACKSLOTS = [AvatarSlotType.FarmWeap, AvatarSlotType.BarmWeap];
    private readonly UNCHECKAVATARPROPERTY = ["id", "dirable", "farmWeapId", "barmWeapId"];
    private mReplaceTexTimeOutID = null;

    /**
     * 龙骨显示对象包围框
     */
    private mClickCon: Phaser.GameObjects.Container;

    private mPreReplaceTextureKey: string = "";
    private mReplaceTextureKey: string = "";
    private mTmpIndex: number = 0;

    public constructor(scene: Phaser.Scene) {
        super(scene);
        this.scene.textures.on("onload", this.onLoadFunc, this);
    }

    public set displayInfo(val: IDragonbonesModel | undefined) {
        if (this.mNeedReplaceTexture === false) {
            this.mNeedReplaceTexture = this.checkNeedReplaceTexture(this.mDisplayInfo, val);
        }
        this.mDisplayInfo = val;
    }

    public get displayInfo(): IDragonbonesModel | undefined {
        return this.mDisplayInfo;
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

    get topPoint(): Phaser.Geom.Point {
        return this.mBoardPoint;
    }

    // 改变装扮接口
    public load(display: IDragonbonesModel): Promise<any> {
        this.displayInfo = <IDragonbonesModel>display;
        if (!this.displayInfo) return Promise.reject("displayInfo error");
        this.mLoadDisplayPromise = new ValueResolver<any>();
        return this.mLoadDisplayPromise.promise(() => {
            this.buildDragbones();
        });
    }

    public getDisplay(): dragonBones.phaser.display.ArmatureDisplay | undefined {
        return this.mArmatureDisplay;
    }

    public play(val: RunningAnimation) {
        this.mAnimation = val;
        Logger.getInstance().debug("dragonbones play ====>", val);
        if (this.mArmatureDisplay) {
            if (this.mArmatureDisplay.hasDBEventListener(dragonBones.EventObject.LOOP_COMPLETE)) {
                this.mArmatureDisplay.removeDBEventListener(dragonBones.EventObject.LOOP_COMPLETE, this.onArmatureLoopComplete, this);
            }
            if (val.playingQueue && (val.playingQueue.playTimes && val.playingQueue.playTimes > 0)) {
                this.mArmatureDisplay.addDBEventListener(dragonBones.EventObject.LOOP_COMPLETE, this.onArmatureLoopComplete, this);
            }
            this.mArmatureDisplay.animation.play(val.name, val.times);
            this.mArmatureDisplay.scaleX = val.flip ? -1 : 1;
        }
        super.play(val);
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
        if (this.scene) this.scene.textures.off("onload", this.onLoadFunc, this, false);
        // this.displayInfo = null;
        this.mDisplayInfo = null;
        this.mNeedReplaceTexture = false;
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

        if (this.mReplaceTexTimeOutID) {
            clearTimeout(this.mReplaceTexTimeOutID);
            this.mReplaceTexTimeOutID = null;
        }
        // if (this.scene) {
        //     if (this.scene.textures.exists(this.mReplaceTextureKey)) {
        //         this.scene.textures.remove(this.mReplaceTextureKey);
        //         this.scene.textures.removeKey(this.mReplaceTextureKey);
        //     }
        // }

        super.destroy();
    }

    public setClickInteractive(active: boolean) {
        this.mInteractive = active;
        if (active) {
            const rect: Phaser.Geom.Rectangle = new Phaser.Geom.Rectangle(0, 0, 50, 70);
            if (!this.mClickCon) {
                this.mClickCon = this.scene.make.container(undefined, false);
                this.mClickCon.setInteractive(rect, Phaser.Geom.Rectangle.Contains);
                this.mClickCon.x = -rect.width >> 1;
                this.mClickCon.y = -rect.height;
            }
        } else {
            if (this.mClickCon) this.mClickCon.destroy();
        }
    }

    public set resourceName(val: string) {
        this.mResourceName = val;
    }

    public get resourceName(): string {
        return this.mResourceName;
    }

    protected buildDragbones() {
        if (!this.scene.cache.custom.dragonbone) return;
        if (this.scene.cache.custom.dragonbone.get(this.resourceName)) {
            this.createArmatureDisplay();
        } else {
            const res = `${this.localResourceRoot}dragonbones`;
            const pngUrl = `${res}/${this.resourceName}_tex.png`;
            const jsonUrl = `${res}/${this.resourceName}_tex.json`;
            const dbbinUrl = `${res}/${this.resourceName}_ske.dbbin`;
            this.loadDragonBones(pngUrl, jsonUrl, dbbinUrl);
        }
    }

    protected get localResourceRoot(): string {
        return Url.RES_PATH;
    }

    // TODO: 游戏中截图会出现404，待解决
    protected getPartLoadUrl(val: string): string {
        return ResUtils.getPartUrl(val);
    }

    protected getPartLoadKey(val: string): string {
        return ResUtils.getPartName(val);
    }

    protected generateReplaceTextureKey() {
        return "bones_" + this.displayInfo.id + this.mTmpIndex;
    }

    protected createArmatureDisplay(loader?: any, totalComplete?: number, totalFailed?: number) {
        if (!this.scene) return;
        this.showPlaceholder();
        if (!this.mArmatureDisplay) {
            this.mArmatureDisplay = this.scene.add.armature(
                this.mArmatureName,
                this.resourceName,
            );
            this.mArmatureDisplay.visible = false;
            this.addAt(this.mArmatureDisplay, 0);

            // for (const slot of this.mArmatureDisplay.armature.getSlots()) {
            //     Logger.getInstance().log(this.mBonesName + "'s slot: ", slot.name);
            // }
            const bound = this.mArmatureDisplay.armature.getBone("board");
            if (bound) {
                this.mBoardPoint = new Phaser.Geom.Point(bound.global.x, bound.global.y);
            } else {
                this.mBoardPoint = new Phaser.Geom.Point(35, 40);
            }
        } else {
            this.mArmatureDisplay.visible = false;
        }
        this.mArmatureDisplay.removeDBEventListener(dragonBones.EventObject.SOUND_EVENT, this.onSoundEventHandler, this);
        this.mArmatureDisplay.addDBEventListener(dragonBones.EventObject.SOUND_EVENT, this.onSoundEventHandler, this);

        // ==========只有在创建龙骨时才会调用全部清除，显示通过后续通信做处理
        if (!this.isRenderTexture) this.clearArmatureSlot();
        // ==========替换相应格位的display，服务端通信后可调用
        this.getReplaceArr();
        this.showReplaceArmatrue();

        // this.play("idle");
        // this.mArmatureDisplay.x = this.baseLoc.x;
        // this.mArmatureDisplay.y = this.baseLoc.y;
        const rect: Phaser.Geom.Rectangle = new Phaser.Geom.Rectangle(0, 0, 50, 70);
        if (this.mInteractive) {
            if (!this.mClickCon) {
                this.mClickCon = this.scene.make.container(undefined, false);
                this.mClickCon.setInteractive(rect, Phaser.Geom.Rectangle.Contains);
                this.mClickCon.x = -rect.width >> 1;
                this.mClickCon.y = -rect.height;
            }
            this.mClickCon.setData("id", this.displayInfo.id);
            this.add(this.mClickCon);
        }
        this.setData("id", this.displayInfo.id);
        this.displayCreated();
    }

    protected onArmatureLoopComplete(event: dragonBones.EventObject) {
        if (!this.mArmatureDisplay || !this.mAnimation) {
            return;
        }
        const queue = this.mAnimation.playingQueue;
        if (queue.playedTimes === undefined) {
            queue.playedTimes = 1;
        } else {
            queue.playedTimes++;
        }
        const times = queue.playTimes === undefined ? -1 : queue.playTimes;
        if (queue.playedTimes >= times && times > 0) {
            this.mArmatureDisplay.removeDBEventListener(dragonBones.EventObject.LOOP_COMPLETE, this.onArmatureLoopComplete, this);
            // this.emit("animationComplete");
        }
    }

    protected clearArmatureSlot() {
        const slotList: dragonBones.Slot[] = this.mArmatureDisplay.armature.getSlots();
        slotList.forEach((slot: dragonBones.Slot) => {
            if (slot) slot.display.visible = false;
        });
    }

    protected loadCompleteHander() {
        this.closePlaceholder();
    }

    protected showPlaceholder() {
        if (this.mPlaceholder) {
            this.mPlaceholder.destroy();
        }
        this.mPlaceholder = this.scene.make.image({ key: "avatar_placeholder", x: -22, y: -68 }).setOrigin(0);
        this.add(this.mPlaceholder);
    }

    protected closePlaceholder() {
        if (this.mPlaceholder) {
            this.mPlaceholder.destroy();
        }
        this.mPlaceholder = undefined;
    }

    protected loadDragonBones(pngUrl: string, jsonUrl: string, dbbinUrl: string) {
        this.scene.load.dragonbone(
            this.resourceName,
            pngUrl,
            jsonUrl,
            dbbinUrl,
            null,
            null,
            { responseType: "arraybuffer" }
        );
        this.scene.load.once(Phaser.Loader.Events.COMPLETE, this.createArmatureDisplay, this);
        this.scene.load.start();
    }

    protected refreshAvatar() {
        this.clearArmatureSlot();
        const dragonBonesTexture: Phaser.Textures.Texture = this.scene.game.textures.get(this.resourceName);
        for (const rep of this.replaceArr) {
            const part: string = rep.slot.replace("$", rep.dir.toString());
            const slot: dragonBones.Slot = this.mArmatureDisplay.armature.getSlot(part);
            if (!slot) continue;
            const skin = this.formattingSkin(rep.skin);
            const key = rep.part.replace("#", skin.sn.toString()).replace("$", rep.dir.toString()) + skin.version;
            const partName: string = this.getPartLoadKey(key);
            const frameName: string = "test resources/" + key;
            if (this.UNPACKSLOTS.indexOf(rep.slot) < 0) {
                slot.display.visible = this.scene.textures.exists(partName) || dragonBonesTexture.frames[frameName];
                continue;
            }
            if (this.scene.textures.exists(partName)) {
                const img = new dragonBones.phaser.display.SlotImage(this.scene, slot.display.x, slot.display.y, partName);
                // slot.replaceDisplay(img);
                slot.display = img;
            }
        }
        // 单图加载替换
        if (!this.isRenderTexture) {
        } else {
            if (this.mNeedReplaceTexture) {
                this.mNeedReplaceTexture = false;
                const frames = dragonBonesTexture.getFrameNames();
                // ==============重绘贴图方式
                this.mTmpIndex++;
                this.mPreReplaceTextureKey = this.mReplaceTextureKey;
                this.mReplaceTextureKey = this.generateReplaceTextureKey();
                const canvas = this.scene.textures.createCanvas(this.mReplaceTextureKey + "_canvas", dragonBonesTexture.source[0].width, dragonBonesTexture.source[0].height);
                for (let i: number = 0, len = frames.length; i < len; i++) {
                    // =============龙骨贴图资源frames里面的key "test resources/xxxxx"
                    const name = frames[i];
                    // =============龙骨part资源key 带图片资源名及方向
                    const key = name.split("/")[1].split("_");
                    // =============front || back单独也有格位
                    const slotKey = key[4] ? key[0] + "_" + key[1] + "_" + key[2] + "_" + key[4] : key[0] + "_" + key[1] + "_" + key[3];
                    const slot: dragonBones.Slot = this.mArmatureDisplay.armature.getSlot(slotKey);
                    if (!slot) Logger.getInstance().warn("dragonbonesDisplay, get slot error: ", slotKey, slot);
                    const dat = dragonBonesTexture.get(name);
                    const loadArr = this.mLoadMap.get(slotKey);
                    // 原始资源
                    if (!loadArr) {
                        for (const obj of this.replaceArr) {
                            const skin = this.formattingSkin(obj.skin);
                            const tmpKey = obj.part.replace("#", skin.sn.toString()).replace("$", obj.dir.toString()) + skin.version;
                            const partName: string = this.getPartLoadKey(tmpKey);
                            const frameName: string = "test resources/" + tmpKey;
                            const part: string = obj.slot.replace("$", obj.dir.toString());
                            if (part === slotKey) {
                                const texture = this.scene.textures.get(partName);
                                if (dragonBonesTexture.frames[frameName]) {
                                    canvas.drawFrame(this.resourceName, frameName, dat.cutX, dat.cutY);
                                    break;
                                } else {
                                    canvas.drawFrame(partName, texture.firstFrame, dat.cutX, dat.cutY);
                                    break;
                                }
                            }
                        }
                    } else {
                        const drawTextureKey = loadArr[1] + "_png";
                        const drawTexture = this.scene.game.textures.get(drawTextureKey);
                        canvas.drawFrame(drawTextureKey, drawTexture.firstFrame, dat.cutX, dat.cutY);
                    }
                }
                const url = canvas.canvas.toDataURL("image/png", 1);
                this.scene.textures.addBase64(this.mReplaceTextureKey, url);
                canvas.destroy();
            } else {
                if (this.mLoadDisplayPromise) {
                    this.mLoadDisplayPromise.resolve(null);
                }
            }
        }
        this.mArmatureDisplay.visible = true;
        this.emit("replacefinished");
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
        // this.hideUnreplacedParts();
        if (this.mLoadMap && this.mLoadMap.size > 0) {
            this.startLoadPartRes();
        } else {
            // 单图加载
            if (!this.isRenderTexture) {
                this.mArmatureDisplay.visible = true;
                this.replaceArr.splice(0);
            } else {
                this.refreshAvatar();
            }
            this.loadCompleteHander();
        }
    }

    // TODO: 待优化
    private getReplaceArr() {
        this.replaceArr.length = 0;
        const avater: IAvatar = this.displayInfo.avatar;
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
        }

        if (avater.bodyCostDresId) {
            this.replaceArr.push({
                slot: AvatarSlotType.BodyCostDres,
                part: AvatarPartType.BodyCostDres,
                dir: 3,
                skin: avater.bodyCostDresId,
            });
            this.replaceArr.push({
                slot: AvatarSlotType.BodyCostDres,
                part: AvatarPartType.BodyCostDres,
                dir: 1,
                skin: avater.bodyCostDresId,
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
                slot: AvatarSlotType.BarmWeap,
                part: AvatarPartType.WeapBarm,
                dir: 3,
                skin: avater.barmWeapId,
            });
            this.replaceArr.push({
                slot: AvatarSlotType.BarmWeap,
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
        }

        if (avater.headHairBackId) {
            this.replaceArr.push({
                slot: AvatarSlotType.HeadHairBack,
                part: AvatarPartType.HeadHairBack,
                dir: 3,
                skin: avater.headHairBackId,
            });
            this.replaceArr.push({
                slot: AvatarSlotType.HeadHairBack,
                part: AvatarPartType.HeadHairBack,
                dir: 1,
                skin: avater.headHairBackId,
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

        // 新加的插槽
        if (avater.headFaceId) {
            this.replaceArr.push({
                slot: AvatarSlotType.HeadFace,
                part: AvatarPartType.HeadFace,
                dir: 3,
                skin: avater.headFaceId,
            });
            this.replaceArr.push({
                slot: AvatarSlotType.HeadFace,
                part: AvatarPartType.HeadFace,
                dir: 1,
                skin: avater.headFaceId,
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
        }

        if (avater.barmShldId) {
            this.replaceArr.push({
                slot: AvatarSlotType.ShldBarm,
                part: AvatarPartType.ShldBarm,
                dir: 3,
                skin: avater.barmShldId,
            });
            this.replaceArr.push({
                slot: AvatarSlotType.ShldBarm,
                part: AvatarPartType.ShldBarm,
                dir: 1,
                skin: avater.barmShldId,
            });
        }

        if (avater.farmWeapId) {
            this.replaceArr.push({
                slot: AvatarSlotType.FarmWeap,
                part: AvatarPartType.WeapFarm,
                dir: 3,
                skin: avater.farmWeapId,
            });
            this.replaceArr.push({
                slot: AvatarSlotType.FarmWeap,
                part: AvatarPartType.WeapFarm,
                dir: 1,
                skin: avater.farmWeapId,
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
    }

    private hideUnreplacedParts() {
        const replaceSlots = [];
        for (const rep of this.replaceArr) {
            const part: string = rep.slot.replace("$", rep.dir.toString());
            const slot: dragonBones.Slot = this.mArmatureDisplay.armature.getSlot(part);
            replaceSlots.push(slot);
        }

        const slotList: dragonBones.Slot[] = this.mArmatureDisplay.armature.getSlots();
        for (const slot of slotList) {
            if (slot) slot.display.visible = replaceSlots.indexOf(slot) >= 0;
        }
    }

    // set loadMap
    private replacePartDisplay(soltName: string, soltPart: string, soltDir: number, skin: SlotSkin | string | number): void {
        const part: string = soltName.replace("$", soltDir.toString());
        const slot: dragonBones.Slot = this.mArmatureDisplay.armature.getSlot(part);
        if (!slot) return;
        const tempskin = this.formattingSkin(skin);
        if (!tempskin.sn) return;
        const key = soltPart.replace("#", tempskin.sn).replace("$", soltDir.toString()) + tempskin.version;
        const dragonBonesTexture = this.scene.game.textures.get(this.resourceName);
        if (this.scene.cache.custom.dragonbone.get(this.resourceName)) {
            const partName: string = this.getPartLoadKey(key);
            const frameName: string = "test resources/" + key;
            if (this.mErrorLoadMap.get(partName)) return;
            // 单图替换
            if (!this.isRenderTexture) {
                if (!this.scene.textures.exists(partName) && !dragonBonesTexture.frames[frameName]) {
                    // ==============新资源需从外部加载，之后要重新打图集
                    this.mLoadMap.set(slot.name, [slot.name, key]);
                } else {
                    // ==============贴图集上的资源 / 单个替换资源
                    let img: dragonBones.phaser.display.SlotImage;
                    if (dragonBonesTexture.frames[frameName]) {// && this.scene.game.textures.exists(this.mDisplayInfo.id + "")) {
                        if (!this.scene.textures.exists(partName)) {
                            this.mLoadMap.set(slot.name, [slot.name, key]);
                            return;
                        }
                        img = new dragonBones.phaser.display.SlotImage(this.scene, slot.display.x, slot.display.y, partName);
                    } else {
                        img = new dragonBones.phaser.display.SlotImage(this.scene, slot.display.x, slot.display.y, partName);
                    }
                    slot.replaceDisplay(img);
                }
            } else {
                if (!this.scene.textures.exists(partName)) {
                    if (!dragonBonesTexture.frames[frameName]) {
                        // ==============新资源需从外部加载，之后要重新打图集
                        this.mLoadMap.set(slot.name, [slot.name, key]);
                    } else {
                        this.mHasLoadMap.set(key, this.scene.textures.get(partName));
                    }
                }
            }
        }
    }

    private startLoadPartRes() {
        const configList: Phaser.Types.Loader.FileTypes.ImageFileConfig[] = [];
        if (!this.isRenderTexture) {
            this.showPlaceholder();
            // ============只有check到新资源时才会重新load，否则直接从当前龙骨的贴图资源上，获取对应贴图
            this.scene.load.once(Phaser.Loader.Events.COMPLETE, (data, totalComplete: integer, totalFailed: integer) => {
                if (!configList || !this.scene) return;
                const dragonBonesTexture = this.scene.game.textures.get(this.mResourceName);
                // if (!this.mDragonBonesRenderTexture) this.mDragonBonesRenderTexture = this.scene.add.renderTexture(0, 0, dragonBonesTexture.source[0].width, dragonBonesTexture.source[0].height);
                const frames = dragonBonesTexture.getFrameNames();
                // ==============有队列加载说明此处有新资源加载，在队列加载完成后，重新画一张龙骨的贴图并存入缓存中，下次渲染从缓存中获取贴图
                this.mLoadMap.forEach((load) => {
                    // ==========load[0]slot名  load[1]part名
                    const slot: dragonBones.Slot = this.mArmatureDisplay.armature.getSlot(load[0]);
                    // slot.display.visible = true;
                    const name: string = this.getPartLoadKey(load[1]);
                    if (this.scene.textures.exists(name) && !this.mErrorLoadMap.get(name)) {
                        const baseX = slot.display ? slot.display.x : 0;
                        const baseY = slot.display ? slot.display.y : 0;
                        const img: dragonBones.phaser.display.SlotImage = new dragonBones.phaser.display.SlotImage(this.scene, baseX, baseY, name);
                        if (img.texture.key === name) {
                            slot.replaceDisplay(img);
                        }
                    }
                });
                this.loadCompleteHander();
                this.mArmatureDisplay.visible = true;
                this.mLoadMap.clear();
            }, this);
        } else {
            // ============只有check到新资源时才会重新load，否则直接从当前龙骨的贴图资源上，获取对应贴图
            this.scene.load.once(Phaser.Loader.Events.COMPLETE, () => {
                if (!configList || !this.scene) return;
                this.loadCompleteHander();
                this.refreshAvatar();
                this.mLoadMap.clear();
            }, this);
        }
        this.scene.load.once(Phaser.Loader.Events.FILE_LOAD_ERROR, (e: any) => {
            // ==============为了防止404资源重复请求加载，在加载失败后直接将其索引放置加载失败列表中，并从加载map中删除
            this.mLoadMap.delete(e.key);
            this.mErrorLoadMap.set(e.key, e);
        }, this);

        this.mLoadMap.forEach((data) => {
            const nextLoad: string[] = data;
            const partUrl: string = this.getPartLoadUrl(nextLoad[1]);
            const partName: string = this.getPartLoadKey(nextLoad[1]);
            configList.push({ key: partName, url: partUrl });
        });
        this.scene.load.image(configList);
        this.scene.load.start();
    }

    private onLoadFunc(key: string, texture: Phaser.Textures.Texture) {
        if (key !== this.mReplaceTextureKey) return;
        this.mArmatureDisplay.armature.replacedTexture = texture;

        // 需等待下一帧 显示上才会真正替换texture
        if (this.mReplaceTexTimeOutID) {
            clearTimeout(this.mReplaceTexTimeOutID);
            this.mReplaceTexTimeOutID = null;
        }
        this.mReplaceTexTimeOutID = setTimeout(() => {
            if (this.mPreReplaceTextureKey !== null && this.mPreReplaceTextureKey.length > 0 && this.scene &&
                this.scene.textures.exists(this.mPreReplaceTextureKey)) {
                this.scene.textures.remove(this.mPreReplaceTextureKey);
                this.scene.textures.removeKey(this.mPreReplaceTextureKey);
            }
            if (this.mLoadDisplayPromise) {
                this.mLoadDisplayPromise.resolve(null);
                this.mLoadDisplayPromise = null;
            }
        }, 100);
    }

    private formattingSkin(skin: any) {
        let version = "", sn = "";
        if (typeof skin === "string" || typeof skin === "number") {
            sn = skin.toString();
        } else {
            version = (skin.version === undefined || skin.version === "" ? "" : `_${skin.version}`);
            sn = skin.sn;
        }
        return { sn, version };
    }

    private clearFadeTween() {
        if (this.mFadeTween) {
            this.mFadeTween.stop();
            this.mFadeTween.remove();
        }
    }

    private onSoundEventHandler(event: dragonBones.EventObject) {
        if (event.name) {
        }
    }

    private checkNeedReplaceTexture(preVal: IDragonbonesModel | undefined, newVal: IDragonbonesModel | undefined): boolean {
        if (!newVal) return false;
        if (!preVal) return true;

        const preAvatar = preVal.avatar;
        const newAvatar = newVal.avatar;
        for (const key in newAvatar) {
            if (!newAvatar.hasOwnProperty(key)) continue;

            if (this.UNCHECKAVATARPROPERTY.indexOf(key) >= 0) continue;

            if (!preAvatar.hasOwnProperty(key)) return true;

            if (preAvatar[key] !== newAvatar[key]) return true;
        }
        return false;
    }
}
