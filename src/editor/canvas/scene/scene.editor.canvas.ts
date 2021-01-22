import { AnimationsNode, Capsule, ElementNode, SceneNode, TerrainNode } from "game-capsule";
import { BaseCamerasManager, BaseDisplay, BaseFramesDisplay, BaseLayer, GroundLayer, IBaseDisplay, SurfaceLayer } from "base";
import { AnimationModel, IFramesModel } from "structure";
import { IPos, IPosition45Obj, load, Logger, LogicPos, Position45, Url } from "utils";
import { EditorCanvas, IEditorCanvasConfig } from "../editor.canvas";
import { LayerManager } from "base";
import { EditorFramesDisplay } from "./editor.frames.display";
import { EditorFactory } from "./factory";
import { transitionGrid } from "./check.bound";

export class SceneEditorCanvas extends EditorCanvas {
    private mSelecedElement: SelectedElementManager;
    private mCameraManager: BaseCamerasManager;
    private mRoomSize: IPosition45Obj;
    private mMiniRoomSize: IPosition45Obj;
    private mSceneNode: SceneNode;
    private mAlignGrid: boolean = true;
    private mElements: Map<number, EditorFramesDisplay>;
    private mStamp: MouseFollow;
    private mBrush: BrushEnum = BrushEnum.Select;
    private mFactory: EditorFactory;

    private mScene: Phaser.Scene;
    constructor(config: IEditorCanvasConfig) {
        super(config);
        Url.OSD_PATH = "https://osd-alpha.tooqing.com/";
        this.mElements = new Map();
        this.mFactory = new EditorFactory(this);
        this.mSelecedElement = new SelectedElementManager(this);
        this.mStamp = new MouseFollow(this);
        this.mGame.scene.add(SceneEditor.name, SceneEditor, true, this);
    }

    public create(scene: Phaser.Scene) {
        this.mScene = scene;
        if (!this.mSceneNode) {
            return;
        }
        this.init();
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
        this.init();
    }

    public changeBrushType() {
    }

    public changeStamp() {
    }

    public drawElement(element: ElementNode) {
        this.mSelecedElement.unselectedElements();
        this.mStamp.setDisplay(element);
        this.mBrush = BrushEnum.Fill;
    }

    public selectElement(id: number) {
        if (this.mBrush !== BrushEnum.Select) {
            return;
        }
        if (!this.mSelecedElement) {
            return;
        }
        const ele = this.mElements.get(id);
        if (!ele) {
            return;
        }
        this.mSelecedElement.selectElements([ele]);
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
        this.mStamp.setDisplay(terrain);
        this.mBrush = BrushEnum.Fill;
    }

    public removeTile() {
    }

    public toggleLayerVisible() {
    }

    public drawSpawnpoint() {
    }

    public toggleAlignWithGrid() {
        this.mAlignGrid = !this.mAlignGrid;
    }

    public showGrid() {
        if (!this.mScene) {
            return;
        }
        (<SceneEditor>this.mScene).drawGrid(this.mRoomSize);
    }

    public lookatLElement() {

    }

    private init() {
        this.mCameraManager = new BaseCamerasManager();
        const camera = this.mScene.cameras.main;
        this.mCameraManager.camera = camera;
        const { sceneWidth, sceneHeight } = this.mRoomSize;
        this.mCameraManager.setBounds(
            -camera.width - sceneWidth >> 1,
            -camera.height >> 1,
            sceneWidth + camera.width,
            sceneHeight + camera.height
        );
        this.mCameraManager.setScroll(this.mRoomSize.sceneWidth >> 1, 0);
        camera.setScroll(
            (-camera.width) >> 1,
            (sceneHeight - camera.height) >> 1
        );
        this.addListener();
        this.showGrid();

        const elements = this.mSceneNode.getElements();
        for (const ele of elements) {
            this.addElement(ele);
        }

        const terrains = this.mSceneNode.getTerrains();
        for (const terrain of terrains) {
            this.addTerrain(terrain);
        }

        this.initSkybox();
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
    }

