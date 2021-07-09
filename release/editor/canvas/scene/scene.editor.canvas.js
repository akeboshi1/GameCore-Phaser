var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
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
for (const key in protos) {
  PBpacket.addProtocol(protos[key]);
}
export class SceneEditorCanvas extends EditorCanvas {
  constructor(config) {
    super(config);
    __publicField(this, "displayObjectPool");
    __publicField(this, "mSelecedElement");
    __publicField(this, "mCameraManager");
    __publicField(this, "mRoomSize");
    __publicField(this, "mMiniRoomSize");
    __publicField(this, "mSceneNode");
    __publicField(this, "mAlignGrid", true);
    __publicField(this, "mElements");
    __publicField(this, "mStamp");
    __publicField(this, "mBrush", BrushEnum.Select);
    __publicField(this, "mFactory");
    __publicField(this, "mConnection");
    __publicField(this, "mEditorPacket");
    __publicField(this, "mTerrainManager");
    __publicField(this, "mMossManager");
    __publicField(this, "mElementManager");
    __publicField(this, "mWallManager");
    __publicField(this, "mSkyboxManager");
    __publicField(this, "mSceneManager");
    __publicField(this, "mElementStorage");
    __publicField(this, "mScene");
    this.mElements = new Map();
    this.mConfig = config;
    this.mConfig.osd = config.osd || "https://osd-alpha.tooqing.com/";
    this.mFactory = new EditorFactory(this);
    this.mSelecedElement = new SelectedElementManager(this);
    this.mStamp = new MouseFollow(this);
    this.mConnection = config.connection;
    this.mEditorPacket = new EditorPacket(this, this.mConnection);
    this.displayObjectPool = new DisplayObjectPool(this);
    this.mTerrainManager = new EditorTerrainManager(this);
    this.mMossManager = new EditorMossManager(this);
    this.mElementManager = new EditorElementManager(this);
    this.mWallManager = new EditorWallManager(this);
    this.mSkyboxManager = new EditorSkyboxManager(this);
    this.mSceneManager = new EditorSceneManger(this);
    this.mElementStorage = new ElementStorage({ resPath: config.LOCAL_HOME_PATH, osdPath: config.osd });
    this.mGame.scene.add(SceneEditor.name, SceneEditor, true, this);
  }
  get url() {
    return null;
  }
  get config() {
    return this.mConfig;
  }
  update(time, delta) {
    this.mElementManager.update();
    this.mMossManager.update();
    this.mTerrainManager.update();
    this.mWallManager.update();
  }
  create(scene) {
    this.mScene = scene;
    if (this.mConfig.game_created) {
      this.mConfig.game_created.call(this);
    }
  }
  enableClick() {
    if (this.mScene) {
      this.mScene.input.enabled = true;
    }
  }
  disableClick() {
    if (this.mScene) {
      this.mScene.input.enabled = false;
    }
  }
  load(url) {
    load(this.mConfig.LOCAL_HOME_PATH + url, "arraybuffer").then((req) => {
      try {
        const capsule = new Capsule().deserialize(req.response);
      } catch (e) {
        Logger.getInstance().error(`deserialize failed ${req.response}`);
      }
    });
  }
  setSceneConfig(scene) {
    this.mSceneNode = scene;
    const { rows, cols, tileWidth, tileHeight } = scene.size;
    const sceneWidth = (rows + cols) * (tileWidth / 2);
    const sceneHeight = (rows + cols) * (tileHeight / 2);
    this.mRoomSize = { rows, cols, tileWidth, tileHeight, sceneWidth, sceneHeight };
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
  }
  changeBrushType(mode) {
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
  }
  changeStamp() {
  }
  drawElement(element) {
    this.mSelecedElement.unselectedElements();
    this.mStamp.setSprite(element);
    this.mBrush = BrushEnum.Fill;
  }
  setSprite(content) {
    this.mStamp.setSprite(content);
  }
  selectElement(id, selecting = true) {
    if (this.mBrush !== BrushEnum.Select) {
      return;
    }
    if (!this.mSelecedElement) {
      return;
    }
    const ele = this.displayObjectPool.get(id.toString());
    if (!ele) {
      return;
    }
    this.mSkyboxManager.unselected();
    this.mSelecedElement.selectElements([ele], selecting);
    this.mEditorPacket.sendFetch(this.mSelecedElement.getSelectedIDs(), op_def.NodeType.ElementNodeType, ele.isMoss);
  }
  unselectElement() {
    if (!this.mSelecedElement) {
      return;
    }
    this.mSelecedElement.unselectedElements();
  }
  updateElements() {
  }
  deleteElement() {
    if (!this.mSelecedElement) {
      return;
    }
  }
  duplicateElements() {
  }
  drawTile(terrain) {
    this.mSelecedElement.unselectedElements();
    this.mStamp.setSprite(terrain);
    this.mBrush = BrushEnum.Fill;
  }
  removeTile() {
  }
  toggleLayerVisible(visible) {
    if (visible) {
      this.showGrid();
    } else {
      this.mScene.hideGrid();
    }
  }
  drawSpawnpoint() {
  }
  toggleAlignWithGrid(val) {
    this.mAlignGrid = val;
  }
  showGrid() {
    if (!this.mScene) {
      return;
    }
    this.mScene.drawGrid(this.mRoomSize);
  }
  lookatLElement() {
  }
  createElement() {
    if (!this.mStamp.sprite) {
      return;
    }
    const nodeType = this.mStamp.nodeType;
    if (nodeType === op_def.NodeType.TerrainNodeType) {
      const terrainCoorData = this.mStamp.createTerrainsOrMossesData();
      this.mTerrainManager.addTerrains(terrainCoorData);
    } else if (nodeType === op_def.NodeType.ElementNodeType) {
      const sprites = this.mStamp.createSprites();
      if (!sprites) {
        return;
      }
      if (this.mStamp.isMoss) {
        const mossesCoorData = this.mStamp.createTerrainsOrMossesData();
        this.mMossManager.addMosses(mossesCoorData);
      } else {
        this.mElementManager.addElements(sprites);
      }
    } else if (this.mStamp.nodeType === op_def.NodeType.SpawnPointType) {
      const sprites = this.mStamp.createSprites();
      this.mElementManager.addElements(sprites);
    } else if (this.mStamp.nodeType === op_def.NodeType.WallNodeType) {
      const mossesCoorData = this.mStamp.createWallData();
      this.mWallManager.addWalls(mossesCoorData);
    }
  }
  calcWallDirection(x, y) {
    const pos = Position45.transformTo45(new LogicPos(x, y), this.mRoomSize);
    const existTerrain = this.mTerrainManager.existTerrain.bind(this.mTerrainManager);
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
    } else {
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
  }
  enter(scene) {
    const { rows, cols, tileWidth, tileHeight } = scene;
    const sceneWidth = (rows + cols) * (tileWidth / 2);
    const sceneHeight = (rows + cols) * (tileHeight / 2);
    this.mRoomSize = { rows, cols, tileWidth, tileHeight, sceneWidth, sceneHeight };
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
  }
  toggleStackElement(val) {
    if (this.mSelecedElement)
      this.mSelecedElement.stackElement = val;
  }
  onResize(width, height) {
  }
  fetchSprite(ids, nodeType) {
    this.selectElement(ids[0], false);
  }
  fetchScenery(id) {
    this.mSelecedElement.unselectedElements();
    this.mSkyboxManager.fetch(id);
  }
  setGameConfig(config) {
    this.mElementStorage.setGameConfig(config);
  }
  updatePalette(palette) {
    this.mElementStorage.updatePalette(palette);
  }
  updateMoss(moss) {
    this.mElementStorage.updateMoss(moss);
  }
  getCurrentRoomSize() {
    return this.mRoomSize;
  }
  getCurrentRoomMiniSize() {
    return this.mMiniRoomSize;
  }
  getMainScene() {
    return this.mScene;
  }
  checkCollision(pos, sprite) {
    return this.mElementManager.checkCollision(pos, sprite);
  }
  destroy() {
    this.mTerrainManager.destroy();
    this.displayObjectPool.destroy();
    this.mEditorPacket.destroy();
    this.mElementManager.destroy();
    this.mElementStorage.destroy();
    this.mMossManager.destroy();
    this.mSkyboxManager.destroy();
    super.destroy();
  }
  init() {
    this.mCameraManager = new EditorCamerasManager(this);
    const camera = this.mScene.cameras.main;
    this.mCameraManager.camera = camera;
    const { sceneWidth, sceneHeight } = this.mRoomSize;
    this.mCameraManager.setBounds(-camera.width - sceneWidth >> 1, -camera.height >> 1, sceneWidth + camera.width, sceneHeight + camera.height);
    this.mCameraManager.centerCamera();
    this.addListener();
    this.showGrid();
    this.mElementManager.init();
    this.mEditorPacket.sceneCreate();
  }
  addListener() {
    if (!this.mScene) {
      return;
    }
    const input = this.mScene.input;
    input.on("pointerup", this.onPointerUpHandler, this);
    input.on("pointerdown", this.onPointerDownHandler, this);
    input.on("pointermove", this.onPointerMoveHandler, this);
    input.on("gameobjectup", this.onGameobjectUpHandler, this);
    input.on("gameobjectdown", this.onGameobjectDownHandler, this);
    input.on("wheel", this.onWheelHandler, this);
  }
  removeListener() {
    if (!this.mScene) {
      return;
    }
    const input = this.mScene.input;
    input.off("pointerup", this.onPointerUpHandler, this);
    input.off("pointerdown", this.onPointerDownHandler, this);
    input.off("pointermove", this.onPointerMoveHandler, this);
    input.off("gameobjectup", this.onGameobjectUpHandler, this);
    input.off("gameobjectdown", this.onGameobjectDownHandler, this);
    input.off("wheel", this.onWheelHandler, this);
  }
  onPointerUpHandler(pointer) {
    if (this.mSelecedElement)
      this.mSelecedElement.selecting = false;
    switch (this.mBrush) {
      case BrushEnum.BRUSH:
        this.createElement();
        break;
      case BrushEnum.Select:
        if (pointer.downX !== pointer.upX && pointer.downY !== pointer.upY) {
          const selectedElements = this.mSelecedElement.getSelecedElement();
          for (const ele of selectedElements) {
            if (ele.isMoss) {
              this.mMossManager.updateMosses([ele]);
            } else {
              const sprite = ele.toSprite();
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
  }
  onPointerDownHandler(pointer) {
    const key = this.mStamp.key;
    if (key) {
      const nodeType = this.mStamp.nodeType;
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
  }
  onPointerMoveHandler(pointer) {
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
  }
  moveCameras(x, y) {
    this.mCameraManager.offsetScroll(x, y);
  }
  onGameobjectUpHandler(pointer, gameobject) {
  }
  onGameobjectDownHandler(pointer, gameobject) {
    const id = gameobject.getData("id");
    if (id) {
      this.selectElement(id);
    }
  }
  onWheelHandler(pointer) {
    switch (this.mBrush) {
      case BrushEnum.Move:
      case BrushEnum.Select:
        break;
      case BrushEnum.Eraser:
      case BrushEnum.BRUSH:
      case BrushEnum.Fill:
      case BrushEnum.EraserWall:
        this.mStamp.wheel(pointer);
        break;
    }
  }
  addElement(element) {
    const display = this.factory.createFramesDisplay(element);
    const loc = element.location;
    display.setPosition(loc.x, loc.y);
    display.name = element.name;
    display.setInteractive();
    this.mElements.set(element.id, display);
    this.mScene.layerManager.addToLayer(element.layer.toString(), display);
  }
  addTerrain(terrain) {
    const display = this.factory.createFramesDisplay(terrain);
    const loc = terrain.location;
    const pos = Position45.transformTo90(loc, this.mRoomSize);
    display.setPosition(pos.x, pos.y);
    this.mScene.layerManager.addToLayer(terrain.layer.toString(), display);
  }
  eraser(type) {
    const positions = this.mStamp.getEaserPosition();
    if (type === op_def.NodeType.TerrainNodeType) {
      this.mTerrainManager.removeTerrains(positions);
    } else {
      this.mWallManager.removeWalls(positions);
    }
  }
  initSkybox() {
    const scenery = this.mSceneNode.getScenerys();
    Logger.getInstance().log("scenery: ", scenery);
  }
  get alignGrid() {
    return this.mAlignGrid;
  }
  get roomSize() {
    return this.mRoomSize;
  }
  get miniRoomSize() {
    return this.mMiniRoomSize;
  }
  get scene() {
    return this.mScene;
  }
  get factory() {
    return this.mFactory;
  }
  get elementStorage() {
    return this.mElementStorage;
  }
  get connection() {
    return this.mConnection;
  }
  get camerasManager() {
    return this.mCameraManager;
  }
  get game() {
    return this.mGame;
  }
  get scaleRatio() {
    return Math.round(window.devicePixelRatio);
  }
  get elementManager() {
    return this.mElementManager;
  }
  get mossManager() {
    return this.mMossManager;
  }
  get emitter() {
    return this.mEmitter;
  }
  get sceneManager() {
    return this.mSceneManager;
  }
}
const _SceneEditor = class extends Phaser.Scene {
  constructor() {
    super({ key: "SceneEditor" });
    __publicField(this, "layerManager");
    __publicField(this, "gridLayer");
    __publicField(this, "sceneEditor");
  }
  preload() {
  }
  init(sceneEditor) {
    this.sceneEditor = sceneEditor;
  }
  create() {
    this.layerManager = new LayerManager();
    this.sceneEditor.sceneManager.setMainScene(this);
    this.layerManager.addLayer(this, GroundLayer, _SceneEditor.LAYER_WALL.toString(), 0);
    this.layerManager.addLayer(this, GroundLayer, _SceneEditor.LAYER_HANGING.toString(), 1);
    this.layerManager.addLayer(this, GroundLayer, _SceneEditor.LAYER_GROUND.toString(), 2);
    this.gridLayer = new GridLayer(this);
    this.sys.displayList.add(this.gridLayer);
    this.layerManager.addLayer(this, BaseLayer, _SceneEditor.LAYER_MIDDLE, 4);
    this.layerManager.addLayer(this, GroundLayer, _SceneEditor.LAYER_FLOOR.toString(), 5);
    this.layerManager.addLayer(this, SurfaceLayer, _SceneEditor.LAYER_SURFACE.toString(), 6);
    this.layerManager.addLayer(this, BaseLayer, _SceneEditor.SCENE_UI, 7);
    this.sceneEditor.create(this);
  }
  update(time, delta) {
    if (this.sceneEditor)
      this.sceneEditor.update(time, delta);
    this.layerManager.update(time, delta);
  }
  drawGrid(roomSize, line = 1) {
    this.gridLayer.draw(roomSize, line);
  }
  hideGrid() {
    this.gridLayer.clear();
  }
};
export let SceneEditor = _SceneEditor;
__publicField(SceneEditor, "LAYER_GROUND", LayerEnum.Terrain);
__publicField(SceneEditor, "LAYER_MIDDLE", "middleLayer");
__publicField(SceneEditor, "LAYER_FLOOR", LayerEnum.Floor);
__publicField(SceneEditor, "LAYER_SURFACE", LayerEnum.Surface);
__publicField(SceneEditor, "LAYER_WALL", LayerEnum.Wall);
__publicField(SceneEditor, "LAYER_HANGING", LayerEnum.Hanging);
__publicField(SceneEditor, "LAYER_ATMOSPHERE", "atmosphere");
__publicField(SceneEditor, "SCENE_UI", "sceneUILayer");
class GridLayer extends Phaser.GameObjects.Graphics {
  constructor(scene) {
    super(scene);
  }
  draw(roomSize, line = 1, color = 16777215, alpha) {
    this.clear();
    if (!roomSize)
      return;
    this.lineStyle(line, color, alpha);
    const rows = roomSize.rows;
    const cols = roomSize.cols;
    for (let i = 0; i <= rows; i++) {
      this.drawLine(Position45.transformTo90(new LogicPos(0, i), roomSize), Position45.transformTo90(new LogicPos(cols, i), roomSize));
    }
    for (let i = 0; i <= cols; i++) {
      this.drawLine(Position45.transformTo90(new LogicPos(i, 0), roomSize), Position45.transformTo90(new LogicPos(i, rows), roomSize));
    }
  }
  drawLine(startPos, endPos) {
    this.lineBetween(startPos.x, startPos.y, endPos.x, endPos.y);
  }
}
var BrushEnum;
(function(BrushEnum2) {
  BrushEnum2["Move"] = "move";
  BrushEnum2["Select"] = "select";
  BrushEnum2["Fill"] = "FILL";
  BrushEnum2["Eraser"] = "eraser";
  BrushEnum2["BRUSH"] = "brush";
  BrushEnum2["EraserWall"] = "eraserWall";
})(BrushEnum || (BrushEnum = {}));
class MouseFollow {
  constructor(sceneEditor) {
    this.sceneEditor = sceneEditor;
    __publicField(this, "mDisplay");
    __publicField(this, "isTerrain", false);
    __publicField(this, "mNodeType");
    __publicField(this, "mKey");
    __publicField(this, "mSprite");
    __publicField(this, "mIsMoss");
    __publicField(this, "mScaleRatio", 1);
    __publicField(this, "mSize", 1);
  }
  wheel(pointer) {
    if (this.isTerrain === false) {
      return;
    }
    if (pointer.deltaY < 0) {
      this.size--;
    } else {
      this.size++;
    }
    this.updatePos(pointer.worldX, pointer.worldY);
  }
  setSprite(content) {
    if (this.mDisplay) {
      this.mDisplay.destroy();
      this.mDisplay = null;
    }
    const scene = this.sceneEditor.scene;
    this.mNodeType = content.nodeType;
    this.mIsMoss = content.isMoss;
    this.mKey = content.key;
    this.isTerrain = this.mNodeType === op_def.NodeType.TerrainNodeType || this.mNodeType === op_def.NodeType.WallNodeType;
    this.mSprite = new Sprite(content.sprite, content.nodeType);
    this.mDisplay = new MouseDisplayContainer(this.sceneEditor);
    const size = this.mNodeType === op_def.NodeType.TerrainNodeType ? this.mSize : 1;
    this.mDisplay.setDisplay(this.mSprite, size);
    scene.layerManager.addToLayer(SceneEditor.SCENE_UI, this.mDisplay);
    const activePointer = this.sceneEditor.scene.input.activePointer;
    if (activePointer)
      this.pointerMove(activePointer.worldX, activePointer.worldY);
  }
  showEraserArea() {
    if (this.mDisplay) {
      this.mDisplay.destroy();
    }
    const scene = this.sceneEditor.scene;
    this.mDisplay = new EraserArea(this.sceneEditor);
    this.mNodeType = op_def.NodeType.TerrainNodeType;
    this.mDisplay.setDisplay(null, this.mSize);
    this.isTerrain = true;
    scene.layerManager.addToLayer(SceneEditor.SCENE_UI, this.mDisplay);
    const activePointer = this.sceneEditor.scene.input.activePointer;
    if (activePointer)
      this.pointerMove(activePointer.worldX, activePointer.worldY);
  }
  pointerMove(x, y) {
    if (!this.mDisplay) {
      return;
    }
    this.updatePos(x, y);
  }
  createTerrainsOrMossesData() {
    const locs = this.mDisplay.displays.map((display) => this.getPosition(display.x, display.y));
    return { locs, key: this.key };
  }
  createWallData() {
    const displays = this.mDisplay.displays;
    const locs = [];
    let pos = null;
    for (const display of displays) {
      pos = this.getPosition(display.x, display.y);
      locs.push(__spreadProps(__spreadValues({}, pos), {
        dir: display.direction
      }));
    }
    return { locs, key: this.key };
  }
  createSprites() {
    if (!this.mSprite) {
      return;
    }
    const result = [];
    let sprite = null;
    const displays = this.mDisplay.displays;
    for (const display of displays) {
      sprite = Object.assign(Object.create(Object.getPrototypeOf(this.mSprite)), this.mSprite);
      sprite.newID();
      sprite.pos = this.getPosition(display.x, display.y);
      sprite.bindID = this.mSprite.id;
      sprite.sn = this.mSprite.sn;
      const ids = display.getMountIds();
      if (ids.length > 0)
        sprite.mountSprites = ids;
      result.push(sprite);
    }
    return result;
  }
  getEaserPosition() {
    const result = [];
    if (!this.mDisplay) {
      return;
    }
    let pos = null;
    for (let i = 0; i < this.mSize; i++) {
      for (let j = 0; j < this.mSize; j++) {
        pos = this.mDisplay.transformTo90(i, j);
        result.push(this.getPosition(pos.x, pos.y));
      }
    }
    return result;
  }
  unselected() {
    if (this.mDisplay) {
      this.mDisplay.destroy();
      this.mDisplay = null;
    }
    this.mNodeType = op_def.NodeType.UnknownNodeType;
    this.mIsMoss = false;
    this.mKey = 0;
    this.isTerrain = false;
  }
  updatePos(worldX, worldY) {
    if (!this.mDisplay) {
      return;
    }
    const roomSize = this.isTerrain ? this.sceneEditor.roomSize : this.sceneEditor.miniRoomSize;
    const pos = transitionGrid(worldX, worldY, this.sceneEditor.alignGrid, roomSize);
    if (!pos) {
      return;
    }
    if (this.mNodeType === op_def.NodeType.ElementNodeType) {
      const result = this.sceneEditor.checkCollision(pos, this.mSprite);
      if (!result) {
        return;
      }
    }
    const p = Position45.transformTo45(new LogicPos(pos.x, pos.y), this.sceneEditor.roomSize);
    this.mDisplay.updatePosition(pos.x, pos.y);
  }
  getPosition(rows = 0, cols = 0) {
    if (this.mNodeType === op_def.NodeType.TerrainNodeType || this.mNodeType === op_def.NodeType.WallNodeType) {
      const pos45 = Position45.transformTo45(new LogicPos(this.mDisplay.x / this.mScaleRatio + rows, this.mDisplay.y / this.mScaleRatio + cols), this.sceneEditor.roomSize);
      return pos45;
    }
    const pos = new LogicPos(this.mDisplay.x / this.mScaleRatio + rows, this.mDisplay.y / this.mScaleRatio + cols, this.mDisplay.z);
    return pos;
  }
  get size() {
    return this.mSize;
  }
  set size(val) {
    if (val < 1) {
      val = 1;
    }
    if (val > 20) {
      val = 20;
    }
    this.mSize = val;
    this.mDisplay.setDisplay(this.mSprite, this.mSize);
  }
  get sprite() {
    return this.mSprite;
  }
  get isMoss() {
    return this.mIsMoss;
  }
  get nodeType() {
    return this.mNodeType;
  }
  get key() {
    return this.mKey;
  }
}
class MouseDisplayContainer extends Phaser.GameObjects.Container {
  constructor(sceneEditor) {
    super(sceneEditor.scene);
    this.sceneEditor = sceneEditor;
    __publicField(this, "mOffset");
    __publicField(this, "mNodeType");
    __publicField(this, "mDisplays");
    __publicField(this, "mScaleRatio", 1);
    __publicField(this, "mSprite");
    __publicField(this, "mTileSize");
    this.mOffset = { x: 0, y: 0 };
  }
  setDisplay(sprite, size) {
    this.clear();
    this.mDisplays = [];
    this.mSprite = sprite;
    if (!sprite) {
      return;
    }
    const frame = sprite.displayInfo;
    this.mNodeType = sprite.nodeType;
    let frameDisplay;
    const { tileWidth, tileHeight } = this.sceneEditor.roomSize;
    this.mTileSize = {
      tileWidth,
      tileHeight,
      rows: size,
      cols: size,
      sceneWidth: (size + size) * (tileWidth / 2),
      sceneHeight: (size + size) * (tileHeight / 2)
    };
    this.mOffset.x = 0;
    this.mOffset.y = -((this.mTileSize.sceneHeight / this.mScaleRatio - (size % 2 === 0 ? 0 : tileHeight)) / 2);
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        if (sprite.avatar) {
          frameDisplay = new EditorDragonbonesDisplay(this.sceneEditor.scene, this.sceneEditor.config, sprite);
        } else {
          frameDisplay = new EditorFramesDisplay(this.sceneEditor, this.sceneEditor.config, sprite);
        }
        frameDisplay.setAlpha(0.8);
        frameDisplay.load(frame);
        frameDisplay.play({ name: frame.animationName, flip: false });
        const pos = Position45.transformTo90(new LogicPos(i, j), this.mTileSize);
        frameDisplay.x = pos.x;
        frameDisplay.y = pos.y;
        frameDisplay.showRefernceArea();
        this.add(frameDisplay);
        this.mDisplays.push(frameDisplay);
      }
    }
  }
  updatePosition(x, y, z, w) {
    this.setPosition(x + this.mOffset.x, y + this.mOffset.y, z, w);
    if (this.mNodeType === op_def.NodeType.WallNodeType) {
      for (const display of this.mDisplays) {
        const direction = this.sceneEditor.calcWallDirection(x, y);
        if (direction)
          display.setDirection(direction);
      }
    }
  }
  transformTo90(row, col) {
    return Position45.transformTo90(new LogicPos(row, col), this.mTileSize);
  }
  transformTo45(x, y) {
    return Position45.transformTo45(new LogicPos(x, y), this.mTileSize);
  }
  clear() {
    this.removeAll(true);
    this.mDisplays = void 0;
  }
  get displays() {
    return this.mDisplays;
  }
}
class EraserArea extends MouseDisplayContainer {
  constructor(sceneEditor) {
    super(sceneEditor);
    __publicField(this, "area");
  }
  setDisplay(frame, size) {
    if (this.area) {
      this.area.clear();
    }
    const { tileWidth, tileHeight } = this.sceneEditor.roomSize;
    this.mTileSize = {
      tileWidth,
      tileHeight,
      rows: size,
      cols: size,
      sceneWidth: (size + size) * (tileWidth / 2),
      sceneHeight: (size + size) * (tileHeight / 2)
    };
    this.mOffset.x = 0;
    this.mOffset.y = -((this.mTileSize.sceneHeight - (size % 2 === 0 ? 0 : tileHeight)) / 2);
    let p1;
    let p2;
    let p3;
    let p4;
    this.mNodeType = op_def.NodeType.TerrainNodeType;
    this.area = this.scene.make.graphics(void 0, false);
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
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
  }
}
class SelectedElementManager {
  constructor(sceneEditor) {
    this.sceneEditor = sceneEditor;
    __publicField(this, "mSelecting", false);
    __publicField(this, "overElement");
    __publicField(this, "mStackElement");
    __publicField(this, "mSelecedElement");
  }
  selectElements(elements, selecting = true) {
    this.unselectedElements();
    this.mSelecedElement = elements;
    if (elements.length < 1) {
      return;
    }
    for (const ele of elements) {
      ele.selected();
    }
    this.selecting = selecting;
  }
  unselectedElements() {
    if (!this.mSelecedElement || this.mSelecedElement.length < 1) {
      return;
    }
    for (const ele of this.mSelecedElement) {
      ele.unselected();
    }
    this.mSelecedElement.length = 0;
    this.selecting = false;
  }
  dragElement(pointer) {
    if (!this.mSelecedElement || this.mSelecedElement.length < 1) {
      return;
    }
    if (this.selecting === false) {
      return;
    }
    const roomSize = this.sceneEditor.miniRoomSize;
    const worldPos = new LogicPos(pointer.worldX, pointer.worldY);
    for (const ele of this.mSelecedElement) {
      if (ele.nodeType === op_def.NodeType.ElementNodeType) {
        const rootMount = ele.rootMount;
        if (rootMount) {
          const _x = pointer.prevPosition.x - pointer.position.x;
          const _y = pointer.prevPosition.y - pointer.position.y;
          rootMount.updateMountPoint(ele, _x, _y);
          continue;
        }
        const result = this.sceneEditor.checkCollision(worldPos, ele.sprite);
        if (!result) {
          return;
        }
      }
      const pos = transitionGrid(worldPos.x, worldPos.y, this.sceneEditor.alignGrid, roomSize);
      ele.setPosition(pos.x, pos.y);
    }
  }
  getSelectedIDs() {
    return this.mSelecedElement.map((ele) => ele.id);
  }
  getSelecedElement() {
    return this.mSelecedElement || [];
  }
  registerGameobjectOver() {
    const scene = this.sceneEditor.getMainScene();
    if (!scene)
      return;
    const input = scene.input;
    input.on("gameobjectover", this.onGameobjectOverHandler, this);
    input.on("gameobjectout", this.onGameobjectOutHandler, this);
  }
  unregisterGameobjectOver() {
    const scene = this.sceneEditor.getMainScene();
    if (!scene)
      return;
    const input = scene.input;
    input.off("gameobjectover", this.onGameobjectOverHandler, this);
    input.off("gameobjectout", this.onGameobjectOutHandler, this);
    this.clearOverElement();
  }
  checkMount() {
    if (this.overElement) {
      this.mount();
    }
  }
  mount() {
    if (this.overElement) {
      for (const ele of this.mSelecedElement) {
        ele.mount(this.overElement, 0);
      }
    }
  }
  unmount() {
  }
  onGameobjectOverHandler(pointer, gameobject) {
    if (!this.selecting || !this.mStackElement) {
      return;
    }
    const id = gameobject.getData("id");
    if (this.mSelecedElement.length < 1) {
      return;
    }
    if (!id)
      return;
    const pool = this.sceneEditor.displayObjectPool.getPool("elements");
    if (!pool) {
      return;
    }
    this.overElement = pool.get(id.toString());
    if (this.overElement) {
      if (this.overElement.nodeType !== op_def.NodeType.ElementNodeType) {
        return;
      }
      this.overElement.selected();
      for (const ele of this.mSelecedElement) {
        if (this.overElement.id !== ele.id) {
          const rootMount = ele.rootMount;
          if (rootMount) {
            if (rootMount === this.overElement) {
              continue;
            } else {
              rootMount.unmount(ele);
              this.sceneEditor.elementManager.updateElements([rootMount.toSprite()]);
            }
          }
          this.overElement.mount(ele);
        }
      }
      this.sceneEditor.elementManager.updateElements([this.overElement.toSprite()]);
    }
  }
  onGameobjectOutHandler(pointer, gameobject) {
    this.clearOverElement();
  }
  clearOverElement() {
    if (!this.overElement)
      return;
    this.overElement.unselected();
    this.overElement = null;
  }
  get selecting() {
    return this.mSelecting;
  }
  set selecting(val) {
    if (this.mSelecting !== val) {
      this.mSelecting = val;
      if (this.mSelecedElement) {
        for (const ele of this.mSelecedElement) {
          val ? ele.disableInteractive() : ele.setInteractive();
        }
      }
      this.unregisterGameobjectOver();
      if (val)
        this.registerGameobjectOver();
    }
  }
  set stackElement(val) {
    this.mStackElement = val;
  }
}
