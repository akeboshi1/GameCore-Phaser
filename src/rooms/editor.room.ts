import {IPosition45Obj, Position45} from "../utils/position45";
import {IRoomManager} from "./room.manager";
import {PBpacket} from "net-socket-packet";
import {op_client, op_def, op_editor, op_virtual_world} from "pixelpai_proto";
import {Logger} from "../utils/log";
import {Brush, BrushEnum} from "../const/brush";
import {IRoomService, Room} from "./room";
import {LayerManager} from "./layer/layer.manager";
import {ViewblockManager} from "./cameras/viewblock.manager";
import {EditScene} from "../scenes/edit";
import {MouseFollow} from "./editor/mouse.follow";
import {FramesDisplay} from "./display/frames.display";
import {TerrainDisplay} from "./display/terrain.display";
import {SelectedElement} from "./editor/selected.element";
import {DisplayObject} from "./display/display.object";
import {Pos} from "../utils/pos";
import {EditorElementManager} from "./element/editor.element.manager";
import {EditorTerrainManager} from "./terrain/editor.terrain.manager";
import {Element} from "./element/element";
import {ElementDisplay} from "./display/element.display";
import { DragonbonesDisplay } from "./display/dragonbones.display";

export interface EditorRoomService extends IRoomService {
    readonly brush: Brush;
    readonly miniSize: IPosition45Obj;

    transformToMini45(p: Pos): Pos;

    transformToMini90(p: Pos): Pos;

    removeSelected(): void;
}

