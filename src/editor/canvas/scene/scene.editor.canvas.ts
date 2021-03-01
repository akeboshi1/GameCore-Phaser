import { Capsule, ElementNode, LayerEnum, MossNode, PaletteNode, SceneNode, TerrainNode } from "game-capsule";
import { op_def, op_client } from "pixelpai_proto";
import { IFramesModel, ISprite } from "structure";
import { IPos, IPosition45Obj, load, Logger, LogicPos, Position45, Url } from "utils";
import { EditorCanvas, IEditorCanvasConfig } from "../editor.canvas";
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
import { BaseFramesDisplay, BaseLayer, GroundLayer, IRender, LayerManager, SurfaceLayer } from "baseRender";
import { ElementStorage, Sprite } from "baseModel";
import * as protos from "pixelpai_proto";
import { PBpacket } from "net-socket-packet";
import { EditorSceneManger } from "./manager/scene.manager";
import { EditorWallManager } from "./manager/wall.manager";
for (const key in protos) {
    PBpacket.addProtocol(protos[key]);
}
export class SceneEditorCanvas extends EditorCanvas implements IRender {
    public displayObjectPool: DisplayObjectPool;
    private mSelecedElement: SelectedElementManager;
    private mCameraManager: EditorCamerasManager;
    private mRoomSize: IPosition45Obj;
    private mMiniRoomSize: IPosition45Obj;
    private mSceneNode: SceneNode;
    private mAlignGrid: boolean = true;
    private mElements: Map<number, EditorFramesDisplay>;
    private mStamp: MouseFollow;
    private mBrush: BrushEnum = BrushEnum.Select;
    private mFactory: EditorFactory;
    private mConnection: any;
    private mEditorPacket: EditorPacket;

    private mTerrainManager: EditorTerrainManager;
    private mMossManager: EditorMossManager;
    private mElementManager: EditorElementManager;
    private mWallManager: EditorWallManager;
    private mSkyboxManager: EditorSkyboxManager;
    private mSceneManager: EditorSceneManger;

    private mElementStorage: ElementStorage;

    private mScene: Phaser.Scene;
    constructor(config: IEditorCanvasConfig) {
        super(config);
        Url.OSD_PATH = "https://osd-alpha.tooqing.com/";
        this.mElements = new Map();
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
        this.mElementStorage = new ElementStorage();
        this.mGame.scene.add(SceneEditor.name, SceneEditor, true, this);
    }

    public update(time?: number, delta?: number) {
        this.mElementManager.update();
        this.mMossManager.update();
        this.mTerrainManager.update();
        this.mWallManager.update();
    }

    public create(scene: Phaser.Scene) {
        this.mScene = scene;
        if (this.mConfig.game_created) {
            this.mConfig.game_created.call(this);
        }
        // if (!this.mSceneNode) {
        //     return;
        // }
        // this.init();
    }

    public enableClick() {
        if (this.mScene) {
            this.mScene.input.enabled = true;
        }
    }

    public disableClick() {
        if (this.mScene) {
            this.mScene.input.enabled = false;
        }
    }

    public load(url: string) {
        load(this.mConfig.LOCAL_HOME_PATH + url, "arraybuffer").then((req: any) => {
            try {
                const capsule = new Capsule().deserialize(req.response);
            } catch {
                Logger.getInstance().error(`deserialize failed ${req.response}`);
            }
        });
    }