    private onPointerDownHandler(pointer: Phaser.Input.Pointer) {
    }

    private onPointerMoveHandler(pointer: Phaser.Input.Pointer) {
        switch (this.mBrush) {
            case BrushEnum.Move:
                if (pointer.isDown) {
                    this.moveCameras(pointer.prevPosition.x - pointer.position.x, pointer.prevPosition.y - pointer.position.y);
                }
                break;
            case BrushEnum.Select:
                if (pointer.isDown && this.mSelecedElement) this.mSelecedElement.dragElement(pointer.worldX, pointer.worldY);
                break;
            case BrushEnum.Fill:
                this.mStamp.pointerMove(pointer.worldX, pointer.worldY);
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
        (<SceneEditor>this.mScene).layerManager.addToLayer("surfaceLayer", display);
    }

    private addTerrain(terrain: TerrainNode) {
        const display = this.factory.createFramesDisplay(terrain);
        const loc = terrain.location;
        const pos = Position45.transformTo90(loc, this.mRoomSize);
        display.setPosition(pos.x, pos.y);
        (<SceneEditor>this.mScene).layerManager.addToLayer("groundLayer", display);
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
}

class SceneEditor extends Phaser.Scene {
    public layerManager: LayerManager;
    public readonly LAYER_GROUND = "groundLayer";
    public readonly LAYER_MIDDLE = "middleLayer";
    public readonly LAYER_SURFACE = "surfaceLayer";
    public readonly LAYER_ATMOSPHERE = "atmosphere";
    public readonly SCENE_UI = "sceneUILayer";

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

        this.layerManager.addLayer(this, GroundLayer, this.LAYER_GROUND, 1);
        this.gridLayer = new GridLayer(this);
        this.sys.displayList.add(this.gridLayer);
        this.layerManager.addLayer(this, BaseLayer, this.LAYER_MIDDLE, 3);
        this.layerManager.addLayer(this, SurfaceLayer, this.LAYER_SURFACE, 4);
        this.layerManager.addLayer(this, BaseLayer, this.SCENE_UI, 5);

        this.sceneEditor.create(this);
    }

    update(time?: number, delta?: number) {
        this.layerManager.update(time, delta);
    }

    drawGrid(roomSize: IPosition45Obj, line: number = 1) {
        this.gridLayer.draw(roomSize, line);
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
    Move,
    Select,
    Fill,
    Eraser
}

class MouseFollow {
    private mDisplay: MouseDisplayContainer;
    private isTerrain: boolean = false;
    private isMoss: boolean;

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
            this.mSize--;
        } else {
            this.mSize++;
        }
        this.updatePos(pointer.worldX, pointer.worldY);
    }

    setDisplay(content: ElementNode | TerrainNode) {
        if (this.mDisplay) {
            this.mDisplay.destroy();
            this.mDisplay = null;
        }
        const scene = this.sceneEditor.scene;
        this.isTerrain = content.nodeType === 4 ? true : false;
        this.isMoss = content.isMoss;
        // this.key = content.key;
        // this.mSprite = new Sprite(content.sprite, content.nodeType);
        this.mDisplay = new MouseDisplayContainer(scene, this.sceneEditor);
        // const displayInfo = this.sceneEditor.factory.createFramesModel(content.animations);
        this.mDisplay.setDisplay(content, this.isTerrain ? this.mSize : 1);
        // this.mLayerManager.addToSceneToUI(this.mDisplay);
        (<SceneEditor>scene).layerManager.addToLayer("sceneUILayer", this.mDisplay);
    }

    showEraserArea() {
        if (this.mDisplay) {
            this.mDisplay.destroy();
        }
        this.mDisplay = new EraserArea(undefined, this.sceneEditor);
        this.mDisplay.setDisplay(null, this.mSize);
        this.isTerrain = true;
        // this.mLayerManager.addToSceneToUI(this.mDisplay);
    }

