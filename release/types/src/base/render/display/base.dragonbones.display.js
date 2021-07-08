var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import { Tool } from "utils";
import { Atlas, Logger, } from "structure";
import { BaseDisplay } from "./base.display";
import * as sha1 from "simple-sha1";
import { MaxRectsPacker } from "maxrects-packer";
export var AvatarSlotNameTemp;
(function (AvatarSlotNameTemp) {
    AvatarSlotNameTemp["BodyCostDres"] = "body_cost_dres_$";
    AvatarSlotNameTemp["BodyCost"] = "body_cost_$";
    AvatarSlotNameTemp["BodyTail"] = "body_tail_$";
    AvatarSlotNameTemp["BodyWing"] = "body_wing_$";
    AvatarSlotNameTemp["BodyBase"] = "body_base_$";
    AvatarSlotNameTemp["BodySpec"] = "body_spec_$";
    AvatarSlotNameTemp["BodyScar"] = "body_scar_$";
    AvatarSlotNameTemp["BodyCloa"] = "body_cloa_$";
    AvatarSlotNameTemp["FlegSpec"] = "fleg_spec_$";
    AvatarSlotNameTemp["FlegBase"] = "fleg_base_$";
    AvatarSlotNameTemp["FlegCost"] = "fleg_cost_$";
    AvatarSlotNameTemp["BarmSpec"] = "barm_spec_$";
    AvatarSlotNameTemp["BarmBase"] = "barm_base_$";
    AvatarSlotNameTemp["BarmCost"] = "barm_cost_$";
    AvatarSlotNameTemp["BarmWeap"] = "barm_weap_$";
    AvatarSlotNameTemp["ShldBarm"] = "barm_shld_$";
    AvatarSlotNameTemp["BlegSpec"] = "bleg_spec_$";
    AvatarSlotNameTemp["BlegBase"] = "bleg_base_$";
    AvatarSlotNameTemp["BlegCost"] = "bleg_cost_$";
    AvatarSlotNameTemp["FarmSpec"] = "farm_spec_$";
    AvatarSlotNameTemp["FarmBase"] = "farm_base_$";
    AvatarSlotNameTemp["FarmCost"] = "farm_cost_$";
    AvatarSlotNameTemp["ShldFarm"] = "farm_shld_$";
    AvatarSlotNameTemp["FarmWeap"] = "farm_weap_$";
    AvatarSlotNameTemp["HeadSpec"] = "head_spec_$";
    AvatarSlotNameTemp["HeadMask"] = "head_mask_$";
    AvatarSlotNameTemp["HeadEyes"] = "head_eyes_$";
    AvatarSlotNameTemp["HeadBase"] = "head_base_$";
    AvatarSlotNameTemp["HeadHairBack"] = "head_hair_back_$";
    AvatarSlotNameTemp["HeadMous"] = "head_mous_$";
    AvatarSlotNameTemp["HeadHair"] = "head_hair_$";
    AvatarSlotNameTemp["HeadHats"] = "head_hats_$";
    AvatarSlotNameTemp["HeadFace"] = "head_face_$";
    AvatarSlotNameTemp["HeadChin"] = "head_chin_$";
})(AvatarSlotNameTemp || (AvatarSlotNameTemp = {}));
export var AvatarPartNameTemp;
(function (AvatarPartNameTemp) {
    AvatarPartNameTemp["BarmBase"] = "barm_base_#_$";
    AvatarPartNameTemp["BarmCost"] = "barm_cost_#_$";
    AvatarPartNameTemp["BarmSpec"] = "barm_spec_#_$";
    AvatarPartNameTemp["BlegBase"] = "bleg_base_#_$";
    AvatarPartNameTemp["BlegCost"] = "bleg_cost_#_$";
    AvatarPartNameTemp["BlegSpec"] = "bleg_spec_#_$";
    AvatarPartNameTemp["BodyBase"] = "body_base_#_$";
    AvatarPartNameTemp["BodyCost"] = "body_cost_#_$";
    AvatarPartNameTemp["BodyCostDres"] = "body_cost_dres_#_$";
    AvatarPartNameTemp["BodySpec"] = "body_spec_#_$";
    AvatarPartNameTemp["BodyTail"] = "body_tail_#_$";
    AvatarPartNameTemp["BodyWing"] = "body_wing_#_$";
    AvatarPartNameTemp["BodyScar"] = "body_scar_#_$";
    AvatarPartNameTemp["BodyCloa"] = "body_cloa_#_$";
    AvatarPartNameTemp["FarmBase"] = "farm_base_#_$";
    AvatarPartNameTemp["FarmCost"] = "farm_cost_#_$";
    AvatarPartNameTemp["FarmSpec"] = "farm_spec_#_$";
    AvatarPartNameTemp["FlegBase"] = "fleg_base_#_$";
    AvatarPartNameTemp["FlegCost"] = "fleg_cost_#_$";
    AvatarPartNameTemp["FlegSpec"] = "fleg_spec_#_$";
    AvatarPartNameTemp["HeadBase"] = "head_base_#_$";
    AvatarPartNameTemp["HeadEyes"] = "head_eyes_#_$";
    AvatarPartNameTemp["HeadHair"] = "head_hair_#_$";
    AvatarPartNameTemp["HeadHairBack"] = "head_hair_back_#_$";
    AvatarPartNameTemp["HeadHats"] = "head_hats_#_$";
    AvatarPartNameTemp["HeadFace"] = "head_face_#_$";
    AvatarPartNameTemp["HeadMask"] = "head_mask_#_$";
    AvatarPartNameTemp["HeadMous"] = "head_mous_#_$";
    AvatarPartNameTemp["HeadSpec"] = "head_spec_#_$";
    AvatarPartNameTemp["HeadChin"] = "head_chin_#_$";
    AvatarPartNameTemp["ShldFarm"] = "farm_shld_#_$";
    AvatarPartNameTemp["WeapFarm"] = "farm_weap_#_$";
    AvatarPartNameTemp["ShldBarm"] = "barm_shld_#_$";
    AvatarPartNameTemp["WeapBarm"] = "barm_weap_#_$";
})(AvatarPartNameTemp || (AvatarPartNameTemp = {}));
var SERIALIZE_QUEUE = [
    "headBaseId",
    "headHairId",
    "headEyesId",
    "headHairBackId",
    "headMousId",
    "headHatsId",
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
var ReplacedTextures = new Map();
// 解决低版本和高版本共用同一张合图的问题，低版本未做"不重复上传"的处理
var ReplacedTextureVersion = "v1";
/**
 * 龙骨显示对象
 */
var BaseDragonbonesDisplay = /** @class */ (function (_super) {
    __extends_1(BaseDragonbonesDisplay, _super);
    function BaseDragonbonesDisplay(scene, pathObj, id) {
        var _this = _super.call(this, scene, id) || this;
        _this.pathObj = pathObj;
        _this.mArmatureName = "Armature";
        _this.mResourceName = "bones_human01";
        _this.mInteractive = true;
        _this.replaceArr = [];
        // key: slotName; val: partName
        _this.mLoadMap = new Map();
        // key: loadKey; val: err
        _this.mErrorLoadMap = new Map();
        _this.mNeedReplaceTexture = false;
        // 不需要手动释放旧的资源，龙骨中已经做了相关处理
        // private mPreReplaceTextureKey: string = "";
        _this.mReplaceTextureKey = "";
        // phaer 监听回收
        _this.mLoadListeners = new Map();
        _this.mTexturesListeners = new Map();
        _this.loadError = false;
        _this.UNPACK_SLOTS = [AvatarSlotNameTemp.FarmWeap, AvatarSlotNameTemp.BarmWeap];
        _this.UNCHECK_AVATAR_PROPERTY = ["id", "dirable", "farmWeapId", "farmShldId", "barmWeapId", "barmShldId"];
        return _this;
    }
    Object.defineProperty(BaseDragonbonesDisplay.prototype, "displayInfo", {
        get: function () {
            return this.mDisplayInfo;
        },
        set: function (val) {
            if (this.mNeedReplaceTexture === false) {
                this.mNeedReplaceTexture = this.checkNeedReplaceTexture(this.mDisplayInfo, val);
            }
            this.mDisplayInfo = val;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BaseDragonbonesDisplay.prototype, "spriteWidth", {
        get: function () {
            if (this.mArmatureDisplay) {
                return this.mArmatureDisplay.width;
            }
            return 0;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BaseDragonbonesDisplay.prototype, "spriteHeight", {
        get: function () {
            if (this.mArmatureDisplay) {
                return this.mArmatureDisplay.height;
            }
            return 0;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BaseDragonbonesDisplay.prototype, "topPoint", {
        get: function () {
            return this.mBoardPoint;
        },
        enumerable: true,
        configurable: true
    });
    // 改变装扮接口(全量)
    BaseDragonbonesDisplay.prototype.load = function (display, field, useRenderTex) {
        // test
        // useRenderTex = false;
        var _this = this;
        if (useRenderTex === void 0) { useRenderTex = true; }
        this.displayInfo = display;
        if (!this.displayInfo)
            return Promise.reject("displayInfo error");
        this.setData("id", this.displayInfo.id);
        return new Promise(function (resolve, reject) {
            _this.buildDragbones()
                .then(function () {
                return new Promise(function (_resolve, _reject) {
                    // prepare for refreshAvatar
                    _this.setClickInteractive(_this.mInteractive);
                    _this.displayCreated();
                    _this.setReplaceArrAndLoadMap();
                    _this.showLoadingShadow();
                    if (useRenderTex && _this.mNeedReplaceTexture) {
                        _this.prepareReplaceRenderTexture()
                            .then(function () {
                            _resolve(null);
                        })
                            .catch(function () {
                            // fallback
                            useRenderTex = false;
                            _this.prepareReplaceSlotsDisplay()
                                .then(function () {
                                _resolve(null);
                            });
                        });
                    }
                    else {
                        useRenderTex = false;
                        _this.prepareReplaceSlotsDisplay()
                            .then(function () {
                            _resolve(null);
                        });
                    }
                });
            })
                .then(function () {
                _this.refreshAvatar(useRenderTex);
                _this.hideLoadingShadow();
                _this.mNeedReplaceTexture = false;
                resolve(null);
            });
        });
    };
    // 生成合图
    BaseDragonbonesDisplay.prototype.save = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.loadPartsRes()
                .then(function () {
                var textureKey = _this.generateReplaceTextureKey();
                var replaceData = _this.generateReplaceTexture(textureKey);
                resolve({ key: textureKey, url: replaceData.url, json: replaceData.json });
            });
        });
    };
    BaseDragonbonesDisplay.prototype.getDisplay = function () {
        return this.mArmatureDisplay;
    };
    BaseDragonbonesDisplay.prototype.play = function (val) {
        if (!val)
            return;
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
        _super.prototype.play.call(this, val);
    };
    BaseDragonbonesDisplay.prototype.fadeIn = function (callback) {
        this.clearFadeTween();
        this.alpha = 0;
        this.mFadeTween = this.scene.tweens.add({
            targets: this,
            alpha: 1,
            duration: 1200,
            onComplete: function () {
                if (callback)
                    callback();
            }
        });
    };
    BaseDragonbonesDisplay.prototype.fadeOut = function (callback) {
        this.clearFadeTween();
        this.mFadeTween = this.scene.tweens.add({
            targets: this,
            alpha: 0,
            duration: 1200,
            onComplete: function () {
                if (callback)
                    callback();
            }
        });
    };
    BaseDragonbonesDisplay.prototype.destroy = function () {
        var _this = this;
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
        this.mLoadListeners.forEach(function (val, key) {
            for (var _i = 0, val_1 = val; _i < val_1.length; _i++) {
                var func = val_1[_i];
                _this.scene.load.off(key, func, _this);
            }
        });
        this.mLoadListeners.clear();
        this.mTexturesListeners.forEach(function (val, key) {
            for (var _i = 0, val_2 = val; _i < val_2.length; _i++) {
                var func = val_2[_i];
                _this.scene.textures.off(key, func, _this);
            }
        });
        this.mTexturesListeners.clear();
        _super.prototype.destroy.call(this);
    };
    BaseDragonbonesDisplay.prototype.setClickInteractive = function (active) {
        this.mInteractive = active;
        if (active) {
            var rect = new Phaser.Geom.Rectangle(0, 0, 50, 70);
            rect.x = -rect.width >> 1;
            rect.y = -rect.height;
            this.setInteractive(rect, Phaser.Geom.Rectangle.Contains);
        }
        else {
            this.disableInteractive();
        }
    };
    Object.defineProperty(BaseDragonbonesDisplay.prototype, "resourceName", {
        get: function () {
            return this.mResourceName;
        },
        set: function (val) {
            this.mResourceName = val;
        },
        enumerable: true,
        configurable: true
    });
    BaseDragonbonesDisplay.prototype.buildDragbones = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (!_this.scene.cache.custom.dragonbone) {
                reject("dragonbone plugin error");
                return;
            }
            if (_this.scene.cache.custom.dragonbone.get(_this.resourceName)) {
                _this.createArmatureDisplay();
                resolve(_this.mArmatureDisplay);
            }
            else {
                var res = "dragonbones";
                var resPath = _this.localResourceRoot;
                var pngUrl = resPath + (res + "/" + _this.resourceName + "_tex.png");
                var jsonUrl = resPath + (res + "/" + _this.resourceName + "_tex.json");
                var dbbinUrl = resPath + (res + "/" + _this.resourceName + "_ske.dbbin");
                _this.loadDragonBones(pngUrl, jsonUrl, dbbinUrl)
                    .then(function () {
                    _this.createArmatureDisplay();
                    resolve(_this.mArmatureDisplay);
                });
            }
        });
    };
    Object.defineProperty(BaseDragonbonesDisplay.prototype, "localResourceRoot", {
        get: function () {
            return this.pathObj.resPath;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BaseDragonbonesDisplay.prototype, "osdResourceRoot", {
        get: function () {
            return this.pathObj.osdPath;
        },
        enumerable: true,
        configurable: true
    });
    // TODO: 游戏中截图会出现404，待解决
    BaseDragonbonesDisplay.prototype.partNameToLoadUrl = function (partName) {
        return this.osdResourceRoot + "avatar/part/" + partName + ".png";
    };
    BaseDragonbonesDisplay.prototype.partNameToLoadKey = function (partName) {
        return partName + "_png";
    };
    BaseDragonbonesDisplay.prototype.partNameToDBFrameName = function (partName) {
        return "test resources/" + partName;
    };
    BaseDragonbonesDisplay.prototype.generateReplaceTextureKey = function () {
        return this.serializeAvatarData(this.displayInfo.avatar) + ReplacedTextureVersion;
    };
    BaseDragonbonesDisplay.prototype.createArmatureDisplay = function () {
        if (!this.scene)
            return;
        if (this.mArmatureDisplay)
            return;
        this.mArmatureDisplay = this.scene.add.armature(this.mArmatureName, this.resourceName);
        this.addAt(this.mArmatureDisplay, 0);
        if (this.mAnimation) {
            this.play(this.mAnimation);
        }
        var bound = this.mArmatureDisplay.armature.getBone("board");
        if (bound) {
            this.mBoardPoint = new Phaser.Geom.Point(bound.global.x, bound.global.y);
        }
        else {
            this.mBoardPoint = new Phaser.Geom.Point(35, 40);
        }
    };
    BaseDragonbonesDisplay.prototype.onArmatureLoopComplete = function (event) {
        if (!this.mArmatureDisplay || !this.mAnimation) {
            return;
        }
        var queue = this.mAnimation.playingQueue;
        if (!queue)
            return;
        if (queue.playedTimes === undefined) {
            queue.playedTimes = 1;
        }
        else {
            queue.playedTimes++;
        }
        var times = queue.playTimes === undefined ? -1 : queue.playTimes;
        if (queue.playedTimes >= times && times > 0) {
            this.mArmatureDisplay.removeDBEventListener(dragonBones.EventObject.LOOP_COMPLETE, this.onArmatureLoopComplete, this);
        }
    };
    BaseDragonbonesDisplay.prototype.showLoadingShadow = function () {
        if (this.mLoadingShadow) {
            this.mLoadingShadow.destroy();
        }
        this.mLoadingShadow = this.scene.make.image({ key: "avatar_placeholder", x: -22, y: -68 }).setOrigin(0);
        this.add(this.mLoadingShadow);
        if (this.mArmatureDisplay) {
            this.mArmatureDisplay.visible = false;
        }
    };
    BaseDragonbonesDisplay.prototype.hideLoadingShadow = function () {
        if (this.mLoadingShadow) {
            this.mLoadingShadow.destroy();
        }
        this.mLoadingShadow = undefined;
        if (this.mArmatureDisplay) {
            this.mArmatureDisplay.visible = true;
        }
    };
    BaseDragonbonesDisplay.prototype.loadDragonBones = function (pngUrl, jsonUrl, dbbinUrl) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.scene.load.dragonbone(_this.resourceName, pngUrl, jsonUrl, dbbinUrl, null, null, { responseType: "arraybuffer" });
            var onLoad = function () {
                if (!_this.scene.cache.custom.dragonbone.get(_this.resourceName))
                    return;
                _this.removePhaserListener(PhaserListenerType.Load, Phaser.Loader.Events.COMPLETE, onLoad);
                resolve(null);
            };
            var onFileLoadError = function () {
                _this.removePhaserListener(PhaserListenerType.Load, Phaser.Loader.Events.FILE_LOAD_ERROR, onFileLoadError);
                // tslint:disable-next-line:no-console
                // console.log("fileloaderror ===>", pngUrl);
                reject(null);
            };
            _this.addPhaserListener(PhaserListenerType.Load, Phaser.Loader.Events.COMPLETE, onLoad);
            _this.addPhaserListener(PhaserListenerType.Load, Phaser.Loader.Events.FILE_LOAD_ERROR, onFileLoadError);
            _this.scene.load.start();
        });
    };
    BaseDragonbonesDisplay.prototype.refreshAvatar = function (useRenderTexture) {
        if (useRenderTexture) {
            if (this.scene.textures.exists(this.mReplaceTextureKey)) {
                var tex = this.scene.textures.get(this.mReplaceTextureKey);
                if (this.mArmatureDisplay.armature.replacedTexture !== tex) {
                    // 检查老图片引用计数
                    this.destroyReplacedTextureManually();
                    // 新增合图使用
                    this.recordReplacedTexture(tex.key);
                    this.mArmatureDisplay.armature.replacedTexture = tex;
                }
            }
        }
        var slotList = this.mArmatureDisplay.armature.getSlots();
        slotList.forEach(function (slot) {
            if (slot) {
                slot.display.visible = false;
            }
        });
        // const defaultDBTexture: Phaser.Textures.Texture = this.scene.game.textures.get(this.resourceName);
        var curDBTexture = this.scene.game.textures.get(this.mReplaceTextureKey);
        for (var _i = 0, _a = this.replaceArr; _i < _a.length; _i++) {
            var rep = _a[_i];
            var slotName = rep.slot.replace("$", rep.dir.toString());
            var slot = this.mArmatureDisplay.armature.getSlot(slotName);
            if (!slot)
                continue;
            var skin = this.formattingSkin(rep.skin);
            if (skin.sn.length === 0)
                continue;
            var partName = rep.part.replace("#", skin.sn.toString()).replace("$", rep.dir.toString()) + skin.version;
            var loadKey = this.partNameToLoadKey(partName);
            var dbFrameName = this.partNameToDBFrameName(partName);
            // if (this.UNPACK_SLOTS.indexOf(rep.slot) < 0) {
            //     slot.display.visible = this.scene.textures.exists(loadKey) || dragonBonesTexture.frames[dbFrameName];
            //     continue;
            // }
            var img = null;
            if (curDBTexture && curDBTexture.frames[dbFrameName]) {
                img = new dragonBones.phaser.display.SlotImage(this.scene, slot.display.x, slot.display.y, this.mReplaceTextureKey, dbFrameName);
            }
            else if (this.scene.textures.exists(loadKey)) {
                img = new dragonBones.phaser.display.SlotImage(this.scene, slot.display.x, slot.display.y, loadKey);
            }
            if (img) {
                slot.display.visible = true;
                slot.replaceDisplay(img);
            }
            else {
                Logger.getInstance().warn("dragonbones replace slot display error: no texture: ", loadKey);
            }
        }
    };
    // doc: https://code.apowo.com/PixelPai/game-core/-/issues/239
    BaseDragonbonesDisplay.prototype.serializeAvatarData = function (data) {
        var serializeStr = "";
        for (var _i = 0, SERIALIZE_QUEUE_1 = SERIALIZE_QUEUE; _i < SERIALIZE_QUEUE_1.length; _i++) {
            var key = SERIALIZE_QUEUE_1[_i];
            if (this.UNCHECK_AVATAR_PROPERTY.indexOf(key) >= 0)
                continue;
            if (data[key] !== undefined && data[key] !== null) {
                if (typeof data[key] === "string") {
                    serializeStr += key + "_" + data[key];
                }
                else {
                    serializeStr += key + "_" + data[key].sn;
                    if (data[key].version !== undefined) {
                        serializeStr += "V" + data[key].version;
                    }
                }
            }
        }
        var result = sha1.sync(serializeStr);
        Logger.getInstance().debug("serialize avatar data: ", result, data);
        return result;
    };
    BaseDragonbonesDisplay.prototype.generateReplaceTexture = function (textureKey) {
        var atlas = new Atlas();
        var packer = new MaxRectsPacker();
        packer.padding = 2;
        packer.options.pot = false;
        for (var _i = 0, _a = this.replaceArr; _i < _a.length; _i++) {
            var rep = _a[_i];
            var slotName = rep.slot.replace("$", rep.dir.toString());
            var propertyName = this.slotNameToPropertyName(slotName);
            if (this.UNCHECK_AVATAR_PROPERTY.indexOf(propertyName) >= 0)
                continue;
            var slot = this.mArmatureDisplay.armature.getSlot(slotName);
            if (!slot)
                continue;
            var skin = this.formattingSkin(rep.skin);
            if (skin.sn.length === 0)
                continue;
            var partName = rep.part.replace("#", skin.sn.toString()).replace("$", rep.dir.toString()) + skin.version;
            var loadKey = this.partNameToLoadKey(partName);
            var dbFrameName = this.partNameToDBFrameName(partName);
            if (!this.scene.game.textures.exists(loadKey)) {
                Logger.getInstance().error("draw texture error, texture not exists, key: ", loadKey);
            }
            else {
                var frame = this.scene.game.textures.getFrame(loadKey, "__BASE");
                packer.add(frame.width, frame.height, { key: loadKey, name: dbFrameName });
            }
        }
        var _b = packer.bins[0], width = _b.width, height = _b.height;
        var canvas = this.scene.textures.createCanvas("canvas_" + this.id + "_" + textureKey, width, height);
        packer.bins.forEach(function (bin) {
            bin.rects.forEach(function (rect) {
                canvas.drawFrame(rect.data.key, "__BASE", rect.x, rect.y);
                atlas.addFrame(rect.data.name, rect);
            });
        });
        var url = canvas.canvas.toDataURL("image/png", 1);
        canvas.destroy();
        return { url: url, json: atlas.toString() };
    };
    BaseDragonbonesDisplay.prototype.prepareReplaceRenderTexture = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            // load unpack parts
            _this.loadPartsRes(function (slotName) {
                var propertyName = _this.slotNameToPropertyName(slotName);
                return _this.UNCHECK_AVATAR_PROPERTY.indexOf(propertyName) >= 0;
            })
                .then(function () {
                // load replaced texture
                // this.mPreReplaceTextureKey = this.mReplaceTextureKey;
                _this.mReplaceTextureKey = _this.generateReplaceTextureKey();
                if (_this.scene.textures.exists(_this.mReplaceTextureKey)) {
                    resolve(null);
                }
                else {
                    var loadData_1 = {
                        img: _this.pathObj.osdPath + "user_avatar/texture/" + _this.mReplaceTextureKey + ".png",
                        json: _this.pathObj.osdPath + "user_avatar/texture/" + _this.mReplaceTextureKey + ".json"
                    };
                    _this.scene.load.atlas(_this.mReplaceTextureKey, loadData_1.img, loadData_1.json);
                    var onLoadComplete_1 = function (key) {
                        if (_this.mReplaceTextureKey !== key)
                            return;
                        _this.removePhaserListener(PhaserListenerType.Load, Phaser.Loader.Events.FILE_COMPLETE, onLoadComplete_1);
                        _this.removePhaserListener(PhaserListenerType.Load, Phaser.Loader.Events.FILE_LOAD_ERROR, onLoadError_1);
                        // tslint:disable-next-line:no-console
                        console.warn("load dragonbones texture complete: ", loadData_1);
                        resolve(null);
                    };
                    var onLoadError_1 = function (imageFile) {
                        if (_this.mReplaceTextureKey !== imageFile.key)
                            return;
                        _this.removePhaserListener(PhaserListenerType.Load, Phaser.Loader.Events.FILE_COMPLETE, onLoadComplete_1);
                        _this.removePhaserListener(PhaserListenerType.Load, Phaser.Loader.Events.FILE_LOAD_ERROR, onLoadError_1);
                        // tslint:disable-next-line:no-console
                        console.warn("load dragonbones texture error: ", loadData_1);
                        reject("load dragonbones texture error: " + loadData_1);
                    };
                    _this.addPhaserListener(PhaserListenerType.Load, Phaser.Loader.Events.FILE_COMPLETE, onLoadComplete_1);
                    _this.addPhaserListener(PhaserListenerType.Load, Phaser.Loader.Events.FILE_LOAD_ERROR, onLoadError_1);
                    _this.scene.load.start();
                }
            })
                .catch(function (reason) {
                reject(reason);
            });
        });
    };
    BaseDragonbonesDisplay.prototype.prepareReplaceSlotsDisplay = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (_this.mLoadMap && _this.mLoadMap.size > 0) {
                _this.loadPartsRes()
                    .then(function () {
                    resolve(null);
                });
            }
            else {
                resolve(null);
            }
        });
    };
    BaseDragonbonesDisplay.prototype.loadPartsRes = function (filter) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var loadList = [];
            _this.mLoadMap.forEach(function (pName, sName) {
                if (filter !== undefined) {
                    if (!filter(sName))
                        return;
                }
                var loadUrl = _this.partNameToLoadUrl(pName);
                var loadKey = _this.partNameToLoadKey(pName);
                if (!_this.scene.textures.exists(loadKey))
                    loadList.push({ key: loadKey, url: loadUrl });
            });
            if (loadList.length === 0) {
                resolve(null);
                return;
            }
            var onLoadComplete = function (data, totalComplete, totalFailed) {
                if (!_this.scene)
                    return;
                _this.removePhaserListener(PhaserListenerType.Load, Phaser.Loader.Events.COMPLETE, onLoadComplete);
                resolve(null);
            };
            _this.addPhaserListener(PhaserListenerType.Load, Phaser.Loader.Events.COMPLETE, onLoadComplete);
            var onLoadError = function (e) {
                // ==============为了防止404资源重复请求加载，在加载失败后直接将其索引放置加载失败列表中，并从加载map中删除
                var sName = _this.partLoadKeyToSlotName(e.key);
                if (!_this.mLoadMap.has(sName))
                    return;
                var pName = _this.mLoadMap.get(sName);
                var lKey = _this.partNameToLoadKey(pName);
                // this.mLoadMap.delete(sName);
                _this.mErrorLoadMap.set(lKey, e);
            };
            _this.addPhaserListener(PhaserListenerType.Load, Phaser.Loader.Events.FILE_LOAD_ERROR, onLoadError);
            _this.scene.load.image(loadList);
            _this.scene.load.start();
        });
    };
    BaseDragonbonesDisplay.prototype.formattingSkin = function (skin) {
        var version = "", sn = "";
        if (typeof skin === "string" || typeof skin === "number") {
            sn = skin.toString();
        }
        else {
            version = (skin.version === undefined || skin.version === "" ? "" : "_" + skin.version);
            sn = skin.sn;
        }
        return { sn: sn, version: version };
    };
    BaseDragonbonesDisplay.prototype.clearFadeTween = function () {
        if (this.mFadeTween) {
            this.mFadeTween.stop();
            this.mFadeTween.remove();
        }
    };
    BaseDragonbonesDisplay.prototype.checkNeedReplaceTexture = function (preVal, newVal) {
        if (!newVal)
            return false;
        if (!preVal)
            return true;
        var preAvatar = preVal.avatar;
        var newAvatar = newVal.avatar;
        for (var key in newAvatar) {
            if (!newAvatar.hasOwnProperty(key))
                continue;
            if (this.UNCHECK_AVATAR_PROPERTY.indexOf(key) >= 0)
                continue;
            if (!preAvatar.hasOwnProperty(key))
                return true;
            if (typeof preAvatar[key] === "string" && typeof newAvatar[key] === "string") {
                if (preAvatar[key] !== newAvatar[key])
                    return true;
                else
                    continue;
            }
            if (preAvatar[key].hasOwnProperty("sn") && newAvatar[key].hasOwnProperty("sn")) {
                if (preAvatar[key].sn !== newAvatar[key].sn)
                    return true;
                else if (preAvatar[key].version !== newAvatar[key].version)
                    return true;
                else
                    continue;
            }
            if (preAvatar[key] !== newAvatar[key])
                return true;
        }
        return false;
    };
    // head_base_0001_3_1 => head_base_3 ; head_hair_back_11111111_3_1 => head_hair_back_3
    BaseDragonbonesDisplay.prototype.partLoadKeyToSlotName = function (key) {
        var arr = key.split("_");
        if (Tool.isNumeric(arr[2])) {
            return arr[0] + "_" + arr[1] + "_" + arr[3];
        }
        else {
            return arr[0] + "_" + arr[1] + "_" + arr[2] + "_" + arr[4];
        }
    };
    // head_base_3 => headBaseId
    BaseDragonbonesDisplay.prototype.slotNameToPropertyName = function (slotName) {
        var sliced = slotName.slice(0, -2);
        var humpName = sliced.replace(/([^_])(?:_+([^_]))/g, function ($0, $1, $2) {
            return $1 + $2.toUpperCase();
        });
        return humpName + "Id";
    };
    // TODO: 待优化
    BaseDragonbonesDisplay.prototype.setReplaceArrAndLoadMap = function () {
        var _this = this;
        this.replaceArr.length = 0;
        var avater = this.displayInfo.avatar;
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
        var setLoadMap = function (soltNameTemp, partNameTemp, dir, skin) {
            var slotName = soltNameTemp.replace("$", dir.toString());
            var slot = _this.mArmatureDisplay.armature.getSlot(slotName);
            if (!slot)
                return;
            var tempskin = _this.formattingSkin(skin);
            if (!tempskin.sn)
                return;
            var partName = partNameTemp.replace("#", tempskin.sn).replace("$", dir.toString()) + tempskin.version;
            var dragonBonesTexture = _this.scene.game.textures.get(_this.resourceName);
            var loadKey = _this.partNameToLoadKey(partName);
            var dbFrameName = _this.partNameToDBFrameName(partName);
            if (_this.mErrorLoadMap.get(loadKey))
                return;
            if (!_this.scene.textures.exists(loadKey)) { //  && !dragonBonesTexture.frames[dbFrameName]
                // ==============所有资源都需要从外部加载
                _this.mLoadMap.set(slotName, partName);
            }
        };
        this.mLoadMap.clear();
        for (var _i = 0, _a = this.replaceArr; _i < _a.length; _i++) {
            var obj = _a[_i];
            setLoadMap(obj.slot, obj.part, obj.dir, obj.skin);
        }
    };
    // issues: https://code.apowo.com/PixelPai/game-core/-/issues/243
    BaseDragonbonesDisplay.prototype.addPhaserListener = function (type, key, func) {
        var loadPlugin;
        var listenersMap;
        switch (type) {
            case PhaserListenerType.Load: {
                loadPlugin = this.scene.load;
                listenersMap = this.mLoadListeners;
                break;
            }
            case PhaserListenerType.Textures: {
                loadPlugin = this.scene.textures;
                listenersMap = this.mTexturesListeners;
                break;
            }
        }
        loadPlugin.off(key, func, this);
        loadPlugin.on(key, func, this);
        if (!listenersMap.has(key)) {
            listenersMap.set(key, []);
        }
        var listeners = listenersMap.get(key);
        var idx = listeners.indexOf(func);
        if (idx >= 0)
            listeners.splice(idx, 1);
        listeners.push(func);
    };
    BaseDragonbonesDisplay.prototype.removePhaserListener = function (type, key, func) {
        var loadPlugin;
        var listenersMap;
        switch (type) {
            case PhaserListenerType.Load: {
                loadPlugin = this.scene.load;
                listenersMap = this.mLoadListeners;
                break;
            }
            case PhaserListenerType.Textures: {
                loadPlugin = this.scene.textures;
                listenersMap = this.mTexturesListeners;
                break;
            }
        }
        loadPlugin.off(key, func, this);
        if (!listenersMap.has(key))
            return;
        var listeners = listenersMap.get(key);
        var idx = listeners.indexOf(func);
        if (idx >= 0)
            listeners.splice(idx, 1);
    };
    BaseDragonbonesDisplay.prototype.recordReplacedTexture = function (key) {
        if (ReplacedTextures.has(key)) {
            var count = ReplacedTextures.get(key);
            ReplacedTextures.set(key, count + 1);
        }
        else {
            ReplacedTextures.set(key, 1);
        }
    };
    BaseDragonbonesDisplay.prototype.destroyReplacedTextureManually = function () {
        var textureAtlasData = this.mArmatureDisplay.armature["_replaceTextureAtlasData"];
        if (!textureAtlasData || !textureAtlasData.renderTexture)
            return;
        if (!ReplacedTextures.has(textureAtlasData.renderTexture.key))
            return;
        var count = ReplacedTextures.get(textureAtlasData.renderTexture.key);
        if (count > 1) {
            ReplacedTextures.set(textureAtlasData.renderTexture.key, count - 1);
        }
        else {
            ReplacedTextures.delete(textureAtlasData.renderTexture.key);
            // this.scene.textures.remove(textureAtlasData.renderTexture.key);
            // this.scene.textures.removeKey(textureAtlasData.renderTexture.key);
            this.scene.cache.json.remove(textureAtlasData.renderTexture.key);
            textureAtlasData.renderTexture.destroy();
        }
        textureAtlasData.releaseRenderTexture();
    };
    return BaseDragonbonesDisplay;
}(BaseDisplay));
export { BaseDragonbonesDisplay };
var PhaserListenerType;
(function (PhaserListenerType) {
    PhaserListenerType[PhaserListenerType["Load"] = 0] = "Load";
    PhaserListenerType[PhaserListenerType["Textures"] = 1] = "Textures";
})(PhaserListenerType || (PhaserListenerType = {}));
//# sourceMappingURL=base.dragonbones.display.js.map