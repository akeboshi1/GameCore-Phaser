import { EventNode } from "game-capsule";
import { op_def } from "pixelpai_proto";
import { BlockIndex } from "utils";
import { AnimationModel, Logger, LogicPos, Position45 } from "structure";
import { DragonbonesModel, FramesModel } from "../sprite";
var ElementStorage = /** @class */ (function () {
    // private event: Phaser.Events.EventEmitter;
    function ElementStorage(config) {
        this.config = config;
        this.mModels = new Map();
        this.mElementRef = new Map();
        this.mTerrainRef = new Map();
        this.terrainPalette = new Map();
        this.terrainPaletteWithBindId = new Map();
        this.terrainPaletteWithSN = new Map();
        this.mossPalette = new Map();
        // this.event = new Phaser.Events.EventEmitter();
        this.mDisplayRefMap = new Map();
        this.mDisplayRefMap.set(op_def.NodeType.ElementNodeType, new Map());
        this.mDisplayRefMap.set(op_def.NodeType.TerrainNodeType, new Map());
    }
    // public on(event: string | symbol, fn: Function, context?: any) {
    //     this.event.on(event, fn, context);
    // }
    // public off(event: string | symbol, fn: Function, context?: any) {
    //     this.event.off(event, fn, context);
    // }
    ElementStorage.prototype.setGameConfig = function (config) {
        Logger.getInstance().debug("TCL: ElementStorage -> config", config);
        if (!config) {
            return;
        }
        var objs = config.objectsList;
        var displayModel = null;
        for (var _i = 0, objs_1 = objs; _i < objs_1.length; _i++) {
            var obj = objs_1[_i];
            if (obj.type === op_def.NodeType.ElementNodeType) {
                displayModel = this.mModels.get(obj.id);
                if (!displayModel) {
                    var anis = [];
                    var eleAnis = obj.animations;
                    if (!eleAnis)
                        continue;
                    var objAnis = eleAnis.animationData;
                    for (var _a = 0, objAnis_1 = objAnis; _a < objAnis_1.length; _a++) {
                        var ani = objAnis_1[_a];
                        anis.push(new AnimationModel(ani.createProtocolObject()));
                    }
                    displayModel = new FramesModel({
                        id: obj.id,
                        sn: obj.sn,
                        animations: {
                            defaultAnimationName: eleAnis.defaultAnimationName,
                            display: eleAnis.display,
                            animationData: anis,
                        },
                    });
                    // this.mModels.set(obj.id, displayModel);
                }
                // const ele: IDisplayRef = {
                //     id: obj.id,
                //     displayModel,
                // };
                // this.mElementRef.set(obj.id, ele);
            }
        }
        this.updatePalette(config.root.palette);
        this.updateMoss(config.root.moss);
        this.updateAssets(config.root.assets);
    };
    ElementStorage.prototype.updatePalette = function (palette) {
        for (var _i = 0, _a = Array.from(palette.peersDict.keys()); _i < _a.length; _i++) {
            var key = _a[_i];
            var terrainPalette = palette.peersDict.get(key);
            var terrainModel = this.terrainPalette.get(terrainPalette.id);
            if (!terrainPalette.animations)
                continue;
            if (!terrainModel) {
                var frameModel = new FramesModel({
                    id: terrainPalette.id,
                    sn: terrainPalette.sn,
                    animations: {
                        defaultAnimationName: terrainPalette.animations.defaultAnimationName,
                        display: terrainPalette.animations.display,
                        animationData: terrainPalette.animations.animationData.map(function (ani) { return new AnimationModel(ani.createProtocolObject()); }),
                    },
                });
                this.terrainPalette.set(key, frameModel);
                this.terrainPaletteWithBindId.set(terrainPalette.id, frameModel);
                this.terrainPaletteWithSN.set(terrainPalette.sn, frameModel);
            }
        }
    };
    ElementStorage.prototype.updateMoss = function (moss) {
        for (var _i = 0, _a = Array.from(moss.peersDict.keys()); _i < _a.length; _i++) {
            var peerKey = _a[_i];
            var elementMoss = moss.peersDict.get(peerKey);
            var elementModel = this.mossPalette.get(elementMoss.id);
            if (!elementMoss.animations)
                continue;
            if (!elementModel) {
                var frameModel = new FramesModel({
                    id: elementMoss.id,
                    sn: elementMoss.sn,
                    animations: {
                        defaultAnimationName: elementMoss.animations.defaultAnimationName,
                        display: elementMoss.animations.display,
                        animationData: elementMoss.animations.animationData.map(function (ani) { return new AnimationModel(ani.createProtocolObject()); }),
                    },
                });
                this.mossPalette.set(peerKey, { layer: elementMoss.layer, frameModel: frameModel });
            }
        }
    };
    ElementStorage.prototype.updateAssets = function (assetsNode) {
        var assets = assetsNode.getAssetList();
        this._assets = [];
        for (var _i = 0, assets_1 = assets; _i < assets_1.length; _i++) {
            var asset = assets_1[_i];
            var media = asset.media;
            if (media) {
                var fileType = media.match(/\.([a-zA-Z0-9]+)($|\?)/);
                if (fileType && fileType[1]) {
                    this._assets.push({
                        type: fileType[1],
                        key: asset.key,
                        source: this.config.osdPath + media,
                    });
                }
            }
        }
    };
    ElementStorage.prototype.setSceneConfig = function (config) {
        this.clearDisplayRef();
        var objs = config.objectsList;
        var sceneNode = config.root.children.find(function (node) { return node.type === op_def.NodeType.SceneNodeType; });
        Logger.getInstance().log("sceneNode: ", sceneNode.size);
        if (!sceneNode) {
            return Logger.getInstance().error("Failed to parse scene, SceneNode does not exist");
        }
        // Logger.getInstance().log("children: ", children);
        var displayModel = null;
        var _loop_1 = function (obj) {
            if (obj.type === op_def.NodeType.ElementNodeType) {
                displayModel = this_1.mModels.get(obj.id);
                var eventName_1 = [];
                obj.children.forEach(function (item) {
                    // if (item.className === "EventNode" && item.eventName === op_def.GameEvent.onElementHit) {
                    //     eventName.push(item.eventName);
                    // }
                    if (item instanceof EventNode && item.eventName === op_def.GameEvent.onElementHit) {
                        eventName_1.push(item.eventName);
                    }
                });
                var ele = obj;
                if (!displayModel) {
                    var anis = [];
                    var eleAnis = obj.animations;
                    if (ele.avatar) {
                        displayModel = new DragonbonesModel({ id: ele.id, avatar: ele.avatar.createProtocolObject() });
                    }
                    else {
                        var objAnis = eleAnis.animationData;
                        if (objAnis.length < 1) {
                            Logger.getInstance().error(obj.name + ":" + obj.id + " animation error");
                            return "continue";
                        }
                        for (var _i = 0, objAnis_2 = objAnis; _i < objAnis_2.length; _i++) {
                            var ani = objAnis_2[_i];
                            anis.push(new AnimationModel(ani.createProtocolObject()));
                        }
                        displayModel = new FramesModel({
                            id: obj.id,
                            sn: obj.sn,
                            eventName: eventName_1,
                            animations: {
                                defaultAnimationName: eleAnis.defaultAnimationName,
                                display: eleAnis.display,
                                animationData: anis,
                            },
                        });
                    }
                    this_1.mModels.set(obj.id, displayModel);
                }
                var pos = ele.location;
                if (!pos) {
                    Logger.getInstance().error(ele.name + "-" + ele.id + " location does not exist");
                    return "continue";
                }
                var mountSprites = null;
                if (ele.mountSprites && ele.mountSprites.ids.length > 0) {
                    mountSprites = ele.mountSprites.ids;
                }
                var eleRef = {
                    id: obj.id,
                    pos: pos,
                    blockIndex: new BlockIndex().getBlockIndex(pos.x, pos.y, sceneNode.size),
                    direction: ele.animations.dir,
                    name: obj.name,
                    displayModel: displayModel,
                    layer: ele.layer,
                    mountSprites: mountSprites
                };
                this_1.addDisplayRef(eleRef, op_def.NodeType.ElementNodeType);
            }
        };
        var this_1 = this;
        // TODO Lite deserialize可能会有个别Display link失败
        for (var _i = 0, objs_2 = objs; _i < objs_2.length; _i++) {
            var obj = objs_2[_i];
            _loop_1(obj);
        }
        // const sceneNode = config.root.children.find((node) => node.type === op_def.NodeType.SceneNodeType) as SceneNode;
        this._terrainCollection = sceneNode.terrainCollection;
        this._mossCollection = sceneNode.mossCollection;
        this._wallCollection = sceneNode.wallCollection;
        this._scenerys = sceneNode.getScenerys();
        // const scenerys = sceneNode.getScenerys();
        // this._scenerys = [];
        // for (const scenery of scenerys) {
        //     this._scenerys.push(scenery);
        // }
        this.addTerrainToDisplayRef(sceneNode);
        this.addMossToDisplayRef(sceneNode);
    };
    ElementStorage.prototype.add = function (obj) {
        if (!obj)
            return;
        this.mModels.set(obj.id, obj);
    };
    ElementStorage.prototype.getElementRef = function (id) {
        var map = this.mDisplayRefMap.get(op_def.NodeType.ElementNodeType);
        if (!map)
            return;
        return map.get(id);
    };
    ElementStorage.prototype.getDisplayModel = function (id) {
        return this.mModels.get(id);
    };
    ElementStorage.prototype.getTerrainCollection = function () {
        return this._terrainCollection;
    };
    ElementStorage.prototype.getTerrainPalette = function (key) {
        if (this.terrainPalette.get(key)) {
            return this.terrainPalette.get(key);
        }
    };
    ElementStorage.prototype.getTerrainPaletteByBindId = function (id) {
        if (this.terrainPaletteWithBindId.get(id)) {
            return this.terrainPaletteWithBindId.get(id);
        }
    };
    ElementStorage.prototype.getTerrainPaletteBySN = function (sn) {
        if (this.terrainPaletteWithSN.get(sn)) {
            return this.terrainPaletteWithSN.get(sn);
        }
    };
    ElementStorage.prototype.getMossCollection = function () {
        return this._mossCollection;
    };
    ElementStorage.prototype.getMossPalette = function (id) {
        if (this.mossPalette.get(id)) {
            return this.mossPalette.get(id);
        }
    };
    ElementStorage.prototype.getScenerys = function () {
        return this._scenerys;
    };
    ElementStorage.prototype.getAssets = function () {
        return this._assets;
    };
    ElementStorage.prototype.getWallCollection = function () {
        return this._wallCollection;
    };
    ElementStorage.prototype.getElementFromBlockIndex = function (indexs, nodeType) {
        var result = [];
        var map = this.mDisplayRefMap.get(nodeType);
        if (!map)
            return;
        map.forEach(function (ele) {
            if (indexs.includes(ele.blockIndex))
                result.push(ele);
        });
        return result;
    };
    ElementStorage.prototype.destroy = function () {
        this.clearDisplayRef();
        this.terrainPalette.clear();
        this.terrainPaletteWithBindId.clear();
        this.terrainPaletteWithSN.clear();
        this.mossPalette.clear();
        this.mModels.forEach(function (model, index) {
            model.destroy();
        });
        this.mModels.clear();
        this._assets = undefined;
    };
    ElementStorage.prototype.addDisplayRef = function (displayRef, nodeType) {
        var map = this.mDisplayRefMap.get(nodeType);
        if (!map)
            return;
        map.set(displayRef.id, displayRef);
    };
    ElementStorage.prototype.addTerrainToDisplayRef = function (sceneNode) {
        var terrains = this._terrainCollection.data;
        var cols = terrains.length;
        var rows = terrains[0].length;
        for (var i = 0; i < cols; i++) {
            for (var j = 0; j < rows; j++) {
                if (terrains[i][j] === 0)
                    continue;
                var id = i << 16 | j;
                if (!sceneNode || !sceneNode.size) {
                    Logger.getInstance().error(sceneNode.name + "-" + sceneNode.id + " sceneNode.size does not exist");
                    continue;
                }
                var pos = Position45.transformTo90(new LogicPos(i, j), sceneNode.size);
                this.addDisplayRef({
                    id: id,
                    displayModel: this.getTerrainPalette(terrains[i][j]),
                    pos: pos,
                    blockIndex: new BlockIndex().getBlockIndex(pos.x, pos.y, sceneNode.size)
                }, op_def.NodeType.TerrainNodeType);
            }
        }
    };
    ElementStorage.prototype.addMossToDisplayRef = function (sceneNode) {
        var mossCollection = this._mossCollection.data;
        for (var _i = 0, mossCollection_1 = mossCollection; _i < mossCollection_1.length; _i++) {
            var moss = mossCollection_1[_i];
            var mossPalette = this.getMossPalette(moss.key);
            var layer = mossPalette.layer, frameModel = mossPalette.frameModel;
            this.addDisplayRef({
                id: moss.id,
                direction: moss.dir || 3,
                pos: new LogicPos(moss.x, moss.y, moss.z),
                displayModel: frameModel,
                layer: layer,
                blockIndex: new BlockIndex().getBlockIndex(moss.x, moss.y, sceneNode.size)
            }, op_def.NodeType.ElementNodeType);
        }
    };
    ElementStorage.prototype.clearDisplayRef = function () {
        this.mDisplayRefMap.forEach(function (map) { return map.clear(); });
    };
    return ElementStorage;
}());
export { ElementStorage };
//# sourceMappingURL=element.storage.js.map