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
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import { Capsule, LayerEnum } from "game-capsule";
import { op_def } from "pixelpai_proto";
import { Direction, Logger, LogicPos, Position45 } from "structure";
import { EditorCanvas } from "../editor.canvas";
import { EditorFramesDisplay } from "./editor.frames.display";
import { EditorFactory } from "./factory";
import { transitionGrid } from "./check.bound";
import { EditorPacket } from "./connection/editor.packet";
import { DisplayObjectPool } from "./display.object.pool";
import { EditorTerrainManager } from "./manager/terrain.manager";
import { EditorMossManager } from "./manager/moss.manager";
import { EditorElementManager } from "./manager/element.manager";
import { EditorCamerasManager } from "./manager/cameras.manager";
import { EditorSkyboxManager } from "./manager/skybox.manager";
import { BaseLayer, GroundLayer, LayerManager, SurfaceLayer } from "baseRender";
import { ElementStorage, Sprite } from "baseGame";
import * as protos from "pixelpai_proto";
import { PBpacket } from "net-socket-packet";
import { EditorSceneManger } from "./manager/scene.manager";
import { EditorWallManager } from "./manager/wall.manager";
import { EditorDragonbonesDisplay } from "./editor.dragonbones.display";
import { load } from "utils";
for (var key in protos) {
    PBpacket.addProtocol(protos[key]);
}
var SceneEditorCanvas = /** @class */ (function (_super) {
    __extends_1(SceneEditorCanvas, _super);
    function SceneEditorCanvas(config) {
        var _this = _super.call(this, config) || this;
        _this.mAlignGrid = true;
        _this.mBrush = BrushEnum.Select;
        _this.mElements = new Map();
        _this.mConfig = config;
        _this.mConfig.osd = config.osd || "https://osd-alpha.tooqing.com/";
        _this.mFactory = new EditorFactory(_this);
        _this.mSelecedElement = new SelectedElementManager(_this);
        _this.mStamp = new MouseFollow(_this);
        _this.mConnection = config.connection;
        _this.mEditorPacket = new EditorPacket(_this, _this.mConnection);
        _this.displayObjectPool = new DisplayObjectPool(_this);
        _this.mTerrainManager = new EditorTerrainManager(_this);
        _this.mMossManager = new EditorMossManager(_this);
        _this.mElementManager = new EditorElementManager(_this);
        _this.mWallManager = new EditorWallManager(_this);
        _this.mSkyboxManager = new EditorSkyboxManager(_this);
        _this.mSceneManager = new EditorSceneManger(_this);
        _this.mElementStorage = new ElementStorage({ resPath: config.LOCAL_HOME_PATH, osdPath: config.osd });
        _this.mGame.scene.add(SceneEditor.name, SceneEditor, true, _this);
        return _this;
    }
    Object.defineProperty(SceneEditorCanvas.prototype, "url", {
        get: function () {
            return null;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SceneEditorCanvas.prototype, "config", {
        get: function () {
            return this.mConfig;
        },
        enumerable: true,
        configurable: true
    });
    SceneEditorCanvas.prototype.update = function (time, delta) {
        this.mElementManager.update();
        this.mMossManager.update();
        this.mTerrainManager.update();
        this.mWallManager.update();
    };
    SceneEditorCanvas.prototype.create = function (scene) {
        this.mScene = scene;
        if (this.mConfig.game_created) {
            this.mConfig.game_created.call(this);
        }
        // if (!this.mSceneNode) {
        //     return;
        // }
        // this.init();
    };
    SceneEditorCanvas.prototype.enableClick = function () {
        if (this.mScene) {
            this.mScene.input.enabled = true;
        }
    };
    SceneEditorCanvas.prototype.disableClick = function () {
        if (this.mScene) {
            this.mScene.input.enabled = false;
        }
    };
    SceneEditorCanvas.prototype.load = function (url) {
        load(this.mConfig.LOCAL_HOME_PATH + url, "arraybuffer").then(function (req) {
            try {
                var capsule = new Capsule().deserialize(req.response);
            }
            catch (_a) {
                Logger.getInstance().error("deserialize failed " + req.response);
            }
        });
    };
    SceneEditorCanvas.prototype.setSceneConfig = function (scene) {
        this.mSceneNode = scene;
        var _a = scene.size, rows = _a.rows, cols = _a.cols, tileWidth = _a.tileWidth, tileHeight = _a.tileHeight;
        var sceneWidth = (rows + cols) * (tileWidth / 2);
        var sceneHeight = (rows + cols) * (tileHeight / 2);
        this.mRoomSize = { rows: rows, cols: cols, tileWidth: tileWidth, tileHeight: tileHeight, sceneWidth: sceneWidth, sceneHeight: sceneHeight };
        this.mMiniRoomSize = {
            rows: rows * 2,
            cols: cols * 2,
            tileWidth: tileWidth / 2,
            tileHeight: tileHeight / 2
        };
        if (!this.mScene) {
            return;
        }
        this.mEditorPacket.sceneCreate();
        this.init();
    };
    SceneEditorCanvas.prototype.changeBrushType = function (mode) {
        this.mBrush = mode;
        if (this.mBrush !== BrushEnum.BRUSH) {
            this.mStamp.unselected();
        }
        if (this.mBrush !== BrushEnum.Select) {
            this.mSelecedElement.unselectedElements();
        }
        if (this.mBrush === BrushEnum.Eraser || this.mBrush === BrushEnum.EraserWall) {
            this.mStamp.showEraserArea();
        }
    };
    SceneEditorCanvas.prototype.changeStamp = function () {
    };
    SceneEditorCanvas.prototype.drawElement = function (element) {
        this.mSelecedElement.unselectedElements();
        this.mStamp.setSprite(element);
        this.mBrush = BrushEnum.Fill;
    };
    /**
     * @deprecated
     */
    SceneEditorCanvas.prototype.setSprite = function (content) {
        this.mStamp.setSprite(content);
    };
    SceneEditorCanvas.prototype.selectElement = function (id, selecting) {
        if (selecting === void 0) { selecting = true; }
        if (this.mBrush !== BrushEnum.Select) {
            return;
        }
        if (!this.mSelecedElement) {
            return;
        }
        var ele = this.displayObjectPool.get(id.toString());
        if (!ele) {
            return;
        }
        this.mSkyboxManager.unselected();
        this.mSelecedElement.selectElements([ele], selecting);
        this.mEditorPacket.sendFetch(this.mSelecedElement.getSelectedIDs(), op_def.NodeType.ElementNodeType, ele.isMoss);
    };
    SceneEditorCanvas.prototype.unselectElement = function () {
        if (!this.mSelecedElement) {
            return;
        }
        this.mSelecedElement.unselectedElements();
    };
    SceneEditorCanvas.prototype.updateElements = function () {
    };
    SceneEditorCanvas.prototype.deleteElement = function () {
        if (!this.mSelecedElement) {
            return;
        }
    };
    SceneEditorCanvas.prototype.duplicateElements = function () {
    };
    SceneEditorCanvas.prototype.drawTile = function (terrain) {
        this.mSelecedElement.unselectedElements();
        this.mStamp.setSprite(terrain);
        this.mBrush = BrushEnum.Fill;
    };
    SceneEditorCanvas.prototype.removeTile = function () {
    };
    SceneEditorCanvas.prototype.toggleLayerVisible = function (visible) {
        if (visible) {
            this.showGrid();
        }
        else {
            this.mScene.hideGrid();
        }
    };
    SceneEditorCanvas.prototype.drawSpawnpoint = function () {
    };
    SceneEditorCanvas.prototype.toggleAlignWithGrid = function (val) {
        // this.mAlignGrid = !this.mAlignGrid;
        this.mAlignGrid = val;
    };
    SceneEditorCanvas.prototype.showGrid = function () {
        if (!this.mScene) {
            return;
        }
        this.mScene.drawGrid(this.mRoomSize);
    };
    SceneEditorCanvas.prototype.lookatLElement = function () {
    };
    SceneEditorCanvas.prototype.createElement = function () {
        if (!this.mStamp.sprite) {
            return;
        }
        var nodeType = this.mStamp.nodeType;
        if (nodeType === op_def.NodeType.TerrainNodeType) {
            var terrainCoorData = this.mStamp.createTerrainsOrMossesData();
            this.mTerrainManager.addTerrains(terrainCoorData);
        }
        else if (nodeType === op_def.NodeType.ElementNodeType) {
            var sprites = this.mStamp.createSprites();
            if (!sprites) {
                return;
            }
            if (this.mStamp.isMoss) {
                var mossesCoorData = this.mStamp.createTerrainsOrMossesData();
                this.mMossManager.addMosses(mossesCoorData);
            }
            else {
                this.mElementManager.addElements(sprites);
            }
        }
        else if (this.mStamp.nodeType === op_def.NodeType.SpawnPointType) {
            var sprites = this.mStamp.createSprites();
            this.mElementManager.addElements(sprites);
        }
        else if (this.mStamp.nodeType === op_def.NodeType.WallNodeType) {
            var mossesCoorData = this.mStamp.createWallData();
            this.mWallManager.addWalls(mossesCoorData);
        }
    };
    SceneEditorCanvas.prototype.calcWallDirection = function (x, y) {
        var pos = Position45.transformTo45(new LogicPos(x, y), this.mRoomSize);
        var existTerrain = this.mTerrainManager.existTerrain.bind(this.mTerrainManager);
        if (existTerrain(pos.x, pos.y)) {
            if (!existTerrain(pos.x - 1, pos.y - 1)) {
                if (!existTerrain(pos.x, pos.y - 1) && !existTerrain(pos.x - 1, pos.y)) {
                    return Direction.concave;
                }
                if (!existTerrain(pos.x, pos.y + 1) && !existTerrain(pos.x + 1, pos.y)) {
                    return Direction.convex;
                }
            }
            if (!existTerrain(pos.x - 1, pos.y))
                return Direction.south_east;
            if (!existTerrain(pos.x, pos.y - 1))
                return Direction.west_south;
        }
        else {
            if (!existTerrain(pos.x, pos.y + 1) && !existTerrain(pos.x + 1, pos.y)) {
                if (existTerrain(pos.x + 1, pos.y + 1))
                    return Direction.concave;
            }
            if (existTerrain(pos.x + 1, pos.y) && existTerrain(pos.x, pos.y + 1))
                return Direction.convex;
            if (existTerrain(pos.x, pos.y + 1))
                return Direction.west_south;
            if (existTerrain(pos.x + 1, pos.y))
                return Direction.south_east;
        }
    };
    /**
     * @deprecated
     */
    SceneEditorCanvas.prototype.enter = function (scene) {
        var rows = scene.rows, cols = scene.cols, tileWidth = scene.tileWidth, tileHeight = scene.tileHeight;
        var sceneWidth = (rows + cols) * (tileWidth / 2);
        var sceneHeight = (rows + cols) * (tileHeight / 2);
        this.mRoomSize = { rows: rows, cols: cols, tileWidth: tileWidth, tileHeight: tileHeight, sceneWidth: sceneWidth, sceneHeight: sceneHeight };
        this.mMiniRoomSize = {
            rows: rows * 2,
            cols: cols * 2,
            tileWidth: tileWidth / 2,
            tileHeight: tileHeight / 2
        };
        if (!this.mScene) {
            return;
        }
        this.init();
    };
    SceneEditorCanvas.prototype.toggleStackElement = function (val) {
        // this.stackElemetn = val;
        if (this.mSelecedElement)
            this.mSelecedElement.stackElement = val;
    };
    SceneEditorCanvas.prototype.onResize = function (width, height) {
    };
    SceneEditorCanvas.prototype.fetchSprite = function (ids, nodeType) {
        // const map = {
        //     [op_def.NodeType.SpawnPointType]: "elements",
        //     [op_def.NodeType.ElementNodeType]: "elements",
        //     [op_def.NodeType.MossCollectionType]: "mosses",
        // };
        // for (const id of ids) {
        //     const poolName = map[nodeType];
        //     const pool = this.displayObjectPool.getPool(poolName);
        //     const displayObj = pool.get(id.toString());
        //     if (displayObj) {
        this.selectElement(ids[0], false);
        // this.selectedElement(displayObj.getDisplay());
        //     }
        // }
    };
    SceneEditorCanvas.prototype.fetchScenery = function (id) {
        this.mSelecedElement.unselectedElements();
        this.mSkyboxManager.fetch(id);
    };
    SceneEditorCanvas.prototype.setGameConfig = function (config) {
        this.mElementStorage.setGameConfig(config);
    };
    SceneEditorCanvas.prototype.updatePalette = function (palette) {
        this.mElementStorage.updatePalette(palette);
    };
    SceneEditorCanvas.prototype.updateMoss = function (moss) {
        this.mElementStorage.updateMoss(moss);
    };
    SceneEditorCanvas.prototype.getCurrentRoomSize = function () {
        return this.mRoomSize;
    };
    SceneEditorCanvas.prototype.getCurrentRoomMiniSize = function () {
        return this.mMiniRoomSize;
    };
    SceneEditorCanvas.prototype.getMainScene = function () {
        return this.mScene;
    };
    SceneEditorCanvas.prototype.checkCollision = function (pos, sprite) {
        return this.mElementManager.checkCollision(pos, sprite);
    };
    SceneEditorCanvas.prototype.destroy = function () {
        this.mTerrainManager.destroy();
        this.displayObjectPool.destroy();
        this.mEditorPacket.destroy();
        this.mElementManager.destroy();
        this.mElementStorage.destroy();
        this.mMossManager.destroy();
        this.mSkyboxManager.destroy();
        _super.prototype.destroy.call(this);
    };
    SceneEditorCanvas.prototype.init = function () {
        this.mCameraManager = new EditorCamerasManager(this);
        var camera = this.mScene.cameras.main;
        this.mCameraManager.camera = camera;
        var _a = this.mRoomSize, sceneWidth = _a.sceneWidth, sceneHeight = _a.sceneHeight;
        this.mCameraManager.setBounds(-camera.width - sceneWidth >> 1, -camera.height >> 1, sceneWidth + camera.width, sceneHeight + camera.height);
        this.mCameraManager.centerCamera();
        this.addListener();
        this.showGrid();
        this.mElementManager.init();
        // const elements = this.mSceneNode.getElements();
        // for (const ele of elements) {
        //     this.addElement(ele);
        // }
        // const terrains = this.mSceneNode.getTerrains();
        // for (const terrain of terrains) {
        //     this.addTerrain(terrain);
        // }
        // this.initSkybox();
        this.mEditorPacket.sceneCreate();
    };
    SceneEditorCanvas.prototype.addListener = function () {
        if (!this.mScene) {
            return;
        }
        var input = this.mScene.input;
        input.on("pointerup", this.onPointerUpHandler, this);
        input.on("pointerdown", this.onPointerDownHandler, this);
        input.on("pointermove", this.onPointerMoveHandler, this);
        input.on("gameobjectup", this.onGameobjectUpHandler, this);
        input.on("gameobjectdown", this.onGameobjectDownHandler, this);
        input.on("wheel", this.onWheelHandler, this);
    };
    SceneEditorCanvas.prototype.removeListener = function () {
        if (!this.mScene) {
            return;
        }
        var input = this.mScene.input;
        input.off("pointerup", this.onPointerUpHandler, this);
        input.off("pointerdown", this.onPointerDownHandler, this);
        input.off("pointermove", this.onPointerMoveHandler, this);
        input.off("gameobjectup", this.onGameobjectUpHandler, this);
        input.off("gameobjectdown", this.onGameobjectDownHandler, this);
        input.off("wheel", this.onWheelHandler, this);
    };
    SceneEditorCanvas.prototype.onPointerUpHandler = function (pointer) {
        if (this.mSelecedElement)
            this.mSelecedElement.selecting = false;
        switch (this.mBrush) {
            case BrushEnum.BRUSH:
                this.createElement();
                break;
            case BrushEnum.Select:
                if (pointer.downX !== pointer.upX && pointer.downY !== pointer.upY) {
                    var selectedElements = this.mSelecedElement.getSelecedElement();
                    for (var _i = 0, selectedElements_1 = selectedElements; _i < selectedElements_1.length; _i++) {
                        var ele = selectedElements_1[_i];
                        if (ele.isMoss) {
                            this.mMossManager.updateMosses([ele]);
                        }
                        else {
                            var sprite = ele.toSprite();
                            this.mElementManager.updateElements([sprite]);
                        }
                    }
                }
                break;
            case BrushEnum.Eraser:
                this.eraser(op_def.NodeType.TerrainNodeType);
                break;
            case BrushEnum.EraserWall:
                this.eraser(op_def.NodeType.WallNodeType);
                break;
            case BrushEnum.Move:
                this.mCameraManager.syncCameraScroll();
                break;
        }
    };
    SceneEditorCanvas.prototype.onPointerDownHandler = function (pointer) {
        var key = this.mStamp.key;
        if (key) {
            var nodeType = this.mStamp.nodeType;
            // if (nodeType === op_def.NodeType.TerrainNodeType) {
            //     if (!this.mElementStorage.getTerrainPalette(key)) {
            //         this.mEditorPacket.reqEditorSyncPaletteOrMoss(key, nodeType);
            //     }
            // } else if (nodeType === op_def.NodeType.ElementNodeType) {
            //     if (!this.mElementStorage.getMossPalette(key)) {
            //         this.mEditorPacket.reqEditorSyncPaletteOrMoss(key, nodeType);
            //     }
            // }
            switch (nodeType) {
                case op_def.NodeType.TerrainNodeType:
                    if (!this.mElementStorage.getTerrainPalette(key)) {
                        this.mEditorPacket.reqEditorSyncPaletteOrMoss(key, nodeType);
                    }
                    break;
                case op_def.NodeType.WallNodeType:
                case op_def.NodeType.ElementNodeType:
                    if (!this.mElementStorage.getMossPalette(key)) {
                        this.mEditorPacket.reqEditorSyncPaletteOrMoss(key, nodeType);
                    }
                    break;
            }
        }
    };
    SceneEditorCanvas.prototype.onPointerMoveHandler = function (pointer) {
        switch (this.mBrush) {
            case BrushEnum.Move:
                if (pointer.isDown) {
                    this.moveCameras(pointer.prevPosition.x - pointer.position.x, pointer.prevPosition.y - pointer.position.y);
                }
                break;
            case BrushEnum.Select:
                if (pointer.isDown) {
                    if (this.mSelecedElement) {
                        this.mSelecedElement.dragElement(pointer);
                    }
                    this.mSkyboxManager.move(pointer);
                }
                // if (pointer.isDown && this.mSelecedElement) this.mSelecedElement.dragElement(pointer.worldX, pointer.worldY);
                break;
            case BrushEnum.Fill:
                this.mStamp.pointerMove(pointer.worldX, pointer.worldY);
                break;
            case BrushEnum.BRUSH:
                this.mStamp.pointerMove(pointer.worldX, pointer.worldY);
                if (pointer.isDown && (this.mStamp.nodeType === op_def.NodeType.TerrainNodeType || this.mStamp.nodeType === op_def.NodeType.WallNodeType)) {
                    this.createElement();
                }
                break;
            case BrushEnum.Eraser:
                this.mStamp.pointerMove(pointer.worldX, pointer.worldY);
                if (pointer.isDown) {
                    this.eraser(op_def.NodeType.TerrainNodeType);
                }
                break;
            case BrushEnum.EraserWall:
                this.mStamp.pointerMove(pointer.worldX, pointer.worldY);
                if (pointer.isDown) {
                    this.eraser(op_def.NodeType.WallNodeType);
                }
                break;
        }
    };
    SceneEditorCanvas.prototype.moveCameras = function (x, y) {
        this.mCameraManager.offsetScroll(x, y);
    };
    SceneEditorCanvas.prototype.onGameobjectUpHandler = function (pointer, gameobject) { };
    SceneEditorCanvas.prototype.onGameobjectDownHandler = function (pointer, gameobject) {
        var id = gameobject.getData("id");
        if (id) {
            this.selectElement(id);
        }
    };
    SceneEditorCanvas.prototype.onWheelHandler = function (pointer) {
        switch (this.mBrush) {
            case BrushEnum.Move:
            case BrushEnum.Select:
                // 缩放地图
                break;
            case BrushEnum.Eraser:
            case BrushEnum.BRUSH:
            case BrushEnum.Fill:
            case BrushEnum.EraserWall:
                this.mStamp.wheel(pointer);
                break;
        }
    };
    SceneEditorCanvas.prototype.addElement = function (element) {
        var display = this.factory.createFramesDisplay(element);
        var loc = element.location;
        display.setPosition(loc.x, loc.y);
        display.name = element.name;
        display.setInteractive();
        this.mElements.set(element.id, display);
        this.mScene.layerManager.addToLayer(element.layer.toString(), display);
    };
    SceneEditorCanvas.prototype.addTerrain = function (terrain) {
        var display = this.factory.createFramesDisplay(terrain);
        var loc = terrain.location;
        var pos = Position45.transformTo90(loc, this.mRoomSize);
        display.setPosition(pos.x, pos.y);
        this.mScene.layerManager.addToLayer(terrain.layer.toString(), display);
    };
    SceneEditorCanvas.prototype.eraser = function (type) {
        var positions = this.mStamp.getEaserPosition();
        if (type === op_def.NodeType.TerrainNodeType) {
            this.mTerrainManager.removeTerrains(positions);
        }
        else {
            this.mWallManager.removeWalls(positions);
        }
    };
    SceneEditorCanvas.prototype.initSkybox = function () {
        var scenery = this.mSceneNode.getScenerys();
        Logger.getInstance().log("scenery: ", scenery);
    };
    Object.defineProperty(SceneEditorCanvas.prototype, "alignGrid", {
        get: function () {
            return this.mAlignGrid;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SceneEditorCanvas.prototype, "roomSize", {
        get: function () {
            return this.mRoomSize;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SceneEditorCanvas.prototype, "miniRoomSize", {
        get: function () {
            return this.mMiniRoomSize;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SceneEditorCanvas.prototype, "scene", {
        get: function () {
            return this.mScene;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SceneEditorCanvas.prototype, "factory", {
        get: function () {
            return this.mFactory;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SceneEditorCanvas.prototype, "elementStorage", {
        get: function () {
            return this.mElementStorage;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SceneEditorCanvas.prototype, "connection", {
        get: function () {
            return this.mConnection;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SceneEditorCanvas.prototype, "camerasManager", {
        get: function () {
            return this.mCameraManager;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SceneEditorCanvas.prototype, "game", {
        get: function () {
            return this.mGame;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SceneEditorCanvas.prototype, "scaleRatio", {
        get: function () {
            return Math.round(window.devicePixelRatio);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SceneEditorCanvas.prototype, "elementManager", {
        get: function () {
            return this.mElementManager;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SceneEditorCanvas.prototype, "mossManager", {
        get: function () {
            return this.mMossManager;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SceneEditorCanvas.prototype, "emitter", {
        get: function () {
            return this.mEmitter;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SceneEditorCanvas.prototype, "sceneManager", {
        get: function () {
            return this.mSceneManager;
        },
        enumerable: true,
        configurable: true
    });
    return SceneEditorCanvas;
}(EditorCanvas));
export { SceneEditorCanvas };
var SceneEditor = /** @class */ (function (_super) {
    __extends_1(SceneEditor, _super);
    function SceneEditor() {
        return _super.call(this, { key: "SceneEditor" }) || this;
    }
    SceneEditor.prototype.preload = function () {
    };
    SceneEditor.prototype.init = function (sceneEditor) {
        this.sceneEditor = sceneEditor;
    };
    SceneEditor.prototype.create = function () {
        this.layerManager = new LayerManager();
        this.sceneEditor.sceneManager.setMainScene(this);
        this.layerManager.addLayer(this, GroundLayer, SceneEditor.LAYER_WALL.toString(), 0);
        this.layerManager.addLayer(this, GroundLayer, SceneEditor.LAYER_HANGING.toString(), 1);
        this.layerManager.addLayer(this, GroundLayer, SceneEditor.LAYER_GROUND.toString(), 2);
        this.gridLayer = new GridLayer(this);
        this.sys.displayList.add(this.gridLayer);
        this.layerManager.addLayer(this, BaseLayer, SceneEditor.LAYER_MIDDLE, 4);
        this.layerManager.addLayer(this, GroundLayer, SceneEditor.LAYER_FLOOR.toString(), 5);
        this.layerManager.addLayer(this, SurfaceLayer, SceneEditor.LAYER_SURFACE.toString(), 6);
        this.layerManager.addLayer(this, BaseLayer, SceneEditor.SCENE_UI, 7);
        this.sceneEditor.create(this);
    };
    SceneEditor.prototype.update = function (time, delta) {
        if (this.sceneEditor)
            this.sceneEditor.update(time, delta);
        this.layerManager.update(time, delta);
    };
    SceneEditor.prototype.drawGrid = function (roomSize, line) {
        if (line === void 0) { line = 1; }
        this.gridLayer.draw(roomSize, line);
    };
    SceneEditor.prototype.hideGrid = function () {
        this.gridLayer.clear();
    };
    SceneEditor.LAYER_GROUND = LayerEnum.Terrain;
    SceneEditor.LAYER_MIDDLE = "middleLayer";
    SceneEditor.LAYER_FLOOR = LayerEnum.Floor;
    SceneEditor.LAYER_SURFACE = LayerEnum.Surface;
    SceneEditor.LAYER_WALL = LayerEnum.Wall;
    SceneEditor.LAYER_HANGING = LayerEnum.Hanging;
    SceneEditor.LAYER_ATMOSPHERE = "atmosphere";
    SceneEditor.SCENE_UI = "sceneUILayer";
    return SceneEditor;
}(Phaser.Scene));
export { SceneEditor };
var GridLayer = /** @class */ (function (_super) {
    __extends_1(GridLayer, _super);
    function GridLayer(scene) {
        return _super.call(this, scene) || this;
    }
    GridLayer.prototype.draw = function (roomSize, line, color, alpha) {
        if (line === void 0) { line = 1; }
        if (color === void 0) { color = 0xFFFFFF; }
        this.clear();
        if (!roomSize)
            return;
        this.lineStyle(line, color, alpha);
        var rows = roomSize.rows;
        var cols = roomSize.cols;
        for (var i = 0; i <= rows; i++) {
            this.drawLine(Position45.transformTo90(new LogicPos(0, i), roomSize), Position45.transformTo90(new LogicPos(cols, i), roomSize));
        }
        for (var i = 0; i <= cols; i++) {
            this.drawLine(Position45.transformTo90(new LogicPos(i, 0), roomSize), Position45.transformTo90(new LogicPos(i, rows), roomSize));
        }
    };
    GridLayer.prototype.drawLine = function (startPos, endPos) {
        this.lineBetween(startPos.x, startPos.y, endPos.x, endPos.y);
    };
    return GridLayer;
}(Phaser.GameObjects.Graphics));
var BrushEnum;
(function (BrushEnum) {
    BrushEnum["Move"] = "move";
    BrushEnum["Select"] = "select";
    BrushEnum["Fill"] = "FILL";
    BrushEnum["Eraser"] = "eraser";
    BrushEnum["BRUSH"] = "brush";
    BrushEnum["EraserWall"] = "eraserWall";
})(BrushEnum || (BrushEnum = {}));
var MouseFollow = /** @class */ (function () {
    function MouseFollow(sceneEditor) {
        this.sceneEditor = sceneEditor;
        this.isTerrain = false;
        this.mScaleRatio = 1;
        /**
         * 笔触大小
         */
        this.mSize = 1;
    }
    MouseFollow.prototype.wheel = function (pointer) {
        if (this.isTerrain === false) {
            return;
        }
        if (pointer.deltaY < 0) {
            this.size--;
        }
        else {
            this.size++;
        }
        this.updatePos(pointer.worldX, pointer.worldY);
    };
    /**
     * @deprecated
     */
    MouseFollow.prototype.setSprite = function (content) {
        if (this.mDisplay) {
            this.mDisplay.destroy();
            this.mDisplay = null;
        }
        var scene = this.sceneEditor.scene;
        this.mNodeType = content.nodeType;
        this.mIsMoss = content.isMoss;
        this.mKey = content.key;
        this.isTerrain = this.mNodeType === op_def.NodeType.TerrainNodeType || this.mNodeType === op_def.NodeType.WallNodeType;
        this.mSprite = new Sprite(content.sprite, content.nodeType);
        this.mDisplay = new MouseDisplayContainer(this.sceneEditor);
        var size = this.mNodeType === op_def.NodeType.TerrainNodeType ? this.mSize : 1;
        this.mDisplay.setDisplay(this.mSprite, size);
        scene.layerManager.addToLayer(SceneEditor.SCENE_UI, this.mDisplay);
        var activePointer = this.sceneEditor.scene.input.activePointer;
        if (activePointer)
            this.pointerMove(activePointer.worldX, activePointer.worldY);
    };
    // setDisplay(content: ElementNode | TerrainNode) {
    //     if (this.mDisplay) {
    //         this.mDisplay.destroy();
    //         this.mDisplay = null;
    //     }
    //     const scene = this.sceneEditor.scene;
    //     this.isTerrain = content.nodeType === 4 ? true : false;
    //     this.isMoss = content.isMoss;
    //     // this.key = content.key;
    //     // this.mSprite = new Sprite(content.sprite, content.nodeType);
    //     this.mDisplay = new MouseDisplayContainer(this.sceneEditor);
    //     // const displayInfo = this.sceneEditor.factory.createFramesModel(content.animations);
    //     this.mDisplay.setDisplay(content, this.isTerrain ? this.mSize : 1);
    //     // this.mLayerManager.addToSceneToUI(this.mDisplay);
    //     (<SceneEditor>scene).layerManager.addToLayer("sceneUILayer", this.mDisplay);
    // }
    MouseFollow.prototype.showEraserArea = function () {
        if (this.mDisplay) {
            this.mDisplay.destroy();
        }
        var scene = this.sceneEditor.scene;
        this.mDisplay = new EraserArea(this.sceneEditor);
        this.mNodeType = op_def.NodeType.TerrainNodeType;
        this.mDisplay.setDisplay(null, this.mSize);
        this.isTerrain = true;
        scene.layerManager.addToLayer(SceneEditor.SCENE_UI, this.mDisplay);
        var activePointer = this.sceneEditor.scene.input.activePointer;
        if (activePointer)
            this.pointerMove(activePointer.worldX, activePointer.worldY);
        // this.mLayerManager.addToSceneToUI(this.mDisplay);
    };
    MouseFollow.prototype.pointerMove = function (x, y) {
        if (!this.mDisplay) {
            return;
        }
        this.updatePos(x, y);
    };
    MouseFollow.prototype.createTerrainsOrMossesData = function () {
        var _this = this;
        var locs = this.mDisplay.displays.map(function (display) { return _this.getPosition(display.x, display.y); });
        return { locs: locs, key: this.key };
    };
    MouseFollow.prototype.createWallData = function () {
        // const locs = this.mDisplay.displays.map((display) => this.getPosition(display.x, display.y));
        // return { locs, key: this.key };
        var displays = this.mDisplay.displays;
        var locs = [];
        var pos = null;
        for (var _i = 0, displays_1 = displays; _i < displays_1.length; _i++) {
            var display = displays_1[_i];
            pos = this.getPosition(display.x, display.y);
            locs.push(__assign(__assign({}, pos), { dir: display.direction }));
        }
        return { locs: locs, key: this.key };
    };
    MouseFollow.prototype.createSprites = function () {
        if (!this.mSprite) {
            return;
        }
        var result = [];
        var sprite = null;
        var displays = this.mDisplay.displays;
        for (var _i = 0, displays_2 = displays; _i < displays_2.length; _i++) {
            var display = displays_2[_i];
            // deep clone
            sprite = Object.assign(Object.create(Object.getPrototypeOf(this.mSprite)), this.mSprite);
            sprite.newID();
            sprite.pos = this.getPosition(display.x, display.y);
            sprite.bindID = this.mSprite.id;
            sprite.sn = this.mSprite.sn;
            var ids = display.getMountIds();
            if (ids.length > 0)
                sprite.mountSprites = ids;
            // sprite.nodeType = this.mSprite.node
            result.push(sprite);
        }
        return result;
    };
    MouseFollow.prototype.getEaserPosition = function () {
        var result = [];
        if (!this.mDisplay) {
            return;
        }
        var pos = null;
        for (var i = 0; i < this.mSize; i++) {
            for (var j = 0; j < this.mSize; j++) {
                pos = this.mDisplay.transformTo90(i, j);
                result.push(this.getPosition(pos.x, pos.y));
                // result.push(this.mRoomService.transformTo45(new Pos(i, j)));
            }
        }
        // result.push(this.getPosition());
        return result;
    };
    MouseFollow.prototype.unselected = function () {
        if (this.mDisplay) {
            this.mDisplay.destroy();
            this.mDisplay = null;
        }
        this.mNodeType = op_def.NodeType.UnknownNodeType;
        this.mIsMoss = false;
        this.mKey = 0;
        this.isTerrain = false;
    };
    MouseFollow.prototype.updatePos = function (worldX, worldY) {
        if (!this.mDisplay) {
            return;
        }
        var roomSize = this.isTerrain ? this.sceneEditor.roomSize : this.sceneEditor.miniRoomSize;
        var pos = transitionGrid(worldX, worldY, this.sceneEditor.alignGrid, roomSize);
        if (!pos) {
            return;
        }
        if (this.mNodeType === op_def.NodeType.ElementNodeType) {
            var result = this.sceneEditor.checkCollision(pos, this.mSprite);
            if (!result) {
                return;
            }
        }
        var p = Position45.transformTo45(new LogicPos(pos.x, pos.y), this.sceneEditor.roomSize);
        this.mDisplay.updatePosition(pos.x, pos.y);
    };
    MouseFollow.prototype.getPosition = function (rows, cols) {
        if (rows === void 0) { rows = 0; }
        if (cols === void 0) { cols = 0; }
        if (this.mNodeType === op_def.NodeType.TerrainNodeType || this.mNodeType === op_def.NodeType.WallNodeType) {
            var pos45 = Position45.transformTo45(new LogicPos(this.mDisplay.x / this.mScaleRatio + rows, this.mDisplay.y / this.mScaleRatio + cols), this.sceneEditor.roomSize);
            return pos45;
        }
        // TODO 多个物件仅支持地块
        var pos = new LogicPos(this.mDisplay.x / this.mScaleRatio + rows, this.mDisplay.y / this.mScaleRatio + cols, this.mDisplay.z);
        return pos;
    };
    Object.defineProperty(MouseFollow.prototype, "size", {
        get: function () {
            return this.mSize;
        },
        set: function (val) {
            if (val < 1) {
                val = 1;
            }
            if (val > 20) {
                val = 20;
            }
            this.mSize = val;
            this.mDisplay.setDisplay(this.mSprite, this.mSize);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MouseFollow.prototype, "sprite", {
        get: function () {
            return this.mSprite;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MouseFollow.prototype, "isMoss", {
        get: function () {
            return this.mIsMoss;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MouseFollow.prototype, "nodeType", {
        get: function () {
            return this.mNodeType;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MouseFollow.prototype, "key", {
        get: function () {
            return this.mKey;
        },
        enumerable: true,
        configurable: true
    });
    return MouseFollow;
}());
var MouseDisplayContainer = /** @class */ (function (_super) {
    __extends_1(MouseDisplayContainer, _super);
    function MouseDisplayContainer(sceneEditor) {
        var _this = _super.call(this, sceneEditor.scene) || this;
        _this.sceneEditor = sceneEditor;
        _this.mScaleRatio = 1;
        _this.mOffset = { x: 0, y: 0 };
        return _this;
    }
    // public setDisplay(element: ElementNode | TerrainNode, size: number) {
    //     this.clear();
    //     this.mDisplays = [];
    //     if (!element) {
    //         return;
    //     }
    //     this.mNodeType = element.nodeType;
    //     let frameDisplay: EditorFramesDisplay;
    //     const { tileWidth, tileHeight } = this.sceneEditor.roomSize;
    //     const roomSize = {
    //         tileWidth,
    //         tileHeight,
    //         rows: size,
    //         cols: size,
    //         sceneWidth: (size + size) * (tileWidth / 2),
    //         sceneHeight: (size + size) * (tileHeight / 2),
    //     };
    //     this.mOffset.x = 0;
    //     this.mOffset.y = -((roomSize.sceneHeight / this.mScaleRatio - (size % 2 === 0 ? 0 : tileHeight)) / 2);
    //     const animationName = element.animations.defaultAnimationName;
    //     for (let i = 0; i < size; i++) {
    //         for (let j = 0; j < size; j++) {
    //             // frameDisplay = new EditorFramesDisplay(this.scene, 0, this.sceneEditor);
    //             frameDisplay = this.sceneEditor.factory.createFramesDisplay(element);
    //             frameDisplay.setAlpha(0.8);
    //             frameDisplay.play({ name: animationName, flip: false });
    //             frameDisplay.selected();
    //             const pos = Position45.transformTo90(new LogicPos(i, j), roomSize);
    //             frameDisplay.x = pos.x;
    //             frameDisplay.y = pos.y;
    //             this.add(frameDisplay);
    //             this.mDisplays.push(frameDisplay);
    //         }
    //     }
    // }
    /**
     * @deprecated
     */
    MouseDisplayContainer.prototype.setDisplay = function (sprite, size) {
        this.clear();
        this.mDisplays = [];
        this.mSprite = sprite;
        if (!sprite) {
            return;
        }
        var frame = sprite.displayInfo;
        this.mNodeType = sprite.nodeType;
        var frameDisplay;
        var _a = this.sceneEditor.roomSize, tileWidth = _a.tileWidth, tileHeight = _a.tileHeight;
        this.mTileSize = {
            tileWidth: tileWidth,
            tileHeight: tileHeight,
            rows: size,
            cols: size,
            sceneWidth: (size + size) * (tileWidth / 2),
            sceneHeight: (size + size) * (tileHeight / 2),
        };
        this.mOffset.x = 0;
        this.mOffset.y = -((this.mTileSize.sceneHeight / this.mScaleRatio - (size % 2 === 0 ? 0 : tileHeight)) / 2);
        for (var i = 0; i < size; i++) {
            for (var j = 0; j < size; j++) {
                if (sprite.avatar) {
                    frameDisplay = new EditorDragonbonesDisplay(this.sceneEditor.scene, this.sceneEditor.config, sprite);
                }
                else {
                    frameDisplay = new EditorFramesDisplay(this.sceneEditor, this.sceneEditor.config, sprite);
                }
                frameDisplay.setAlpha(0.8);
                // frameDisplay.once("initialized", this.onInitializedHandler, this);
                frameDisplay.load(frame);
                frameDisplay.play({ name: frame.animationName, flip: false });
                var pos = Position45.transformTo90(new LogicPos(i, j), this.mTileSize);
                frameDisplay.x = pos.x;
                frameDisplay.y = pos.y;
                frameDisplay.showRefernceArea();
                this.add(frameDisplay);
                // TODO 定义统一接口
                // @ts-ignore
                this.mDisplays.push(frameDisplay);
            }
        }
    };
    MouseDisplayContainer.prototype.updatePosition = function (x, y, z, w) {
        this.setPosition(x + this.mOffset.x, y + this.mOffset.y, z, w);
        if (this.mNodeType === op_def.NodeType.WallNodeType) {
            for (var _i = 0, _a = this.mDisplays; _i < _a.length; _i++) {
                var display = _a[_i];
                var direction = this.sceneEditor.calcWallDirection(x, y);
                if (direction)
                    display.setDirection(direction);
            }
        }
    };
    MouseDisplayContainer.prototype.transformTo90 = function (row, col) {
        return Position45.transformTo90(new LogicPos(row, col), this.mTileSize);
    };
    MouseDisplayContainer.prototype.transformTo45 = function (x, y) {
        return Position45.transformTo45(new LogicPos(x, y), this.mTileSize);
    };
    MouseDisplayContainer.prototype.clear = function () {
        this.removeAll(true);
        this.mDisplays = undefined;
    };
    Object.defineProperty(MouseDisplayContainer.prototype, "displays", {
        get: function () {
            return this.mDisplays;
        },
        enumerable: true,
        configurable: true
    });
    return MouseDisplayContainer;
}(Phaser.GameObjects.Container));
var EraserArea = /** @class */ (function (_super) {
    __extends_1(EraserArea, _super);
    function EraserArea(sceneEditor) {
        return _super.call(this, sceneEditor) || this;
    }
    EraserArea.prototype.setDisplay = function (frame, size) {
        if (this.area) {
            this.area.clear();
        }
        var _a = this.sceneEditor.roomSize, tileWidth = _a.tileWidth, tileHeight = _a.tileHeight;
        this.mTileSize = {
            tileWidth: tileWidth,
            tileHeight: tileHeight,
            rows: size,
            cols: size,
            sceneWidth: (size + size) * (tileWidth / 2),
            sceneHeight: (size + size) * (tileHeight / 2),
        };
        this.mOffset.x = 0;
        this.mOffset.y = -((this.mTileSize.sceneHeight - (size % 2 === 0 ? 0 : tileHeight)) / 2);
        var p1;
        var p2;
        var p3;
        var p4;
        this.mNodeType = op_def.NodeType.TerrainNodeType;
        this.area = this.scene.make.graphics(undefined, false);
        for (var y = 0; y < size; y++) {
            for (var x = 0; x < size; x++) {
                this.area.lineStyle(2, 0);
                p1 = Position45.transformTo90(new LogicPos(x, y), this.mTileSize);
                p2 = Position45.transformTo90(new LogicPos(x + 1, y), this.mTileSize);
                p3 = Position45.transformTo90(new LogicPos(x + 1, y + 1), this.mTileSize);
                p4 = Position45.transformTo90(new LogicPos(x, y + 1), this.mTileSize);
                this.area.beginPath();
                this.area.fillStyle(0, 0.5);
                this.area.strokePoints([p1.toPoint(), p2.toPoint(), p3.toPoint(), p4.toPoint()], true, true);
                this.area.fillPath();
            }
        }
        this.add(this.area);
    };
    return EraserArea;
}(MouseDisplayContainer));
var SelectedElementManager = /** @class */ (function () {
    function SelectedElementManager(sceneEditor) {
        this.sceneEditor = sceneEditor;
        this.mSelecting = false;
    }
    SelectedElementManager.prototype.selectElements = function (elements, selecting) {
        if (selecting === void 0) { selecting = true; }
        this.unselectedElements();
        this.mSelecedElement = elements;
        if (elements.length < 1) {
            return;
        }
        for (var _i = 0, elements_1 = elements; _i < elements_1.length; _i++) {
            var ele = elements_1[_i];
            ele.selected();
        }
        // this.registerGameobjectOver();
        this.selecting = selecting;
    };
    SelectedElementManager.prototype.unselectedElements = function () {
        if (!this.mSelecedElement || this.mSelecedElement.length < 1) {
            return;
        }
        for (var _i = 0, _a = this.mSelecedElement; _i < _a.length; _i++) {
            var ele = _a[_i];
            ele.unselected();
        }
        // this.unregisterGameobjectOver();
        this.mSelecedElement.length = 0;
        this.selecting = false;
    };
    SelectedElementManager.prototype.dragElement = function (pointer) {
        if (!this.mSelecedElement || this.mSelecedElement.length < 1) {
            return;
        }
        if (this.selecting === false) {
            return;
        }
        var roomSize = this.sceneEditor.miniRoomSize;
        var worldPos = new LogicPos(pointer.worldX, pointer.worldY);
        for (var _i = 0, _a = this.mSelecedElement; _i < _a.length; _i++) {
            var ele = _a[_i];
            if (ele.nodeType === op_def.NodeType.ElementNodeType) {
                var rootMount = ele.rootMount;
                if (rootMount) {
                    var _x = (pointer.prevPosition.x - pointer.position.x);
                    var _y = (pointer.prevPosition.y - pointer.position.y);
                    rootMount.updateMountPoint(ele, _x, _y);
                    continue;
                }
                var result = this.sceneEditor.checkCollision(worldPos, ele.sprite);
                if (!result) {
                    return;
                }
            }
            var pos = transitionGrid(worldPos.x, worldPos.y, this.sceneEditor.alignGrid, roomSize);
            ele.setPosition(pos.x, pos.y);
        }
    };
    SelectedElementManager.prototype.getSelectedIDs = function () {
        return this.mSelecedElement.map(function (ele) { return ele.id; });
    };
    SelectedElementManager.prototype.getSelecedElement = function () {
        return this.mSelecedElement || [];
    };
    SelectedElementManager.prototype.registerGameobjectOver = function () {
        var scene = this.sceneEditor.getMainScene();
        if (!scene)
            return;
        var input = scene.input;
        input.on("gameobjectover", this.onGameobjectOverHandler, this);
        input.on("gameobjectout", this.onGameobjectOutHandler, this);
    };
    SelectedElementManager.prototype.unregisterGameobjectOver = function () {
        var scene = this.sceneEditor.getMainScene();
        if (!scene)
            return;
        var input = scene.input;
        input.off("gameobjectover", this.onGameobjectOverHandler, this);
        input.off("gameobjectout", this.onGameobjectOutHandler, this);
        this.clearOverElement();
    };
    SelectedElementManager.prototype.checkMount = function () {
        if (this.overElement) {
            this.mount();
        }
    };
    SelectedElementManager.prototype.mount = function () {
        if (this.overElement) {
            for (var _i = 0, _a = this.mSelecedElement; _i < _a.length; _i++) {
                var ele = _a[_i];
                ele.mount(this.overElement, 0);
            }
        }
    };
    SelectedElementManager.prototype.unmount = function () {
        // if (!this.overElement) {
        //     for (const ele of this.mSelecedElement) {
        //         ele.unmount();
        //     }
        // }
    };
    SelectedElementManager.prototype.onGameobjectOverHandler = function (pointer, gameobject) {
        if (!this.selecting || !this.mStackElement) {
            return;
        }
        var id = gameobject.getData("id");
        if (this.mSelecedElement.length < 1) {
            return;
        }
        if (!id)
            return;
        var pool = this.sceneEditor.displayObjectPool.getPool("elements");
        if (!pool) {
            return;
        }
        this.overElement = pool.get(id.toString());
        if (this.overElement) {
            if (this.overElement.nodeType !== op_def.NodeType.ElementNodeType) {
                return;
            }
            this.overElement.selected();
            for (var _i = 0, _a = this.mSelecedElement; _i < _a.length; _i++) {
                var ele = _a[_i];
                if (this.overElement.id !== ele.id) {
                    var rootMount = ele.rootMount;
                    if (rootMount) {
                        if (rootMount === this.overElement) {
                            continue;
                        }
                        else {
                            rootMount.unmount(ele);
                            this.sceneEditor.elementManager.updateElements([rootMount.toSprite()]);
                        }
                    }
                    this.overElement.mount(ele);
                }
            }
            this.sceneEditor.elementManager.updateElements([this.overElement.toSprite()]);
        }
    };
    SelectedElementManager.prototype.onGameobjectOutHandler = function (pointer, gameobject) {
        this.clearOverElement();
    };
    SelectedElementManager.prototype.clearOverElement = function () {
        if (!this.overElement)
            return;
        this.overElement.unselected();
        // 拖动时改变mount point还是unmount不好区分。unmount先不做
        // for (const ele of this.mSelecedElement) {
        //     this.overElement.unmount(ele);
        // }
        // this.sceneEditor.elementManager.updateElements([this.overElement.toSprite()]);
        this.overElement = null;
    };
    Object.defineProperty(SelectedElementManager.prototype, "selecting", {
        get: function () {
            return this.mSelecting;
        },
        set: function (val) {
            if (this.mSelecting !== val) {
                this.mSelecting = val;
                if (this.mSelecedElement) {
                    for (var _i = 0, _a = this.mSelecedElement; _i < _a.length; _i++) {
                        var ele = _a[_i];
                        val ? ele.disableInteractive() : ele.setInteractive();
                    }
                }
                this.unregisterGameobjectOver();
                if (val)
                    this.registerGameobjectOver();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SelectedElementManager.prototype, "stackElement", {
        set: function (val) {
            this.mStackElement = val;
        },
        enumerable: true,
        configurable: true
    });
    return SelectedElementManager;
}());
//# sourceMappingURL=scene.editor.canvas.js.map