export class EditorRoom extends Room implements EditorRoomService {
    protected mTerrainManager: EditorTerrainManager;
    protected mElementManager: EditorElementManager;
    private mBrush: Brush = new Brush(this);
    private mMouseFollow: MouseFollow;
    private mSelectedElementEffect: SelectedElement;
    private mNimiSize: IPosition45Obj;
    constructor(manager: IRoomManager) {
        super(manager);
        if (this.connection) {
            Logger.getInstance().log("this: ===>", this);
            this.connection.addPacketListener(this);
            this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_SET_EDITOR_MODE, this.onSetEditorModeHandler);
            this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_ALIGN_GRID, this.onAlignGridHandler);
            this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_VISIBLE_GRID, this.onVisibleGridHandler);
            this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_MOUSE_FOLLOW, this.onMouseFollowHandler);
            this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_MOUSE_SELECTED_SPRITE, this.onMouseFollowHandler);
            this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_FETCH_SPRITE, this.onFetchSpriteHandler);
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

        this.mTerainManager = new EditorTerrainManager(this);
        this.mElementManager = new EditorElementManager(this);
        this.mBlocks = new ViewblockManager(this.mCameraService);

        this.mWorld.game.scene.start(EditScene.name, { room: this });
    }

    public startPlay() {
        this.mScene = this.mWorld.game.scene.getScene(EditScene.name);
        this.mLayManager = new LayerManager(this);
        this.mLayManager.drawGrid(this);
        this.mScene.input.on("pointerdown", this.onPointerDownHandler, this);
        this.mScene.input.on("pointerup", this.onPointerUpHandler, this);
        this.mScene.input.on("gameobjectdown", this.onGameobjectUpHandler, this);
        this.mCameraService.camera = this.scene.cameras.main;
        const mainCameras = this.mScene.cameras.main;
        mainCameras.setBounds(-200, -200, this.mSize.sceneWidth + 400, this.mSize.sceneHeight + 400);

        this.connection.send(new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_SCENE_CREATED));
        this.mCameraService.centerCameas();
        // setTimeout(() => {
        //     this.mCameraService.syncToEditor();
        // }, 10);
        this.mScene.input.keyboard.on("keydown", this.onKeyDownHandler, this);
    }

    public destroy() {
        if (this.mWorld && this.mWorld.connection) {
            this.mWorld.connection.removePacketListener(this);
        }
        super.destroy();
    }

    public update(time: number, delta: number) {
        if (this.layerManager) this.layerManager.update(time, delta);
        if (this.mSelectedElementEffect) {
            this.mSelectedElementEffect.update();
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
        }
    }

    private moveCameras(pointer) {
        this.cameraService.offsetScroll(pointer.prevPosition.x - pointer.position.x, pointer.prevPosition.y - pointer.position.y);
    }

    private createElement() {
        if (!this.mMouseFollow.sprite) {
            return;
        }
        const elementManager = this.mMouseFollow.elementManager;
        if (elementManager) {
            const sprites = this.mMouseFollow.createSprites();
            if (sprites) {
                elementManager.add(sprites);
            }
        }
    }

    private eraserElement() {
        const terrainManager = <EditorTerrainManager> this.mTerainManager;
        if (terrainManager) {
            const positions = this.mMouseFollow.getEaserPosition();
            terrainManager.removeFormPositions(positions);
        }
    }

    private onSetEditorModeHandler(packet: PBpacket) {
        const mode: op_client.IOP_EDITOR_REQ_CLIENT_SET_EDITOR_MODE = packet.content;
        this.mBrush.mode = <BrushEnum> mode.mode;
        if (this.mMouseFollow) this.mMouseFollow.destroy();
        if (this.mBrush.mode !== BrushEnum.SELECT) {
            if (this.mSelectedElementEffect) {
                this.mSelectedElementEffect.destroy();
                this.mSelectedElementEffect = null;
            }
        }
        if (this.mBrush.mode === BrushEnum.ERASER) {
            if (!this.mMouseFollow) {
                this.mMouseFollow = new MouseFollow(this.mScene, this);
            }
            this.mMouseFollow.showEraserArea();
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
        const ids = content.ids;
        if (ids.length > 0) {
            const ele = this.elementManager.get(ids[0]);
            if (ele) {
                this.selectedElement(ele.getDisplay());
            }
        }
    }

    private addPointerMoveHandler() {
        this.mScene.input.on("pointermove", this.onPointerMoveHandler, this);
        this.mScene.input.on("gameout", this.onGameOutHandler, this);
    }

    private removePointerMoveHandler() {
        this.mScene.input.off("pointermove", this.onPointerMoveHandler, this);
        this.mScene.input.off("gameout", this.onGameOutHandler, this);
    }

    private onPointerDownHandler() {
        this.addPointerMoveHandler();
    }

    private onPointerUpHandler(pointer: Phaser.Input.Pointer) {
        this.removePointerMoveHandler();
        switch (this.brush.mode) {
            case BrushEnum.BRUSH:
                this.createElement();
                break;
            case BrushEnum.SELECT:
                if (pointer.downX !== pointer.upX && pointer.downY !== pointer.upY) {
                    if (this.mSelectedElementEffect) this.syncSprite(this.mSelectedElementEffect.display);
                }
                break;
            case BrushEnum.ERASER:
                this.eraserElement();
                break;
        }
    }

    private sendFetch(ids: number[], nodetype: op_def.NodeType) {
        if (!this.mSelectedElementEffect || !this.mSelectedElementEffect.display) {
            return;
        }
        const pkt: PBpacket = new PBpacket(op_editor.OPCODE._OP_CLIENT_REQ_EDITOR_FETCH_SPRITE);
        const content: op_editor.IOP_CLIENT_REQ_EDITOR_FETCH_SPRITE = pkt.content;
        content.ids = ids;
        content.nodeType = nodetype;
        this.connection.send(pkt);
        Logger.getInstance().log("fetch sprite", content);
    }

    private onGameobjectUpHandler(pointer, gameobject) {
        this.removePointerMoveHandler();
        const com = gameobject.parentContainer;
        if (!com) {
            return;
        }
        switch (this.mBrush.mode) {
            case BrushEnum.SELECT:
                const selected = this.selectedElement(com);
                if (selected) {
                    this.sendFetch([selected.element.id], op_def.NodeType.ElementNodeType);
                }
                break;
        }
    }

    private onGameOutHandler() {
        this.removePointerMoveHandler();
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
        this.mSelectedElementEffect.setElement(<FramesDisplay> com);
        return com;
    }

    private syncSprite(object: ElementDisplay) {
        if (!object) return;
        const ele = object.element;
        if (!ele) return;
        const pkt = new PBpacket(op_editor.OPCODE._OP_CLIENT_REQ_EDITOR_SYNC_SPRITE);
        const content: op_editor.IOP_CLIENT_REQ_EDITOR_SYNC_SPRITE = pkt.content;
        content.sprites = [ele.toSprite()];
        this.connection.send(pkt);
    }

    private onPointerMoveHandler(pointer) {
        if (!this.mScene.cameras) {
            return;
        }
        switch (this.mBrush.mode) {
            case BrushEnum.BRUSH:
                if (this.mMouseFollow.nodeType === op_def.NodeType.TerrainNodeType) {
                    this.createElement();
                }
                break;
            case BrushEnum.MOVE:
                this.moveCameras(pointer);
                break;
            case BrushEnum.SELECT:
                if (!this.mSelectedElementEffect) {
                    return;
                }
                if (!this.mouseFollow) {
                    return;
                }
                const pos = this.mMouseFollow.transitionGrid(pointer.worldX, pointer.worldY);
                if (pos) {
                    this.mSelectedElementEffect.setDisplayPos(pos.x, pos.y);
                    this.mLayManager.depthSurfaceDirty = true;
                }
                break;
            case BrushEnum.ERASER:
                this.eraserElement();
                break;
        }
    }

    private onKeyDownHandler(event) {
        if (!this.mSelectedElementEffect) {
            return;
        }
        switch (event.keyCode) {
            case 37:
            case 38:
            case 39:
            case 40:
                this.moveElement(event.keyCode);
                break;
            case 46:
                this.removeDisplay(this.mSelectedElementEffect.display);
                break;
        }
    }

    private moveElement(keyCode: number) {
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

    private removeDisplay(display: FramesDisplay | DragonbonesDisplay) {
        if (!display) {
            return;
        }
        if (!display.element) {
            return;
        }
        const ele = this.mElementManager.removeEditor(display.element.id);
        if (ele) {
            this.removeSelected();
        }
    }
}