    pointerMove(x: number, y: number) {
        if (!this.mDisplay) {
            return;
        }
        this.updatePos(x, y);
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
        this.mDisplay.setPosition(pos.x, pos.y);
    }
}

class MouseDisplayContainer extends Phaser.GameObjects.Container {
    protected mOffset: IPos;
    protected mNodeType;
    protected mDisplays: BaseFramesDisplay[];
    protected mScaleRatio: number = 1;
    constructor(scene: Phaser.Scene, protected sceneEditor: SceneEditorCanvas) {
        super(scene);
        this.mOffset = { x: 0, y: 0 };
    }

    public setDisplay(element: ElementNode | TerrainNode, size: number) {
        this.clear();
        this.mDisplays = [];
        if (!element) {
            return;
        }
        this.mNodeType = element.nodeType;
        let frameDisplay: EditorFramesDisplay;
        const { tileWidth, tileHeight } = this.sceneEditor.roomSize;
        const roomSize = {
            tileWidth,
            tileHeight,
            rows: size,
            cols: size,
            sceneWidth: (size + size) * (tileWidth / 2),
            sceneHeight: (size + size) * (tileHeight / 2),
        };

        this.mOffset.x = 0;
        this.mOffset.y = -((roomSize.sceneHeight / this.mScaleRatio - (size % 2 === 0 ? 0 : tileHeight)) / 2);
        const animationName = element.animations.defaultAnimationName;

        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                // frameDisplay = new EditorFramesDisplay(this.scene, 0, this.sceneEditor);
                frameDisplay = this.sceneEditor.factory.createFramesDisplay(element);
                frameDisplay.setAlpha(0.8);
                frameDisplay.play({ name: animationName, flip: false });
                frameDisplay.selected();
                const pos = Position45.transformTo90(new LogicPos(i, j), roomSize);
                frameDisplay.x = pos.x;
                frameDisplay.y = pos.y;
                this.add(frameDisplay);
                this.mDisplays.push(frameDisplay);
            }
        }
    }

    protected clear() {

    }

    private onInitializedHandler() {
    }
}

class EraserArea extends MouseDisplayContainer {
    private area: Phaser.GameObjects.Graphics;
    constructor(scene: Phaser.Scene, sceneEditor: SceneEditorCanvas) {
        super(scene, sceneEditor);
    }

    setDisplay(frame, size: number) {
        if (this.area) {
            this.area.clear();
        }
        const { tileWidth, tileHeight } = this.sceneEditor.roomSize;
        const roomSize = {
            tileWidth,
            tileHeight,
            rows: size,
            cols: size,
            sceneWidth: (size + size) * (tileWidth / 2),
            sceneHeight: (size + size) * (tileHeight / 2),
        };

        this.mOffset.x = 0;
        this.mOffset.y = -((roomSize.sceneHeight - (size % 2 === 0 ? 0 : tileHeight)) / 2);
        let p1: LogicPos;
        let p2: LogicPos;
        let p3: LogicPos;
        let p4: LogicPos;
        this.area = this.scene.make.graphics(undefined, false);
        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                this.area.lineStyle(2, 0);
                p1 = Position45.transformTo90(new LogicPos(x, y), roomSize);
                p2 = Position45.transformTo90(new LogicPos(x + 1, y), roomSize);
                p3 = Position45.transformTo90(new LogicPos(x + 1, y + 1), roomSize);
                p4 = Position45.transformTo90(new LogicPos(x, y + 1), roomSize);
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
    public selecting: boolean = false;
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
        this.selecting = true;
    }

    unselectedElements() {
        if (!this.mSelecedElement || this.mSelecedElement.length < 1) {
            return;
        }
        for (const ele of this.mSelecedElement) {
            ele.unselected();
        }
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
            const pos = transitionGrid(x, y, this.sceneEditor.alignGrid, roomSize);
            ele.setPosition(pos.x, pos.y);
        }
    }
}
