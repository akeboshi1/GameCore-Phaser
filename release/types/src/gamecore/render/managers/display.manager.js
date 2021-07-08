var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
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
(function (NodeType) {
    NodeType[NodeType["UnknownNodeType"] = 0] = "UnknownNodeType";
    NodeType[NodeType["GameNodeType"] = 1] = "GameNodeType";
    NodeType[NodeType["SceneNodeType"] = 2] = "SceneNodeType";
    NodeType[NodeType["ElementNodeType"] = 3] = "ElementNodeType";
    NodeType[NodeType["TerrainNodeType"] = 4] = "TerrainNodeType";
    NodeType[NodeType["CharacterNodeType"] = 5] = "CharacterNodeType";
    NodeType[NodeType["LocationType"] = 6] = "LocationType";
    NodeType[NodeType["MovableType"] = 7] = "MovableType";
    NodeType[NodeType["DisplayType"] = 8] = "DisplayType";
    NodeType[NodeType["AttributeType"] = 9] = "AttributeType";
    NodeType[NodeType["FunctionType"] = 10] = "FunctionType";
    NodeType[NodeType["AnimationsType"] = 11] = "AnimationsType";
    NodeType[NodeType["EventType"] = 12] = "EventType";
    NodeType[NodeType["MapSizeType"] = 13] = "MapSizeType";
    NodeType[NodeType["UIType"] = 14] = "UIType";
    NodeType[NodeType["TimerType"] = 15] = "TimerType";
    NodeType[NodeType["PackageType"] = 16] = "PackageType";
    NodeType[NodeType["PackageItemType"] = 17] = "PackageItemType";
    NodeType[NodeType["AvatarType"] = 18] = "AvatarType";
    NodeType[NodeType["SettingsType"] = 19] = "SettingsType";
    NodeType[NodeType["CampType"] = 20] = "CampType";
    NodeType[NodeType["MutexType"] = 21] = "MutexType";
    NodeType[NodeType["AnimationDataType"] = 22] = "AnimationDataType";
    NodeType[NodeType["ForkType"] = 23] = "ForkType";
    NodeType[NodeType["ButtonType"] = 24] = "ButtonType";
    NodeType[NodeType["TextType"] = 25] = "TextType";
    NodeType[NodeType["AccessType"] = 26] = "AccessType";
    NodeType[NodeType["SpawnPointType"] = 27] = "SpawnPointType";
    NodeType[NodeType["CommodityType"] = 28] = "CommodityType";
    NodeType[NodeType["ShopType"] = 29] = "ShopType";
    NodeType[NodeType["PaletteType"] = 30] = "PaletteType";
    NodeType[NodeType["TerrainCollectionType"] = 31] = "TerrainCollectionType";
    NodeType[NodeType["AssetsType"] = 32] = "AssetsType";
    NodeType[NodeType["MossType"] = 33] = "MossType";
    NodeType[NodeType["MossCollectionType"] = 34] = "MossCollectionType";
    NodeType[NodeType["SceneryType"] = 35] = "SceneryType";
    NodeType[NodeType["ModsType"] = 36] = "ModsType";
    NodeType[NodeType["InputTextType"] = 37] = "InputTextType";
})(NodeType || (NodeType = {}));
var DisplayManager = /** @class */ (function () {
    function DisplayManager(render) {
        this.render = render;
        this.loading = false;
        // ====实例id
        this.uuid = 0;
        this.sceneManager = render.sceneManager;
        this.displays = new Map();
        this.scenerys = new Map();
        this.mModelCache = new Map();
        this.preLoadList = [];
    }
    Object.defineProperty(DisplayManager.prototype, "user", {
        get: function () {
            return this.mUser;
        },
        enumerable: true,
        configurable: true
    });
    DisplayManager.prototype.update = function (time, delta) {
        if (this.preLoadList && this.preLoadList.length > 0 && !this.loading) {
            this.loading = true;
            this.loadProgress();
        }
        if (this.mGridLayer)
            this.mGridLayer.update(time, delta);
    };
    DisplayManager.prototype.resize = function (width, height) {
        this.scenerys.forEach(function (scenery) {
            scenery.resize(width, height);
        });
    };
    DisplayManager.prototype.updateModel = function (id, data) {
        var scene = this.sceneManager.getMainScene();
        if (!scene) {
            Logger.getInstance().fatal("scene does not exist");
            return;
        }
        var display = this.displays.get(id);
        if (display) {
            display.load(data);
            this.render.mainPeer.elementDisplaySyncReady(id);
        }
    };
    DisplayManager.prototype.addDragonbonesDisplay = function (id, data, layer, nodeType) {
        if (!data) {
            return;
        }
        var scene = this.sceneManager.getMainScene();
        if (!scene) {
            Logger.getInstance().fatal("scene does not exist");
            return;
        }
        var display;
        if (!this.displays.has(id)) {
            display = new DragonbonesDisplay(scene, this.render, id, this.uuid++, nodeType);
            this.displays.set(id, display);
            this.preLoadList.push(display);
        }
        else {
            display = this.displays.get(id);
        }
        display.load(data);
        var sprite = this.mModelCache.get(id);
        if (sprite) {
            display.titleMask = sprite.titleMask;
            if (sprite.nickname)
                display.showNickname(sprite.nickname);
            this.mModelCache.delete(id);
        }
        scene.layerManager.addToLayer(layer.toString(), display);
    };
    DisplayManager.prototype.addUserDragonbonesDisplay = function (data, isUser, layer) {
        if (isUser === void 0) { isUser = false; }
        if (!data) {
            return;
        }
        var scene = this.sceneManager.getMainScene();
        if (!scene) {
            Logger.getInstance().fatal("scene does not exist");
            return;
        }
        var display;
        if (!this.displays.has(data.id)) {
            display = new DragonbonesDisplay(scene, this.render, data.id, this.uuid++, NodeType.CharacterNodeType);
            this.displays.set(data.id, display);
        }
        else {
            display = this.displays.get(data.id);
        }
        // 主角龙骨无视其余资源优先加载
        display.load(data, undefined, false);
        // display.startLoad();
        if (isUser)
            this.mUser = display;
        var id = data.id;
        var sprite = this.mModelCache.get(id);
        if (sprite) {
            display.titleMask = sprite.titleMask;
            if (sprite.nickname)
                display.showNickname(sprite.nickname);
            this.mModelCache.delete(id);
        }
        scene.layerManager.addToLayer(layer.toString(), display);
        return display;
    };
    DisplayManager.prototype.addTerrainDisplay = function (id, data, layer) {
        if (!data) {
            return;
        }
        var scene = this.sceneManager.getMainScene();
        if (!scene) {
            Logger.getInstance().fatal("scene does not exist");
            return;
        }
        var display;
        if (!this.displays.has(id)) {
            display = new FramesDisplay(scene, this.render, id, NodeType.TerrainNodeType);
            this.displays.set(id, display);
        }
        else {
            display = this.displays.get(id);
        }
        display.load(data);
        var sprite = this.mModelCache.get(id);
        if (sprite) {
            display.titleMask = sprite.titleMask;
            if (sprite.nickname)
                display.showNickname(sprite.nickname);
            this.mModelCache.delete(id);
        }
        scene.layerManager.addToLayer(layer.toString(), display);
        return display;
    };
    DisplayManager.prototype.addFramesDisplay = function (id, data, layer, field) {
        if (!data) {
            Logger.getInstance().debug("no data addFramesDisplay ====>", id);
            return;
        }
        var scene = this.sceneManager.getMainScene();
        if (!scene) {
            Logger.getInstance().fatal("scene does not exist");
            return;
        }
        var display;
        if (!this.displays.has(id)) {
            display = new FramesDisplay(scene, this.render, id, NodeType.ElementNodeType);
            this.displays.set(id, display);
        }
        else {
            display = this.displays.get(id);
        }
        display.load(data, field);
        var sprite = this.mModelCache.get(id);
        if (sprite) {
            display.titleMask = sprite.titleMask;
            if (sprite.nickname)
                display.showNickname(sprite.nickname);
            this.mModelCache.delete(id);
        }
        scene.layerManager.addToLayer(layer.toString(), display);
        return display;
    };
    DisplayManager.prototype.addToLayer = function (layerName, display, index) {
        var scene = this.sceneManager.getMainScene();
        if (!scene) {
            Logger.getInstance().fatal("scene does not exist");
            return;
        }
        scene.layerManager.addToLayer(layerName, display, index);
    };
    DisplayManager.prototype.removeDisplay = function (displayID) {
        if (!this.displays.has(displayID)) {
            // Logger.getInstance().warn("BaseDisplay not found: ", displayID);
            return;
        }
        var display = this.displays.get(displayID);
        display.destroy();
        this.displays.delete(displayID);
    };
    DisplayManager.prototype.addFillEffect = function (x, y, status) {
    };
    DisplayManager.prototype.load = function (displayID, data, field) {
        if (!this.displays.has(displayID)) {
            Logger.getInstance().warn("BaseDisplay not found: ", displayID);
            return;
        }
        var display = this.displays.get(displayID);
        display.load(data, field);
    };
    DisplayManager.prototype.changeAlpha = function (displayID, val) {
        if (!this.displays.has(displayID)) {
            Logger.getInstance().warn("BaseDisplay not found: ", displayID);
            return;
        }
        var display = this.displays.get(displayID);
        display.changeAlpha(val);
    };
    DisplayManager.prototype.fadeIn = function (displayID) {
        if (!this.displays.has(displayID)) {
            Logger.getInstance().warn("BaseDisplay not found: ", displayID);
            return;
        }
        var display = this.displays.get(displayID);
        display.fadeIn();
    };
    DisplayManager.prototype.fadeOut = function (displayID) {
        if (!this.displays.has(displayID)) {
            Logger.getInstance().warn("BaseDisplay not found: ", displayID);
            return;
        }
        var display = this.displays.get(displayID);
        display.fadeOut();
    };
    DisplayManager.prototype.play = function (displayID, animation, field, times) {
        if (!this.displays.has(displayID)) {
            Logger.getInstance().warn("BaseDisplay not found: ", displayID);
            return;
        }
        var display = this.displays.get(displayID);
        display.play(animation);
    };
    DisplayManager.prototype.mount = function (displayID, targetID, targetIndex) {
        var display = this.displays.get(displayID);
        if (!display) {
            Logger.getInstance().warn("BaseDisplay not found: ", displayID);
            return;
        }
        var target = this.displays.get(targetID);
        if (!target) {
            Logger.getInstance().warn("BaseDisplay not found: ", targetID);
            return;
        }
        var camerasManager = this.render.camerasManager;
        var followed = camerasManager.targetFollow === target;
        if (followed) {
            camerasManager.stopFollow();
        }
        target.setRootMount(display);
        display.mount(target, targetIndex);
        if (followed) {
            var pos_1 = target.getPosition();
            var scaleRatio_1 = this.render.scaleRatio;
            camerasManager.pan(pos_1.x, pos_1.y, 500, "Sine.easeInOut", true, function (cam, progress) {
                pos_1 = target.getPosition();
                cam.panEffect.destination.x = pos_1.x * scaleRatio_1;
                cam.panEffect.destination.y = pos_1.y * scaleRatio_1;
            })
                .then(function () {
                camerasManager.startFollow(target);
            });
        }
    };
    DisplayManager.prototype.unmount = function (displayID, targetID, pos) {
        var display = this.displays.get(displayID);
        if (!display) {
            Logger.getInstance().warn("BaseDisplay not found: ", displayID);
            return;
        }
        var target = this.displays.get(targetID);
        if (!target) {
            Logger.getInstance().warn("BaseDisplay not found: ", targetID);
            return;
        }
        var camerasManager = this.render.camerasManager;
        if (!camerasManager)
            return;
        var followed = camerasManager.targetFollow === target;
        if (followed) {
            camerasManager.stopFollow();
        }
        target.setRootMount(null);
        display.unmount(target);
        if (pos)
            target.setPosition(pos.x, pos.y, pos.z);
        if (followed) {
            var targetPos_1 = target.getPosition();
            var scaleRatio_2 = this.render.scaleRatio;
            camerasManager.pan(targetPos_1.x, targetPos_1.y, 500, "Sine.easeInOut", true, function (cam, progress) {
                targetPos_1 = target.getPosition();
                cam.panEffect.destination.x = targetPos_1.x * scaleRatio_2;
                cam.panEffect.destination.y = targetPos_1.y * scaleRatio_2;
            }).then(function () {
                camerasManager.startFollow(target);
            });
        }
    };
    DisplayManager.prototype.addEffect = function (targetID, effectID, display) {
        var target = this.getDisplay(targetID);
        var effect = this.getDisplay(effectID);
        if (!effect)
            effect = this.addFramesDisplay(effectID, display, parseInt(LayerName.SURFACE, 10), DisplayField.Effect);
        if (!target || !effect) {
            return;
        }
        if (effect.created) {
            target.addEffect(effect);
        }
        else {
            effect.createdHandler = new Handler(this, function () {
                target.addEffect(effect);
                effect.createdHandler = undefined;
            });
        }
    };
    DisplayManager.prototype.removeEffect = function (targetID, displayID) {
        var display = this.displays.get(displayID);
        if (!display) {
            Logger.getInstance().warn("BaseDisplay not found: ", displayID);
            return;
        }
        var target = this.displays.get(targetID);
        if (target)
            target.removeEffect(display);
        display.destroy();
        this.displays.delete(displayID);
    };
    DisplayManager.prototype.showEffect = function (displayID) {
        if (!this.displays.has(displayID)) {
            Logger.getInstance().warn("BaseDisplay not found: ", displayID);
            return;
        }
        var display = this.displays.get(displayID);
        // display.showEffect();
    };
    DisplayManager.prototype.setModel = function (sprite) {
        var display = this.displays.get(sprite.id);
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
    };
    DisplayManager.prototype.startFireMove = function (id, pos) {
        var display = this.displays.get(id);
        if (display)
            display.startFireMove(pos);
    };
    DisplayManager.prototype.addSkybox = function (scenery) {
        var skybox = new BlockManager(scenery, this.render);
        this.scenerys.set(scenery.id, skybox);
    };
    DisplayManager.prototype.updateSkyboxState = function (state) {
        this.scenerys.forEach(function (scenery) {
            scenery.setState(state);
        });
    };
    DisplayManager.prototype.removeSkybox = function (id) {
        var scenery = this.scenerys.get(id);
        if (!scenery) {
            return;
        }
        scenery.destroy();
        this.scenerys.delete(id);
    };
    DisplayManager.prototype.getDisplay = function (id) {
        return this.displays.get(id);
    };
    DisplayManager.prototype.displayDoMove = function (id, moveData) {
        var display = this.getDisplay(id);
        if (display)
            display.doMove(moveData);
    };
    DisplayManager.prototype.showNickname = function (id, name) {
        var display = this.getDisplay(id);
        if (!display) {
            return Logger.getInstance().debug("can't show nickname " + name);
        }
        display.showNickname(name);
        // if (display) display.showNickname(name);
    };
    DisplayManager.prototype.showTopDisplay = function (id, state) {
        var display = this.getDisplay(id);
        if (!display) {
            return;
        }
        display.showTopDisplay(state);
    };
    DisplayManager.prototype.showMatterDebug = function (bodies) {
        if (!this.matterBodies) {
            this.matterBodies = new MatterBodies(this.render);
        }
        this.matterBodies.renderWireframes(bodies);
    };
    DisplayManager.prototype.hideMatterDebug = function () {
        if (this.matterBodies) {
            this.matterBodies.destroy();
            this.matterBodies = undefined;
        }
    };
    DisplayManager.prototype.drawServerPosition = function (x, y) {
        if (!this.serverPosition) {
            this.serverPosition = new ServerPosition(this.render);
        }
        this.serverPosition.draw(x, y);
    };
    DisplayManager.prototype.hideServerPosition = function () {
        if (!this.serverPosition)
            return;
        this.serverPosition.destroy();
        this.serverPosition = null;
    };
    DisplayManager.prototype.liftItem = function (id, display, animation) {
        var player = this.displays.get(id);
        if (!player) {
            return;
        }
        if (!display || !animation)
            return;
        player.destroyMount();
        var scene = this.sceneManager.getMainScene();
        if (!scene) {
            Logger.getInstance().fatal("scene does not exist");
            return;
        }
        var displayFrame = new FramesDisplay(scene, this.render);
        displayFrame.load(FramesModel.createFromDisplay(display, animation));
        player.mount(displayFrame, 0);
    };
    DisplayManager.prototype.clearMount = function (id) {
        var player = this.displays.get(id);
        if (player) {
            player.destroyMount();
        }
    };
    DisplayManager.prototype.throwElement = function (userId, targetId, display, animation) {
        var player = this.getDisplay(userId);
        if (!player) {
            return;
        }
        var target = this.getDisplay(targetId);
        if (!target) {
            return;
        }
        var scene = this.render.sceneManager.getMainScene();
        var displayFrame = new FramesDisplay(scene, this.render);
        displayFrame.load(FramesModel.createFromDisplay(display, animation));
        this.addToLayer(LayerName.SURFACE, displayFrame);
        var playerPos = player.getPosition();
        var targetPos = target.getPosition();
        // 30 大概手的位置
        displayFrame.setPosition(playerPos.x, playerPos.y - 30, playerPos.z);
        var distance = Tool.twoPointDistance(playerPos, targetPos) * 2;
        var tween = scene.tweens.add({
            targets: displayFrame,
            duration: distance,
            props: { x: targetPos.x, y: targetPos.y - 30 },
            onComplete: function () {
                tween.stop();
                displayFrame.destroy();
            }
        });
    };
    DisplayManager.prototype.snapshot = function () {
        return __awaiter(this, void 0, void 0, function () {
            var scene, layerManager, floor, terrain, surface, size, sceneryScenes, offsetX, rt, _i, sceneryScenes_1, layer;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        scene = this.sceneManager.getMainScene();
                        if (!scene)
                            return [2 /*return*/];
                        layerManager = scene.layerManager;
                        if (!layerManager)
                            return [2 /*return*/];
                        floor = layerManager.getLayer(LayerEnum.Floor.toString());
                        terrain = layerManager.getLayer(LayerEnum.Terrain.toString());
                        surface = layerManager.getLayer(LayerEnum.Surface.toString());
                        return [4 /*yield*/, this.render.getCurrentRoomSize()];
                    case 1:
                        size = _a.sent();
                        sceneryScenes = [floor, terrain, surface];
                        offsetX = size.rows * (size.tileWidth / 2);
                        this.scenerys.forEach(function (scenery) {
                            if (scenery.getLayer()) {
                                scenery.updateScale(1);
                                sceneryScenes.unshift(scenery.getLayer());
                            }
                        });
                        rt = scene.make.renderTexture({ x: 0, y: 0, width: size.sceneWidth, height: size.sceneHeight }, false);
                        for (_i = 0, sceneryScenes_1 = sceneryScenes; _i < sceneryScenes_1.length; _i++) {
                            layer = sceneryScenes_1[_i];
                            layer.setScale(1);
                        }
                        rt.draw(sceneryScenes, 0, 0);
                        rt.snapshot(function (img) {
                            Logger.getInstance().log(img);
                            rt.destroy();
                            for (var _i = 0, sceneryScenes_2 = sceneryScenes; _i < sceneryScenes_2.length; _i++) {
                                var layer = sceneryScenes_2[_i];
                                layer.setScale(_this.render.scaleRatio);
                            }
                            _this.scenerys.forEach(function (scenery) { return scenery.updateScale(_this.render.scaleRatio); });
                        });
                        return [2 /*return*/];
                }
            });
        });
    };
    DisplayManager.prototype.destroy = function () {
        this.loading = false;
        if (this.preLoadList) {
            this.preLoadList.length = 0;
            this.preLoadList = [];
        }
        if (this.displays) {
            this.displays.forEach(function (display) {
                if (display)
                    display.destroy();
            });
            this.displays.clear();
        }
        if (this.mModelCache) {
            this.mModelCache.clear();
        }
        if (this.scenerys) {
            this.scenerys.forEach(function (block) {
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
    };
    DisplayManager.prototype.showGrids = function (size, maps) {
        // if (this.mGridLayer) {
        //     this.mGridLayer.destroy();
        // }
        // const scene = this.sceneManager.getMainScene();
        // this.mGridLayer = scene.make.container(undefined, false);
        // const graphics = scene.make.graphics(undefined, false);
        // graphics.lineStyle(1, 0xffffff, 0.5);
        // graphics.beginPath();
        // for (let i = 0; i <= size.rows; i++) {
        //     this.drawLine(graphics, 0, i, size.cols, i, size);
        // }
        // for (let i = 0; i <= size.cols; i++) {
        //     this.drawLine(graphics, i, 0, i, size.rows, size);
        // }
        // graphics.closePath();
        // graphics.strokePath();
        // this.mGridLayer.add(graphics);
        // // this.mGridLayer.x += size.tileWidth / 2;
        // // this.mGridLayer.y += size.tileHeight / 2;
        // (<PlayScene>scene).layerManager.addToLayer(LayerName.MIDDLE, this.mGridLayer);
        this.mGridLayer = new TerrainGrid(this.render, size);
        this.mGridLayer.setMap(maps);
    };
    DisplayManager.prototype.hideGrids = function () {
        if (this.mGridLayer) {
            this.mGridLayer.destroy();
        }
    };
    DisplayManager.prototype.loadProgress = function () {
        var _this = this;
        var display = this.preLoadList.shift();
        if (!display) {
            this.loading = false;
            return;
        }
        display.startLoad()
            .then(function () {
            _this.loadProgress();
        })
            .catch(function () {
            _this.loadProgress();
        });
    };
    return DisplayManager;
}());
export { DisplayManager };
//# sourceMappingURL=display.manager.js.map