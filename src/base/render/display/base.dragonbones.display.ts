import {
    IAvatar,
    IDragonbonesModel,
    RunningAnimation,
    SlotSkin,
    Atlas,
    DisplayField,
    IResPath, Logger
} from "structure";
import {BaseDisplay} from "./base.display";

import * as sha1 from "simple-sha1";
// import * as hash from "object-hash";
import ImageFile = Phaser.Loader.FileTypes.ImageFile;
import {MaxRectsPacker} from "maxrects-packer";
import {PhaserListenerType} from "../listener.manager/listener.manager";
import {Tool} from "utils";

export enum AvatarSlotNameTemp {
    BodyCostDres = "body_cost_dres_$",
    BodyCost = "body_cost_$",
    BodyTail = "body_tail_$",
    BodyWing = "body_wing_$",
    BodyBase = "body_base_$",
    BodySpec = "body_spec_$",
    BodyScar = "body_scar_$",
    BodyCloa = "body_cloa_$",
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
    HeadHatBack = "head_hats_back_$",
    HeadFace = "head_face_$",
    HeadChin = "head_chin_$"
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
    BodyScar = "body_scar_#_$",
    BodyCloa = "body_cloa_#_$",
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
    HeadHatsBack = "head_hats_back_#_$",
    HeadFace = "head_face_#_$",
    HeadMask = "head_mask_#_$",
    HeadMous = "head_mous_#_$",
    HeadSpec = "head_spec_#_$",
    HeadChin = "head_chin_#_$",
    ShldFarm = "farm_shld_#_$",
    WeapFarm = "farm_weap_#_$",
    ShldBarm = "barm_shld_#_$",
    WeapBarm = "barm_weap_#_$",
}

const SERIALIZE_QUEUE = [
    "headBaseId",
    "headHairId",
    "headEyesId",
    "headHairBackId",
    "headMousId",
    "headHatsId",
    "headHatsBackId",
    "headMaskId",
    "headSpecId",
    "headFaceId",
    "headChinId",
    "bodyBaseId",
    "bodyCostId",
    "bodyCostDresId",
    "bodyTailId",
    "bodyWingId",
    "bodyScarId",
    "bodyCloaId",
    "bodySpecId",
    "farmBaseId",
    "farmCostId",
    "farmSpecId",
    "barmBaseId",
    "barmCostId",
    "barmSpecId",
    "flegBaseId",
    "flegCostId",
    "flegSpecId",
    "blegBaseId",
    "blegCostId",
    "blegSpecId",
    "stalkerId",
];

