/// <reference types="tooqinggamephaser" />
import { Capsule, ElementNode, LayerEnum, MossNode, PaletteNode, SceneNode, TerrainNode } from "game-capsule";
import { op_def, op_client } from "pixelpai_proto";
import { IPos, IPosition45Obj } from "structure";
import { EditorCanvas, IEditorCanvasConfig } from "../editor.canvas";
import { EditorFactory } from "./factory";
import { DisplayObjectPool } from "./display.object.pool";
import { EditorMossManager } from "./manager/moss.manager";
import { EditorElementManager } from "./manager/element.manager";
import { EditorCamerasManager } from "./manager/cameras.manager";
import { IRender, LayerManager } from "baseRender";
import { ElementStorage } from "baseGame";
import { EditorSceneManger } from "./manager/scene.manager";
export declare class SceneEditorCanvas extends EditorCanvas implements IRender {
    displayObjectPool: DisplayObjectPool;
    private mSelecedElement;
    private mCameraManager;
    private mRoomSize;
    private mMiniRoomSize;
    private mSceneNode;
    private mAlignGrid;
    private mElements;
    private mStamp;
    private mBrush;
    private mFactory;
    private mConnection;
    private mEditorPacket;
    private mTerrainManager;
    private mMossManager;
    private mElementManager;
    private mWallManager;
    private mSkyboxManager;
    private mSceneManager;
    private mElementStorage;
    private mScene;
    constructor(config: IEditorCanvasConfig);
    update(time?: number, delta?: number): void;
    create(scene: Phaser.Scene): void;
    enableClick(): void;
    disableClick(): void;
    load(url: string): void;
    setSceneConfig(scene: SceneNode): void;
    changeBrushType(mode: string): void;
    changeStamp(): void;
    drawElement(element: ElementNode): void;
    /**
     * @deprecated
     */
    setSprite(content: any): void;
    selectElement(id: number, selecting?: boolean): void;
    unselectElement(): void;
    updateElements(): void;
    deleteElement(): void;
    duplicateElements(): void;
    drawTile(terrain: TerrainNode): void;
    removeTile(): void;
    toggleLayerVisible(visible: boolean): void;
    drawSpawnpoint(): void;
    toggleAlignWithGrid(val: boolean): void;
    showGrid(): void;
    lookatLElement(): void;
    createElement(): void;
    calcWallFlip(x: number, y: number): boolean;
    /**
     * @deprecated
     */
    enter(scene: op_client.IScene): void;
    toggleStackElement(val: boolean): void;
    onResize(width: number, height: number): void;
    fetchSprite(ids: number[], nodeType: op_def.NodeType): void;
    fetchScenery(id: number): void;
    setGameConfig(config: Capsule): void;
    updatePalette(palette: PaletteNode): void;
    updateMoss(moss: MossNode): void;
    getCurrentRoomSize(): IPosition45Obj;
    getCurrentRoomMiniSize(): IPosition45Obj;
    getMainScene(): Phaser.Scene;
    checkCollision(pos: IPos, sprite: any): boolean;
    destroy(): void;
    private init;
    private addListener;
    private removeListener;
    private onPointerUpHandler;
    private onPointerDownHandler;
    private onPointerMoveHandler;
    private moveCameras;
    private onGameobjectUpHandler;
    private onGameobjectDownHandler;
    private onWheelHandler;
    private addElement;
    private addTerrain;
    private eraser;
    private initSkybox;
    get alignGrid(): boolean;
    get roomSize(): IPosition45Obj;
    get miniRoomSize(): IPosition45Obj;
    get scene(): Phaser.Scene;
    get factory(): EditorFactory;
    get elementStorage(): ElementStorage;
    get connection(): any;
    get camerasManager(): EditorCamerasManager;
    get game(): Phaser.Game;
    get scaleRatio(): number;
    get elementManager(): EditorElementManager;
    get mossManager(): EditorMossManager;
    get emitter(): Phaser.Events.EventEmitter;
    get sceneManager(): EditorSceneManger;
}
export declare class SceneEditor extends Phaser.Scene {
    static LAYER_GROUND: LayerEnum;
    static LAYER_MIDDLE: string;
    static LAYER_FLOOR: LayerEnum;
    static LAYER_SURFACE: LayerEnum;
    static LAYER_WALL: LayerEnum;
    static LAYER_ATMOSPHERE: string;
    static SCENE_UI: string;
    layerManager: LayerManager;
    private gridLayer;
    private sceneEditor;
    constructor();
    preload(): void;
    init(sceneEditor: SceneEditorCanvas): void;
    create(): void;
    update(time?: number, delta?: number): void;
    drawGrid(roomSize: IPosition45Obj, line?: number): void;
    hideGrid(): void;
}
