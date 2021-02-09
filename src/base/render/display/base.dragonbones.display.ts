import {Logger, ResUtils, Tool, Url, ValueResolver} from "utils";
import {IAvatar, IDragonbonesModel, RunningAnimation, SlotSkin} from "structure";
import {BaseDisplay} from "./base.display";

export enum AvatarSlotNameTemp {
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

export enum AvatarPartNameTemp {
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
    // key: slotName; val: partName
    private mLoadMap: Map<string, string> = new Map();
    // key: loadKey; val: err
    private mErrorLoadMap: Map<string, any> = new Map();
    private mNeedReplaceTexture: boolean = false;
    private mBoardPoint: Phaser.Geom.Point;
    private readonly UNPACK_SLOTS = [AvatarSlotNameTemp.FarmWeap, AvatarSlotNameTemp.BarmWeap];
    private readonly UNCHECK_AVATAR_PROPERTY = ["id", "dirable", "farmWeapId", "barmWeapId"];
    // 默认装扮 slot : part
    private readonly DEFAULT_SETS = {
        "body_base_3": "body_base_0001_3",
        "body_base_1": "body_base_0001_1",
        "barm_base_3": "barm_base_0001_3",
        "barm_base_1": "barm_base_0001_1",
        "farm_base_3": "farm_base_0001_3",
        "farm_base_1": "farm_base_0001_1",
        "bleg_base_3": "bleg_base_0001_3",
        "bleg_base_1": "bleg_base_0001_1",
        "fleg_base_3": "fleg_base_0001_3",
        "fleg_base_1": "fleg_base_0001_1",
        "head_base_3": "head_base_0001_3",
        "head_base_1": "head_base_0001_1",
        "head_hair_3": "head_hair_5cd28238fb073710972a73c2_3",
        "head_hair_1": "head_hair_5cd28238fb073710972a73c2_1",
        "head_eyes_3": "head_eyes_5cd28238fb073710972a73c2_3",
        "head_eyes_1": "head_eyes_5cd28238fb073710972a73c2_1",
        "head_mous_3": "head_mous_5cd28238fb073710972a73c2_3",
        "head_mous_1": "head_mous_5cd28238fb073710972a73c2_1",
        "body_cost_3": "body_cost_5cd28238fb073710972a73c2_3",
        "body_cost_1": "body_cost_5cd28238fb073710972a73c2_1"
    };
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
        this.displayInfo = <IDragonbonesModel> display;
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
    protected partNameToLoadUrl(partName: string): string {
        return ResUtils.getPartUrl(partName);
    }

