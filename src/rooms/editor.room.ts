import { IPosition45Obj, Position45 } from "../utils/position45";
import { IRoomManager } from "./room.manager";
import { PBpacket } from "net-socket-packet";
import { op_client, op_def, op_editor, op_virtual_world } from "pixelpai_proto";
import { Logger } from "../utils/log";
import { Brush, BrushEnum } from "../const/brush";
import { IRoomService, Room } from "./room";
import { RoomLayerManager } from "./layer/room.layer.manager";
import { EditScene } from "../scenes/edit";
import { MouseFollow } from "./editor/mouse.follow";
import { FramesDisplay } from "./display/frames.display";
import { TerrainDisplay } from "./display/terrain.display";
import { SelectedElement } from "./editor/selected.element";
import { DisplayObject } from "./display/display.object";
import { Pos } from "../utils/pos";
import { EditorElementManager } from "./element/editor.element.manager";
import { EditorTerrainManager } from "./terrain/editor.terrain.manager";
import { ElementDisplay } from "./display/element.display";
import { EditorCamerasManager } from "./cameras/editor.cameras.manager";
import { EditorMossManager } from "./element/editor.moss.manager";
import { DisplayObjectPool } from "./display-object.pool";
import { EditorSkyBoxManager } from "./sky.box/editor.sky.box.manager";
import { CamerasManager } from "./cameras/cameras.manager";

export interface EditorRoomService extends IRoomService {
    readonly brush: Brush;
    readonly miniSize: IPosition45Obj;
    displayObjectPool: DisplayObjectPool;

    transformToMini45(p: Pos): Pos;

    transformToMini90(p: Pos): Pos;

    removeSelected(): void;
}

export class EditorRoom extends Room implements EditorRoomService {
    public displayObjectPool: DisplayObjectPool;
    protected editorTerrainManager: EditorTerrainManager;
    protected editorElementManager: EditorElementManager;
    protected editorMossManager: EditorMossManager;
    protected editorSkyboxManager: EditorSkyBoxManager;

    private mBrush: Brush = new Brush(this);
    private mMouseFollow: MouseFollow;
    private mSelectedElementEffect: SelectedElement;
    private mNimiSize: IPosition45Obj;
    private mPointerDelta: Pos = null;