const ReplacedTextures: Map<string, number> = new Map<string, number>();
// 解决低版本和高版本共用同一张合图的问题，低版本未做"不重复上传"的处理
const ReplacedTextureVersion: string = "v1";

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
    private readonly UNCHECK_AVATAR_PROPERTY = ["id", "dirable", "farmWeapId", "farmShldId", "barmWeapId", "barmShldId"];

    // 不需要手动释放旧的资源，龙骨中已经做了相关处理
    // private mPreReplaceTextureKey: string = "";
    private mReplaceTextureKey: string = "";

    public constructor(scene: Phaser.Scene, private pathObj: IResPath, id?: number) {
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
                                    _resolve(null);
                                })
                                .catch(() => {
                                    // fallback
                                    useRenderTex = false;
                                    this.prepareReplaceSlotsDisplay()
                                        .then(() => {
                                            _resolve(null);
                                        });
                                });
                        } else {
                            useRenderTex = false;
                            this.prepareReplaceSlotsDisplay()
                                .then(() => {
                                    _resolve(null);
                                });
                        }
                    });
                })
                .then(() => {
                    this.refreshAvatar(useRenderTex);
                    this.hideLoadingShadow();
                    this.mNeedReplaceTexture = false;
                    resolve(null);
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
            // const slotList: dragonBones.Slot[] = this.mArmatureDisplay.armature.getSlots();
            // slotList.forEach((slot: dragonBones.Slot) => {
            //     if (slot) {
            //         slot.replaceDisplay(null);
            //         // slot.display.visible = false;
            //     }
            // });
            this.destroyReplacedTextureManually();

            this.mArmatureDisplay.dispose(false);
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
                const resPath = this.localResourceRoot;
                const pngUrl = resPath + `${res}/${this.resourceName}_tex.png`;
                const jsonUrl = resPath + `${res}/${this.resourceName}_tex.json`;
                const dbbinUrl = resPath + `${res}/${this.resourceName}_ske.dbbin`;
                this.loadDragonBones(pngUrl, jsonUrl, dbbinUrl)
                    .then(() => {
                        this.createArmatureDisplay();
                        resolve(this.mArmatureDisplay);
                    });
            }
        });
    }

    protected get localResourceRoot(): string {
        return this.pathObj.resPath;
    }

    protected get osdResourceRoot(): string {
        return this.pathObj.osdPath;
    }

    // TODO: 游戏中截图会出现404，待解决
    protected partNameToLoadUrl(partName: string): string {
        return this.osdResourceRoot + "avatar/part/" + partName + ".png";
    }

    protected partNameToLoadKey(partName: string): string {
        return partName + "_png";
    }

    protected partNameToDBFrameName(partName: string): string {
        return "test resources/" + partName;
    }

    protected generateReplaceTextureKey() {
        return this.serializeAvatarData(this.displayInfo.avatar) + ReplacedTextureVersion;
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
                this.mListenerMng.removePhaserListener(PhaserListenerType.Load, Phaser.Loader.Events.COMPLETE, onLoad);
                resolve(null);
            };

            this.mListenerMng.addPhaserListener(PhaserListenerType.Load, Phaser.Loader.Events.COMPLETE, onLoad);
            this.scene.load.start();
        });
    }

    protected refreshAvatar(useRenderTexture: boolean) {
        if (useRenderTexture) {
            if (this.scene.textures.exists(this.mReplaceTextureKey)) {
                const tex = this.scene.textures.get(this.mReplaceTextureKey);
                if (this.mArmatureDisplay.armature.replacedTexture !== tex) {
                    // 检查老图片引用计数
                    this.destroyReplacedTextureManually();

                    // 新增合图使用
                    this.recordReplacedTexture(tex.key);
                    this.mArmatureDisplay.armature.replacedTexture = tex;
                }
            }
        }

        const slotList: dragonBones.Slot[] = this.mArmatureDisplay.armature.getSlots();
        slotList.forEach((slot: dragonBones.Slot) => {
            if (slot) {
                slot.display.visible = false;
                slot.replaceDisplay(slot.display);
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
            const partName = this.formatPartName(rep.part, skin, rep.dir.toString());
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
        let serializeStr = "";
        for (const key of SERIALIZE_QUEUE) {
            if (this.UNCHECK_AVATAR_PROPERTY.indexOf(key) >= 0) continue;
            if (data[key] !== undefined && data[key] !== null) {
                if (typeof data[key] === "string") {
                    serializeStr += `${key}_${data[key]}`;
                } else {
                    serializeStr += `${key}_${data[key].sn}`;
                    if (data[key].version !== undefined) {
                        serializeStr += "V" + data[key].version;
                    }
                }
            }
        }

        const result = sha1.sync(serializeStr);
        Logger.getInstance().debug("serialize avatar data: ", result, data);
        return result;
    }

    protected formatPartName(sourcePart: string, skin: SlotSkin, dir: string) {
        if (!sourcePart) {
            Logger.getInstance().error("part name is undefined");
            return "";
        }
        if (!skin) {
            Logger.getInstance().error("skin not does exist");
            return "";
        }
        const { sn, version, useCutOff } = skin;
        // 帽发截断
        let cutOff = useCutOff ? "_cutoff" : "";
        return sourcePart.replace("#", sn).replace("$", dir) + cutOff + version;
    }

    private generateReplaceTexture(textureKey: string): { url: string, json: string } {
        const atlas = new Atlas();
        const packer = new MaxRectsPacker();
        packer.padding = 2;
        packer.options.pot = false;
        for (const rep of this.replaceArr) {
            const slotName: string = rep.slot.replace("$", rep.dir.toString());
            const propertyName = this.slotNameToPropertyName(slotName);
            if (this.UNCHECK_AVATAR_PROPERTY.indexOf(propertyName) >= 0) continue;
            const slot: dragonBones.Slot = this.mArmatureDisplay.armature.getSlot(slotName);
            if (!slot) continue;
            const skin = this.formattingSkin(rep.skin);
            if (skin.sn.length === 0) continue;
            const partName = this.formatPartName(rep.part, skin, rep.dir.toString());
            const loadKey: string = this.partNameToLoadKey(partName);
            const dbFrameName: string = this.partNameToDBFrameName(partName);
            if (!this.scene.game.textures.exists(loadKey)) {
                Logger.getInstance().error("draw texture error, texture not exists, key: ", loadKey);
            } else {
                const frame = this.scene.game.textures.getFrame(loadKey, "__BASE");
                packer.add(frame.width, frame.height, {key: loadKey, name: dbFrameName});
            }
        }

        const {width, height} = packer.bins[0];
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
            // load unpack parts
            this.loadPartsRes((slotName) => {
                const propertyName = this.slotNameToPropertyName(slotName);
                return this.UNCHECK_AVATAR_PROPERTY.indexOf(propertyName) >= 0;
            })
                .then(() => {
                    // load replaced texture
                    // this.mPreReplaceTextureKey = this.mReplaceTextureKey;
                    this.mReplaceTextureKey = this.generateReplaceTextureKey();
                    if (this.scene.textures.exists(this.mReplaceTextureKey)) {
                        resolve(null);
                    } else {
                        const loadData = {
                            img: this.pathObj.osdPath + "user_avatar/texture/" + this.mReplaceTextureKey + ".png",
                            json: this.pathObj.osdPath + "user_avatar/texture/" + this.mReplaceTextureKey + ".json"
                        };
                        this.scene.load.atlas(this.mReplaceTextureKey, loadData.img, loadData.json);
                        const onLoadComplete = (key: string) => {
                            if (this.mReplaceTextureKey !== key) return;
                            this.mListenerMng.removePhaserListener(PhaserListenerType.Load, Phaser.Loader.Events.FILE_COMPLETE, onLoadComplete);
                            this.mListenerMng.removePhaserListener(PhaserListenerType.Load, Phaser.Loader.Events.FILE_LOAD_ERROR, onLoadError);

                            resolve(null);
                        };
                        const onLoadError = (imageFile: ImageFile) => {
                            if (this.mReplaceTextureKey !== imageFile.key) return;
                            this.mListenerMng.removePhaserListener(PhaserListenerType.Load, Phaser.Loader.Events.FILE_COMPLETE, onLoadComplete);
                            this.mListenerMng.removePhaserListener(PhaserListenerType.Load, Phaser.Loader.Events.FILE_LOAD_ERROR, onLoadError);

                            Logger.getInstance().warn("load dragonbones texture error: ", loadData);
                            reject("load dragonbones texture error: " + loadData);
                        };
                        this.mListenerMng.addPhaserListener(PhaserListenerType.Load, Phaser.Loader.Events.FILE_COMPLETE, onLoadComplete);
                        this.mListenerMng.addPhaserListener(PhaserListenerType.Load, Phaser.Loader.Events.FILE_LOAD_ERROR, onLoadError);
                        this.scene.load.start();
                    }
                })
                .catch((reason) => {
                    reject(reason);
                });
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

    private loadPartsRes(filter?: (slotName: string) => boolean): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            const loadList: Phaser.Types.Loader.FileTypes.ImageFileConfig[] = [];
            this.mLoadMap.forEach((pName, sName) => {
                if (filter !== undefined) {
                    if (!filter(sName)) return;
                }
                const loadUrl: string = this.partNameToLoadUrl(pName);
                const loadKey: string = this.partNameToLoadKey(pName);
                if (!this.scene.textures.exists(loadKey))
                    loadList.push({key: loadKey, url: loadUrl});
            });

            if (loadList.length === 0) {
                resolve(null);
                return;
            }

            const onLoadComplete = (data, totalComplete: integer, totalFailed: integer) => {
                if (!this.scene) return;
                this.mListenerMng.removePhaserListener(PhaserListenerType.Load, Phaser.Loader.Events.COMPLETE, onLoadComplete);
                resolve(null);
            };
            this.mListenerMng.addPhaserListener(PhaserListenerType.Load, Phaser.Loader.Events.COMPLETE, onLoadComplete);

            const onLoadError = (e: any) => {
                // ==============为了防止404资源重复请求加载，在加载失败后直接将其索引放置加载失败列表中，并从加载map中删除
                const sName = this.partLoadKeyToSlotName(e.key);
                if (!this.mLoadMap.has(sName)) return;
                const pName = this.mLoadMap.get(sName);
                const lKey = this.partNameToLoadKey(pName);
                // this.mLoadMap.delete(sName);
                this.mErrorLoadMap.set(lKey, e);
            };
            this.mListenerMng.addPhaserListener(PhaserListenerType.Load, Phaser.Loader.Events.FILE_LOAD_ERROR, onLoadError);

            this.scene.load.image(loadList);
            this.scene.load.start();
        });
    }

    private formattingSkin(skin: SlotSkin | string | number) {
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

    // head_base_3 => headBaseId
    private slotNameToPropertyName(slotName: string): string {
        const sliced = slotName.slice(0, -2);
        const humpName = sliced.replace(/([^_])(?:_+([^_]))/g, ($0, $1, $2) => {
            return $1 + $2.toUpperCase();
        });
        return humpName + "Id";
    }

    // TODO: 待优化
    private setReplaceArrAndLoadMap() {
        this.replaceArr.length = 0;
        const avater: IAvatar = this.displayInfo.avatar;
        this.replaceAvatar(avater);
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

        if (avater.headChinId) {
            this.replaceArr.push({
                slot: AvatarSlotNameTemp.HeadChin,
                part: AvatarPartNameTemp.HeadChin,
                dir: 3,
                skin: avater.headChinId,
            });
            this.replaceArr.push({
                slot: AvatarSlotNameTemp.HeadChin,
                part: AvatarPartNameTemp.HeadChin,
                dir: 1,
                skin: avater.headChinId,
            });
        }

        if (avater.bodyScarId) {
            this.replaceArr.push({
                slot: AvatarSlotNameTemp.BodyScar,
                part: AvatarPartNameTemp.BodyScar,
                dir: 3,
                skin: avater.bodyScarId,
            });
            this.replaceArr.push({
                slot: AvatarSlotNameTemp.BodyScar,
                part: AvatarPartNameTemp.BodyScar,
                dir: 1,
                skin: avater.bodyScarId,
            });
        }

        if (avater.bodyCloaId) {
            this.replaceArr.push({
                slot: AvatarSlotNameTemp.BodyCloa,
                part: AvatarPartNameTemp.BodyCloa,
                dir: 3,
                skin: avater.bodyCloaId,
            });
            this.replaceArr.push({
                slot: AvatarSlotNameTemp.BodyCloa,
                part: AvatarPartNameTemp.BodyCloa,
                dir: 1,
                skin: avater.bodyCloaId,
            });
        }

        if (avater.headHatsBackId) {
            this.replaceArr.push({
                slot: AvatarSlotNameTemp.HeadHatBack,
                part: AvatarPartNameTemp.HeadHatsBack,
                dir: 3,
                skin: avater.headHatsBackId
            });
            this.replaceArr.push({
                slot: AvatarSlotNameTemp.HeadHatBack,
                part: AvatarPartNameTemp.HeadHatsBack,
                dir: 1,
                skin: avater.headHatsBackId
            });
        }
    
        const setLoadMap = (soltNameTemp: string, partNameTemp: string, dir: number, skin: SlotSkin | string | number) => {
            const slotName: string = soltNameTemp.replace("$", dir.toString());
            const slot: dragonBones.Slot = this.mArmatureDisplay.armature.getSlot(slotName);
            if (!slot) return;
            const tempskin = this.formattingSkin(skin);
            if (!tempskin.sn) return;
            const partName = this.formatPartName(partNameTemp, tempskin, dir.toString());
            const loadKey: string = this.partNameToLoadKey(partName);
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

    private recordReplacedTexture(key: string) {
        if (ReplacedTextures.has(key)) {
            const count = ReplacedTextures.get(key);
            ReplacedTextures.set(key, count + 1);
        } else {
            ReplacedTextures.set(key, 1);
        }
    }

    private destroyReplacedTextureManually() {
        const textureAtlasData = this.mArmatureDisplay.armature["_replaceTextureAtlasData"];
        if (!textureAtlasData || !textureAtlasData.renderTexture) return;
        if (!ReplacedTextures.has(textureAtlasData.renderTexture.key)) return;
        const count = ReplacedTextures.get(textureAtlasData.renderTexture.key);
        if (count > 1) {
            ReplacedTextures.set(textureAtlasData.renderTexture.key, count - 1);
        } else {
            ReplacedTextures.delete(textureAtlasData.renderTexture.key);
            // this.scene.textures.remove(textureAtlasData.renderTexture.key);
            // this.scene.textures.removeKey(textureAtlasData.renderTexture.key);
            this.scene.cache.json.remove(textureAtlasData.renderTexture.key);
            textureAtlasData.renderTexture.destroy();
        }
        textureAtlasData.releaseRenderTexture();
    }

    /**
     * avatar预处理
     * 部分帽子需要替换头发资源
     * 部分头饰需要去掉头发
     */
    private replaceAvatar(avatar: IAvatar) {
        const headHat = avatar.headHatsId;
        if (headHat && typeof headHat !== "string") {
            const hatTag = headHat.tags;
            // 帽子标记使用截断资源
            if (hatTag && hatTag.includes("fit_cutoff")) {
                
            }
            if (hatTag) {
                if (hatTag.includes("fit_cutoff")) {
                    const headHair = avatar.headHairId;
                    const headHairBack = avatar.headHairBackId;
                    if (headHair && headHairBack && typeof headHair !== "string" && typeof headHairBack !== "string") {
                        const hairTag = headHair.tags;
                        const hairBackTag = headHairBack.tags;
                        if (hairTag && hairTag.includes("cutoff")) headHair.useCutOff = true;
                        if (hairBackTag && hairBackTag.includes("cutoff")) headHairBack.useCutOff = true;
                    }
                }
                if (hatTag.includes("remove_hair")) {
                    // this.replaceArr = this.replaceArr.filter((avatar) => avatar.slot !== AvatarSlotNameTemp.HeadHair 
                    //     && avatar.slot !== AvatarSlotNameTemp.HeadHairBack);
                    avatar.headHairId = null;
                    avatar.headHairBackId = null;
                }
            }
        }
    }
}
