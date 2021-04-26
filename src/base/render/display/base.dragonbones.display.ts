import {Logger, ResUtils, Tool, Url, ValueResolver} from "utils";
import {IAvatar, IDragonbonesModel, RunningAnimation, SlotSkin, Atlas, IFramesModel, DisplayField} from "structure";
import {BaseDisplay} from "./base.display";

const hash = require("object-hash");
import ImageFile = Phaser.Loader.FileTypes.ImageFile;
import {MaxRectsPacker} from "maxrects-packer";

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
    protected mLoadingShadow: Phaser.GameObjects.Image;
    protected mMountContainer: Phaser.GameObjects.Container;
    private replaceArr = [];
    // key: slotName; val: partName
    private mLoadMap: Map<string, string> = new Map();
    // key: loadKey; val: err
    private mErrorLoadMap: Map<string, any> = new Map();
    private mNeedReplaceTexture: boolean = false;
    private mBoardPoint: Phaser.Geom.Point;
    private readonly UNPACK_SLOTS = [AvatarSlotNameTemp.FarmWeap, AvatarSlotNameTemp.BarmWeap];
    private readonly UNCHECK_AVATAR_PROPERTY = ["id", "dirable", "farmWeapId", "barmWeapId"];

    private mPreReplaceTextureKey: string = "";
    private mReplaceTextureKey: string = "";

    public constructor(scene: Phaser.Scene, id?: number) {
        super(scene, id);
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

    // 改变装扮接口(全量)
    public load(display: IDragonbonesModel, field?: DisplayField, useRenderTex: boolean = true): Promise<any> {
        // test
        // useRenderTex = false;

        this.displayInfo = <IDragonbonesModel> display;
        if (!this.displayInfo) return Promise.reject("displayInfo error");
        this.setData("id", this.displayInfo.id);
        return new Promise<any>((resolve, reject) => {
            this.buildDragbones()
                .then(() => {
                    return new Promise<any>((_resolve, _reject) => {
                        // prepare for refreshAvatar
                        this.setClickInteractive(this.mInteractive);
                        this.displayCreated();
                        this.setReplaceArrAndLoadMap();

                        this.showLoadingShadow();

                        if (useRenderTex && this.mNeedReplaceTexture) {
                            this.prepareReplaceRenderTexture()
                                .then(() => {
                                    _resolve();
                                })
                                .catch(() => {
                                    // fallback
                                    useRenderTex = false;
                                    this.prepareReplaceSlotsDisplay()
                                        .then(() => {
                                            _resolve();
                                        });
                                });
                        } else {
                            useRenderTex = false;
                            this.prepareReplaceSlotsDisplay()
                                .then(() => {
                                    _resolve();
                                });
                        }
                    });
                })
                .then(() => {
                    this.refreshAvatar(useRenderTex);
                    this.hideLoadingShadow();
                    this.mNeedReplaceTexture = false;
                    resolve();
                });
        });
    }

    // 生成合图
    public save(): Promise<{ key: string, url: string, json: string }> {
        return new Promise((resolve, reject) => {
            this.loadPartsRes()
                .then(() => {
                    const textureKey = this.generateReplaceTextureKey();
                    const replaceData = this.generateReplaceTexture(textureKey);
                    resolve({key: textureKey, url: replaceData.url, json: replaceData.json});
                });
        });
    }

    public getDisplay(): dragonBones.phaser.display.ArmatureDisplay | undefined {
        return this.mArmatureDisplay;
    }

    public play(val: RunningAnimation) {
        if (!val) return;
        this.mAnimation = val;
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
        this.mDisplayInfo = null;
        this.mNeedReplaceTexture = false;
        if (this.mArmatureDisplay) {
            // TODO: 两个使用同一合图资源的龙骨对象，一个销毁之后，另一个显示异常
            const slotList: dragonBones.Slot[] = this.mArmatureDisplay.armature.getSlots();
            slotList.forEach((slot: dragonBones.Slot) => {
                if (slot) {
                    slot.replaceDisplay(null);
                    // slot.display.visible = false;
                }
            });
            this.mArmatureDisplay.destroy();
            this.mArmatureDisplay = null;
        }

        if (this.mFadeTween) {
            this.clearFadeTween();
            this.mFadeTween = null;
        }

        super.destroy();
    }

    public setClickInteractive(active: boolean) {
        this.mInteractive = active;
        if (active) {
            const rect: Phaser.Geom.Rectangle = new Phaser.Geom.Rectangle(0, 0, 50, 70);
            rect.x = -rect.width >> 1;
            rect.y = -rect.height;
            this.setInteractive(rect, Phaser.Geom.Rectangle.Contains);
        } else {
            this.disableInteractive();
        }
    }

    public set resourceName(val: string) {
        this.mResourceName = val;
    }

    public get resourceName(): string {
        return this.mResourceName;
    }

    protected buildDragbones(): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            if (!this.scene.cache.custom.dragonbone) {
                reject("dragonbone plugin error");
                return;
            }
            if (this.scene.cache.custom.dragonbone.get(this.resourceName)) {
                this.createArmatureDisplay();
                resolve(this.mArmatureDisplay);
            } else {
                const res = `dragonbones`;
                const pngUrl = Url.getRes(`${res}/${this.resourceName}_tex.png`);
                const jsonUrl = Url.getRes(`${res}/${this.resourceName}_tex.json`);
                const dbbinUrl = Url.getRes(`${res}/${this.resourceName}_ske.dbbin`);
                this.loadDragonBones(pngUrl, jsonUrl, dbbinUrl)
                    .then(() => {
                        this.createArmatureDisplay();
                        resolve(this.mArmatureDisplay);
                    });
            }
        });
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

    protected partNameToDBFrameName(partName: string): string {
        return "test resources/" + partName;
    }

    protected generateReplaceTextureKey() {
        return this.serializeAvatarData(this.displayInfo.avatar);
    }

    protected createArmatureDisplay() {
        if (!this.scene) return;

        if (this.mArmatureDisplay) return;

        this.mArmatureDisplay = this.scene.add.armature(
            this.mArmatureName,
            this.resourceName,
        );
        this.addAt(this.mArmatureDisplay, 0);

        if (this.mAnimation) {
            this.play(this.mAnimation);
        }

        const bound = this.mArmatureDisplay.armature.getBone("board");
        if (bound) {
            this.mBoardPoint = new Phaser.Geom.Point(bound.global.x, bound.global.y);
        } else {
            this.mBoardPoint = new Phaser.Geom.Point(35, 40);
        }
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
        }
    }

    protected showLoadingShadow() {
        if (this.mLoadingShadow) {
            this.mLoadingShadow.destroy();
        }
        this.mLoadingShadow = this.scene.make.image({key: "avatar_placeholder", x: -22, y: -68}).setOrigin(0);
        this.add(this.mLoadingShadow);

        if (this.mArmatureDisplay) {
            this.mArmatureDisplay.visible = false;
        }
    }

    protected hideLoadingShadow() {
        if (this.mLoadingShadow) {
            this.mLoadingShadow.destroy();
        }
        this.mLoadingShadow = undefined;

        if (this.mArmatureDisplay) {
            this.mArmatureDisplay.visible = true;
        }
    }

    protected loadDragonBones(pngUrl: string, jsonUrl: string, dbbinUrl: string): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            this.scene.load.dragonbone(
                this.resourceName,
                pngUrl,
                jsonUrl,
                dbbinUrl,
                null,
                null,
                {responseType: "arraybuffer"}
            );
            const onLoad = () => {
                if (!this.scene.cache.custom.dragonbone.get(this.resourceName)) return;
                this.scene.load.off(Phaser.Loader.Events.COMPLETE, onLoad, this);
                resolve();
            };
            this.scene.load.off(Phaser.Loader.Events.COMPLETE, onLoad, this);
            this.scene.load.on(Phaser.Loader.Events.COMPLETE, onLoad, this);
            this.scene.load.start();
        });
    }

    protected refreshAvatar(useRenderTexture: boolean) {
        if (useRenderTexture) {
            if (this.scene.textures.exists(this.mReplaceTextureKey)) {
                const tex = this.scene.textures.get(this.mReplaceTextureKey);
                this.mArmatureDisplay.armature.replacedTexture = tex;
            }
        }

        const slotList: dragonBones.Slot[] = this.mArmatureDisplay.armature.getSlots();
        slotList.forEach((slot: dragonBones.Slot) => {
            if (slot) {
                slot.display.visible = false;
            }
        });
        // const defaultDBTexture: Phaser.Textures.Texture = this.scene.game.textures.get(this.resourceName);
        const curDBTexture: Phaser.Textures.Texture = this.scene.game.textures.get(this.mReplaceTextureKey);
        for (const rep of this.replaceArr) {
            const slotName: string = rep.slot.replace("$", rep.dir.toString());
            const slot: dragonBones.Slot = this.mArmatureDisplay.armature.getSlot(slotName);
            if (!slot) continue;
            const skin = this.formattingSkin(rep.skin);
            if (skin.sn.length === 0) continue;
            const partName = rep.part.replace("#", skin.sn.toString()).replace("$", rep.dir.toString()) + skin.version;
            const loadKey: string = this.partNameToLoadKey(partName);
            const dbFrameName: string = this.partNameToDBFrameName(partName);
            // if (this.UNPACK_SLOTS.indexOf(rep.slot) < 0) {
            //     slot.display.visible = this.scene.textures.exists(loadKey) || dragonBonesTexture.frames[dbFrameName];
            //     continue;
            // }
            let img = null;
            if (curDBTexture && curDBTexture.frames[dbFrameName]) {
                img = new dragonBones.phaser.display.SlotImage(this.scene, slot.display.x, slot.display.y, this.mReplaceTextureKey, dbFrameName);
            } else if (this.scene.textures.exists(loadKey)) {
                img = new dragonBones.phaser.display.SlotImage(this.scene, slot.display.x, slot.display.y, loadKey);
            }

            if (img) {
                slot.display.visible = true;
                slot.replaceDisplay(img);
            } else {
                Logger.getInstance().warn("dragonbones replace slot display error: no texture: ", loadKey);
            }
        }
    }

    // doc: https://code.apowo.com/PixelPai/game-core/-/issues/239
    protected serializeAvatarData(data: IAvatar): string {
        const temp = JSON.parse(JSON.stringify(data));
        const deleteKeys = [];
        for (const tempKey in temp) {
            if (tempKey === "id" || tempKey === "dirable") {
                deleteKeys.push(tempKey);
                continue;
            }
            const val = temp[tempKey];
            if (val === null) {
                deleteKeys.push(tempKey);
            } else if (typeof val === "string" && val.length === 0) {
                deleteKeys.push(tempKey);
            }
        }
        for (const deleteKey of deleteKeys) {
            delete temp[deleteKey];
        }
        return hash(temp);
    }

    private generateReplaceTexture(textureKey: string): { url: string, json: string } {
        const atlas = new Atlas();
        const packer = new MaxRectsPacker();
        packer.padding = 2;
        for (const rep of this.replaceArr) {
            const slotName: string = rep.slot.replace("$", rep.dir.toString());
            const slot: dragonBones.Slot = this.mArmatureDisplay.armature.getSlot(slotName);
            if (!slot) continue;
            const skin = this.formattingSkin(rep.skin);
            if (skin.sn.length === 0) continue;
            const partName = rep.part.replace("#", skin.sn.toString()).replace("$", rep.dir.toString()) + skin.version;
            const loadKey: string = this.partNameToLoadKey(partName);
            const dbFrameName: string = this.partNameToDBFrameName(partName);
            if (!this.scene.game.textures.exists(loadKey)) {
                Logger.getInstance().error("draw texture error, texture not exists, key: ", loadKey);
            } else {
                const frame = this.scene.game.textures.getFrame(loadKey, "__BASE");
                packer.add(frame.width, frame.height, { key: loadKey, name: dbFrameName });
            }
        }

        const { width, height } = packer.bins[0];
        const canvas = this.scene.textures.createCanvas("canvas_" + this.id + "_" + textureKey, width, height);

        packer.bins.forEach((bin) => {
            bin.rects.forEach((rect) => {
                canvas.drawFrame(rect.data.key, "__BASE", rect.x, rect.y);
                atlas.addFrame(rect.data.name, rect);
            });
        });

        const url = canvas.canvas.toDataURL("image/png", 1);
        canvas.destroy();

        return {url, json: atlas.toString()};
    }

    private prepareReplaceRenderTexture(): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            this.mPreReplaceTextureKey = this.mReplaceTextureKey;
            this.mReplaceTextureKey = this.generateReplaceTextureKey();
            if (this.scene.textures.exists(this.mReplaceTextureKey)) {
                resolve(null);
            } else {
                const loadData = ResUtils.getUsrAvatarTextureUrls(this.mReplaceTextureKey);
                this.scene.load.atlas(this.mReplaceTextureKey, loadData.img, loadData.json);
                const onLoadComplete = (key: string) => {
                    if (this.mReplaceTextureKey !== key) return;
                    this.scene.textures.off(Phaser.Textures.Events.ADD, onLoadComplete, this);

                    resolve(null);
                };
                const onLoadError = (imageFile: ImageFile) => {
                    if (this.mReplaceTextureKey !== imageFile.key) return;
                    this.scene.load.off(Phaser.Loader.Events.FILE_LOAD_ERROR, onLoadError, this);

                    Logger.getInstance().warn("load dragonbones texture error: ", loadData);
                    reject("load dragonbones texture error: " + loadData);
                };
                this.scene.textures.off(Phaser.Textures.Events.ADD, onLoadComplete, this);
                this.scene.textures.on(Phaser.Textures.Events.ADD, onLoadComplete, this);
                this.scene.load.off(Phaser.Loader.Events.FILE_LOAD_ERROR, onLoadError, this);
                this.scene.load.on(Phaser.Loader.Events.FILE_LOAD_ERROR, onLoadError, this);
                this.scene.load.start();
            }
        });
    }

    private prepareReplaceSlotsDisplay(): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            if (this.mLoadMap && this.mLoadMap.size > 0) {
                this.loadPartsRes()
                    .then(() => {
                        resolve(null);
                    });
            } else {
                resolve(null);
            }
        });
    }

    private loadPartsRes(): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            const loadList: Phaser.Types.Loader.FileTypes.ImageFileConfig[] = [];
            this.mLoadMap.forEach((pName, sName) => {
                const loadUrl: string = this.partNameToLoadUrl(pName);
                const loadKey: string = this.partNameToLoadKey(pName);
                if (!this.scene.textures.exists(loadKey))
                    loadList.push({key: loadKey, url: loadUrl});
            });

            if (loadList.length === 0) {
                resolve();
                return;
            }

            const onLoadComplete = (data, totalComplete: integer, totalFailed: integer) => {
                if (!this.scene) return;
                this.scene.load.off(Phaser.Loader.Events.COMPLETE, onLoadComplete, this);
                resolve(null);
            };
            this.scene.load.off(Phaser.Loader.Events.COMPLETE, onLoadComplete, this);
            this.scene.load.on(Phaser.Loader.Events.COMPLETE, onLoadComplete, this);

            const onLoadError = (e: any) => {
                // ==============为了防止404资源重复请求加载，在加载失败后直接将其索引放置加载失败列表中，并从加载map中删除
                const sName = this.partLoadKeyToSlotName(e.key);
                if (!this.mLoadMap.has(sName)) return;
                const pName = this.mLoadMap.get(sName);
                const lKey = this.partNameToLoadKey(pName);
                // this.mLoadMap.delete(sName);
                this.mErrorLoadMap.set(lKey, e);
            };
            this.scene.load.off(Phaser.Loader.Events.FILE_LOAD_ERROR, onLoadError, this);
            this.scene.load.on(Phaser.Loader.Events.FILE_LOAD_ERROR, onLoadError, this);

            this.scene.load.image(loadList);
            this.scene.load.start();
        });
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

    private checkNeedReplaceTexture(preVal: IDragonbonesModel | undefined, newVal: IDragonbonesModel | undefined): boolean {
        if (!newVal) return false;
        if (!preVal) return true;

        const preAvatar = preVal.avatar;
        const newAvatar = newVal.avatar;
        for (const key in newAvatar) {
            if (!newAvatar.hasOwnProperty(key)) continue;

            if (this.UNCHECK_AVATAR_PROPERTY.indexOf(key) >= 0) continue;

            if (!preAvatar.hasOwnProperty(key)) return true;

            if (typeof preAvatar[key] === "string" && typeof newAvatar[key] === "string") {
                if (preAvatar[key] !== newAvatar[key]) return true;
                else continue;
            }

            if (preAvatar[key].hasOwnProperty("sn") && newAvatar[key].hasOwnProperty("sn")) {
                if (preAvatar[key].sn !== newAvatar[key].sn) return true;
                else if (preAvatar[key].version !== newAvatar[key].version) return true;
                else continue;
            }

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

    // TODO: 待优化
    private setReplaceArrAndLoadMap() {
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

        const setLoadMap = (soltNameTemp: string, partNameTemp: string, dir: number, skin: SlotSkin | string | number) => {
            const slotName: string = soltNameTemp.replace("$", dir.toString());
            const slot: dragonBones.Slot = this.mArmatureDisplay.armature.getSlot(slotName);
            if (!slot) return;
            const tempskin = this.formattingSkin(skin);
            if (!tempskin.sn) return;
            const partName = partNameTemp.replace("#", tempskin.sn).replace("$", dir.toString()) + tempskin.version;
            const dragonBonesTexture = this.scene.game.textures.get(this.resourceName);
            const loadKey: string = this.partNameToLoadKey(partName);
            const dbFrameName: string = this.partNameToDBFrameName(partName);
            if (this.mErrorLoadMap.get(loadKey)) return;
            if (!this.scene.textures.exists(loadKey)) {//  && !dragonBonesTexture.frames[dbFrameName]
                // ==============所有资源都需要从外部加载
                this.mLoadMap.set(slotName, partName);
            }
        };

        this.mLoadMap.clear();
        for (const obj of this.replaceArr) {
            setLoadMap(obj.slot, obj.part, obj.dir, obj.skin);
        }
    }
}
