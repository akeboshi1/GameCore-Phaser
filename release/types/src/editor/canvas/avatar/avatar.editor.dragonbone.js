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
var _a, _b;
import { BaseDragonbonesDisplay } from "baseRender";
import { Logger } from "structure";
var AvatarEditorDragonbone = /** @class */ (function (_super) {
    __extends_1(AvatarEditorDragonbone, _super);
    function AvatarEditorDragonbone(scene, homePath, osdPath, emitter, autoScale, startSets, onReadyForSnapshot) {
        var _this = _super.call(this, scene) || this;
        _this.mAutoScale = true; // 截图时不能临时改变龙骨scale（除y*-1以外），只能在创建时就设置好scale
        _this.mCurAnimationName = "idle";
        _this.mCurDir = 3;
        _this.mBaseSets = [];
        _this.mSets = [];
        _this.mParts = {};
        _this.mArmatureBottomArea = 0;
        _this.mArmatureBottomArea_head = 0;
        _this.mWebHomePath = osdPath;
        _this.mLocalHomePath = homePath;
        _this.mEmitter = emitter;
        _this.mAutoScale = autoScale;
        var parentContainer = scene.add.container(0, 0);
        parentContainer.add(_this);
        if (startSets) {
            _this.mSets = startSets;
        }
        if (onReadyForSnapshot) {
            _this.mOnReadyForSnapshot = onReadyForSnapshot;
        }
        _this.setBaseSets(AvatarEditorDragonbone.DEFAULT_SETS);
        _this.createDisplays();
        return _this;
    }
    AvatarEditorDragonbone.prototype.destroy = function () {
        this.removeAll(true);
        if (this.mDisplay_default) {
            this.remove(this.mDisplay_default);
            this.mDisplay_default.destroy();
            this.mDisplay_default = null;
        }
        if (this.mDisplay_head) {
            this.remove(this.mDisplay_head);
            this.mDisplay_head.destroy();
            this.mDisplay_head = null;
        }
        this.mCurAnimationName = null;
        this.mCurDir = null;
        if (this.mBaseSets)
            this.mBaseSets = [];
        this.mBaseSets = null;
        if (this.mSets)
            this.mSets = [];
        this.mSets = null;
        this.mParts = {};
        this.mParts = null;
        _super.prototype.destroy.call(this);
    };
    // 每次调用强制重新加载资源（因为可能出现不同图片，但是key相同的情况）
    AvatarEditorDragonbone.prototype.loadLocalResources = function (img, part, dir) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var key = _this.partTextureSaveKey(part, img.key, dir);
            if (_this.scene.textures.exists(key)) {
                _this.scene.textures.remove(key);
                _this.scene.textures.removeKey(key);
            }
            var onLoad = function (k) {
                if (key !== k)
                    return;
                _this.scene.textures.off("onload", onLoad, _this, false);
                _this.scene.textures.off(Phaser.Loader.Events.FILE_LOAD_ERROR, onLoadError, _this);
                _this.reloadDisplay();
                resolve(k);
            };
            var onLoadError = function (k) {
                if (key !== k)
                    return;
                _this.scene.textures.off("onload", onLoad, _this, false);
                _this.scene.textures.off(Phaser.Loader.Events.FILE_LOAD_ERROR, onLoadError, _this);
                reject(k);
            };
            _this.scene.textures.on("onload", onLoad, _this);
            _this.scene.textures.on(Phaser.Loader.Events.FILE_LOAD_ERROR, onLoadError, _this);
            _this.scene.textures.addBase64(key, img.url);
        });
    };
    AvatarEditorDragonbone.prototype.setDir = function (dir) {
        var re = this.mCurAnimationName.split("_");
        this.mCurAnimationName = dir === 3 ? re[0] : re[0] + "_back";
        // Logger.getInstance().debug("ZW-- new animation name: ", this.mCurAnimationName);
        this.mCurDir = dir;
        this.reloadDisplay();
    };
    AvatarEditorDragonbone.prototype.play = function (animationName) {
        this.mCurAnimationName = animationName;
        if (this.mDisplay_default) {
            this.mDisplay_default.play({ name: this.mCurAnimationName, flip: false });
        }
        // if (this.mArmatureDisplay_head) {
        //     this.mArmatureDisplay_head.play({ name: this.mCurAnimationName, flip: false });
        // }
    };
    AvatarEditorDragonbone.prototype.clearParts = function () {
        if (this.mSets)
            this.mSets = [];
        this.setBaseSets(AvatarEditorDragonbone.DEFAULT_SETS);
        this.reloadDisplay();
    };
    AvatarEditorDragonbone.prototype.mergeParts = function (sets) {
        this.addSets(sets);
        this.reloadDisplay();
    };
    AvatarEditorDragonbone.prototype.cancelParts = function (sets) {
        this.removeSets(sets);
        this.reloadDisplay();
    };
    // 截图规则：如果包含下半身装扮，使用正常龙骨；否则使用上半身龙骨
    AvatarEditorDragonbone.prototype.generateShopIcon = function (width, height) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (width === 0 || height === 0) {
                reject("width and height must not be 0");
                return;
            }
            var modelData = _this.getSnapshotModelData();
            if (!modelData.armature) {
                reject("no armature");
                return;
            }
            _this.snapshot({ x: 0, y: 0, width: width, height: height }, modelData)
                .then(function (result) {
                Logger.getInstance().log("shop icon: ", result);
                resolve(result);
            })
                .catch(function (reason) {
                reject(reason);
            });
        });
    };
    AvatarEditorDragonbone.prototype.generateHeadIcon = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (!_this.mDisplay_default) {
                reject("no armature");
                return;
            }
            if (AvatarEditorDragonbone.HEAD_ICON_DEFAULT_SNAPSHOT_TOTAL_HEIGHT > _this.scene.scale.height) {
                reject("game size is not enough, must larger than " + AvatarEditorDragonbone.HEAD_ICON_DEFAULT_SNAPSHOT_TOTAL_HEIGHT);
                return;
            }
            var modelData = {
                armature: _this.mDisplay_default,
                x: AvatarEditorDragonbone.HEAD_ICON_WIDTH / 2,
                y: AvatarEditorDragonbone.HEAD_ICON_DEFAULT_BOTTOM_PIX,
                baseSets: AvatarEditorDragonbone.DEFAULT_SETS
            };
            _this.snapshot({
                x: 0,
                y: AvatarEditorDragonbone.HEAD_ICON_DEFAULT_SNAPSHOT_TOTAL_HEIGHT - AvatarEditorDragonbone.HEAD_ICON_HEIGHT,
                width: AvatarEditorDragonbone.HEAD_ICON_WIDTH,
                height: AvatarEditorDragonbone.HEAD_ICON_HEIGHT
            }, modelData)
                .then(function (result) {
                resolve(result);
            })
                .catch(function (reason) {
                reject(reason);
            });
        });
    };
    Object.defineProperty(AvatarEditorDragonbone.prototype, "curSets", {
        get: function () {
            return this.mSets;
        },
        enumerable: true,
        configurable: true
    });
    AvatarEditorDragonbone.prototype.createDisplays = function () {
        if (this.mDisplay_default) {
            this.mDisplay_default.destroy();
        }
        if (this.mDisplay_head) {
            this.mDisplay_head.destroy();
        }
        var sceneHeight = this.scene.scale.height;
        this.mArmatureBottomArea = AvatarEditorDragonbone.DEFAULT_SCALE_BOTTOM_PIX * sceneHeight / AvatarEditorDragonbone.DEFAULT_SCALE_GAME_HEIGHT;
        this.mDisplay_default = new EditorDragonbonesDisplay(this.scene, AvatarEditorDragonbone.DRAGONBONE_NAME_DEFAULT, this.mLocalHomePath, this.mWebHomePath);
        this.mDisplay_default.play({ name: this.mCurAnimationName, flip: false });
        if (this.mAutoScale)
            this.mDisplay_default.scale = sceneHeight / AvatarEditorDragonbone.DEFAULT_SCALE_GAME_HEIGHT;
        this.mDisplay_default.x = this.scene.scale.width >> 1;
        this.mDisplay_default.y = this.scene.scale.height - this.mArmatureBottomArea;
        this.add(this.mDisplay_default);
        this.mArmatureBottomArea_head = this.mArmatureBottomArea -
            AvatarEditorDragonbone.ARMATURE_LEG_PERCENT * AvatarEditorDragonbone.ARMATURE_HEIGHT * sceneHeight / AvatarEditorDragonbone.DEFAULT_SCALE_GAME_HEIGHT;
        this.mDisplay_head = new EditorDragonbonesDisplay(this.scene, AvatarEditorDragonbone.DRAGONBONE_NAME_HEAD, this.mLocalHomePath, this.mWebHomePath);
        if (this.mAutoScale)
            this.mDisplay_head.scale = sceneHeight / AvatarEditorDragonbone.DEFAULT_SCALE_GAME_HEIGHT;
        this.mDisplay_head.x = this.scene.scale.width >> 1;
        this.mDisplay_head.y = this.scene.scale.height - this.mArmatureBottomArea_head + 1000;
        this.add(this.mDisplay_head);
        this.reloadDisplay();
    };
    AvatarEditorDragonbone.prototype.setBaseSets = function (sets) {
        if (this.mBaseSets)
            this.mBaseSets = [];
        this.mBaseSets = sets;
        this.applySets(true);
    };
    // 将一组AvatatSet整合到一起形成一个完整的Avatar，并保存到self._parts里
    AvatarEditorDragonbone.prototype.addSets = function (newSets) {
        // Logger.getInstance().debug("ZW-- addSets: ", newSets);
        // 复制值
        var temp = [];
        var _loop_1 = function (newSet) {
            // fix dumplicate sets
            var existSetIdx = this_1.mSets.findIndex(function (x) { return (x.id === newSet.id && JSON.stringify(x.parts) === JSON.stringify(newSet.parts)); });
            if (existSetIdx >= 0)
                return "continue";
            temp.push(JSON.parse(JSON.stringify(newSet)));
        };
        var this_1 = this;
        for (var _i = 0, newSets_1 = newSets; _i < newSets_1.length; _i++) {
            var newSet = newSets_1[_i];
            _loop_1(newSet);
        }
        // 解决替换发型，后发分层存在的问题
        for (var _a = 0, temp_1 = temp; _a < temp_1.length; _a++) {
            var newSet = temp_1[_a];
            for (var key in AvatarEditorDragonbone.HAIR_BACK) {
                if (AvatarEditorDragonbone.HAIR_BACK.hasOwnProperty(key)) {
                    var parts = newSet.parts;
                    for (var _b = 0, parts_1 = parts; _b < parts_1.length; _b++) {
                        var part = parts_1[_b];
                        if (part === key) {
                            // 删除mSets和mParts中相应数据
                            this.removePartsInSets(AvatarEditorDragonbone.HAIR_BACK[part], this.mSets);
                            this.removePartsInCurParts(AvatarEditorDragonbone.HAIR_BACK[part]);
                        }
                    }
                }
            }
        }
        this.mSets = this.mSets.concat(temp);
        // Logger.getInstance().debug("ZW-- this.mSets: ", this.mSets);
        this.applySets();
    };
    AvatarEditorDragonbone.prototype.applySets = function (reset) {
        if (reset === void 0) { reset = false; }
        if (reset) {
            this.mParts = {};
            for (var _i = 0, _a = AvatarEditorDragonbone.ADD_PARTS; _i < _a.length; _i++) {
                var part = _a[_i];
                this.mParts[part] = null;
            }
            for (var _b = 0, _c = this.mBaseSets; _b < _c.length; _b++) {
                var set = _c[_b];
                for (var _d = 0, _e = set.parts; _d < _e.length; _d++) {
                    var part = _e[_d];
                    this.mParts[part] = set;
                }
            }
        }
        for (var _f = 0, _g = this.mSets; _f < _g.length; _f++) {
            var set = _g[_f];
            for (var _h = 0, _j = set.parts; _h < _j.length; _h++) {
                var part = _j[_h];
                this.mParts[part] = set;
            }
        }
        // 特型装扮隐藏对应部位
        for (var key in this.mParts) {
            var set = this.mParts[key];
            if (!set)
                continue;
            if (AvatarEditorDragonbone.SPECIAL_SETS.hasOwnProperty(key)) {
                var specParts = AvatarEditorDragonbone.SPECIAL_SETS[key];
                for (var _k = 0, specParts_1 = specParts; _k < specParts_1.length; _k++) {
                    var specP = specParts_1[_k];
                    this.mParts[specP] = null;
                }
            }
        }
    };
    AvatarEditorDragonbone.prototype.removeSets = function (sets) {
        var _loop_2 = function (set) {
            var idx = this_2.mSets.findIndex(function (x) { return x.id === set.id; });
            if (idx >= 0) {
                this_2.mSets.splice(idx, 1);
            }
            var dirs = ["1", "3"];
            for (var _i = 0, dirs_1 = dirs; _i < dirs_1.length; _i++) {
                var dir = dirs_1[_i];
                for (var _a = 0, _b = set.parts; _a < _b.length; _a++) {
                    var part = _b[_a];
                    var imgKey = this_2.partTextureSaveKey(part, set.id, dir, set.version);
                    if (this_2.scene.textures.exists(imgKey)) {
                        this_2.scene.textures.remove(imgKey);
                        this_2.scene.textures.removeKey(imgKey);
                    }
                }
            }
        };
        var this_2 = this;
        for (var _i = 0, sets_1 = sets; _i < sets_1.length; _i++) {
            var set = sets_1[_i];
            _loop_2(set);
        }
        this.applySets(true);
    };
    AvatarEditorDragonbone.prototype.reloadDisplay = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var loadData = _this.convertPartsToIDragonbonesModel(_this.mParts);
            Promise.all([_this.mDisplay_default.load(loadData, undefined, false),
                _this.mDisplay_head.load(loadData, undefined, false)])
                .then(function () {
                resolve(null);
                if (_this.mOnReadyForSnapshot) {
                    _this.mOnReadyForSnapshot(_this);
                    _this.mOnReadyForSnapshot = null;
                }
            })
                .catch(function (err) {
                if (err)
                    Logger.getInstance().error("reload display error: ", err);
            });
            _this.mDisplay_default.play({ name: _this.mCurAnimationName, flip: false });
        });
    };
    // 从部件ID转换为TextureManager中的key
    // TODO: 需要和BaseDragonbonesDisplay中保持一致
    AvatarEditorDragonbone.prototype.partTextureSaveKey = function (part, id, dir, ver) {
        var result = part + "_" + id + "_" + dir;
        if (ver !== undefined && ver.length > 0) {
            result = result + "_" + ver;
        }
        result = result + "_png";
        return result;
    };
    AvatarEditorDragonbone.prototype.removePartsInSets = function (parts, sets) {
        for (var _i = 0, sets_2 = sets; _i < sets_2.length; _i++) {
            var set = sets_2[_i];
            for (var _a = 0, parts_2 = parts; _a < parts_2.length; _a++) {
                var part = parts_2[_a];
                var idx = set.parts.indexOf(part);
                if (idx >= 0)
                    set.parts.splice(idx, 1);
            }
        }
        return sets;
    };
    AvatarEditorDragonbone.prototype.removePartsInCurParts = function (parts) {
        for (var _i = 0, parts_3 = parts; _i < parts_3.length; _i++) {
            var part = parts_3[_i];
            if (this.mParts.hasOwnProperty(part)) {
                delete this.mParts[part];
            }
        }
    };
    AvatarEditorDragonbone.prototype.getSnapshotModelData = function () {
        for (var _i = 0, _a = this.mSets; _i < _a.length; _i++) {
            var set = _a[_i];
            for (var _b = 0, _c = set.parts; _b < _c.length; _b++) {
                var part = _c[_b];
                if (AvatarEditorDragonbone.BOTTOM_BODY_PARTS.indexOf(part) >= 0) {
                    // Logger.getInstance().debug("ZW-- snapshotArmature: body");
                    return {
                        armature: this.mDisplay_default,
                        x: this.mDisplay_default.x,
                        y: this.mArmatureBottomArea,
                        baseSets: AvatarEditorDragonbone.MODEL_SETS
                    };
                }
            }
        }
        // Logger.getInstance().debug("ZW-- snapshotArmature: head");
        return {
            armature: this.mDisplay_head,
            x: this.mDisplay_default.x,
            y: this.mArmatureBottomArea_head,
            baseSets: AvatarEditorDragonbone.MODEL_SETS
        };
    };
    AvatarEditorDragonbone.prototype.snapshot = function (area, modelData) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.setBaseSets(modelData.baseSets);
            _this.reloadDisplay()
                .then(function () {
                var gameWidth = _this.scene.scale.width;
                var gameHeight = _this.scene.scale.height;
                Logger.getInstance().debug("ZW-- start snapshot, gameSize: " + gameWidth + "*" + gameHeight + ", setSize: " + area.width + "*" + area.height);
                var rt = _this.scene.make.renderTexture({ x: 0, y: 0, width: gameWidth, height: gameHeight }, false);
                modelData.armature.scaleY *= -1;
                var display = modelData.armature.getDisplay();
                if (!display)
                    reject("display does not exist");
                display.armature.advanceTime(1000);
                rt.draw(modelData.armature, modelData.x, modelData.y);
                rt.snapshotArea(area.x, area.y, area.width, area.height, function (img) {
                    modelData.armature.scaleY *= -1;
                    // reverse parts
                    _this.setBaseSets(AvatarEditorDragonbone.DEFAULT_SETS);
                    _this.reloadDisplay()
                        .then(function () {
                        resolve(img.src);
                        Logger.getInstance().log("snapshot result: ", img.src);
                    });
                });
            })
                .catch(function () {
                reject("replaceDisplay error");
            });
        });
    };
    AvatarEditorDragonbone.prototype.convertPartsToIDragonbonesModel = function (parts) {
        var avatarModel = { id: "0" };
        var allPartsName = [].concat(AvatarEditorDragonbone.BASE_PARTS, AvatarEditorDragonbone.ADD_PARTS);
        for (var _i = 0, allPartsName_1 = allPartsName; _i < allPartsName_1.length; _i++) {
            var partName = allPartsName_1[_i];
            if (!parts.hasOwnProperty(partName))
                continue;
            var set = parts[partName];
            if (!set)
                continue;
            var avatarKey = this.convertPartNameToIAvatarKey(partName);
            avatarModel[avatarKey] = { sn: set.id, version: set.version };
        }
        var dragonbonesModel = { id: 0, avatar: avatarModel };
        return dragonbonesModel;
    };
    // ex: "head_base" => "headBaseId"
    AvatarEditorDragonbone.prototype.convertPartNameToIAvatarKey = function (partName) {
        var nameArr = partName.split("_");
        var result = nameArr[0];
        for (var i = 1; i < nameArr.length; i++) {
            var temp = nameArr[i];
            result += temp.charAt(0).toUpperCase() + temp.slice(1);
        }
        result += "Id";
        return result;
    };
    AvatarEditorDragonbone.DRAGONBONE_NAME_DEFAULT = "bones_human01";
    AvatarEditorDragonbone.DRAGONBONE_NAME_HEAD = "bones_model_head";
    AvatarEditorDragonbone.DRAGONBONE_ARMATURE_NAME = "Armature";
    AvatarEditorDragonbone.BASE_PARTS = [
        "body_base", "barm_base", "farm_base", "bleg_base", "fleg_base", "head_base"
    ];
    // 除base以外的"着装"插槽
    AvatarEditorDragonbone.ADD_PARTS = [
        "barm_cost",
        "barm_spec",
        "bleg_cost",
        "bleg_spec",
        "body_cost",
        "body_cost_dres",
        "body_spec",
        "body_tail",
        "body_wing",
        "body_scar",
        "body_cloa",
        "farm_cost",
        "farm_spec",
        "fleg_cost",
        "fleg_spec",
        "head_eyes",
        "head_hair",
        "head_mous",
        "head_hair_back",
        "head_hats",
        "head_mask",
        "head_spec",
        "head_face",
        "head_chin",
        "barm_shld",
        "farm_shld",
        "barm_weap",
        "farm_weap",
    ];
    // 下半身插槽名
    AvatarEditorDragonbone.BOTTOM_BODY_PARTS = [
        "body_cost",
        "body_cost_dres",
        "farm_cost",
        "barm_cost",
        "fleg_cost",
        "bleg_cost",
        "barm_weap",
        "farm_weap",
        "barm_shld",
        "farm_shld",
        "body_tail",
        "body_wing",
        "body_spec",
        "farm_spec",
        "barm_spec",
        "fleg_spec",
        "bleg_spec",
        "body_cloa"
    ];
    AvatarEditorDragonbone.HAIR_BACK = (_a = {},
        _a["head_hair"] = ["head_hair", "head_hair_back"],
        _a["body_cost"] = ["body_cost", "body_cost_dres"],
        _a);
    AvatarEditorDragonbone.DEFAULT_SETS = [
        { id: "60c8626bdd14da5f64b49341", parts: AvatarEditorDragonbone.BASE_PARTS },
        { id: "5cd28238fb073710972a73c2", parts: ["head_hair", "head_eyes", "head_mous", "body_cost"] },
    ];
    AvatarEditorDragonbone.SPECIAL_SETS = (_b = {},
        _b["head_spec"] = ["head_eyes", "head_hair", "head_mous", "head_hair_back", "head_hats", "head_mask", "head_face", "head_base"],
        _b["body_spec"] = ["body_cost", "body_cost_dres", "body_tail", "body_wing", "body_base"],
        _b["farm_spec"] = ["farm_cost", "farm_shld", "farm_weap", "farm_base"],
        _b["barm_spec"] = ["barm_cost", "barm_shld", "barm_weap", "barm_base"],
        _b["fleg_spec"] = ["fleg_cost", "fleg_base"],
        _b["bleg_spec"] = ["bleg_cost", "bleg_base"],
        _b);
    AvatarEditorDragonbone.MODEL_SETS = [
        {
            id: "5fbf562e72c7db2dbdcdb4ea",
            parts: AvatarEditorDragonbone.BASE_PARTS
        }
    ];
    AvatarEditorDragonbone.DEFAULT_SCALE_GAME_HEIGHT = 72; // 默认展示龙骨时，游戏尺寸
    AvatarEditorDragonbone.DEFAULT_SCALE_BOTTOM_PIX = 4; // 默认展示龙骨时，龙骨所处位置下方的区域（/像素）
    AvatarEditorDragonbone.ARMATURE_HEIGHT = 61; // 龙骨设计高度
    AvatarEditorDragonbone.ARMATURE_LEG_PERCENT = 0.15; // 龙骨中，腿部占整个身高比重
    AvatarEditorDragonbone.HEAD_ICON_HIDE_PIX = 22; // 头像截图中，下方隐藏的龙骨高度
    AvatarEditorDragonbone.HEAD_ICON_WIDTH = 71; // 头像截图中，图片宽度
    AvatarEditorDragonbone.HEAD_ICON_HEIGHT = 57; // 头像截图中，图片高度
    AvatarEditorDragonbone.HEAD_ICON_DEFAULT_SNAPSHOT_TOTAL_HEIGHT = 79; // 头像截图中，含隐藏部分的整个高度
    AvatarEditorDragonbone.HEAD_ICON_DEFAULT_BOTTOM_PIX = 0; // 头像截图中，龙骨所处位置下方的区域（/像素）
    return AvatarEditorDragonbone;
}(Phaser.GameObjects.Container));
export { AvatarEditorDragonbone };
var EditorDragonbonesDisplay = /** @class */ (function (_super) {
    __extends_1(EditorDragonbonesDisplay, _super);
    // private static GenerateCount = 0;
    //
    // private uuid = 0;
    function EditorDragonbonesDisplay(scene, resName, mLocalHomePath, mWebHomePath) {
        var _this = _super.call(this, scene, { resPath: mLocalHomePath, osdPath: mWebHomePath }) || this;
        _this.resourceName = resName;
        return _this;
        // this.uuid = EditorDragonbonesDisplay.GenerateCount ++;
    }
    return EditorDragonbonesDisplay;
}(BaseDragonbonesDisplay));
//# sourceMappingURL=avatar.editor.dragonbone.js.map