    public setSceneConfig(scene: SceneNode) {
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

    public changeBrushType(mode: string) {
        this.mBrush = <BrushEnum>mode;
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

    public changeStamp() {
    }

    public drawElement(element: ElementNode) {
        this.mSelecedElement.unselectedElements();
        this.mStamp.setSprite(element);
        this.mBrush = BrushEnum.Fill;
    }

    /**
     * @deprecated
     */
    public setSprite(content) {
        this.mStamp.setSprite(content);
    }

    public selectElement(id: number) {
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
        this.mSelecedElement.selectElements([ele]);
        this.mEditorPacket.sendFetch(this.mSelecedElement.getSelectedIDs(), op_def.NodeType.ElementNodeType, ele.isMoss);
    }

    public unselectElement() {
        if (!this.mSelecedElement) {
            return;
        }
        this.mSelecedElement.unselectedElements();
    }

    public updateElements() {
    }

    public deleteElement() {
        if (!this.mSelecedElement) {
            return;
        }
    }

    public duplicateElements() {
    }

    public drawTile(terrain: TerrainNode) {
        this.mSelecedElement.unselectedElements();
        this.mStamp.setSprite(terrain);
        this.mBrush = BrushEnum.Fill;
    }

    public removeTile() {
    }

    public toggleLayerVisible(visible: boolean) {
        if (visible) {
            this.showGrid();
        } else {
            (<SceneEditor>this.mScene).hideGrid();
        }
    }

    public drawSpawnpoint() {
    }

    public toggleAlignWithGrid(val: boolean) {
        // this.mAlignGrid = !this.mAlignGrid;
        this.mAlignGrid = val;
    }

    public showGrid() {
        if (!this.mScene) {
            return;
        }
        (<SceneEditor>this.mScene).drawGrid(this.mRoomSize);
    }

    public lookatLElement() {

    }

    public createElement() {
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

    public calcWallFlip(x: number, y: number) {
        const pos = Position45.transformTo45(new LogicPos(x, y), this.mRoomSize);
        if (this.mTerrainManager.existTerrain(pos.x, pos.y)) {
            if (!this.mTerrainManager.existTerrain(pos.x - 1, pos.y)) return true;
            if (!this.mTerrainManager.existTerrain(pos.x, pos.y - 1)) return false;
        } else {
            if (this.mTerrainManager.existTerrain(pos.x, pos.y + 1)) return false;
            if (this.mTerrainManager.existTerrain(pos.x + 1, pos.y)) return true;
        }
    }

    /**
     * @deprecated
     */
    public enter(scene: op_client.IScene) {
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

    onResize(width: number, height: number) {
    }

    fetchSprite(ids: number[], nodeType: op_def.NodeType) {
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
        this.selectElement(ids[0]);
                // this.selectedElement(displayObj.getDisplay());
        //     }
        // }
    }

    fetchScenery(id: number) {
        this.mSelecedElement.unselectedElements();
        this.mSkyboxManager.fetch(id);
    }

    setGameConfig(config: Capsule) {
        this.mElementStorage.setGameConfig(config);
    }

    updatePalette(palette: PaletteNode) {
        this.mElementStorage.updatePalette(palette);
    }

    updateMoss(moss: MossNode) {
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

    checkCollision(pos: IPos, sprite) {
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

    private init() {
        this.mCameraManager = new EditorCamerasManager(this);
        const camera = this.mScene.cameras.main;
        this.mCameraManager.camera = camera;
        const { sceneWidth, sceneHeight } = this.mRoomSize;
        this.mCameraManager.setBounds(
            -camera.width - sceneWidth >> 1,
            -camera.height >> 1,
            sceneWidth + camera.width,
            sceneHeight + camera.height
        );
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
    }

    private addListener() {
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

    private removeListener() {
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

    private onPointerUpHandler(pointer: Phaser.Input.Pointer) {
        if (this.mSelecedElement) this.mSelecedElement.selecting = false;
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

    private onPointerDownHandler(pointer: Phaser.Input.Pointer) {
        const key = this.mStamp.key;
        if (key) {
            const nodeType = this.mStamp.nodeType;
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
    }

    private onPointerMoveHandler(pointer: Phaser.Input.Pointer) {
        switch (this.mBrush) {
            case BrushEnum.Move:
                if (pointer.isDown) {
                    this.moveCameras(pointer.prevPosition.x - pointer.position.x, pointer.prevPosition.y - pointer.position.y);
                }
                break;
            case BrushEnum.Select:
                if (pointer.isDown) {
                    if (this.mSelecedElement) {
                        this.mSelecedElement.dragElement(pointer.prevPosition.x - pointer.position.x, pointer.prevPosition.y - pointer.position.y);
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
                if (pointer.isDown && this.mStamp.nodeType === op_def.NodeType.TerrainNodeType) {
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

    private moveCameras(x: number, y: number) {
        this.mCameraManager.offsetScroll(x, y);
    }

    private onGameobjectUpHandler(pointer: Phaser.Input.Pointer, gameobject: Phaser.GameObjects.GameObject) { }

    private onGameobjectDownHandler(pointer: Phaser.Input.Pointer, gameobject: Phaser.GameObjects.GameObject) {
        const id = gameobject.getData("id");
        if (id) {
            this.selectElement(id);
        }
    }

    private onWheelHandler(pointer: Phaser.Input.Pointer) {
        switch(this.mBrush) {
            case BrushEnum.Move:
            case BrushEnum.Select:
                // 缩放地图
                break;
            case BrushEnum.Eraser:
            case BrushEnum.BRUSH:
            case BrushEnum.Fill:
                this.mStamp.wheel(pointer);
                break;
        }
    }

    private addElement(element: ElementNode) {
        const display = this.factory.createFramesDisplay(element);
        const loc = element.location;
        display.setPosition(loc.x, loc.y);
        display.name = element.name;
        display.setInteractive();
        this.mElements.set(element.id, display);
        (<SceneEditor>this.mScene).layerManager.addToLayer(element.layer.toString(), display);
    }

    private addTerrain(terrain: TerrainNode) {
        const display = this.factory.createFramesDisplay(terrain);
        const loc = terrain.location;
        const pos = Position45.transformTo90(loc, this.mRoomSize);
        display.setPosition(pos.x, pos.y);
        (<SceneEditor>this.mScene).layerManager.addToLayer(terrain.layer.toString(), display);
    }

    private eraser(type: op_def.NodeType) {
        const positions = this.mStamp.getEaserPosition();
        if (type === op_def.NodeType.TerrainNodeType) {
            this.mTerrainManager.removeTerrains(positions);
        } else {
            this.mWallManager.removeWalls(positions);
        }
    }

    private initSkybox() {
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

    get emitter() {
        return this.mEmitter;
    }

    get sceneManager() {
        return this.mSceneManager;
    }
}

export class SceneEditor extends Phaser.Scene {
    public static LAYER_GROUND = LayerEnum.Terrain;
    public static LAYER_MIDDLE = "middleLayer";
    public static LAYER_FLOOR = LayerEnum.Floor;
    public static LAYER_SURFACE = LayerEnum.Surface;
    public static LAYER_WALL = LayerEnum.Wall;
    public static LAYER_ATMOSPHERE = "atmosphere";
    public static SCENE_UI = "sceneUILayer";
    public layerManager: LayerManager;

    private gridLayer: GridLayer;
    private sceneEditor: SceneEditorCanvas;
    constructor() {
        super({ key: "SceneEditor" });
    }

    preload() {
    }

    init(sceneEditor: SceneEditorCanvas) {
        this.sceneEditor = sceneEditor;
    }

    create() {
        this.layerManager = new LayerManager();
        this.sceneEditor.sceneManager.setMainScene(this);

        this.layerManager.addLayer(this, GroundLayer, SceneEditor.LAYER_WALL.toString(), 0);
        this.layerManager.addLayer(this, GroundLayer, SceneEditor.LAYER_GROUND.toString(), 1);
        this.gridLayer = new GridLayer(this);
        this.sys.displayList.add(this.gridLayer);
        this.layerManager.addLayer(this, BaseLayer, SceneEditor.LAYER_MIDDLE, 3);
        this.layerManager.addLayer(this, GroundLayer, SceneEditor.LAYER_FLOOR.toString(), 4);
        this.layerManager.addLayer(this, SurfaceLayer, SceneEditor.LAYER_SURFACE.toString(), 4);
        this.layerManager.addLayer(this, BaseLayer, SceneEditor.SCENE_UI, 5);

        this.sceneEditor.create(this);
    }

    update(time?: number, delta?: number) {
        if (this.sceneEditor) this.sceneEditor.update(time, delta);
        this.layerManager.update(time, delta);
    }

    drawGrid(roomSize: IPosition45Obj, line: number = 1) {
        this.gridLayer.draw(roomSize, line);
    }

    hideGrid() {
        this.gridLayer.clear();
    }
}

class GridLayer extends Phaser.GameObjects.Graphics {
    constructor(scene: Phaser.Scene) {
        super(scene);
    }

    public draw(roomSize: IPosition45Obj, line: number = 1, color: number = 0xFFFFFF, alpha?: number) {
        this.clear();
        if (!roomSize) return;
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

    private drawLine(startPos: LogicPos, endPos: LogicPos) {
        this.lineBetween(startPos.x, startPos.y, endPos.x, endPos.y);
    }
}

enum BrushEnum {
    Move = "move",
    Select = "select",
    Fill = "FILL",
    Eraser = "eraser",
    BRUSH = "brush",
    EraserWall = "eraserWall"
}

class MouseFollow {
    private mDisplay: MouseDisplayContainer;
    private isTerrain: boolean = false;
    private mNodeType: any;
    private mKey: number;
    private mSprite: Sprite;
    private mIsMoss: boolean;
    private mScaleRatio = 1;

    /**
     * 笔触大小
     */
    private mSize: number = 1;
    constructor(private sceneEditor: SceneEditorCanvas) {
    }

    wheel(pointer: Phaser.Input.Pointer) {
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

    /**
     * @deprecated
     */
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
        (<SceneEditor>scene).layerManager.addToLayer(SceneEditor.SCENE_UI, this.mDisplay);
    }

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

    showEraserArea() {
        if (this.mDisplay) {
            this.mDisplay.destroy();
        }
        const scene = this.sceneEditor.scene;
        this.mDisplay = new EraserArea(this.sceneEditor);
        this.mNodeType = op_def.NodeType.TerrainNodeType;
        this.mDisplay.setDisplay(null, this.mSize);
        this.isTerrain = true;
        (<SceneEditor>scene).layerManager.addToLayer(SceneEditor.SCENE_UI, this.mDisplay);
        // this.mLayerManager.addToSceneToUI(this.mDisplay);
    }

    pointerMove(x: number, y: number) {
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
        // const locs = this.mDisplay.displays.map((display) => this.getPosition(display.x, display.y));
        // return { locs, key: this.key };
        const displays = this.mDisplay.displays;
        const locs = [];
        let pos = null;
        for (const display of displays) {
            pos = this.getPosition(display.x, display.y);
            locs.push({
                ...pos,
                dir: display.runningAnimation.flip ? 5 : 3
            });
        }
        return { locs, key: this.key };
    }

    createSprites(): ISprite[] {
        if (!this.mSprite) {
            return;
        }
        const result = [];
        let sprite: ISprite = null;
        const displays = this.mDisplay.displays;
        for (const display of displays) {
            // deep clone
            sprite = Object.assign(Object.create(Object.getPrototypeOf(this.mSprite)), this.mSprite);
            sprite.newID();
            sprite.pos = this.getPosition(display.x, display.y);
            sprite.bindID = this.mSprite.id;
            sprite.sn = this.mSprite.sn;
            const ids = display.getMountIds();
            if (ids.length > 0) sprite.mountSprites = ids;
            // sprite.nodeType = this.mSprite.node
            result.push(sprite);
        }
        return result;
    }

    getEaserPosition(): IPos[] {
        const result: LogicPos[] = [];
        if (!this.mDisplay) {
            return;
        }
        let pos: LogicPos = null;
        for (let i = 0; i < this.mSize; i++) {
            for (let j = 0; j < this.mSize; j++) {
                pos = this.mDisplay.transformTo90(i, j);
                result.push(this.getPosition(pos.x, pos.y));
                // result.push(this.mRoomService.transformTo45(new Pos(i, j)));
            }
        }
        // result.push(this.getPosition());
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

    private updatePos(worldX: number, worldY: number) {
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

    private getPosition(rows: number = 0, cols: number = 0) {
        if (this.mNodeType === op_def.NodeType.TerrainNodeType || this.mNodeType === op_def.NodeType.WallNodeType) {
            const pos45 = Position45.transformTo45(
                new LogicPos(this.mDisplay.x / this.mScaleRatio + rows, this.mDisplay.y / this.mScaleRatio + cols),
                this.sceneEditor.roomSize);
            return pos45;
        }
        // TODO 多个物件仅支持地块
        const pos = new LogicPos(
            this.mDisplay.x / this.mScaleRatio + rows,
            this.mDisplay.y / this.mScaleRatio + cols,
            this.mDisplay.z
        );
        return pos;
    }

    get size() {
        return this.mSize;
    }

    set size(val: number) {
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
    protected mOffset: IPos;
    protected mNodeType;
    protected mDisplays: EditorFramesDisplay[];
    protected mScaleRatio: number = 1;
    protected mSprite: Sprite;
    protected mTileSize: IPosition45Obj;
    constructor(protected sceneEditor: SceneEditorCanvas) {
        super(sceneEditor.scene);
        this.mOffset = { x: 0, y: 0 };
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
    setDisplay(sprite: Sprite, size: number) {
        this.clear();
        this.mDisplays = [];
        this.mSprite = sprite;
        if (!sprite) {
            return;
        }
        const frame = <IFramesModel>sprite.displayInfo;
        this.mNodeType = sprite.nodeType;
        let frameDisplay: EditorFramesDisplay;
        const { tileWidth, tileHeight } = this.sceneEditor.roomSize;
        this.mTileSize = {
            tileWidth,
            tileHeight,
            rows: size,
            cols: size,
            sceneWidth: (size + size) * (tileWidth / 2),
            sceneHeight: (size + size) * (tileHeight / 2),
        };

        this.mOffset.x = 0;
        this.mOffset.y = -((this.mTileSize.sceneHeight / this.mScaleRatio - (size % 2 === 0 ? 0 : tileHeight)) / 2);

        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                frameDisplay = new EditorFramesDisplay(this.sceneEditor, sprite);
                frameDisplay.setAlpha(0.8);
                // frameDisplay.once("initialized", this.onInitializedHandler, this);
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

    public updatePosition(x?: number, y?: number, z?: number, w?: number) {
        this.setPosition(x + this.mOffset.x, y + this.mOffset.y, z, w);
        if (this.mNodeType === op_def.NodeType.WallNodeType) {
            for (const display of this.mDisplays) {
                const flip = this.sceneEditor.calcWallFlip(x, y);
                const ani = display.runningAnimation;
                if (flip !== undefined &&flip !== ani.flip) {
                    ani.flip = flip;
                    display.play(ani);
                }
            }
        }
    }

    transformTo90(row: number, col: number) {
        return Position45.transformTo90(new LogicPos(row, col), this.mTileSize);
    }

    transformTo45(x: number, y: number) {
        return Position45.transformTo45(new LogicPos(x, y), this.mTileSize);
    }

    protected clear() {
        this.removeAll(true);
        this.mDisplays = undefined;
    }

    get displays() {
        return this.mDisplays;
    }
}

class EraserArea extends MouseDisplayContainer {
    private area: Phaser.GameObjects.Graphics;
    constructor(sceneEditor: SceneEditorCanvas) {
        super(sceneEditor);
    }

    setDisplay(frame, size: number) {
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
            sceneHeight: (size + size) * (tileHeight / 2),
        };

        this.mOffset.x = 0;
        this.mOffset.y = -((this.mTileSize.sceneHeight - (size % 2 === 0 ? 0 : tileHeight)) / 2);
        let p1: LogicPos;
        let p2: LogicPos;
        let p3: LogicPos;
        let p4: LogicPos;
        this.mNodeType = op_def.NodeType.TerrainNodeType;
        this.area = this.scene.make.graphics(undefined, false);
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
    public mSelecting: boolean = false;
    public overElementID: number = null;
    public overElement: EditorFramesDisplay;
    private mSelecedElement: EditorFramesDisplay[];
    constructor(private sceneEditor: SceneEditorCanvas) {

    }

    selectElements(elements: EditorFramesDisplay[]) {
        this.unselectedElements();
        this.mSelecedElement = elements;
        if (elements.length < 1 ) {
            return;
        }
        for (const ele of elements) {
            ele.selected();
        }
        // this.registerGameobjectOver();
        this.selecting = true;
    }

    unselectedElements() {
        if (!this.mSelecedElement || this.mSelecedElement.length < 1) {
            return;
        }
        for (const ele of this.mSelecedElement) {
            ele.unselected();
        }
        // this.unregisterGameobjectOver();
        this.mSelecedElement.length = 0;
        this.selecting = false;
    }

    dragElement(x: number, y: number) {
        if (!this.mSelecedElement || this.mSelecedElement.length < 1) {
            return;
        }
        if (this.selecting === false) {
            return;
        }

        const roomSize = this.sceneEditor.miniRoomSize;
        for (const ele of this.mSelecedElement) {
            const _x = ele.x - x;
            const _y = ele.y - y;
            const elePos = ele.getPosition();
            if (ele.nodeType === op_def.NodeType.ElementNodeType) {
                if (ele.rootMount) {
                    ele.setPosition(_x, _y);
                    continue;
                }
                const result = this.sceneEditor.checkCollision(new LogicPos(_x, _y), ele.sprite);
                if (!result) {
                    return;
                }
            }
            // const pos = transitionGrid(elePos.x + x, elePos.y + y, this.sceneEditor.alignGrid, roomSize);
            ele.setPosition(_x, _y);
        }
    }

    getSelectedIDs() {
        return this.mSelecedElement.map((ele) => ele.id);
    }

    getSelecedElement() {
        return this.mSelecedElement || [];
    }

    public registerGameobjectOver() {
        const scene = this.sceneEditor.getMainScene();
        if (!scene) return;
        const input = scene.input;
        input.on("gameobjectover", this.onGameobjectOverHandler, this);
        input.on("gameobjectout", this.onGameobjectOutHandler, this);
    }

    public unregisterGameobjectOver() {
        const scene = this.sceneEditor.getMainScene();
        if (!scene) return;
        const input = scene.input;
        input.off("gameobjectover", this.onGameobjectOverHandler, this);
        input.off("gameobjectout", this.onGameobjectOutHandler, this);
    }

    public checkMount() {
        if (this.overElement) {
            this.mount();
        }
    }

    public mount() {
        if (this.overElement) {
            for (const ele of this.mSelecedElement) {
                ele.mount(this.overElement, 0);
            }
        }
    }

    public unmount() {
        // if (!this.overElement) {
        //     for (const ele of this.mSelecedElement) {
        //         ele.unmount();
        //     }
        // }
    }

    private onGameobjectOverHandler(pointer: Phaser.Input.Pointer, gameobject: Phaser.GameObjects.GameObject) {
        if (!this.selecting) {
            return;
        }
        const id = gameobject.getData("id");
        if (this.mSelecedElement.length < 1) {
            return;
        }
        if (!id) return;
        const pool = this.sceneEditor.displayObjectPool.getPool("elements");
        if (!pool) {
            return;
        }
        this.overElement = pool.get(id.toString());
        if (this.overElement) {
            this.overElement.selected();
            for (const ele of this.mSelecedElement) {
                this.overElement.mount(ele);
            }
        }
        this.sceneEditor.elementManager.updateElements([this.overElement.toSprite()]);
    }

    private onGameobjectOutHandler(pointer: Phaser.Input.Pointer, gameobject: Phaser.GameObjects.GameObject) {
        this.overElementID = null;
        if (this.overElement) {
            this.overElement.unselected();
            for (const ele of this.mSelecedElement) {
                this.overElement.unmount(ele);
                // ele.unmount(this.overElement);
            }
            this.overElement = null;
        }
    }

    get selecting() {
        return this.mSelecting;
    }

    set selecting(val: boolean) {
        this.mSelecting = val;
        this.unregisterGameobjectOver();
        if (val) this.registerGameobjectOver();
        for (const ele of this.mSelecedElement) {
            val ? ele.disableInteractive() : ele.setInteractive();
        }
    }

}
