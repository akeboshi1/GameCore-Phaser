var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
import { BaseDragonbonesDisplay } from "baseRender";
import { Logger } from "structure";
const _AvatarEditorDragonbone = class extends Phaser.GameObjects.Container {
  constructor(scene, homePath, osdPath, emitter, autoScale, startSets, onReadyForSnapshot) {
    super(scene);
    __publicField(this, "mDisplay_default");
    __publicField(this, "mDisplay_head");
    __publicField(this, "mEmitter");
    __publicField(this, "mAutoScale", true);
    __publicField(this, "mWebHomePath");
    __publicField(this, "mLocalHomePath");
    __publicField(this, "mCurAnimationName", "idle");
    __publicField(this, "mCurDir", 3);
    __publicField(this, "mBaseSets", []);
    __publicField(this, "mSets", []);
    __publicField(this, "mParts", {});
    __publicField(this, "mArmatureBottomArea", 0);
    __publicField(this, "mArmatureBottomArea_head", 0);
    __publicField(this, "mOnReadyForSnapshot");
    this.mWebHomePath = osdPath;
    this.mLocalHomePath = homePath;
    this.mEmitter = emitter;
    this.mAutoScale = autoScale;
    const parentContainer = scene.add.container(0, 0);
    parentContainer.add(this);
    if (startSets) {
      this.mSets = startSets;
    }
    if (onReadyForSnapshot) {
      this.mOnReadyForSnapshot = onReadyForSnapshot;
    }
    this.setBaseSets(_AvatarEditorDragonbone.DEFAULT_SETS);
    this.createDisplays();
  }
  destroy() {
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
    super.destroy();
  }
  loadLocalResources(img, part, dir) {
    return new Promise((resolve, reject) => {
      const key = this.partTextureSaveKey(part, img.key, dir);
      if (this.scene.textures.exists(key)) {
        this.scene.textures.remove(key);
        this.scene.textures.removeKey(key);
      }
      const onLoad = (k) => {
        if (key !== k)
          return;
        this.scene.textures.off("onload", onLoad, this, false);
        this.scene.textures.off(Phaser.Loader.Events.FILE_LOAD_ERROR, onLoadError, this);
        this.reloadDisplay();
        resolve(k);
      };
      const onLoadError = (k) => {
        if (key !== k)
          return;
        this.scene.textures.off("onload", onLoad, this, false);
        this.scene.textures.off(Phaser.Loader.Events.FILE_LOAD_ERROR, onLoadError, this);
        reject(k);
      };
      this.scene.textures.on("onload", onLoad, this);
      this.scene.textures.on(Phaser.Loader.Events.FILE_LOAD_ERROR, onLoadError, this);
      this.scene.textures.addBase64(key, img.url);
    });
  }
  setDir(dir) {
    const re = this.mCurAnimationName.split("_");
    this.mCurAnimationName = dir === 3 ? re[0] : re[0] + "_back";
    this.mCurDir = dir;
    this.reloadDisplay();
  }
  play(animationName) {
    this.mCurAnimationName = animationName;
    if (this.mDisplay_default) {
      this.mDisplay_default.play({ name: this.mCurAnimationName, flip: false });
    }
  }
  clearParts() {
    if (this.mSets)
      this.mSets = [];
    this.setBaseSets(_AvatarEditorDragonbone.DEFAULT_SETS);
    this.reloadDisplay();
  }
  mergeParts(sets) {
    this.addSets(sets);
    this.reloadDisplay();
  }
  cancelParts(sets) {
    this.removeSets(sets);
    this.reloadDisplay();
  }
  generateShopIcon(width, height) {
    return new Promise((resolve, reject) => {
      if (width === 0 || height === 0) {
        reject("width and height must not be 0");
        return;
      }
      const modelData = this.getSnapshotModelData();
      if (!modelData.armature) {
        reject("no armature");
        return;
      }
      this.snapshot({ x: 0, y: 0, width, height }, modelData).then((result) => {
        Logger.getInstance().log("shop icon: ", result);
        resolve(result);
      }).catch((reason) => {
        reject(reason);
      });
    });
  }
  generateHeadIcon() {
    return new Promise((resolve, reject) => {
      if (!this.mDisplay_default) {
        reject("no armature");
        return;
      }
      if (_AvatarEditorDragonbone.HEAD_ICON_DEFAULT_SNAPSHOT_TOTAL_HEIGHT > this.scene.scale.height) {
        reject("game size is not enough, must larger than " + _AvatarEditorDragonbone.HEAD_ICON_DEFAULT_SNAPSHOT_TOTAL_HEIGHT);
        return;
      }
      const modelData = {
        armature: this.mDisplay_default,
        x: _AvatarEditorDragonbone.HEAD_ICON_WIDTH / 2,
        y: _AvatarEditorDragonbone.HEAD_ICON_DEFAULT_BOTTOM_PIX,
        baseSets: _AvatarEditorDragonbone.DEFAULT_SETS
      };
      this.snapshot({
        x: 0,
        y: _AvatarEditorDragonbone.HEAD_ICON_DEFAULT_SNAPSHOT_TOTAL_HEIGHT - _AvatarEditorDragonbone.HEAD_ICON_HEIGHT,
        width: _AvatarEditorDragonbone.HEAD_ICON_WIDTH,
        height: _AvatarEditorDragonbone.HEAD_ICON_HEIGHT
      }, modelData).then((result) => {
        resolve(result);
      }).catch((reason) => {
        reject(reason);
      });
    });
  }
  get curSets() {
    return this.mSets;
  }
  createDisplays() {
    if (this.mDisplay_default) {
      this.mDisplay_default.destroy();
    }
    if (this.mDisplay_head) {
      this.mDisplay_head.destroy();
    }
    const sceneHeight = this.scene.scale.height;
    this.mArmatureBottomArea = _AvatarEditorDragonbone.DEFAULT_SCALE_BOTTOM_PIX * sceneHeight / _AvatarEditorDragonbone.DEFAULT_SCALE_GAME_HEIGHT;
    this.mDisplay_default = new EditorDragonbonesDisplay(this.scene, _AvatarEditorDragonbone.DRAGONBONE_NAME_DEFAULT, this.mLocalHomePath, this.mWebHomePath);
    this.mDisplay_default.play({ name: this.mCurAnimationName, flip: false });
    if (this.mAutoScale)
      this.mDisplay_default.scale = sceneHeight / _AvatarEditorDragonbone.DEFAULT_SCALE_GAME_HEIGHT;
    this.mDisplay_default.x = this.scene.scale.width >> 1;
    this.mDisplay_default.y = this.scene.scale.height - this.mArmatureBottomArea;
    this.add(this.mDisplay_default);
    this.mArmatureBottomArea_head = this.mArmatureBottomArea - _AvatarEditorDragonbone.ARMATURE_LEG_PERCENT * _AvatarEditorDragonbone.ARMATURE_HEIGHT * sceneHeight / _AvatarEditorDragonbone.DEFAULT_SCALE_GAME_HEIGHT;
    this.mDisplay_head = new EditorDragonbonesDisplay(this.scene, _AvatarEditorDragonbone.DRAGONBONE_NAME_HEAD, this.mLocalHomePath, this.mWebHomePath);
    if (this.mAutoScale)
      this.mDisplay_head.scale = sceneHeight / _AvatarEditorDragonbone.DEFAULT_SCALE_GAME_HEIGHT;
    this.mDisplay_head.x = this.scene.scale.width >> 1;
    this.mDisplay_head.y = this.scene.scale.height - this.mArmatureBottomArea_head + 1e3;
    this.add(this.mDisplay_head);
    this.reloadDisplay();
  }
  setBaseSets(sets) {
    if (this.mBaseSets)
      this.mBaseSets = [];
    this.mBaseSets = sets;
    this.applySets(true);
  }
  addSets(newSets) {
    const temp = [];
    for (const newSet of newSets) {
      const existSetIdx = this.mSets.findIndex((x) => x.id === newSet.id && JSON.stringify(x.parts) === JSON.stringify(newSet.parts));
      if (existSetIdx >= 0)
        continue;
      temp.push(JSON.parse(JSON.stringify(newSet)));
    }
    for (const newSet of temp) {
      for (const key in _AvatarEditorDragonbone.HAIR_BACK) {
        if (_AvatarEditorDragonbone.HAIR_BACK.hasOwnProperty(key)) {
          const parts = newSet.parts;
          for (const part of parts) {
            if (part === key) {
              this.removePartsInSets(_AvatarEditorDragonbone.HAIR_BACK[part], this.mSets);
              this.removePartsInCurParts(_AvatarEditorDragonbone.HAIR_BACK[part]);
            }
          }
        }
      }
    }
    this.mSets = this.mSets.concat(temp);
    this.applySets();
  }
  applySets(reset = false) {
    if (reset) {
      this.mParts = {};
      for (const part of _AvatarEditorDragonbone.ADD_PARTS) {
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
    for (const key in this.mParts) {
      const set = this.mParts[key];
      if (!set)
        continue;
      if (_AvatarEditorDragonbone.SPECIAL_SETS.hasOwnProperty(key)) {
        const specParts = _AvatarEditorDragonbone.SPECIAL_SETS[key];
        for (const specP of specParts) {
          this.mParts[specP] = null;
        }
      }
    }
  }
  removeSets(sets) {
    for (const set of sets) {
      const idx = this.mSets.findIndex((x) => x.id === set.id);
      if (idx >= 0) {
        this.mSets.splice(idx, 1);
      }
      const dirs = ["1", "3"];
      for (const dir of dirs) {
        for (const part of set.parts) {
          const imgKey = this.partTextureSaveKey(part, set.id, dir, set.version);
          if (this.scene.textures.exists(imgKey)) {
            this.scene.textures.remove(imgKey);
            this.scene.textures.removeKey(imgKey);
          }
        }
      }
    }
    this.applySets(true);
  }
  reloadDisplay() {
    return new Promise((resolve, reject) => {
      const loadData = this.convertPartsToIDragonbonesModel(this.mParts);
      Promise.all([
        this.mDisplay_default.load(loadData, void 0, false),
        this.mDisplay_head.load(loadData, void 0, false)
      ]).then(() => {
        resolve(null);
        if (this.mOnReadyForSnapshot) {
          this.mOnReadyForSnapshot(this);
          this.mOnReadyForSnapshot = null;
        }
      }).catch((err) => {
        if (err)
          Logger.getInstance().error("reload display error: ", err);
      });
      this.mDisplay_default.play({ name: this.mCurAnimationName, flip: false });
    });
  }
  partTextureSaveKey(part, id, dir, ver) {
    let result = `${part}_${id}_${dir}`;
    if (ver !== void 0 && ver.length > 0) {
      result = `${result}_${ver}`;
    }
    result = result + "_png";
    return result;
  }
  removePartsInSets(parts, sets) {
    for (const set of sets) {
      for (const part of parts) {
        const idx = set.parts.indexOf(part);
        if (idx >= 0)
          set.parts.splice(idx, 1);
      }
    }
    return sets;
  }
  removePartsInCurParts(parts) {
    for (const part of parts) {
      if (this.mParts.hasOwnProperty(part)) {
        delete this.mParts[part];
      }
    }
  }
  getSnapshotModelData() {
    for (const set of this.mSets) {
      for (const part of set.parts) {
        if (_AvatarEditorDragonbone.BOTTOM_BODY_PARTS.indexOf(part) >= 0) {
          return {
            armature: this.mDisplay_default,
            x: this.mDisplay_default.x,
            y: this.mArmatureBottomArea,
            baseSets: _AvatarEditorDragonbone.MODEL_SETS
          };
        }
      }
    }
    return {
      armature: this.mDisplay_head,
      x: this.mDisplay_default.x,
      y: this.mArmatureBottomArea_head,
      baseSets: _AvatarEditorDragonbone.MODEL_SETS
    };
  }
  snapshot(area, modelData) {
    return new Promise((resolve, reject) => {
      this.setBaseSets(modelData.baseSets);
      this.reloadDisplay().then(() => {
        const gameWidth = this.scene.scale.width;
        const gameHeight = this.scene.scale.height;
        Logger.getInstance().debug(`ZW-- start snapshot, gameSize: ${gameWidth}*${gameHeight}, setSize: ${area.width}*${area.height}`);
        const rt = this.scene.make.renderTexture({ x: 0, y: 0, width: gameWidth, height: gameHeight }, false);
        modelData.armature.scaleY *= -1;
        const display = modelData.armature.getDisplay();
        if (!display)
          reject("display does not exist");
        display.armature.advanceTime(1e3);
        rt.draw(modelData.armature, modelData.x, modelData.y);
        rt.snapshotArea(area.x, area.y, area.width, area.height, (img) => {
          modelData.armature.scaleY *= -1;
          this.setBaseSets(_AvatarEditorDragonbone.DEFAULT_SETS);
          this.reloadDisplay().then(() => {
            resolve(img.src);
            Logger.getInstance().log("snapshot result: ", img.src);
          });
        });
      }).catch(() => {
        reject("replaceDisplay error");
      });
    });
  }
  convertPartsToIDragonbonesModel(parts) {
    const avatarModel = { id: "0" };
    const allPartsName = [].concat(_AvatarEditorDragonbone.BASE_PARTS, _AvatarEditorDragonbone.ADD_PARTS);
    for (const partName of allPartsName) {
      if (!parts.hasOwnProperty(partName))
        continue;
      const set = parts[partName];
      if (!set)
        continue;
      const avatarKey = this.convertPartNameToIAvatarKey(partName);
      avatarModel[avatarKey] = { sn: set.id, version: set.version };
    }
    const dragonbonesModel = { id: 0, avatar: avatarModel };
    return dragonbonesModel;
  }
  convertPartNameToIAvatarKey(partName) {
    const nameArr = partName.split("_");
    let result = nameArr[0];
    for (let i = 1; i < nameArr.length; i++) {
      const temp = nameArr[i];
      result += temp.charAt(0).toUpperCase() + temp.slice(1);
    }
    result += "Id";
    return result;
  }
};
export let AvatarEditorDragonbone = _AvatarEditorDragonbone;
__publicField(AvatarEditorDragonbone, "DRAGONBONE_NAME_DEFAULT", "bones_human01");
__publicField(AvatarEditorDragonbone, "DRAGONBONE_NAME_HEAD", "bones_model_head");
__publicField(AvatarEditorDragonbone, "DRAGONBONE_ARMATURE_NAME", "Armature");
__publicField(AvatarEditorDragonbone, "BASE_PARTS", [
  "body_base",
  "barm_base",
  "farm_base",
  "bleg_base",
  "fleg_base",
  "head_base"
]);
__publicField(AvatarEditorDragonbone, "ADD_PARTS", [
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
  "farm_weap"
]);
__publicField(AvatarEditorDragonbone, "BOTTOM_BODY_PARTS", [
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
]);
__publicField(AvatarEditorDragonbone, "HAIR_BACK", {
  ["head_hair"]: ["head_hair", "head_hair_back"],
  ["body_cost"]: ["body_cost", "body_cost_dres"]
});
__publicField(AvatarEditorDragonbone, "DEFAULT_SETS", [
  { id: "60c8626bdd14da5f64b49341", parts: _AvatarEditorDragonbone.BASE_PARTS },
  { id: "5cd28238fb073710972a73c2", parts: ["head_hair", "head_eyes", "head_mous", "body_cost"] }
]);
__publicField(AvatarEditorDragonbone, "SPECIAL_SETS", {
  ["head_spec"]: ["head_eyes", "head_hair", "head_mous", "head_hair_back", "head_hats", "head_mask", "head_face", "head_base"],
  ["body_spec"]: ["body_cost", "body_cost_dres", "body_tail", "body_wing", "body_base"],
  ["farm_spec"]: ["farm_cost", "farm_shld", "farm_weap", "farm_base"],
  ["barm_spec"]: ["barm_cost", "barm_shld", "barm_weap", "barm_base"],
  ["fleg_spec"]: ["fleg_cost", "fleg_base"],
  ["bleg_spec"]: ["bleg_cost", "bleg_base"]
});
__publicField(AvatarEditorDragonbone, "MODEL_SETS", [
  {
    id: "5fbf562e72c7db2dbdcdb4ea",
    parts: _AvatarEditorDragonbone.BASE_PARTS
  }
]);
__publicField(AvatarEditorDragonbone, "DEFAULT_SCALE_GAME_HEIGHT", 72);
__publicField(AvatarEditorDragonbone, "DEFAULT_SCALE_BOTTOM_PIX", 4);
__publicField(AvatarEditorDragonbone, "ARMATURE_HEIGHT", 61);
__publicField(AvatarEditorDragonbone, "ARMATURE_LEG_PERCENT", 0.15);
__publicField(AvatarEditorDragonbone, "HEAD_ICON_HIDE_PIX", 22);
__publicField(AvatarEditorDragonbone, "HEAD_ICON_WIDTH", 71);
__publicField(AvatarEditorDragonbone, "HEAD_ICON_HEIGHT", 57);
__publicField(AvatarEditorDragonbone, "HEAD_ICON_DEFAULT_SNAPSHOT_TOTAL_HEIGHT", 79);
__publicField(AvatarEditorDragonbone, "HEAD_ICON_DEFAULT_BOTTOM_PIX", 0);
class EditorDragonbonesDisplay extends BaseDragonbonesDisplay {
  constructor(scene, resName, mLocalHomePath, mWebHomePath) {
    super(scene, { resPath: mLocalHomePath, osdPath: mWebHomePath });
    this.resourceName = resName;
  }
}
