var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
import { DisplayField, LayerName, Handler, Logger, LogicPos } from "structure";
import { FramesDisplay } from "../display/frames/frames.display";
import { DragonbonesDisplay } from "../display/dragonbones/dragonbones.display";
import { MatterBodies } from "../display/debugs/matter";
import { ServerPosition } from "../display/debugs/server.pointer";
import { LayerEnum } from "game-capsule";
import { TerrainGrid } from "../display/terrain.grid";
import { BlockManager } from "baseRender";
import { FramesModel } from "baseGame";
import { Tool } from "utils";
export var NodeType;
(function(NodeType2) {
  NodeType2[NodeType2["UnknownNodeType"] = 0] = "UnknownNodeType";
  NodeType2[NodeType2["GameNodeType"] = 1] = "GameNodeType";
  NodeType2[NodeType2["SceneNodeType"] = 2] = "SceneNodeType";
  NodeType2[NodeType2["ElementNodeType"] = 3] = "ElementNodeType";
  NodeType2[NodeType2["TerrainNodeType"] = 4] = "TerrainNodeType";
  NodeType2[NodeType2["CharacterNodeType"] = 5] = "CharacterNodeType";
  NodeType2[NodeType2["LocationType"] = 6] = "LocationType";
  NodeType2[NodeType2["MovableType"] = 7] = "MovableType";
  NodeType2[NodeType2["DisplayType"] = 8] = "DisplayType";
  NodeType2[NodeType2["AttributeType"] = 9] = "AttributeType";
  NodeType2[NodeType2["FunctionType"] = 10] = "FunctionType";
  NodeType2[NodeType2["AnimationsType"] = 11] = "AnimationsType";
  NodeType2[NodeType2["EventType"] = 12] = "EventType";
  NodeType2[NodeType2["MapSizeType"] = 13] = "MapSizeType";
  NodeType2[NodeType2["UIType"] = 14] = "UIType";
  NodeType2[NodeType2["TimerType"] = 15] = "TimerType";
  NodeType2[NodeType2["PackageType"] = 16] = "PackageType";
  NodeType2[NodeType2["PackageItemType"] = 17] = "PackageItemType";
  NodeType2[NodeType2["AvatarType"] = 18] = "AvatarType";
  NodeType2[NodeType2["SettingsType"] = 19] = "SettingsType";
  NodeType2[NodeType2["CampType"] = 20] = "CampType";
  NodeType2[NodeType2["MutexType"] = 21] = "MutexType";
  NodeType2[NodeType2["AnimationDataType"] = 22] = "AnimationDataType";
  NodeType2[NodeType2["ForkType"] = 23] = "ForkType";
  NodeType2[NodeType2["ButtonType"] = 24] = "ButtonType";
  NodeType2[NodeType2["TextType"] = 25] = "TextType";
  NodeType2[NodeType2["AccessType"] = 26] = "AccessType";
  NodeType2[NodeType2["SpawnPointType"] = 27] = "SpawnPointType";
  NodeType2[NodeType2["CommodityType"] = 28] = "CommodityType";
  NodeType2[NodeType2["ShopType"] = 29] = "ShopType";
  NodeType2[NodeType2["PaletteType"] = 30] = "PaletteType";
  NodeType2[NodeType2["TerrainCollectionType"] = 31] = "TerrainCollectionType";
  NodeType2[NodeType2["AssetsType"] = 32] = "AssetsType";
  NodeType2[NodeType2["MossType"] = 33] = "MossType";
  NodeType2[NodeType2["MossCollectionType"] = 34] = "MossCollectionType";
  NodeType2[NodeType2["SceneryType"] = 35] = "SceneryType";
  NodeType2[NodeType2["ModsType"] = 36] = "ModsType";
  NodeType2[NodeType2["InputTextType"] = 37] = "InputTextType";
})(NodeType || (NodeType = {}));
export class DisplayManager {
  constructor(render) {
    this.render = render;
    __publicField(this, "sceneManager");
    __publicField(this, "displays");
    __publicField(this, "scenerys");
    __publicField(this, "mUser");
    __publicField(this, "matterBodies");
    __publicField(this, "serverPosition");
    __publicField(this, "preLoadList");
    __publicField(this, "loading", false);
    __publicField(this, "mModelCache");
    __publicField(this, "mGridLayer");
    __publicField(this, "uuid", 0);
    this.sceneManager = render.sceneManager;
    this.displays = new Map();
    this.scenerys = new Map();
    this.mModelCache = new Map();
    this.preLoadList = [];
  }
  get user() {
    return this.mUser;
  }
  update(time, delta) {
    if (this.preLoadList && this.preLoadList.length > 0 && !this.loading) {
      this.loading = true;
      this.loadProgress();
    }
    if (this.mGridLayer)
      this.mGridLayer.update(time, delta);
  }
  resize(width, height) {
    this.scenerys.forEach((scenery) => {
      scenery.resize(width, height);
    });
  }
  updateModel(id, data) {
    const scene = this.sceneManager.getMainScene();
    if (!scene) {
      Logger.getInstance().fatal(`scene does not exist`);
      return;
    }
    const display = this.displays.get(id);
    if (display) {
      display.load(data);
      this.render.mainPeer.elementDisplaySyncReady(id);
    }
  }
  addDragonbonesDisplay(id, data, layer, nodeType) {
    if (!data) {
      return;
    }
    const scene = this.sceneManager.getMainScene();
    if (!scene) {
      Logger.getInstance().fatal(`scene does not exist`);
      return;
    }
    let display;
    if (!this.displays.has(id)) {
      display = new DragonbonesDisplay(scene, this.render, id, this.uuid++, nodeType);
      this.displays.set(id, display);
      this.preLoadList.push(display);
    } else {
      display = this.displays.get(id);
    }
    display.load(data);
    const sprite = this.mModelCache.get(id);
    if (sprite) {
      display.titleMask = sprite.titleMask;
      if (sprite.nickname)
        display.showNickname(sprite.nickname);
      this.mModelCache.delete(id);
    }
    scene.layerManager.addToLayer(layer.toString(), display);
  }
  addUserDragonbonesDisplay(data, isUser = false, layer) {
    if (!data) {
      return;
    }
    const scene = this.sceneManager.getMainScene();
    if (!scene) {
      Logger.getInstance().fatal(`scene does not exist`);
      return;
    }
    let display;
    if (!this.displays.has(data.id)) {
      display = new DragonbonesDisplay(scene, this.render, data.id, this.uuid++, 5);
      this.displays.set(data.id, display);
    } else {
      display = this.displays.get(data.id);
    }
    display.load(data, void 0, false);
    if (isUser)
      this.mUser = display;
    const id = data.id;
    const sprite = this.mModelCache.get(id);
    if (sprite) {
      display.titleMask = sprite.titleMask;
      if (sprite.nickname)
        display.showNickname(sprite.nickname);
      this.mModelCache.delete(id);
    }
    scene.layerManager.addToLayer(layer.toString(), display);
    return display;
  }
  addTerrainDisplay(id, data, layer) {
    if (!data) {
      return;
    }
    const scene = this.sceneManager.getMainScene();
    if (!scene) {
      Logger.getInstance().fatal(`scene does not exist`);
      return;
    }
    let display;
    if (!this.displays.has(id)) {
      display = new FramesDisplay(scene, this.render, id, 4);
      this.displays.set(id, display);
    } else {
      display = this.displays.get(id);
    }
    display.load(data);
    const sprite = this.mModelCache.get(id);
    if (sprite) {
      display.titleMask = sprite.titleMask;
      if (sprite.nickname)
        display.showNickname(sprite.nickname);
      this.mModelCache.delete(id);
    }
    scene.layerManager.addToLayer(layer.toString(), display);
    return display;
  }
  addFramesDisplay(id, data, layer, field) {
    if (!data) {
      Logger.getInstance().debug("no data addFramesDisplay ====>", id);
      return;
    }
    const scene = this.sceneManager.getMainScene();
    if (!scene) {
      Logger.getInstance().fatal(`scene does not exist`);
      return;
    }
    let display;
    if (!this.displays.has(id)) {
      display = new FramesDisplay(scene, this.render, id, 3);
      this.displays.set(id, display);
    } else {
      display = this.displays.get(id);
    }
    display.load(data, field);
    const sprite = this.mModelCache.get(id);
    if (sprite) {
      display.titleMask = sprite.titleMask;
      if (sprite.nickname)
        display.showNickname(sprite.nickname);
      this.mModelCache.delete(id);
    }
    scene.layerManager.addToLayer(layer.toString(), display);
    return display;
  }
  addToLayer(layerName, display, index) {
    const scene = this.sceneManager.getMainScene();
    if (!scene) {
      Logger.getInstance().fatal(`scene does not exist`);
      return;
    }
    scene.layerManager.addToLayer(layerName, display, index);
  }
  removeDisplay(displayID) {
    if (!this.displays.has(displayID)) {
      return;
    }
    const display = this.displays.get(displayID);
    display.destroy();
    this.displays.delete(displayID);
  }
  addFillEffect(x, y, status) {
  }
  load(displayID, data, field) {
    if (!this.displays.has(displayID)) {
      Logger.getInstance().warn("BaseDisplay not found: ", displayID);
      return;
    }
    const display = this.displays.get(displayID);
    display.load(data, field);
  }
  changeAlpha(displayID, val) {
    if (!this.displays.has(displayID)) {
      Logger.getInstance().warn("BaseDisplay not found: ", displayID);
      return;
    }
    const display = this.displays.get(displayID);
    display.changeAlpha(val);
  }
  fadeIn(displayID) {
    if (!this.displays.has(displayID)) {
      Logger.getInstance().warn("BaseDisplay not found: ", displayID);
      return;
    }
    const display = this.displays.get(displayID);
    display.fadeIn();
  }
  fadeOut(displayID) {
    if (!this.displays.has(displayID)) {
      Logger.getInstance().warn("BaseDisplay not found: ", displayID);
      return;
    }
    const display = this.displays.get(displayID);
    display.fadeOut();
  }
  play(displayID, animation, field, times) {
    if (!this.displays.has(displayID)) {
      Logger.getInstance().warn("BaseDisplay not found: ", displayID);
      return;
    }
    const display = this.displays.get(displayID);
    display.play(animation);
  }
  mount(displayID, targetID, targetIndex) {
    const display = this.displays.get(displayID);
    if (!display) {
      Logger.getInstance().warn("BaseDisplay not found: ", displayID);
      return;
    }
    const target = this.displays.get(targetID);
    if (!target) {
      Logger.getInstance().warn("BaseDisplay not found: ", targetID);
      return;
    }
    const camerasManager = this.render.camerasManager;
    const followed = camerasManager.targetFollow === target;
    if (followed) {
      camerasManager.stopFollow();
    }
    target.setRootMount(display);
    display.mount(target, targetIndex);
    if (followed) {
      let pos = target.getPosition();
      const scaleRatio = this.render.scaleRatio;
      camerasManager.pan(pos.x, pos.y, 500, "Sine.easeInOut", true, (cam, progress) => {
        pos = target.getPosition();
        cam.panEffect.destination.x = pos.x * scaleRatio;
        cam.panEffect.destination.y = pos.y * scaleRatio;
      }).then(() => {
        camerasManager.startFollow(target);
      });
    }
  }
  unmount(displayID, targetID, pos) {
    const display = this.displays.get(displayID);
    if (!display) {
      Logger.getInstance().warn("BaseDisplay not found: ", displayID);
      return;
    }
    const target = this.displays.get(targetID);
    if (!target) {
      Logger.getInstance().warn("BaseDisplay not found: ", targetID);
      return;
    }
    const camerasManager = this.render.camerasManager;
    if (!camerasManager)
      return;
    const followed = camerasManager.targetFollow === target;
    if (followed) {
      camerasManager.stopFollow();
    }
    target.setRootMount(null);
    display.unmount(target);
    if (pos)
      target.setPosition(pos.x, pos.y, pos.z);
    if (followed) {
      let targetPos = target.getPosition();
      const scaleRatio = this.render.scaleRatio;
      camerasManager.pan(targetPos.x, targetPos.y, 500, "Sine.easeInOut", true, (cam, progress) => {
        targetPos = target.getPosition();
        cam.panEffect.destination.x = targetPos.x * scaleRatio;
        cam.panEffect.destination.y = targetPos.y * scaleRatio;
      }).then(() => {
        camerasManager.startFollow(target);
      });
    }
  }
  addEffect(targetID, effectID, display) {
    const target = this.getDisplay(targetID);
    let effect = this.getDisplay(effectID);
    if (!effect)
      effect = this.addFramesDisplay(effectID, display, parseInt(LayerName.SURFACE, 10), DisplayField.Effect);
    if (!target || !effect) {
      return;
    }
    if (effect.created) {
      target.addEffect(effect);
    } else {
      effect.createdHandler = new Handler(this, () => {
        target.addEffect(effect);
        effect.createdHandler = void 0;
      });
    }
  }
  removeEffect(targetID, displayID) {
    const display = this.displays.get(displayID);
    if (!display) {
      Logger.getInstance().warn("BaseDisplay not found: ", displayID);
      return;
    }
    const target = this.displays.get(targetID);
    if (target)
      target.removeEffect(display);
    display.destroy();
    this.displays.delete(displayID);
  }
  showEffect(displayID) {
    if (!this.displays.has(displayID)) {
      Logger.getInstance().warn("BaseDisplay not found: ", displayID);
      return;
    }
    const display = this.displays.get(displayID);
  }
  setModel(sprite) {
    const display = this.displays.get(sprite.id);
    if (!display) {
      this.mModelCache.set(sprite.id, sprite);
      return;
    }
    if (!sprite.pos)
      sprite.pos = new LogicPos(0, 0, 0);
    display.titleMask = sprite.titleMask;
    display.setPosition(sprite.pos.x, sprite.pos.y, sprite.pos.z);
    display.checkCollision(sprite);
    display.changeAlpha(sprite.alpha);
    display.hasInteractive = sprite.hasInteractive;
    if (sprite.nickname)
      display.showNickname(sprite.nickname);
  }
  startFireMove(id, pos) {
    const display = this.displays.get(id);
    if (display)
      display.startFireMove(pos);
  }
  addSkybox(scenery) {
    const skybox = new BlockManager(scenery, this.render);
    this.scenerys.set(scenery.id, skybox);
  }
  updateSkyboxState(state) {
    this.scenerys.forEach((scenery) => {
      scenery.setState(state);
    });
  }
  removeSkybox(id) {
    const scenery = this.scenerys.get(id);
    if (!scenery) {
      return;
    }
    scenery.destroy();
    this.scenerys.delete(id);
  }
  getDisplay(id) {
    return this.displays.get(id);
  }
  displayDoMove(id, moveData) {
    const display = this.getDisplay(id);
    if (display)
      display.doMove(moveData);
  }
  showNickname(id, name) {
    const display = this.getDisplay(id);
    if (!display) {
      return Logger.getInstance().debug(`can't show nickname ${name}`);
    }
    display.showNickname(name);
  }
  showTopDisplay(id, state) {
    const display = this.getDisplay(id);
    if (!display) {
      return;
    }
    display.showTopDisplay(state);
  }
  showMatterDebug(bodies) {
    if (!this.matterBodies) {
      this.matterBodies = new MatterBodies(this.render);
    }
    this.matterBodies.renderWireframes(bodies);
  }
  hideMatterDebug() {
    if (this.matterBodies) {
      this.matterBodies.destroy();
      this.matterBodies = void 0;
    }
  }
  drawServerPosition(x, y) {
    if (!this.serverPosition) {
      this.serverPosition = new ServerPosition(this.render);
    }
    this.serverPosition.draw(x, y);
  }
  hideServerPosition() {
    if (!this.serverPosition)
      return;
    this.serverPosition.destroy();
    this.serverPosition = null;
  }
  liftItem(id, display, animation) {
    const player = this.displays.get(id);
    if (!player) {
      return;
    }
    if (!display || !animation)
      return;
    player.destroyMount();
    const scene = this.sceneManager.getMainScene();
    if (!scene) {
      Logger.getInstance().fatal(`scene does not exist`);
      return;
    }
    const displayFrame = new FramesDisplay(scene, this.render);
    displayFrame.load(FramesModel.createFromDisplay(display, animation));
    player.mount(displayFrame, 0);
  }
  clearMount(id) {
    const player = this.displays.get(id);
    if (player) {
      player.destroyMount();
    }
  }
  throwElement(userId, targetId, display, animation) {
    const player = this.getDisplay(userId);
    if (!player) {
      return;
    }
    const target = this.getDisplay(targetId);
    if (!target) {
      return;
    }
    const scene = this.render.sceneManager.getMainScene();
    const displayFrame = new FramesDisplay(scene, this.render);
    displayFrame.load(FramesModel.createFromDisplay(display, animation));
    this.addToLayer(LayerName.SURFACE, displayFrame);
    const playerPos = player.getPosition();
    const targetPos = target.getPosition();
    displayFrame.setPosition(playerPos.x, playerPos.y - 30, playerPos.z);
    const distance = Tool.twoPointDistance(playerPos, targetPos) * 2;
    const tween = scene.tweens.add({
      targets: displayFrame,
      duration: distance,
      props: { x: targetPos.x, y: targetPos.y - 30 },
      onComplete: () => {
        tween.stop();
        displayFrame.destroy();
      }
    });
  }
  snapshot() {
    return __async(this, null, function* () {
      const scene = this.sceneManager.getMainScene();
      if (!scene)
        return;
      const layerManager = scene.layerManager;
      if (!layerManager)
        return;
      const floor = layerManager.getLayer(LayerEnum.Floor.toString());
      const terrain = layerManager.getLayer(LayerEnum.Terrain.toString());
      const surface = layerManager.getLayer(LayerEnum.Surface.toString());
      const size = yield this.render.getCurrentRoomSize();
      const sceneryScenes = [floor, terrain, surface];
      const offsetX = size.rows * (size.tileWidth / 2);
      this.scenerys.forEach((scenery) => {
        if (scenery.getLayer()) {
          scenery.updateScale(1);
          sceneryScenes.unshift(scenery.getLayer());
        }
      });
      const rt = scene.make.renderTexture({ x: 0, y: 0, width: size.sceneWidth, height: size.sceneHeight }, false);
      for (const layer of sceneryScenes) {
        layer.setScale(1);
      }
      rt.draw(sceneryScenes, 0, 0);
      rt.snapshot((img) => {
        Logger.getInstance().log(img);
        rt.destroy();
        for (const layer of sceneryScenes) {
          layer.setScale(this.render.scaleRatio);
        }
        this.scenerys.forEach((scenery) => scenery.updateScale(this.render.scaleRatio));
      });
    });
  }
  destroy() {
    this.loading = false;
    if (this.preLoadList) {
      this.preLoadList.length = 0;
      this.preLoadList = [];
    }
    if (this.displays) {
      this.displays.forEach((display) => {
        if (display)
          display.destroy();
      });
      this.displays.clear();
    }
    if (this.mModelCache) {
      this.mModelCache.clear();
    }
    if (this.scenerys) {
      this.scenerys.forEach((block) => {
        if (block)
          block.destroy();
      });
      this.scenerys.clear();
    }
    if (this.matterBodies) {
      this.matterBodies.destroy();
      this.matterBodies = null;
    }
    if (this.serverPosition) {
      this.serverPosition.destroy();
      this.serverPosition = null;
    }
  }
  showGrids(size, maps) {
    this.mGridLayer = new TerrainGrid(this.render, size);
    this.mGridLayer.setMap(maps);
  }
  hideGrids() {
    if (this.mGridLayer) {
      this.mGridLayer.destroy();
    }
  }
  loadProgress() {
    const display = this.preLoadList.shift();
    if (!display) {
      this.loading = false;
      return;
    }
    display.startLoad().then(() => {
      this.loadProgress();
    }).catch(() => {
      this.loadProgress();
    });
  }
}