    constructor(manager: IRoomManager) {
        super(manager);
        if (this.connection) {
            this.connection.addPacketListener(this);
            this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_SET_EDITOR_MODE, this.onSetEditorModeHandler);
            this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_ALIGN_GRID, this.onAlignGridHandler);
            this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_VISIBLE_GRID, this.onVisibleGridHandler);
            this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_MOUSE_FOLLOW, this.onMouseFollowHandler);
            this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_MOUSE_SELECTED_SPRITE, this.onMouseFollowHandler);
            this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_FETCH_SPRITE, this.onFetchSpriteHandler);
            this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_FETCH_SCENERY, this.onFetchSceneryHandler);
        }
    }

    public enter(data: op_client.IScene) {
        if (!data) {
            Logger.getInstance().error("wrong room");
            return;
        }
        this.mID = data.id;

        let { rows, cols, tileWidth, tileHeight } = data;
        this.mSize = {
            cols,
            rows,
            tileHeight,
            tileWidth,
            sceneWidth: (rows + cols) * (tileWidth / 2),
            sceneHeight: (rows + cols) * (tileHeight / 2),
        };

        rows *= 2;
        cols *= 2;
        tileWidth /= 2;
        tileHeight /= 2;
        this.mNimiSize = {
            cols,
            rows,
            tileHeight,
            tileWidth,
            sceneWidth: (rows + cols) * (tileWidth / 2),
            sceneHeight: (rows + cols) * (tileHeight / 2),
        };

        this.editorTerrainManager = new EditorTerrainManager(this);
        this.editorElementManager = new EditorElementManager(this);
        this.editorMossManager = new EditorMossManager(this);
        this.editorSkyboxManager = new EditorSkyBoxManager(this);
        this.mCameraService = new EditorCamerasManager(this);
        this.displayObjectPool = new DisplayObjectPool();

        // this.mWorld.game.scene.start(EditScene.name, { room: this });
        this.mWorld.game.scene.add(EditScene.name, EditScene, true, { room: this });
    }

    public startPlay() {
        this.mScene = this.mWorld.game.scene.getScene(EditScene.name);
        this.mLayManager = new RoomLayerManager(this);
        this.mLayManager.drawGrid(this);
        const camera = this.scene.cameras.main;
        this.mCameraService.camera = camera;
        const zoom = this.world.scaleRatio;
        // mainCameras.setBounds(-200, -200, this.mSize.sceneWidth + 400, this.mSize.sceneHeight + 400);
        this.mCameraService.setBounds(
            -camera.width >> 1,
            -camera.height >> 1,
            this.mSize.sceneWidth * zoom + camera.width,
            this.mSize.sceneHeight * zoom + camera.height
        );

        this.connection.send(new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_SCENE_CREATED));
        this.mCameraService.centerCameas();

        this.mScene.input.on("pointerdown", this.onPointerDownHandler, this);
        this.mScene.input.on("pointerup", this.onPointerUpHandler, this);
        this.mScene.input.on("gameobjectdown", this.onGameobjectDownHandler, this);
        this.mScene.input.on("gameout", this.onGameOutHandler, this);
        this.mScene.input.keyboard.on("keydown", this.onKeyDownHandler, this);

        // this.addSkyBox();
    }

    public destroy() {
        if (this.mWorld && this.mWorld.connection) {
            this.mWorld.connection.removePacketListener(this);
        }
        if (this.editorTerrainManager) {
            this.editorTerrainManager.destroy();
        }
        if (this.editorMossManager) {
            this.editorMossManager.destroy();
        }
        if (this.editorElementManager) {
            this.editorElementManager.destroy();
        }
        if (this.displayObjectPool) {
            this.displayObjectPool.destroy();
        }
        if (this.editorSkyboxManager) {
            this.editorSkyboxManager.destroy();
        }
        super.destroy();
    }

    public update(time: number, delta: number) {
        if (this.layerManager) this.layerManager.update(time, delta);
        if (this.mSelectedElementEffect) {
            this.mSelectedElementEffect.update();
        }
        if (this.editorTerrainManager) {
            this.editorTerrainManager.update();
        }
        if (this.editorMossManager) {
            this.editorMossManager.update();
        }
        if (this.editorElementManager) {
            this.editorElementManager.update();
        }
    }

    transformToMini90(p: Pos): undefined | Pos {
        if (!this.mNimiSize) {
            Logger.getInstance().error("position object is undefined");
            return;
        }
        return Position45.transformTo90(p, this.mNimiSize);
    }

    transformToMini45(p: Pos): undefined | Pos {
        if (!this.mNimiSize) {
            Logger.getInstance().error("position object is undefined");
            return;
        }
        return Position45.transformTo45(p, this.mNimiSize);
    }

    removeSelected() {
        if (this.mSelectedElementEffect) {
            this.mSelectedElementEffect.remove();
            this.mPointerDelta = null;
        }
    }

    protected addPointerMoveHandler() {
        this.mScene.input.on("pointermove", this.onPointerMoveHandler, this);
    }

    protected removePointerMoveHandler() {
        this.mScene.input.off("pointermove", this.onPointerMoveHandler, this);
    }

    protected addPointerDownHandler() {
        this.mScene.input.on("pointerdown", this.onPointerDownHandler, this);
    }
    protected removePointerDownHandler() {
        this.mScene.input.off("pointerdown", this.onPointerDownHandler, this);
    }

    protected addPointerUpHandler() {
        this.mScene.input.on("pointerup", this.onPointerUpHandler, this);
    }
    protected removePointerUpHandler() {
        this.mScene.input.off("pointerup", this.onPointerUpHandler, this);
    }

    protected addGameObjectDownHandler() {
        this.mScene.input.on("gameobjectdown", this.onGameobjectDownHandler, this);
    }
    protected removeGameObjectDownHandler() {
        this.mScene.input.off("gameobjectdown", this.onGameobjectDownHandler, this);
    }

    protected addKeydownHandler() {
        this.mScene.input.keyboard.on("keydown", this.onKeyDownHandler, this);
    }

    protected removeKeydownHandler() {
        this.mScene.input.keyboard.off("keydown", this.onKeyDownHandler, this);
    }

    protected onPointerDownHandler() {
        const nodeType = this.mouseFollow.nodeType;

        if (this.mouseFollow.key) {
            if (nodeType === op_def.NodeType.TerrainNodeType) {
                if (!this.world.elementStorage.getTerrainPalette(this.mouseFollow.key)) {
                    this.reqEditorSyncPaletteOrMoss(this.mouseFollow.key, this.mouseFollow.nodeType);
                }
            } else if (nodeType === op_def.NodeType.ElementNodeType) {
                if (!this.world.elementStorage.getMossPalette(this.mouseFollow.key)) {
                    this.reqEditorSyncPaletteOrMoss(this.mouseFollow.key, this.mouseFollow.nodeType);
                }
            }
        }

        this.addPointerMoveHandler();
    }

    protected onPointerUpHandler(pointer: Phaser.Input.Pointer) {
        this.removePointerMoveHandler();
        switch (this.brush.mode) {
            case BrushEnum.BRUSH:
                this.createElements();
                break;
            case BrushEnum.SELECT:
                if (this.mSelectedElementEffect && this.mSelectedElementEffect.selecting) {
                    if (pointer.downX !== pointer.upX && pointer.downY !== pointer.upY) {
                        if (this.mSelectedElementEffect.sprite.isMoss) {
                            this.editorMossManager.updateMosses([this.mSelectedElementEffect]);
                        } else {
                            const sprite = (this.mSelectedElementEffect
                                .display as ElementDisplay).element.model.toSprite();
                            this.editorElementManager.updateElements([sprite]);
                        }
                    }
                    this.mSelectedElementEffect.selecting = false;
                    this.mPointerDelta = null;
                }
                break;
            case BrushEnum.ERASER:
                this.eraserTerrains();
                break;
            case BrushEnum.MOVE:
                this.mCameraService.syncCameraScroll();
                break;
        }
    }

    protected onPointerMoveHandler(pointer) {
        if (!this.mScene.cameras) {
            return;
        }
        switch (this.mBrush.mode) {
            case BrushEnum.BRUSH:
                if (this.mMouseFollow.nodeType === op_def.NodeType.TerrainNodeType) {
                    this.createElements();
                }
                break;
            case BrushEnum.MOVE:
                this.moveCameras(pointer);
                break;
            case BrushEnum.SELECT:
                if (this.editorSkyboxManager) {
                    this.editorSkyboxManager.move(pointer);
                }
                this.moveElement(pointer);
                break;
            case BrushEnum.ERASER:
                this.eraserTerrains();
                break;
        }
    }

    private moveCameras(pointer) {
        this.cameraService.offsetScroll(
            pointer.prevPosition.x - pointer.position.x,
            pointer.prevPosition.y - pointer.position.y
        );
    }

    private reqEditorSyncPaletteOrMoss(key: number, nodeType: op_def.NodeType) {
        const pkt = new PBpacket(op_editor.OPCODE._OP_CLIENT_REQ_EDITOR_SYNC_PALETTE_MOSS);
        const content: op_editor.OP_CLIENT_REQ_EDITOR_SYNC_PALETTE_MOSS = pkt.content;
        content.key = key;
        content.type = nodeType;
        this.connection.send(pkt);
    }

    private createElements() {
        if (!this.mMouseFollow.sprite) {
            return;
        }

        if (this.mMouseFollow.nodeType === op_def.NodeType.TerrainNodeType) {
            const terrainCoorData = this.mMouseFollow.createTerrainsOrMossesData();
            if (this.editorTerrainManager) {
                this.editorTerrainManager.addTerrains(terrainCoorData);
            }
        } else if (this.mMouseFollow.nodeType === op_def.NodeType.ElementNodeType) {
            const sprites = this.mMouseFollow.createSprites();
            if (!sprites) {
                return;
            }
            if (!this.editorElementManager) {
                return;
            }
            if (this.mMouseFollow.isMoss) {
                const mossesCoorData = this.mMouseFollow.createTerrainsOrMossesData();
                this.editorMossManager.addMosses(mossesCoorData);
            } else {
                this.editorElementManager.addElements(sprites);
            }
        } else if (this.mMouseFollow.nodeType === op_def.NodeType.SpawnPointType) {
            const sprites = this.mMouseFollow.createSprites();
            this.editorElementManager.addElements(sprites);
        }
    }

    private eraserTerrains() {
        const positions = this.mMouseFollow.getEaserPosition();
        this.editorTerrainManager.removeTerrains(positions);
    }

    private onSetEditorModeHandler(packet: PBpacket) {
        const mode: op_client.IOP_EDITOR_REQ_CLIENT_SET_EDITOR_MODE = packet.content;
        this.mBrush.mode = <BrushEnum>mode.mode;
        if (this.mMouseFollow) this.mMouseFollow.destroy();

        if (this.mBrush.mode !== BrushEnum.SELECT) {
            if (this.mSelectedElementEffect) {
                this.mSelectedElementEffect.destroy();
                this.mSelectedElementEffect = null;
                this.mPointerDelta = null;
            }
        }

        if (this.mBrush.mode === BrushEnum.SELECT) {
            this.removeGameObjectDownHandler();
            this.addGameObjectDownHandler();
        } else {
            this.removeGameObjectDownHandler();
        }

        if (this.mBrush.mode === BrushEnum.ERASER) {
            if (!this.mMouseFollow) {
                this.mMouseFollow = new MouseFollow(this.mScene, this);
            }
            this.mMouseFollow.showEraserArea();
        }
        if (this.editorSkyboxManager) {
            this.editorSkyboxManager.removeSelect();
        }

        this.layerManager.setSurfaceInteractive(this.mBrush.mode !== BrushEnum.ERASER);
    }

    private onAlignGridHandler(packet: PBpacket) {
        const content: op_client.IOP_EDITOR_REQ_CLIENT_ALIGN_GRID = packet.content;
        this.mouseFollow.alignGrid = content.align;
    }

    private onVisibleGridHandler(packet: PBpacket) {
        const content: op_client.IOP_EDITOR_REQ_CLIENT_VISIBLE_GRID = packet.content;
        this.layerManager.setGridVisible(content.visible);
    }

    private onMouseFollowHandler(packet: PBpacket) {
        const content: op_client.IOP_EDITOR_REQ_CLIENT_MOUSE_SELECTED_SPRITE = packet.content;
        if (this.mScene) {
            this.mouseFollow.setDisplay(content);
        }
    }

    private onFetchSpriteHandler(packet: PBpacket) {
        const content: op_client.IOP_EDITOR_REQ_CLIENT_FETCH_SPRITE = packet.content;
        const { ids, nodeType } = content;

        const map = {
            [op_def.NodeType.SpawnPointType]: "elements",
            [op_def.NodeType.ElementNodeType]: "elements",
            [op_def.NodeType.MossCollectionType]: "mosses",
        };

        for (const id of ids) {
            const poolName = map[nodeType];
            const pool = this.displayObjectPool.getPool(poolName);
            const displayObj = pool.get(id.toString());
            if (displayObj) {
                this.selectedElement(displayObj.getDisplay());
            }
        }
    }

    private sendFetch(ids: number[], nodetype: op_def.NodeType, isMoss?: boolean) {
        if (!this.mSelectedElementEffect || !this.mSelectedElementEffect.display) {
            return;
        }
        const pkt: PBpacket = new PBpacket(op_editor.OPCODE._OP_CLIENT_REQ_EDITOR_FETCH_SPRITE);
        const content: op_editor.IOP_CLIENT_REQ_EDITOR_FETCH_SPRITE = pkt.content;
        content.ids = ids;
        content.isMoss = isMoss;
        content.nodeType = nodetype;
        this.connection.send(pkt);
        Logger.getInstance().log("fetch sprite", content);
    }

    private onFetchSceneryHandler(packet: PBpacket) {
        if (this.mSelectedElementEffect) {
            this.mSelectedElementEffect.destroy();
            this.mSelectedElementEffect = null;
            this.mPointerDelta = null;
        }
        if (!this.editorSkyboxManager) {
            return;
        }
        const content: op_client.IOP_EDITOR_REQ_CLIENT_FETCH_SCENERY = packet.content;
        this.editorSkyboxManager.fetch(content.id);
    }

    private onGameobjectDownHandler(pointer, gameobject) {
        const com = gameobject.parentContainer;
        if (!com) {
            return;
        }

        const selected = this.selectedElement(com);
        if (selected) {
            this.sendFetch([selected.element.id], op_def.NodeType.ElementNodeType, selected.element.model.isMoss);
        }
    }

    private selectedElement(com: ElementDisplay): DisplayObject {
        if (!(com instanceof DisplayObject)) {
            return;
        }
        if (com instanceof TerrainDisplay) {
            return;
        }
        if (!this.mSelectedElementEffect) {
            this.mSelectedElementEffect = new SelectedElement(this.mScene, this.layerManager);
        }
        this.mSelectedElementEffect.setElement(<FramesDisplay>com);
        if (this.editorSkyboxManager) {
            this.editorSkyboxManager.removeSelect();
        }
        return com;
    }

    private onKeyDownHandler(event) {
        if (this.editorSkyboxManager) {
            this.editorSkyboxManager.keyboardMove(event.keyCode);
        }
        if (!this.mSelectedElementEffect) {
            return;
        }
        switch (event.keyCode) {
            case 37:
            case 38:
            case 39:
            case 40:
            case 65:
            case 87:
            case 83:
            case 68:
                this.keyboardMoveElement(event.keyCode);
                break;
            // case 8:
            // case 46:
            //     this.removeDisplay(this.mSelectedElementEffect);
            //     break;
        }
    }

    private keyboardMoveElement(keyCode: number) {
        const display = this.mSelectedElementEffect.display;
        if (!display) {
            return;
        }
        const pos = new Pos(display.x, display.y, display.z);
        switch (keyCode) {
            case 37:
                pos.x--;
                break;
            case 38:
                pos.y--;
                break;
            case 39:
                pos.x++;
                break;
            case 40:
                pos.y++;
                break;
        }
        display.setPosition(pos.x, pos.y, pos.z);
        // TOOD 通过统一接口设置depth
        this.layerManager.depthSurfaceDirty = true;
    }

    private moveElement(pointer: Phaser.Input.Pointer) {
        if (!this.mSelectedElementEffect) {
            return;
        }
        if (!this.mSelectedElementEffect.selecting) {
            return;
        }
        if (!this.mouseFollow) {
            return;
        }
        if (!this.mSelectedElementEffect.display) {
            return;
        }

        if (!this.mPointerDelta) {
            const matrix = new Phaser.GameObjects.Components.TransformMatrix();
            const parentMatrix = new Phaser.GameObjects.Components.TransformMatrix();
            this.mSelectedElementEffect.display.getWorldTransformMatrix(matrix, parentMatrix);

            this.mPointerDelta = new Pos(
                matrix.tx - pointer.worldX,
                matrix.ty - pointer.worldY
            );
        }
        const elementWorldPos = new Pos(this.mPointerDelta.x + pointer.worldX, this.mPointerDelta.y + pointer.worldY);

        const gridPos = this.mMouseFollow.transitionGrid(
            elementWorldPos.x / this.mScaleRatio,
            elementWorldPos.y / this.mScaleRatio
        );
        if (gridPos) {
            if (gridPos.x !== this.mSelectedElementEffect.display.x || gridPos.y !== this.mSelectedElementEffect.display.y) {
                this.mSelectedElementEffect.setDisplayPos(gridPos.x, gridPos.y);
                this.mLayManager.depthSurfaceDirty = true;
            }
        }
    }

    get brush(): Brush {
        return this.mBrush;
    }

    get miniSize(): IPosition45Obj {
        return this.mNimiSize;
    }

    private get mouseFollow(): MouseFollow {
        if (!this.mMouseFollow) {
            this.mMouseFollow = new MouseFollow(this.mScene, this);
        }
        return this.mMouseFollow;
    }

    private removeDisplay(element: SelectedElement) {
        if (element.sprite.isMoss) {
            this.editorMossManager.deleteMosses([element.sprite.id]);
        } else {
            this.editorElementManager.deleteElements([element.sprite.id]);
        }
        this.removeSelected();
    }
}
