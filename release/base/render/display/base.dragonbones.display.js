var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
import { Tool } from "utils";
import {
  Atlas,
  Logger
} from "structure";
import { BaseDisplay } from "./base.display";
import * as sha1 from "simple-sha1";
import { MaxRectsPacker } from "maxrects-packer";
export var AvatarSlotNameTemp;
(function(AvatarSlotNameTemp2) {
  AvatarSlotNameTemp2["BodyCostDres"] = "body_cost_dres_$";
  AvatarSlotNameTemp2["BodyCost"] = "body_cost_$";
  AvatarSlotNameTemp2["BodyTail"] = "body_tail_$";
  AvatarSlotNameTemp2["BodyWing"] = "body_wing_$";
  AvatarSlotNameTemp2["BodyBase"] = "body_base_$";
  AvatarSlotNameTemp2["BodySpec"] = "body_spec_$";
  AvatarSlotNameTemp2["BodyScar"] = "body_scar_$";
  AvatarSlotNameTemp2["BodyCloa"] = "body_cloa_$";
  AvatarSlotNameTemp2["FlegSpec"] = "fleg_spec_$";
  AvatarSlotNameTemp2["FlegBase"] = "fleg_base_$";
  AvatarSlotNameTemp2["FlegCost"] = "fleg_cost_$";
  AvatarSlotNameTemp2["BarmSpec"] = "barm_spec_$";
  AvatarSlotNameTemp2["BarmBase"] = "barm_base_$";
  AvatarSlotNameTemp2["BarmCost"] = "barm_cost_$";
  AvatarSlotNameTemp2["BarmWeap"] = "barm_weap_$";
  AvatarSlotNameTemp2["ShldBarm"] = "barm_shld_$";
  AvatarSlotNameTemp2["BlegSpec"] = "bleg_spec_$";
  AvatarSlotNameTemp2["BlegBase"] = "bleg_base_$";
  AvatarSlotNameTemp2["BlegCost"] = "bleg_cost_$";
  AvatarSlotNameTemp2["FarmSpec"] = "farm_spec_$";
  AvatarSlotNameTemp2["FarmBase"] = "farm_base_$";
  AvatarSlotNameTemp2["FarmCost"] = "farm_cost_$";
  AvatarSlotNameTemp2["ShldFarm"] = "farm_shld_$";
  AvatarSlotNameTemp2["FarmWeap"] = "farm_weap_$";
  AvatarSlotNameTemp2["HeadSpec"] = "head_spec_$";
  AvatarSlotNameTemp2["HeadMask"] = "head_mask_$";
  AvatarSlotNameTemp2["HeadEyes"] = "head_eyes_$";
  AvatarSlotNameTemp2["HeadBase"] = "head_base_$";
  AvatarSlotNameTemp2["HeadHairBack"] = "head_hair_back_$";
  AvatarSlotNameTemp2["HeadMous"] = "head_mous_$";
  AvatarSlotNameTemp2["HeadHair"] = "head_hair_$";
  AvatarSlotNameTemp2["HeadHats"] = "head_hats_$";
  AvatarSlotNameTemp2["HeadFace"] = "head_face_$";
  AvatarSlotNameTemp2["HeadChin"] = "head_chin_$";
})(AvatarSlotNameTemp || (AvatarSlotNameTemp = {}));
export var AvatarPartNameTemp;
(function(AvatarPartNameTemp2) {
  AvatarPartNameTemp2["BarmBase"] = "barm_base_#_$";
  AvatarPartNameTemp2["BarmCost"] = "barm_cost_#_$";
  AvatarPartNameTemp2["BarmSpec"] = "barm_spec_#_$";
  AvatarPartNameTemp2["BlegBase"] = "bleg_base_#_$";
  AvatarPartNameTemp2["BlegCost"] = "bleg_cost_#_$";
  AvatarPartNameTemp2["BlegSpec"] = "bleg_spec_#_$";
  AvatarPartNameTemp2["BodyBase"] = "body_base_#_$";
  AvatarPartNameTemp2["BodyCost"] = "body_cost_#_$";
  AvatarPartNameTemp2["BodyCostDres"] = "body_cost_dres_#_$";
  AvatarPartNameTemp2["BodySpec"] = "body_spec_#_$";
  AvatarPartNameTemp2["BodyTail"] = "body_tail_#_$";
  AvatarPartNameTemp2["BodyWing"] = "body_wing_#_$";
  AvatarPartNameTemp2["BodyScar"] = "body_scar_#_$";
  AvatarPartNameTemp2["BodyCloa"] = "body_cloa_#_$";
  AvatarPartNameTemp2["FarmBase"] = "farm_base_#_$";
  AvatarPartNameTemp2["FarmCost"] = "farm_cost_#_$";
  AvatarPartNameTemp2["FarmSpec"] = "farm_spec_#_$";
  AvatarPartNameTemp2["FlegBase"] = "fleg_base_#_$";
  AvatarPartNameTemp2["FlegCost"] = "fleg_cost_#_$";
  AvatarPartNameTemp2["FlegSpec"] = "fleg_spec_#_$";
  AvatarPartNameTemp2["HeadBase"] = "head_base_#_$";
  AvatarPartNameTemp2["HeadEyes"] = "head_eyes_#_$";
  AvatarPartNameTemp2["HeadHair"] = "head_hair_#_$";
  AvatarPartNameTemp2["HeadHairBack"] = "head_hair_back_#_$";
  AvatarPartNameTemp2["HeadHats"] = "head_hats_#_$";
  AvatarPartNameTemp2["HeadFace"] = "head_face_#_$";
  AvatarPartNameTemp2["HeadMask"] = "head_mask_#_$";
  AvatarPartNameTemp2["HeadMous"] = "head_mous_#_$";
  AvatarPartNameTemp2["HeadSpec"] = "head_spec_#_$";
  AvatarPartNameTemp2["HeadChin"] = "head_chin_#_$";
  AvatarPartNameTemp2["ShldFarm"] = "farm_shld_#_$";
  AvatarPartNameTemp2["WeapFarm"] = "farm_weap_#_$";
  AvatarPartNameTemp2["ShldBarm"] = "barm_shld_#_$";
  AvatarPartNameTemp2["WeapBarm"] = "barm_weap_#_$";
})(AvatarPartNameTemp || (AvatarPartNameTemp = {}));
const SERIALIZE_QUEUE = [
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
  "stalkerId"
];
const ReplacedTextures = new Map();
const ReplacedTextureVersion = "v1";
export class BaseDragonbonesDisplay extends BaseDisplay {
  constructor(scene, pathObj, id) {
    super(scene, id);
    this.pathObj = pathObj;
    __publicField(this, "mArmatureName", "Armature");
    __publicField(this, "mResourceName", "bones_human01");
    __publicField(this, "mArmatureDisplay");
    __publicField(this, "mFadeTween");
    __publicField(this, "mInteractive", true);
    __publicField(this, "mLoadingShadow");
    __publicField(this, "mMountContainer");
    __publicField(this, "replaceArr", []);
    __publicField(this, "mLoadMap", new Map());
    __publicField(this, "mErrorLoadMap", new Map());
    __publicField(this, "mNeedReplaceTexture", false);
    __publicField(this, "mBoardPoint");
    __publicField(this, "mReplaceTextureKey", "");
    __publicField(this, "mLoadListeners", new Map());
    __publicField(this, "mTexturesListeners", new Map());
    __publicField(this, "loadError", false);
    __publicField(this, "UNPACK_SLOTS", [AvatarSlotNameTemp.FarmWeap, AvatarSlotNameTemp.BarmWeap]);
    __publicField(this, "UNCHECK_AVATAR_PROPERTY", ["id", "dirable", "farmWeapId", "farmShldId", "barmWeapId", "barmShldId"]);
  }
  set displayInfo(val) {
    if (this.mNeedReplaceTexture === false) {
      this.mNeedReplaceTexture = this.checkNeedReplaceTexture(this.mDisplayInfo, val);
    }
    this.mDisplayInfo = val;
  }
  get displayInfo() {
    return this.mDisplayInfo;
  }
  get spriteWidth() {
    if (this.mArmatureDisplay) {
      return this.mArmatureDisplay.width;
    }
    return 0;
  }
  get spriteHeight() {
    if (this.mArmatureDisplay) {
      return this.mArmatureDisplay.height;
    }
    return 0;
  }
  get topPoint() {
    return this.mBoardPoint;
  }
  load(display, field, useRenderTex = true) {
    this.displayInfo = display;
    if (!this.displayInfo)
      return Promise.reject("displayInfo error");
    this.setData("id", this.displayInfo.id);
    return new Promise((resolve, reject) => {
      this.buildDragbones().then(() => {
        return new Promise((_resolve, _reject) => {
          this.setClickInteractive(this.mInteractive);
          this.displayCreated();
          this.setReplaceArrAndLoadMap();
          this.showLoadingShadow();
          if (useRenderTex && this.mNeedReplaceTexture) {
            this.prepareReplaceRenderTexture().then(() => {
              _resolve(null);
            }).catch(() => {
              useRenderTex = false;
              this.prepareReplaceSlotsDisplay().then(() => {
                _resolve(null);
              });
            });
          } else {
            useRenderTex = false;
            this.prepareReplaceSlotsDisplay().then(() => {
              _resolve(null);
            });
          }
        });
      }).then(() => {
        this.refreshAvatar(useRenderTex);
        this.hideLoadingShadow();
        this.mNeedReplaceTexture = false;
        resolve(null);
      });
    });
  }
  save() {
    return new Promise((resolve, reject) => {
      this.loadPartsRes().then(() => {
        const textureKey = this.generateReplaceTextureKey();
        const replaceData = this.generateReplaceTexture(textureKey);
        resolve({ key: textureKey, url: replaceData.url, json: replaceData.json });
      });
    });
  }
  getDisplay() {
    return this.mArmatureDisplay;
  }
  play(val) {
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
    super.play(val);
  }
  fadeIn(callback) {
    this.clearFadeTween();
    this.alpha = 0;
    this.mFadeTween = this.scene.tweens.add({
      targets: this,
      alpha: 1,
      duration: 1200,
      onComplete: () => {
        if (callback)
          callback();
      }
    });
  }
  fadeOut(callback) {
    this.clearFadeTween();
    this.mFadeTween = this.scene.tweens.add({
      targets: this,
      alpha: 0,
      duration: 1200,
      onComplete: () => {
        if (callback)
          callback();
      }
    });
  }
  destroy() {
    this.mDisplayInfo = null;
    this.mNeedReplaceTexture = false;
    if (this.mArmatureDisplay) {
      this.destroyReplacedTextureManually();
      this.mArmatureDisplay.dispose(false);
      this.mArmatureDisplay = null;
    }
    if (this.mFadeTween) {
      this.clearFadeTween();
      this.mFadeTween = null;
    }
    this.mLoadListeners.forEach((val, key) => {
      for (const func of val) {
        this.scene.load.off(key, func, this);
      }
    });
    this.mLoadListeners.clear();
    this.mTexturesListeners.forEach((val, key) => {
      for (const func of val) {
        this.scene.textures.off(key, func, this);
      }
    });
    this.mTexturesListeners.clear();
    super.destroy();
  }
  setClickInteractive(active) {
    this.mInteractive = active;
    if (active) {
      const rect = new Phaser.Geom.Rectangle(0, 0, 50, 70);
      rect.x = -rect.width >> 1;
      rect.y = -rect.height;
      this.setInteractive(rect, Phaser.Geom.Rectangle.Contains);
    } else {
      this.disableInteractive();
    }
  }
  set resourceName(val) {
    this.mResourceName = val;
  }
  get resourceName() {
    return this.mResourceName;
  }
  buildDragbones() {
    return new Promise((resolve, reject) => {
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
        this.loadDragonBones(pngUrl, jsonUrl, dbbinUrl).then(() => {
          this.createArmatureDisplay();
          resolve(this.mArmatureDisplay);
        });
      }
    });
  }
  get localResourceRoot() {
    return this.pathObj.resPath;
  }
  get osdResourceRoot() {
    return this.pathObj.osdPath;
  }
  partNameToLoadUrl(partName) {
    return this.osdResourceRoot + "avatar/part/" + partName + ".png";
  }
  partNameToLoadKey(partName) {
    return partName + "_png";
  }
  partNameToDBFrameName(partName) {
    return "test resources/" + partName;
  }
  generateReplaceTextureKey() {
    return this.serializeAvatarData(this.displayInfo.avatar) + ReplacedTextureVersion;
  }
  createArmatureDisplay() {
    if (!this.scene)
      return;
    if (this.mArmatureDisplay)
      return;
    this.mArmatureDisplay = this.scene.add.armature(this.mArmatureName, this.resourceName);
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
  onArmatureLoopComplete(event) {
    if (!this.mArmatureDisplay || !this.mAnimation) {
      return;
    }
    const queue = this.mAnimation.playingQueue;
    if (!queue)
      return;
    if (queue.playedTimes === void 0) {
      queue.playedTimes = 1;
    } else {
      queue.playedTimes++;
    }
    const times = queue.playTimes === void 0 ? -1 : queue.playTimes;
    if (queue.playedTimes >= times && times > 0) {
      this.mArmatureDisplay.removeDBEventListener(dragonBones.EventObject.LOOP_COMPLETE, this.onArmatureLoopComplete, this);
    }
  }
  showLoadingShadow() {
    if (this.mLoadingShadow) {
      this.mLoadingShadow.destroy();
    }
    this.mLoadingShadow = this.scene.make.image({ key: "avatar_placeholder", x: -22, y: -68 }).setOrigin(0);
    this.add(this.mLoadingShadow);
    if (this.mArmatureDisplay) {
      this.mArmatureDisplay.visible = false;
    }
  }
  hideLoadingShadow() {
    if (this.mLoadingShadow) {
      this.mLoadingShadow.destroy();
    }
    this.mLoadingShadow = void 0;
    if (this.mArmatureDisplay) {
      this.mArmatureDisplay.visible = true;
    }
  }
  loadDragonBones(pngUrl, jsonUrl, dbbinUrl) {
    return new Promise((resolve, reject) => {
      this.scene.load.dragonbone(this.resourceName, pngUrl, jsonUrl, dbbinUrl, null, null, { responseType: "arraybuffer" });
      const onLoad = () => {
        if (!this.scene.cache.custom.dragonbone.get(this.resourceName))
          return;
        this.removePhaserListener(PhaserListenerType.Load, Phaser.Loader.Events.COMPLETE, onLoad);
        resolve(null);
      };
      const onFileLoadError = () => {
        this.removePhaserListener(PhaserListenerType.Load, Phaser.Loader.Events.FILE_LOAD_ERROR, onFileLoadError);
        reject(null);
      };
      this.addPhaserListener(PhaserListenerType.Load, Phaser.Loader.Events.COMPLETE, onLoad);
      this.addPhaserListener(PhaserListenerType.Load, Phaser.Loader.Events.FILE_LOAD_ERROR, onFileLoadError);
      this.scene.load.start();
    });
  }
  refreshAvatar(useRenderTexture) {
    if (useRenderTexture) {
      if (this.scene.textures.exists(this.mReplaceTextureKey)) {
        const tex = this.scene.textures.get(this.mReplaceTextureKey);
        if (this.mArmatureDisplay.armature.replacedTexture !== tex) {
          this.destroyReplacedTextureManually();
          this.recordReplacedTexture(tex.key);
          this.mArmatureDisplay.armature.replacedTexture = tex;
        }
      }
    }
    const slotList = this.mArmatureDisplay.armature.getSlots();
    slotList.forEach((slot) => {
      if (slot) {
        slot.display.visible = false;
      }
    });
    const curDBTexture = this.scene.game.textures.get(this.mReplaceTextureKey);
    for (const rep of this.replaceArr) {
      const slotName = rep.slot.replace("$", rep.dir.toString());
      const slot = this.mArmatureDisplay.armature.getSlot(slotName);
      if (!slot)
        continue;
      const skin = this.formattingSkin(rep.skin);
      if (skin.sn.length === 0)
        continue;
      const partName = rep.part.replace("#", skin.sn.toString()).replace("$", rep.dir.toString()) + skin.version;
      const loadKey = this.partNameToLoadKey(partName);
      const dbFrameName = this.partNameToDBFrameName(partName);
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
  serializeAvatarData(data) {
    let serializeStr = "";
    for (const key of SERIALIZE_QUEUE) {
      if (this.UNCHECK_AVATAR_PROPERTY.indexOf(key) >= 0)
        continue;
      if (data[key] !== void 0 && data[key] !== null) {
        if (typeof data[key] === "string") {
          serializeStr += `${key}_${data[key]}`;
        } else {
          serializeStr += `${key}_${data[key].sn}`;
          if (data[key].version !== void 0) {
            serializeStr += "V" + data[key].version;
          }
        }
      }
    }
    const result = sha1.sync(serializeStr);
    Logger.getInstance().debug("serialize avatar data: ", result, data);
    return result;
  }
  generateReplaceTexture(textureKey) {
    const atlas = new Atlas();
    const packer = new MaxRectsPacker();
    packer.padding = 2;
    packer.options.pot = false;
    for (const rep of this.replaceArr) {
      const slotName = rep.slot.replace("$", rep.dir.toString());
      const propertyName = this.slotNameToPropertyName(slotName);
      if (this.UNCHECK_AVATAR_PROPERTY.indexOf(propertyName) >= 0)
        continue;
      const slot = this.mArmatureDisplay.armature.getSlot(slotName);
      if (!slot)
        continue;
      const skin = this.formattingSkin(rep.skin);
      if (skin.sn.length === 0)
        continue;
      const partName = rep.part.replace("#", skin.sn.toString()).replace("$", rep.dir.toString()) + skin.version;
      const loadKey = this.partNameToLoadKey(partName);
      const dbFrameName = this.partNameToDBFrameName(partName);
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
    return { url, json: atlas.toString() };
  }
  prepareReplaceRenderTexture() {
    return new Promise((resolve, reject) => {
      this.loadPartsRes((slotName) => {
        const propertyName = this.slotNameToPropertyName(slotName);
        return this.UNCHECK_AVATAR_PROPERTY.indexOf(propertyName) >= 0;
      }).then(() => {
        this.mReplaceTextureKey = this.generateReplaceTextureKey();
        if (this.scene.textures.exists(this.mReplaceTextureKey)) {
          resolve(null);
        } else {
          const loadData = {
            img: this.pathObj.osdPath + "user_avatar/texture/" + this.mReplaceTextureKey + ".png",
            json: this.pathObj.osdPath + "user_avatar/texture/" + this.mReplaceTextureKey + ".json"
          };
          this.scene.load.atlas(this.mReplaceTextureKey, loadData.img, loadData.json);
          const onLoadComplete = (key) => {
            if (this.mReplaceTextureKey !== key)
              return;
            this.removePhaserListener(PhaserListenerType.Load, Phaser.Loader.Events.FILE_COMPLETE, onLoadComplete);
            this.removePhaserListener(PhaserListenerType.Load, Phaser.Loader.Events.FILE_LOAD_ERROR, onLoadError);
            console.warn("load dragonbones texture complete: ", loadData);
            resolve(null);
          };
          const onLoadError = (imageFile) => {
            if (this.mReplaceTextureKey !== imageFile.key)
              return;
            this.removePhaserListener(PhaserListenerType.Load, Phaser.Loader.Events.FILE_COMPLETE, onLoadComplete);
            this.removePhaserListener(PhaserListenerType.Load, Phaser.Loader.Events.FILE_LOAD_ERROR, onLoadError);
            console.warn("load dragonbones texture error: ", loadData);
            reject("load dragonbones texture error: " + loadData);
          };
          this.addPhaserListener(PhaserListenerType.Load, Phaser.Loader.Events.FILE_COMPLETE, onLoadComplete);
          this.addPhaserListener(PhaserListenerType.Load, Phaser.Loader.Events.FILE_LOAD_ERROR, onLoadError);
          this.scene.load.start();
        }
      }).catch((reason) => {
        reject(reason);
      });
    });
  }
  prepareReplaceSlotsDisplay() {
    return new Promise((resolve, reject) => {
      if (this.mLoadMap && this.mLoadMap.size > 0) {
        this.loadPartsRes().then(() => {
          resolve(null);
        });
      } else {
        resolve(null);
      }
    });
  }
  loadPartsRes(filter) {
    return new Promise((resolve, reject) => {
      const loadList = [];
      this.mLoadMap.forEach((pName, sName) => {
        if (filter !== void 0) {
          if (!filter(sName))
            return;
        }
        const loadUrl = this.partNameToLoadUrl(pName);
        const loadKey = this.partNameToLoadKey(pName);
        if (!this.scene.textures.exists(loadKey))
          loadList.push({ key: loadKey, url: loadUrl });
      });
      if (loadList.length === 0) {
        resolve(null);
        return;
      }
      const onLoadComplete = (data, totalComplete, totalFailed) => {
        if (!this.scene)
          return;
        this.removePhaserListener(PhaserListenerType.Load, Phaser.Loader.Events.COMPLETE, onLoadComplete);
        resolve(null);
      };
      this.addPhaserListener(PhaserListenerType.Load, Phaser.Loader.Events.COMPLETE, onLoadComplete);
      const onLoadError = (e) => {
        const sName = this.partLoadKeyToSlotName(e.key);
        if (!this.mLoadMap.has(sName))
          return;
        const pName = this.mLoadMap.get(sName);
        const lKey = this.partNameToLoadKey(pName);
        this.mErrorLoadMap.set(lKey, e);
      };
      this.addPhaserListener(PhaserListenerType.Load, Phaser.Loader.Events.FILE_LOAD_ERROR, onLoadError);
      this.scene.load.image(loadList);
      this.scene.load.start();
    });
  }
  formattingSkin(skin) {
    let version = "", sn = "";
    if (typeof skin === "string" || typeof skin === "number") {
      sn = skin.toString();
    } else {
      version = skin.version === void 0 || skin.version === "" ? "" : `_${skin.version}`;
      sn = skin.sn;
    }
    return { sn, version };
  }
  clearFadeTween() {
    if (this.mFadeTween) {
      this.mFadeTween.stop();
      this.mFadeTween.remove();
    }
  }
  checkNeedReplaceTexture(preVal, newVal) {
    if (!newVal)
      return false;
    if (!preVal)
      return true;
    const preAvatar = preVal.avatar;
    const newAvatar = newVal.avatar;
    for (const key in newAvatar) {
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
  }
  partLoadKeyToSlotName(key) {
    const arr = key.split("_");
    if (Tool.isNumeric(arr[2])) {
      return arr[0] + "_" + arr[1] + "_" + arr[3];
    } else {
      return arr[0] + "_" + arr[1] + "_" + arr[2] + "_" + arr[4];
    }
  }
  slotNameToPropertyName(slotName) {
    const sliced = slotName.slice(0, -2);
    const humpName = sliced.replace(/([^_])(?:_+([^_]))/g, ($0, $1, $2) => {
      return $1 + $2.toUpperCase();
    });
    return humpName + "Id";
  }
  setReplaceArrAndLoadMap() {
    this.replaceArr.length = 0;
    const avater = this.displayInfo.avatar;
    if (avater.bodyBaseId) {
      this.replaceArr.push({
        slot: AvatarSlotNameTemp.BodyBase,
        part: AvatarPartNameTemp.BodyBase,
        dir: 3,
        skin: avater.bodyBaseId
      });
      this.replaceArr.push({
        slot: AvatarSlotNameTemp.BodyBase,
        part: AvatarPartNameTemp.BodyBase,
        dir: 1,
        skin: avater.bodyBaseId
      });
    }
    if (avater.bodySpecId) {
      this.replaceArr.push({
        slot: AvatarSlotNameTemp.BodySpec,
        part: AvatarPartNameTemp.BodySpec,
        dir: 3,
        skin: avater.bodySpecId
      });
      this.replaceArr.push({
        slot: AvatarSlotNameTemp.BodySpec,
        part: AvatarPartNameTemp.BodySpec,
        dir: 1,
        skin: avater.bodySpecId
      });
    }
    if (avater.bodyWingId) {
      this.replaceArr.push({
        slot: AvatarSlotNameTemp.BodyWing,
        part: AvatarPartNameTemp.BodyWing,
        dir: 3,
        skin: avater.bodyWingId
      });
      this.replaceArr.push({
        slot: AvatarSlotNameTemp.BodyWing,
        part: AvatarPartNameTemp.BodyWing,
        dir: 1,
        skin: avater.bodyWingId
      });
    }
    if (avater.bodyTailId) {
      this.replaceArr.push({
        slot: AvatarSlotNameTemp.BodyTail,
        part: AvatarPartNameTemp.BodyTail,
        dir: 3,
        skin: avater.bodyTailId
      });
      this.replaceArr.push({
        slot: AvatarSlotNameTemp.BodyTail,
        part: AvatarPartNameTemp.BodyTail,
        dir: 1,
        skin: avater.bodyTailId
      });
    }
    if (avater.bodyCostId) {
      this.replaceArr.push({
        slot: AvatarSlotNameTemp.BodyCost,
        part: AvatarPartNameTemp.BodyCost,
        dir: 3,
        skin: avater.bodyCostId
      });
      this.replaceArr.push({
        slot: AvatarSlotNameTemp.BodyCost,
        part: AvatarPartNameTemp.BodyCost,
        dir: 1,
        skin: avater.bodyCostId
      });
    }
    if (avater.bodyCostDresId) {
      this.replaceArr.push({
        slot: AvatarSlotNameTemp.BodyCostDres,
        part: AvatarPartNameTemp.BodyCostDres,
        dir: 3,
        skin: avater.bodyCostDresId
      });
      this.replaceArr.push({
        slot: AvatarSlotNameTemp.BodyCostDres,
        part: AvatarPartNameTemp.BodyCostDres,
        dir: 1,
        skin: avater.bodyCostDresId
      });
    }
    if (avater.farmBaseId) {
      this.replaceArr.push({
        slot: AvatarSlotNameTemp.FarmBase,
        part: AvatarPartNameTemp.FarmBase,
        dir: 3,
        skin: avater.farmBaseId
      });
      this.replaceArr.push({
        slot: AvatarSlotNameTemp.FarmBase,
        part: AvatarPartNameTemp.FarmBase,
        dir: 1,
        skin: avater.farmBaseId
      });
    }
    if (avater.farmSpecId) {
      this.replaceArr.push({
        slot: AvatarSlotNameTemp.FarmSpec,
        part: AvatarPartNameTemp.FarmSpec,
        dir: 3,
        skin: avater.farmSpecId
      });
      this.replaceArr.push({
        slot: AvatarSlotNameTemp.FarmSpec,
        part: AvatarPartNameTemp.FarmSpec,
        dir: 1,
        skin: avater.farmSpecId
      });
    }
    if (avater.farmCostId) {
      this.replaceArr.push({
        slot: AvatarSlotNameTemp.FarmCost,
        part: AvatarPartNameTemp.FarmCost,
        dir: 3,
        skin: avater.farmCostId
      });
      this.replaceArr.push({
        slot: AvatarSlotNameTemp.FarmCost,
        part: AvatarPartNameTemp.FarmCost,
        dir: 1,
        skin: avater.farmCostId
      });
    }
    if (avater.barmBaseId) {
      this.replaceArr.push({
        slot: AvatarSlotNameTemp.BarmBase,
        part: AvatarPartNameTemp.BarmBase,
        dir: 3,
        skin: avater.barmBaseId
      });
      this.replaceArr.push({
        slot: AvatarSlotNameTemp.BarmBase,
        part: AvatarPartNameTemp.BarmBase,
        dir: 1,
        skin: avater.barmBaseId
      });
    }
    if (avater.barmSpecId) {
      this.replaceArr.push({
        slot: AvatarSlotNameTemp.BarmSpec,
        part: AvatarPartNameTemp.BarmSpec,
        dir: 3,
        skin: avater.barmSpecId
      });
      this.replaceArr.push({
        slot: AvatarSlotNameTemp.BarmSpec,
        part: AvatarPartNameTemp.BarmSpec,
        dir: 1,
        skin: avater.barmSpecId
      });
    }
    if (avater.barmCostId) {
      this.replaceArr.push({
        slot: AvatarSlotNameTemp.BarmCost,
        part: AvatarPartNameTemp.BarmCost,
        dir: 3,
        skin: avater.barmCostId
      });
      this.replaceArr.push({
        slot: AvatarSlotNameTemp.BarmCost,
        part: AvatarPartNameTemp.BarmCost,
        dir: 1,
        skin: avater.barmCostId
      });
    }
    if (avater.blegBaseId) {
      this.replaceArr.push({
        slot: AvatarSlotNameTemp.BlegBase,
        part: AvatarPartNameTemp.BlegBase,
        dir: 3,
        skin: avater.blegBaseId
      });
      this.replaceArr.push({
        slot: AvatarSlotNameTemp.BlegBase,
        part: AvatarPartNameTemp.BlegBase,
        dir: 1,
        skin: avater.blegBaseId
      });
    }
    if (avater.blegSpecId) {
      this.replaceArr.push({
        slot: AvatarSlotNameTemp.BlegSpec,
        part: AvatarPartNameTemp.BlegSpec,
        dir: 3,
        skin: avater.blegSpecId
      });
      this.replaceArr.push({
        slot: AvatarSlotNameTemp.BlegSpec,
        part: AvatarPartNameTemp.BlegSpec,
        dir: 1,
        skin: avater.blegSpecId
      });
    }
    if (avater.blegCostId) {
      this.replaceArr.push({
        slot: AvatarSlotNameTemp.BlegCost,
        part: AvatarPartNameTemp.BlegCost,
        dir: 3,
        skin: avater.blegCostId
      });
      this.replaceArr.push({
        slot: AvatarSlotNameTemp.BlegCost,
        part: AvatarPartNameTemp.BlegCost,
        dir: 1,
        skin: avater.blegCostId
      });
    }
    if (avater.flegBaseId) {
      this.replaceArr.push({
        slot: AvatarSlotNameTemp.FlegBase,
        part: AvatarPartNameTemp.FlegBase,
        dir: 3,
        skin: avater.flegBaseId
      });
      this.replaceArr.push({
        slot: AvatarSlotNameTemp.FlegBase,
        part: AvatarPartNameTemp.FlegBase,
        dir: 1,
        skin: avater.flegBaseId
      });
    }
    if (avater.flegSpecId) {
      this.replaceArr.push({
        slot: AvatarSlotNameTemp.FlegSpec,
        part: AvatarPartNameTemp.FlegSpec,
        dir: 3,
        skin: avater.flegSpecId
      });
      this.replaceArr.push({
        slot: AvatarSlotNameTemp.FlegSpec,
        part: AvatarPartNameTemp.FlegSpec,
        dir: 1,
        skin: avater.flegSpecId
      });
    }
    if (avater.flegCostId) {
      this.replaceArr.push({
        slot: AvatarSlotNameTemp.FlegCost,
        part: AvatarPartNameTemp.FlegCost,
        dir: 3,
        skin: avater.flegCostId
      });
      this.replaceArr.push({
        slot: AvatarSlotNameTemp.FlegCost,
        part: AvatarPartNameTemp.FlegCost,
        dir: 1,
        skin: avater.flegCostId
      });
    }
    if (avater.headBaseId) {
      this.replaceArr.push({
        slot: AvatarSlotNameTemp.HeadBase,
        part: AvatarPartNameTemp.HeadBase,
        dir: 3,
        skin: avater.headBaseId
      });
      this.replaceArr.push({
        slot: AvatarSlotNameTemp.HeadBase,
        part: AvatarPartNameTemp.HeadBase,
        dir: 1,
        skin: avater.headBaseId
      });
    }
    if (avater.barmWeapId) {
      this.replaceArr.push({
        slot: AvatarSlotNameTemp.BarmWeap,
        part: AvatarPartNameTemp.WeapBarm,
        dir: 3,
        skin: avater.barmWeapId
      });
      this.replaceArr.push({
        slot: AvatarSlotNameTemp.BarmWeap,
        part: AvatarPartNameTemp.WeapBarm,
        dir: 1,
        skin: avater.barmWeapId
      });
    }
    if (avater.headHairId) {
      this.replaceArr.push({
        slot: AvatarSlotNameTemp.HeadHair,
        part: AvatarPartNameTemp.HeadHair,
        dir: 3,
        skin: avater.headHairId
      });
      this.replaceArr.push({
        slot: AvatarSlotNameTemp.HeadHair,
        part: AvatarPartNameTemp.HeadHair,
        dir: 1,
        skin: avater.headHairId
      });
    }
    if (avater.headHairBackId) {
      this.replaceArr.push({
        slot: AvatarSlotNameTemp.HeadHairBack,
        part: AvatarPartNameTemp.HeadHairBack,
        dir: 3,
        skin: avater.headHairBackId
      });
      this.replaceArr.push({
        slot: AvatarSlotNameTemp.HeadHairBack,
        part: AvatarPartNameTemp.HeadHairBack,
        dir: 1,
        skin: avater.headHairBackId
      });
    }
    if (avater.headHatsId) {
      this.replaceArr.push({
        slot: AvatarSlotNameTemp.HeadHats,
        part: AvatarPartNameTemp.HeadHats,
        dir: 3,
        skin: avater.headHatsId
      });
      this.replaceArr.push({
        slot: AvatarSlotNameTemp.HeadHats,
        part: AvatarPartNameTemp.HeadHats,
        dir: 1,
        skin: avater.headHatsId
      });
    }
    if (avater.headSpecId) {
      this.replaceArr.push({
        slot: AvatarSlotNameTemp.HeadSpec,
        part: AvatarPartNameTemp.HeadSpec,
        dir: 3,
        skin: avater.headSpecId
      });
      this.replaceArr.push({
        slot: AvatarSlotNameTemp.HeadSpec,
        part: AvatarPartNameTemp.HeadSpec,
        dir: 1,
        skin: avater.headSpecId
      });
    }
    if (avater.headEyesId) {
      this.replaceArr.push({
        slot: AvatarSlotNameTemp.HeadEyes,
        part: AvatarPartNameTemp.HeadEyes,
        dir: 3,
        skin: avater.headEyesId
      });
    }
    if (avater.headMousId) {
      this.replaceArr.push({
        slot: AvatarSlotNameTemp.HeadMous,
        part: AvatarPartNameTemp.HeadMous,
        dir: 3,
        skin: avater.headMousId
      });
    }
    if (avater.headMaskId) {
      this.replaceArr.push({
        slot: AvatarSlotNameTemp.HeadMask,
        part: AvatarPartNameTemp.HeadMask,
        dir: 3,
        skin: avater.headMaskId
      });
    }
    if (avater.headFaceId) {
      this.replaceArr.push({
        slot: AvatarSlotNameTemp.HeadFace,
        part: AvatarPartNameTemp.HeadFace,
        dir: 3,
        skin: avater.headFaceId
      });
      this.replaceArr.push({
        slot: AvatarSlotNameTemp.HeadFace,
        part: AvatarPartNameTemp.HeadFace,
        dir: 1,
        skin: avater.headFaceId
      });
    }
    if (avater.farmShldId) {
      this.replaceArr.push({
        slot: AvatarSlotNameTemp.ShldFarm,
        part: AvatarPartNameTemp.ShldFarm,
        dir: 3,
        skin: avater.farmShldId
      });
      this.replaceArr.push({
        slot: AvatarSlotNameTemp.ShldFarm,
        part: AvatarPartNameTemp.ShldFarm,
        dir: 1,
        skin: avater.farmShldId
      });
    }
    if (avater.barmShldId) {
      this.replaceArr.push({
        slot: AvatarSlotNameTemp.ShldBarm,
        part: AvatarPartNameTemp.ShldBarm,
        dir: 3,
        skin: avater.barmShldId
      });
      this.replaceArr.push({
        slot: AvatarSlotNameTemp.ShldBarm,
        part: AvatarPartNameTemp.ShldBarm,
        dir: 1,
        skin: avater.barmShldId
      });
    }
    if (avater.farmWeapId) {
      this.replaceArr.push({
        slot: AvatarSlotNameTemp.FarmWeap,
        part: AvatarPartNameTemp.WeapFarm,
        dir: 3,
        skin: avater.farmWeapId
      });
      this.replaceArr.push({
        slot: AvatarSlotNameTemp.FarmWeap,
        part: AvatarPartNameTemp.WeapFarm,
        dir: 1,
        skin: avater.farmWeapId
      });
    }
    if (avater.headChinId) {
      this.replaceArr.push({
        slot: AvatarSlotNameTemp.HeadChin,
        part: AvatarPartNameTemp.HeadChin,
        dir: 3,
        skin: avater.headChinId
      });
      this.replaceArr.push({
        slot: AvatarSlotNameTemp.HeadChin,
        part: AvatarPartNameTemp.HeadChin,
        dir: 1,
        skin: avater.headChinId
      });
    }
    if (avater.bodyScarId) {
      this.replaceArr.push({
        slot: AvatarSlotNameTemp.BodyScar,
        part: AvatarPartNameTemp.BodyScar,
        dir: 3,
        skin: avater.bodyScarId
      });
      this.replaceArr.push({
        slot: AvatarSlotNameTemp.BodyScar,
        part: AvatarPartNameTemp.BodyScar,
        dir: 1,
        skin: avater.bodyScarId
      });
    }
    if (avater.bodyCloaId) {
      this.replaceArr.push({
        slot: AvatarSlotNameTemp.BodyCloa,
        part: AvatarPartNameTemp.BodyCloa,
        dir: 3,
        skin: avater.bodyCloaId
      });
      this.replaceArr.push({
        slot: AvatarSlotNameTemp.BodyCloa,
        part: AvatarPartNameTemp.BodyCloa,
        dir: 1,
        skin: avater.bodyCloaId
      });
    }
    const setLoadMap = (soltNameTemp, partNameTemp, dir, skin) => {
      const slotName = soltNameTemp.replace("$", dir.toString());
      const slot = this.mArmatureDisplay.armature.getSlot(slotName);
      if (!slot)
        return;
      const tempskin = this.formattingSkin(skin);
      if (!tempskin.sn)
        return;
      const partName = partNameTemp.replace("#", tempskin.sn).replace("$", dir.toString()) + tempskin.version;
      const dragonBonesTexture = this.scene.game.textures.get(this.resourceName);
      const loadKey = this.partNameToLoadKey(partName);
      const dbFrameName = this.partNameToDBFrameName(partName);
      if (this.mErrorLoadMap.get(loadKey))
        return;
      if (!this.scene.textures.exists(loadKey)) {
        this.mLoadMap.set(slotName, partName);
      }
    };
    this.mLoadMap.clear();
    for (const obj of this.replaceArr) {
      setLoadMap(obj.slot, obj.part, obj.dir, obj.skin);
    }
  }
  addPhaserListener(type, key, func) {
    let loadPlugin;
    let listenersMap;
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
    const listeners = listenersMap.get(key);
    const idx = listeners.indexOf(func);
    if (idx >= 0)
      listeners.splice(idx, 1);
    listeners.push(func);
  }
  removePhaserListener(type, key, func) {
    let loadPlugin;
    let listenersMap;
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
    const listeners = listenersMap.get(key);
    const idx = listeners.indexOf(func);
    if (idx >= 0)
      listeners.splice(idx, 1);
  }
  recordReplacedTexture(key) {
    if (ReplacedTextures.has(key)) {
      const count = ReplacedTextures.get(key);
      ReplacedTextures.set(key, count + 1);
    } else {
      ReplacedTextures.set(key, 1);
    }
  }
  destroyReplacedTextureManually() {
    const textureAtlasData = this.mArmatureDisplay.armature["_replaceTextureAtlasData"];
    if (!textureAtlasData || !textureAtlasData.renderTexture)
      return;
    if (!ReplacedTextures.has(textureAtlasData.renderTexture.key))
      return;
    const count = ReplacedTextures.get(textureAtlasData.renderTexture.key);
    if (count > 1) {
      ReplacedTextures.set(textureAtlasData.renderTexture.key, count - 1);
    } else {
      ReplacedTextures.delete(textureAtlasData.renderTexture.key);
      this.scene.cache.json.remove(textureAtlasData.renderTexture.key);
      textureAtlasData.renderTexture.destroy();
    }
    textureAtlasData.releaseRenderTexture();
  }
}
var PhaserListenerType;
(function(PhaserListenerType2) {
  PhaserListenerType2[PhaserListenerType2["Load"] = 0] = "Load";
  PhaserListenerType2[PhaserListenerType2["Textures"] = 1] = "Textures";
})(PhaserListenerType || (PhaserListenerType = {}));