    protected partNameToLoadKey(partName: string): string {
        return ResUtils.getPartName(partName);
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
        this.created();
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
        this.mPlaceholder = this.scene.make.image({key: "avatar_placeholder", x: -22, y: -68}).setOrigin(0);
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
            {responseType: "arraybuffer"}
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
            const partName: string = this.partNameToLoadKey(key);
            const frameName: string = "test resources/" + key;
            if (this.UNPACK_SLOTS.indexOf(rep.slot) < 0) {
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
                const dbFrameNames = dragonBonesTexture.getFrameNames();
                // ==============重绘贴图方式
                this.mTmpIndex++;
                this.mPreReplaceTextureKey = this.mReplaceTextureKey;
                this.mReplaceTextureKey = this.generateReplaceTextureKey();
                const canvas = this.scene.textures.createCanvas(this.mReplaceTextureKey + "_canvas", dragonBonesTexture.source[0].width, dragonBonesTexture.source[0].height);
                for (let i: number = 0, len = dbFrameNames.length; i < len; i++) {
                    // =============龙骨贴图资源frames里面的key "test resources/xxxxx"
                    const dbFrameName = dbFrameNames[i];
                    // =============龙骨part资源key 带图片资源名及方向
                    const temp = dbFrameName.split("/")[1].split("_");
                    // =============front || back单独也有格位
                    const slotName = temp[4] ? temp[0] + "_" + temp[1] + "_" + temp[2] + "_" + temp[4] : temp[0] + "_" + temp[1] + "_" + temp[3];
                    const slot: dragonBones.Slot = this.mArmatureDisplay.armature.getSlot(slotName);
                    if (!slot) Logger.getInstance().warn("dragonbonesDisplay, get slot error: ", slotName, slot);
                    const dbFrameData = dragonBonesTexture.get(dbFrameName);
                    const loadPartName = this.mLoadMap.get(slotName);
                    // 原始资源
                    if (!loadPartName) {
                        for (const obj of this.replaceArr) {
                            const skin = this.formattingSkin(obj.skin);
                            const pName = obj.part.replace("#", skin.sn.toString()).replace("$", obj.dir.toString()) + skin.version;
                            const lKey: string = this.partNameToLoadKey(pName);
                            const dbFName: string = "test resources/" + pName;
                            const part: string = obj.slot.replace("$", obj.dir.toString());
                            if (part === slotName) {
                                const texture = this.scene.textures.get(lKey);
                                if (dragonBonesTexture.frames[dbFName]) {
                                    canvas.drawFrame(this.resourceName, dbFName, dbFrameData.cutX, dbFrameData.cutY);
                                } else {
                                    canvas.drawFrame(lKey, texture.firstFrame, dbFrameData.cutX, dbFrameData.cutY);
                                }
                                break;
                            }
                        }
                    } else {
                        const drawTextureKey = this.partNameToLoadKey(loadPartName[1]);
                        const drawTexture = this.scene.game.textures.get(drawTextureKey);
                        canvas.drawFrame(drawTextureKey, drawTexture.firstFrame, dbFrameData.cutX, dbFrameData.cutY);
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
                slot: AvatarSlotNameTemp.BodyBase,
                part: AvatarPartNameTemp.BodyBase,
                dir: 3,
                skin: avater.bodyBaseId,
            });
            this.replaceArr.push({
                slot: AvatarSlotNameTemp.BodyBase,
                part: AvatarPartNameTemp.BodyBase,
                dir: 1,
                skin: avater.bodyBaseId,
            });
        }

        if (avater.bodySpecId) {
            this.replaceArr.push({
                slot: AvatarSlotNameTemp.BodySpec,
                part: AvatarPartNameTemp.BodySpec,
                dir: 3,
                skin: avater.bodySpecId,
            });
            this.replaceArr.push({
                slot: AvatarSlotNameTemp.BodySpec,
                part: AvatarPartNameTemp.BodySpec,
                dir: 1,
                skin: avater.bodySpecId,
            });
        }

        if (avater.bodyWingId) {
            this.replaceArr.push({
                slot: AvatarSlotNameTemp.BodyWing,
                part: AvatarPartNameTemp.BodyWing,
                dir: 3,
                skin: avater.bodyWingId,
            });
            this.replaceArr.push({
                slot: AvatarSlotNameTemp.BodyWing,
                part: AvatarPartNameTemp.BodyWing,
                dir: 1,
                skin: avater.bodyWingId,
            });
        }

        if (avater.bodyTailId) {
            this.replaceArr.push({
                slot: AvatarSlotNameTemp.BodyTail,
                part: AvatarPartNameTemp.BodyTail,
                dir: 3,
                skin: avater.bodyTailId,
            });
            this.replaceArr.push({
                slot: AvatarSlotNameTemp.BodyTail,
                part: AvatarPartNameTemp.BodyTail,
                dir: 1,
                skin: avater.bodyTailId,
            });
        }

        if (avater.bodyCostId) {
            this.replaceArr.push({
                slot: AvatarSlotNameTemp.BodyCost,
                part: AvatarPartNameTemp.BodyCost,
                dir: 3,
                skin: avater.bodyCostId,
            });
            this.replaceArr.push({
                slot: AvatarSlotNameTemp.BodyCost,
                part: AvatarPartNameTemp.BodyCost,
                dir: 1,
                skin: avater.bodyCostId,
            });
        }

        if (avater.bodyCostDresId) {
            this.replaceArr.push({
                slot: AvatarSlotNameTemp.BodyCostDres,
                part: AvatarPartNameTemp.BodyCostDres,
                dir: 3,
                skin: avater.bodyCostDresId,
            });
            this.replaceArr.push({
                slot: AvatarSlotNameTemp.BodyCostDres,
                part: AvatarPartNameTemp.BodyCostDres,
                dir: 1,
                skin: avater.bodyCostDresId,
            });
        }

        if (avater.farmBaseId) {
            this.replaceArr.push({
                slot: AvatarSlotNameTemp.FarmBase,
                part: AvatarPartNameTemp.FarmBase,
                dir: 3,
                skin: avater.farmBaseId,
            });
            this.replaceArr.push({
                slot: AvatarSlotNameTemp.FarmBase,
                part: AvatarPartNameTemp.FarmBase,
                dir: 1,
                skin: avater.farmBaseId,
            });
        }

        if (avater.farmSpecId) {
            this.replaceArr.push({
                slot: AvatarSlotNameTemp.FarmSpec,
                part: AvatarPartNameTemp.FarmSpec,
                dir: 3,
                skin: avater.farmSpecId,
            });
            this.replaceArr.push({
                slot: AvatarSlotNameTemp.FarmSpec,
                part: AvatarPartNameTemp.FarmSpec,
                dir: 1,
                skin: avater.farmSpecId,
            });
        }

        if (avater.farmCostId) {
            this.replaceArr.push({
                slot: AvatarSlotNameTemp.FarmCost,
                part: AvatarPartNameTemp.FarmCost,
                dir: 3,
                skin: avater.farmCostId,
            });
            this.replaceArr.push({
                slot: AvatarSlotNameTemp.FarmCost,
                part: AvatarPartNameTemp.FarmCost,
                dir: 1,
                skin: avater.farmCostId,
            });
        }

        if (avater.barmBaseId) {
            this.replaceArr.push({
                slot: AvatarSlotNameTemp.BarmBase,
                part: AvatarPartNameTemp.BarmBase,
                dir: 3,
                skin: avater.barmBaseId,
            });
            this.replaceArr.push({
                slot: AvatarSlotNameTemp.BarmBase,
                part: AvatarPartNameTemp.BarmBase,
                dir: 1,
                skin: avater.barmBaseId,
            });
        }

        if (avater.barmSpecId) {
            this.replaceArr.push({
                slot: AvatarSlotNameTemp.BarmSpec,
                part: AvatarPartNameTemp.BarmSpec,
                dir: 3,
                skin: avater.barmSpecId,
            });
            this.replaceArr.push({
                slot: AvatarSlotNameTemp.BarmSpec,
                part: AvatarPartNameTemp.BarmSpec,
                dir: 1,
                skin: avater.barmSpecId,
            });
        }

        if (avater.barmCostId) {
            this.replaceArr.push({
                slot: AvatarSlotNameTemp.BarmCost,
                part: AvatarPartNameTemp.BarmCost,
                dir: 3,
                skin: avater.barmCostId,
            });
            this.replaceArr.push({
                slot: AvatarSlotNameTemp.BarmCost,
                part: AvatarPartNameTemp.BarmCost,
                dir: 1,
                skin: avater.barmCostId,
            });
        }

        if (avater.blegBaseId) {
            this.replaceArr.push({
                slot: AvatarSlotNameTemp.BlegBase,
                part: AvatarPartNameTemp.BlegBase,
                dir: 3,
                skin: avater.blegBaseId,
            });
            this.replaceArr.push({
                slot: AvatarSlotNameTemp.BlegBase,
                part: AvatarPartNameTemp.BlegBase,
                dir: 1,
                skin: avater.blegBaseId,
            });
        }

        if (avater.blegSpecId) {
            this.replaceArr.push({
                slot: AvatarSlotNameTemp.BlegSpec,
                part: AvatarPartNameTemp.BlegSpec,
                dir: 3,
                skin: avater.blegSpecId,
            });
            this.replaceArr.push({
                slot: AvatarSlotNameTemp.BlegSpec,
                part: AvatarPartNameTemp.BlegSpec,
                dir: 1,
                skin: avater.blegSpecId,
            });
        }

        if (avater.blegCostId) {
            this.replaceArr.push({
                slot: AvatarSlotNameTemp.BlegCost,
                part: AvatarPartNameTemp.BlegCost,
                dir: 3,
                skin: avater.blegCostId,
            });
            this.replaceArr.push({
                slot: AvatarSlotNameTemp.BlegCost,
                part: AvatarPartNameTemp.BlegCost,
                dir: 1,
                skin: avater.blegCostId,
            });
        }

        if (avater.flegBaseId) {
            this.replaceArr.push({
                slot: AvatarSlotNameTemp.FlegBase,
                part: AvatarPartNameTemp.FlegBase,
                dir: 3,
                skin: avater.flegBaseId,
            });
            this.replaceArr.push({
                slot: AvatarSlotNameTemp.FlegBase,
                part: AvatarPartNameTemp.FlegBase,
                dir: 1,
                skin: avater.flegBaseId,
            });
        }

        if (avater.flegSpecId) {
            this.replaceArr.push({
                slot: AvatarSlotNameTemp.FlegSpec,
                part: AvatarPartNameTemp.FlegSpec,
                dir: 3,
                skin: avater.flegSpecId,
            });
            this.replaceArr.push({
                slot: AvatarSlotNameTemp.FlegSpec,
                part: AvatarPartNameTemp.FlegSpec,
                dir: 1,
                skin: avater.flegSpecId,
            });
        }

        if (avater.flegCostId) {
            this.replaceArr.push({
                slot: AvatarSlotNameTemp.FlegCost,
                part: AvatarPartNameTemp.FlegCost,
                dir: 3,
                skin: avater.flegCostId,
            });
            this.replaceArr.push({
                slot: AvatarSlotNameTemp.FlegCost,
                part: AvatarPartNameTemp.FlegCost,
                dir: 1,
                skin: avater.flegCostId,
            });
        }

        if (avater.headBaseId) {
            this.replaceArr.push({
                slot: AvatarSlotNameTemp.HeadBase,
                part: AvatarPartNameTemp.HeadBase,
                dir: 3,
                skin: avater.headBaseId,
            });
            this.replaceArr.push({
                slot: AvatarSlotNameTemp.HeadBase,
                part: AvatarPartNameTemp.HeadBase,
                dir: 1,
                skin: avater.headBaseId,
            });
        }
        if (avater.barmWeapId) {
            this.replaceArr.push({
                slot: AvatarSlotNameTemp.BarmWeap,
                part: AvatarPartNameTemp.WeapBarm,
                dir: 3,
                skin: avater.barmWeapId,
            });
            this.replaceArr.push({
                slot: AvatarSlotNameTemp.BarmWeap,
                part: AvatarPartNameTemp.WeapBarm,
                dir: 1,
                skin: avater.barmWeapId,
            });
        }

        if (avater.headHairId) {
            this.replaceArr.push({
                slot: AvatarSlotNameTemp.HeadHair,
                part: AvatarPartNameTemp.HeadHair,
                dir: 3,
                skin: avater.headHairId,
            });
            this.replaceArr.push({
                slot: AvatarSlotNameTemp.HeadHair,
                part: AvatarPartNameTemp.HeadHair,
                dir: 1,
                skin: avater.headHairId,
            });
        }

        if (avater.headHairBackId) {
            this.replaceArr.push({
                slot: AvatarSlotNameTemp.HeadHairBack,
                part: AvatarPartNameTemp.HeadHairBack,
                dir: 3,
                skin: avater.headHairBackId,
            });
            this.replaceArr.push({
                slot: AvatarSlotNameTemp.HeadHairBack,
                part: AvatarPartNameTemp.HeadHairBack,
                dir: 1,
                skin: avater.headHairBackId,
            });
        }

        if (avater.headHatsId) {
            this.replaceArr.push({
                slot: AvatarSlotNameTemp.HeadHats,
                part: AvatarPartNameTemp.HeadHats,
                dir: 3,
                skin: avater.headHatsId,
            });
            this.replaceArr.push({
                slot: AvatarSlotNameTemp.HeadHats,
                part: AvatarPartNameTemp.HeadHats,
                dir: 1,
                skin: avater.headHatsId,
            });
        }

        if (avater.headSpecId) {
            this.replaceArr.push({
                slot: AvatarSlotNameTemp.HeadSpec,
                part: AvatarPartNameTemp.HeadSpec,
                dir: 3,
                skin: avater.headSpecId,
            });
            this.replaceArr.push({
                slot: AvatarSlotNameTemp.HeadSpec,
                part: AvatarPartNameTemp.HeadSpec,
                dir: 1,
                skin: avater.headSpecId,
            });
        }

        if (avater.headEyesId) {
            this.replaceArr.push({
                slot: AvatarSlotNameTemp.HeadEyes,
                part: AvatarPartNameTemp.HeadEyes,
                dir: 3,
                skin: avater.headEyesId,
            });
        }

        if (avater.headMousId) {
            this.replaceArr.push({
                slot: AvatarSlotNameTemp.HeadMous,
                part: AvatarPartNameTemp.HeadMous,
                dir: 3,
                skin: avater.headMousId,
            });
        }

        if (avater.headMaskId) {
            this.replaceArr.push({
                slot: AvatarSlotNameTemp.HeadMask,
                part: AvatarPartNameTemp.HeadMask,
                dir: 3,
                skin: avater.headMaskId,
            });
        }

        // 新加的插槽
        if (avater.headFaceId) {
            this.replaceArr.push({
                slot: AvatarSlotNameTemp.HeadFace,
                part: AvatarPartNameTemp.HeadFace,
                dir: 3,
                skin: avater.headFaceId,
            });
            this.replaceArr.push({
                slot: AvatarSlotNameTemp.HeadFace,
                part: AvatarPartNameTemp.HeadFace,
                dir: 1,
                skin: avater.headFaceId,
            });
        }

        if (avater.farmShldId) {
            this.replaceArr.push({
                slot: AvatarSlotNameTemp.ShldFarm,
                part: AvatarPartNameTemp.ShldFarm,
                dir: 3,
                skin: avater.farmShldId,
            });
            this.replaceArr.push({
                slot: AvatarSlotNameTemp.ShldFarm,
                part: AvatarPartNameTemp.ShldFarm,
                dir: 1,
                skin: avater.farmShldId,
            });
        }

        if (avater.barmShldId) {
            this.replaceArr.push({
                slot: AvatarSlotNameTemp.ShldBarm,
                part: AvatarPartNameTemp.ShldBarm,
                dir: 3,
                skin: avater.barmShldId,
            });
            this.replaceArr.push({
                slot: AvatarSlotNameTemp.ShldBarm,
                part: AvatarPartNameTemp.ShldBarm,
                dir: 1,
                skin: avater.barmShldId,
            });
        }

        if (avater.farmWeapId) {
            this.replaceArr.push({
                slot: AvatarSlotNameTemp.FarmWeap,
                part: AvatarPartNameTemp.WeapFarm,
                dir: 3,
                skin: avater.farmWeapId,
            });
            this.replaceArr.push({
                slot: AvatarSlotNameTemp.FarmWeap,
                part: AvatarPartNameTemp.WeapFarm,
                dir: 1,
                skin: avater.farmWeapId,
            });
        }

        if (avater.farmBaseId) {
            this.replaceArr.push({
                slot: AvatarSlotNameTemp.FarmBase,
                part: AvatarPartNameTemp.FarmBase,
                dir: 3,
                skin: avater.farmBaseId,
            });
            this.replaceArr.push({
                slot: AvatarSlotNameTemp.FarmBase,
                part: AvatarPartNameTemp.FarmBase,
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
    private replacePartDisplay(soltNameTemp: string, partNameTemp: string, dir: number, skin: SlotSkin | string | number): void {
        const slotName: string = soltNameTemp.replace("$", dir.toString());
        const slot: dragonBones.Slot = this.mArmatureDisplay.armature.getSlot(slotName);
        if (!slot) return;
        const tempskin = this.formattingSkin(skin);
        if (!tempskin.sn) return;
        const partName = partNameTemp.replace("#", tempskin.sn).replace("$", dir.toString()) + tempskin.version;
        const dragonBonesTexture = this.scene.game.textures.get(this.resourceName);
        if (this.scene.cache.custom.dragonbone.get(this.resourceName)) {
            const loadKey: string = this.partNameToLoadKey(partName);
            const dbFrameName: string = "test resources/" + partName;
            if (this.mErrorLoadMap.get(loadKey)) return;
            // 单图替换
            if (!this.isRenderTexture) {
                if (!this.scene.textures.exists(loadKey) && !dragonBonesTexture.frames[dbFrameName]) {
                    // ==============新资源需从外部加载，之后要重新打图集
                    this.mLoadMap.set(slot.name, partName);
                } else {
                    // ==============贴图集上的资源 / 单个替换资源
                    let img: dragonBones.phaser.display.SlotImage;
                    if (dragonBonesTexture.frames[dbFrameName]) {// && this.scene.game.textures.exists(this.mDisplayInfo.id + "")) {
                        if (!this.scene.textures.exists(loadKey)) {
                            this.mLoadMap.set(slot.name, partName);
                            return;
                        }
                        img = new dragonBones.phaser.display.SlotImage(this.scene, slot.display.x, slot.display.y, loadKey);
                    } else {
                        img = new dragonBones.phaser.display.SlotImage(this.scene, slot.display.x, slot.display.y, loadKey);
                    }
                    slot.replaceDisplay(img);
                }
            } else {
                if (!this.scene.textures.exists(loadKey)) {
                    if (!dragonBonesTexture.frames[dbFrameName]) {
                        // ==============新资源需从外部加载，之后要重新打图集
                        this.mLoadMap.set(slot.name, partName);
                    } else {
                        this.mHasLoadMap.set(partName, this.scene.textures.get(loadKey));
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
                this.mLoadMap.forEach((partName, slotName) => {
                    // ==========load[0]slot名  load[1]part名
                    const slot: dragonBones.Slot = this.mArmatureDisplay.armature.getSlot(slotName);
                    // slot.display.visible = true;
                    const loadKey: string = this.partNameToLoadKey(partName);
                    if (this.scene.textures.exists(loadKey) && !this.mErrorLoadMap.get(loadKey)) {
                        const baseX = slot.display ? slot.display.x : 0;
                        const baseY = slot.display ? slot.display.y : 0;
                        const img: dragonBones.phaser.display.SlotImage = new dragonBones.phaser.display.SlotImage(this.scene, baseX, baseY, loadKey);
                        if (img.texture.key === loadKey) {
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

        const onLoadError = (e: any) => {
            // ==============为了防止404资源重复请求加载，在加载失败后直接将其索引放置加载失败列表中，并从加载map中删除
            const sName = this.partLoadKeyToSlotName(e.key);
            if (!this.mLoadMap.has(sName)) return;
            const pName = this.mLoadMap.get(sName);
            const lKey = this.partNameToLoadKey(pName);
            this.mLoadMap.delete(sName);
            this.mErrorLoadMap.set(lKey, e);
        };
        this.scene.load.off(Phaser.Loader.Events.FILE_LOAD_ERROR, onLoadError, this);
        this.scene.load.on(Phaser.Loader.Events.FILE_LOAD_ERROR, onLoadError, this);

        this.mLoadMap.forEach((pName, sName) => {
            const partUrl: string = this.partNameToLoadUrl(pName);
            const partName: string = this.partNameToLoadKey(pName);
            configList.push({key: partName, url: partUrl});
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
        return {sn, version};
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

            if (this.UNCHECK_AVATAR_PROPERTY.indexOf(key) >= 0) continue;

            if (!preAvatar.hasOwnProperty(key)) return true;

            if (preAvatar[key] !== newAvatar[key]) return true;
        }
        return false;
    }

    // head_base_0001_3_1 => head_base_3 ; head_hair_back_11111111_3_1 => head_hair_back_3
    private partLoadKeyToSlotName(key: string): string {
        const arr = key.split("_");
        if (Tool.isNumeric(arr[2])) {
            return arr[0] + "_" + arr[1] + "_" + arr[3];
        } else {
            return arr[0] + "_" + arr[1] + "_" + arr[2] + "_" + arr[4];
        }
    }
}
