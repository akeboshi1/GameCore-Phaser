var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
import {
  EventNode
} from "game-capsule";
import { op_def } from "pixelpai_proto";
import { BlockIndex } from "utils";
import { AnimationModel, Logger, LogicPos, Position45 } from "structure";
import { DragonbonesModel, FramesModel } from "../sprite";
export class ElementStorage {
  constructor(config) {
    this.config = config;
    __publicField(this, "mModels", new Map());
    __publicField(this, "mElementRef", new Map());
    __publicField(this, "mTerrainRef", new Map());
    __publicField(this, "mDisplayRefMap");
    __publicField(this, "terrainPalette", new Map());
    __publicField(this, "terrainPaletteWithBindId", new Map());
    __publicField(this, "terrainPaletteWithSN", new Map());
    __publicField(this, "mossPalette", new Map());
    __publicField(this, "_terrainCollection");
    __publicField(this, "_mossCollection");
    __publicField(this, "_wallCollection");
    __publicField(this, "_scenerys");
    __publicField(this, "_assets");
    this.mDisplayRefMap = new Map();
    this.mDisplayRefMap.set(op_def.NodeType.ElementNodeType, new Map());
    this.mDisplayRefMap.set(op_def.NodeType.TerrainNodeType, new Map());
  }
  setGameConfig(config) {
    Logger.getInstance().debug("TCL: ElementStorage -> config", config);
    if (!config) {
      return;
    }
    const objs = config.objectsList;
    let displayModel = null;
    for (const obj of objs) {
      if (obj.type === op_def.NodeType.ElementNodeType) {
        displayModel = this.mModels.get(obj.id);
        if (!displayModel) {
          const anis = [];
          const eleAnis = obj.animations;
          if (!eleAnis)
            continue;
          const objAnis = eleAnis.animationData;
          for (const ani of objAnis) {
            anis.push(new AnimationModel(ani.createProtocolObject()));
          }
          displayModel = new FramesModel({
            id: obj.id,
            sn: obj.sn,
            animations: {
              defaultAnimationName: eleAnis.defaultAnimationName,
              display: eleAnis.display,
              animationData: anis
            }
          });
        }
      }
    }
    this.updatePalette(config.root.palette);
    this.updateMoss(config.root.moss);
    this.updateAssets(config.root.assets);
  }
  updatePalette(palette) {
    for (const key of Array.from(palette.peersDict.keys())) {
      const terrainPalette = palette.peersDict.get(key);
      const terrainModel = this.terrainPalette.get(terrainPalette.id);
      if (!terrainPalette.animations)
        continue;
      if (!terrainModel) {
        const frameModel = new FramesModel({
          id: terrainPalette.id,
          sn: terrainPalette.sn,
          animations: {
            defaultAnimationName: terrainPalette.animations.defaultAnimationName,
            display: terrainPalette.animations.display,
            animationData: terrainPalette.animations.animationData.map((ani) => new AnimationModel(ani.createProtocolObject()))
          }
        });
        this.terrainPalette.set(key, frameModel);
        this.terrainPaletteWithBindId.set(terrainPalette.id, frameModel);
        this.terrainPaletteWithSN.set(terrainPalette.sn, frameModel);
      }
    }
  }
  updateMoss(moss) {
    for (const peerKey of Array.from(moss.peersDict.keys())) {
      const elementMoss = moss.peersDict.get(peerKey);
      const elementModel = this.mossPalette.get(elementMoss.id);
      if (!elementMoss.animations)
        continue;
      if (!elementModel) {
        const frameModel = new FramesModel({
          id: elementMoss.id,
          sn: elementMoss.sn,
          animations: {
            defaultAnimationName: elementMoss.animations.defaultAnimationName,
            display: elementMoss.animations.display,
            animationData: elementMoss.animations.animationData.map((ani) => new AnimationModel(ani.createProtocolObject()))
          }
        });
        this.mossPalette.set(peerKey, { layer: elementMoss.layer, frameModel });
      }
    }
  }
  updateAssets(assetsNode) {
    const assets = assetsNode.getAssetList();
    this._assets = [];
    for (const asset of assets) {
      const media = asset.media;
      if (media) {
        const fileType = media.match(/\.([a-zA-Z0-9]+)($|\?)/);
        if (fileType && fileType[1]) {
          this._assets.push({
            type: fileType[1],
            key: asset.key,
            source: this.config.osdPath + media
          });
        }
      }
    }
  }
  setSceneConfig(config) {
    this.clearDisplayRef();
    const objs = config.objectsList;
    const sceneNode = config.root.children.find((node) => node.type === op_def.NodeType.SceneNodeType);
    Logger.getInstance().log("sceneNode: ", sceneNode.size);
    if (!sceneNode) {
      return Logger.getInstance().error("Failed to parse scene, SceneNode does not exist");
    }
    let displayModel = null;
    for (const obj of objs) {
      if (obj.type === op_def.NodeType.ElementNodeType) {
        displayModel = this.mModels.get(obj.id);
        const eventName = [];
        obj.children.forEach((item) => {
          if (item instanceof EventNode && item.eventName === op_def.GameEvent.onElementHit) {
            eventName.push(item.eventName);
          }
        });
        const ele = obj;
        if (!displayModel) {
          const anis = [];
          const eleAnis = obj.animations;
          if (ele.avatar) {
            displayModel = new DragonbonesModel({ id: ele.id, avatar: ele.avatar.createProtocolObject() });
          } else {
            const objAnis = eleAnis.animationData;
            if (objAnis.length < 1) {
              Logger.getInstance().error(`${obj.name}:${obj.id} animation error`);
              continue;
            }
            for (const ani of objAnis) {
              anis.push(new AnimationModel(ani.createProtocolObject()));
            }
            displayModel = new FramesModel({
              id: obj.id,
              sn: obj.sn,
              eventName,
              animations: {
                defaultAnimationName: eleAnis.defaultAnimationName,
                display: eleAnis.display,
                animationData: anis
              }
            });
          }
          this.mModels.set(obj.id, displayModel);
        }
        const pos = ele.location;
        if (!pos) {
          Logger.getInstance().error(`${ele.name}-${ele.id} location does not exist`);
          continue;
        }
        let mountSprites = null;
        if (ele.mountSprites && ele.mountSprites.ids.length > 0) {
          mountSprites = ele.mountSprites.ids;
        }
        const eleRef = {
          id: obj.id,
          pos,
          blockIndex: new BlockIndex().getBlockIndex(pos.x, pos.y, sceneNode.size),
          direction: ele.animations.dir,
          name: obj.name,
          displayModel,
          layer: ele.layer,
          mountSprites
        };
        this.addDisplayRef(eleRef, op_def.NodeType.ElementNodeType);
      }
    }
    this._terrainCollection = sceneNode.terrainCollection;
    this._mossCollection = sceneNode.mossCollection;
    this._wallCollection = sceneNode.wallCollection;
    this._scenerys = sceneNode.getScenerys();
    this.addTerrainToDisplayRef(sceneNode);
    this.addMossToDisplayRef(sceneNode);
  }
  add(obj) {
    if (!obj)
      return;
    this.mModels.set(obj.id, obj);
  }
  getElementRef(id) {
    const map = this.mDisplayRefMap.get(op_def.NodeType.ElementNodeType);
    if (!map)
      return;
    return map.get(id);
  }
  getDisplayModel(id) {
    return this.mModels.get(id);
  }
  getTerrainCollection() {
    return this._terrainCollection;
  }
  getTerrainPalette(key) {
    if (this.terrainPalette.get(key)) {
      return this.terrainPalette.get(key);
    }
  }
  getTerrainPaletteByBindId(id) {
    if (this.terrainPaletteWithBindId.get(id)) {
      return this.terrainPaletteWithBindId.get(id);
    }
  }
  getTerrainPaletteBySN(sn) {
    if (this.terrainPaletteWithSN.get(sn)) {
      return this.terrainPaletteWithSN.get(sn);
    }
  }
  getMossCollection() {
    return this._mossCollection;
  }
  getMossPalette(id) {
    if (this.mossPalette.get(id)) {
      return this.mossPalette.get(id);
    }
  }
  getScenerys() {
    return this._scenerys;
  }
  getAssets() {
    return this._assets;
  }
  getWallCollection() {
    return this._wallCollection;
  }
  getElementFromBlockIndex(indexs, nodeType) {
    const result = [];
    const map = this.mDisplayRefMap.get(nodeType);
    if (!map)
      return;
    map.forEach((ele) => {
      if (indexs.includes(ele.blockIndex))
        result.push(ele);
    });
    return result;
  }
  destroy() {
    this.clearDisplayRef();
    this.terrainPalette.clear();
    this.terrainPaletteWithBindId.clear();
    this.terrainPaletteWithSN.clear();
    this.mossPalette.clear();
    this.mModels.forEach((model, index) => {
      model.destroy();
    });
    this.mModels.clear();
    this._assets = void 0;
  }
  addDisplayRef(displayRef, nodeType) {
    const map = this.mDisplayRefMap.get(nodeType);
    if (!map)
      return;
    map.set(displayRef.id, displayRef);
  }
  addTerrainToDisplayRef(sceneNode) {
    const terrains = this._terrainCollection.data;
    const cols = terrains.length;
    const rows = terrains[0].length;
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        if (terrains[i][j] === 0)
          continue;
        const id = i << 16 | j;
        if (!sceneNode || !sceneNode.size) {
          Logger.getInstance().error(`${sceneNode.name}-${sceneNode.id} sceneNode.size does not exist`);
          continue;
        }
        const pos = Position45.transformTo90(new LogicPos(i, j), sceneNode.size);
        this.addDisplayRef({
          id,
          displayModel: this.getTerrainPalette(terrains[i][j]),
          pos,
          blockIndex: new BlockIndex().getBlockIndex(pos.x, pos.y, sceneNode.size)
        }, op_def.NodeType.TerrainNodeType);
      }
    }
  }
  addMossToDisplayRef(sceneNode) {
    const mossCollection = this._mossCollection.data;
    for (const moss of mossCollection) {
      const mossPalette = this.getMossPalette(moss.key);
      const { layer, frameModel } = mossPalette;
      this.addDisplayRef({
        id: moss.id,
        direction: moss.dir || 3,
        pos: new LogicPos(moss.x, moss.y, moss.z),
        displayModel: frameModel,
        layer,
        blockIndex: new BlockIndex().getBlockIndex(moss.x, moss.y, sceneNode.size)
      }, op_def.NodeType.ElementNodeType);
    }
  }
  clearDisplayRef() {
    this.mDisplayRefMap.forEach((map) => map.clear());
  }
}
