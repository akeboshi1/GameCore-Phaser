import {IPosition45Obj, Position45} from "../utils/position45";
import {IRoomManager} from "./room.manager";
import {PBpacket} from "net-socket-packet";
import {op_client, op_editor, op_virtual_world, op_def} from "pixelpai_proto";
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

export interface EditorRoomService extends IRoomService {
    readonly brush: Brush;
    readonly miniSize: IPosition45Obj;

    transformToMini45(p: Pos): Pos;

    transformToMini90(p: Pos): Pos;
}

export class EditorRoom extends Room implements EditorRoomService {
    private mBrush: Brush = new Brush(this);
    private mMouseFollow: MouseFollow;
    private mSelectedElementEffect: SelectedElement;
    private mSelectedObject: DisplayObject;
    private mNimiSize: IPosition45Obj;
    constructor(manager: IRoomManager) {
        super(manager);
        if (this.connection) {
            this.connection.addPacketListener(this);
            this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_SET_EDITOR_MODE, this.onSetEditorModeHandler);
            this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_ALIGN_GRID, this.onAlignGridHandler);
            this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_VISIBLE_GRID, this.onVisibleGridHandler);
            this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_MOUSE_FOLLOW, this.onMouseFollowHandler);
            this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_MOUSE_SELECTED_SPRITE, this.onMouseFollowHandler);
        }
    }

    public enter(data: op_client.IScene) {
        if (!data) {
            Logger.error("wrong room");
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

        this.mWorld.game.scene.start(EditScene.name, {
            room: this,
            callBack: () => {
                this.mScene = this.mWorld.game.scene.getScene(EditScene.name);
                this.mLayManager = new LayerManager(this);
                this.mLayManager.drawGrid(this);
                this.mScene.input.on("pointerdown", this.onPointerDownHandler, this);
                this.mScene.input.on("pointerup", this.onPointerUpHandler, this);
                this.mScene.input.on("gameobjectup", this.onGameobjectUpHandler, this);
                const mainCameras = this.mScene.cameras.main;
                mainCameras.setBounds(-200, -200, this.mSize.sceneWidth + 400, this.mSize.sceneHeight + 400);

                this.connection.send(new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_SCENE_CREATED));
            }
        });
    }

    public destroy() {
        if (this.mWorld && this.mWorld.connection) {
            this.mWorld.connection.removePacketListener(this);
        }
        super.destroy();
    }

    public update(time: number, delta: number) {
        if (this.layerManager) this.layerManager.update(time, delta);
    }

    transformToMini90(p: Pos): undefined | Pos {
        if (!this.mNimiSize) {
            Logger.error("position object is undefined");
            return;
        }
        return Position45.transformTo90(p, this.mNimiSize);
    }

    transformToMini45(p: Pos): undefined | Pos {
        if (!this.mNimiSize) {
            Logger.error("position object is undefined");
            return;
        }
        return Position45.transformTo45(p, this.mNimiSize);
    }

    private moveCameras(pointer) {
        // TODO 在Cameras里面处理镜头移动
        const camera = this.mScene.cameras.main;
        camera.scrollX += pointer.prevPosition.x - pointer.position.x;
        camera.scrollY += pointer.prevPosition.y - pointer.position.y;

        this.syncCameras();
    }

    private createElement() {
        if (!this.mMouseFollow.sprite) {
            return;
        }
        Logger.log("create element");
        const elementManager = this.mMouseFollow.elementManager;
        if (elementManager) {
            const sprites = this.mMouseFollow.createSprites();
            if (sprites) {
                elementManager.add(sprites);
            }
        }
    }

    private onSetEditorModeHandler(packet: PBpacket) {
        const mode: op_client.IOP_EDITOR_REQ_CLIENT_SET_EDITOR_MODE = packet.content;
        this.mBrush.mode = <BrushEnum> mode.mode;
        if (this.mMouseFollow) this.mMouseFollow.destroy();
        if (this.mSelectedElementEffect) this.mSelectedElementEffect.remove();
        if (this.mSelectedObject) {
            this.mSelectedObject.hideRefernceArea();
            this.mSelectedObject = undefined;
        }
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

    private onPointerDownHandler() {
        this.mScene.input.on("pointermove", this.onPointerMoveHandler, this);
        this.mScene.input.on("gameobjectover", this.onGameobjectOverHandler, this);
    }

    private onPointerUpHandler(pointer: Phaser.Input.Pointer) {
        this.mScene.input.off("pointermove", this.onPointerMoveHandler, this);
        this.mScene.input.off("gameobjectover", this.onGameobjectOverHandler, this);
        switch (this.brush.mode) {
            case BrushEnum.BRUSH:
                this.createElement();
                break;
            case BrushEnum.SELECT:
                if (pointer.downX !== pointer.upX && pointer.downY !== pointer.upY) {
                    this.syncSprite(this.mSelectedObject);
                }
                break;
        }
    }

    private syncCameras() {
        if (!this.connection) return;
        if (!this.mScene || this.mScene.cameras) return;
        const cameraView = this.mScene.cameras.main.worldView;
        const pkt = new PBpacket(op_editor.OPCODE._OP_CLIENT_REQ_EDITOR_RESET_CAMERA);
        const content: op_editor.IOP_CLIENT_REQ_EDITOR_RESET_CAMERA = pkt.content;
        content.x = cameraView.x;
        content.y = cameraView.y;
        content.width = cameraView.width;
        content.height = cameraView.height;
        this.connection.send(pkt);
    }

    private onGameobjectUpHandler(pointer, gameobject) {
        const com = gameobject.parentContainer;
        if (!com) {
            return;
        }
        switch (this.mBrush.mode) {
            case BrushEnum.SELECT:
                this.selectedElement(com);
                break;
            case BrushEnum.ERASER:
                this.removeElement(com);
                break;
        }
    }

    private onGameobjectOverHandler(pointer, gameobject) {
        const com = gameobject.parentContainer;
        if (!com) {
            return;
        }
        switch (this.mBrush.mode) {
            case BrushEnum.ERASER:
                this.removeElement(com);
                break;
        }
    }

    private selectedElement(com: DisplayObject) {
        if (!(com instanceof DisplayObject)) {
            return;
        }
        if (com instanceof TerrainDisplay) {
            return;
        }
        if (!this.mSelectedElementEffect) {
            this.mSelectedElementEffect = new SelectedElement(this.mScene, this.layerManager);
        }
        this.mSelectedObject = com;
        com.showRefernceArea();
        this.mSelectedElementEffect.setElement(<FramesDisplay> com);
    }

    private removeElement(com: DisplayObject) {
        if (!(com instanceof DisplayObject)) {
            return;
        }
        if (!this.connection) {
            return;
        }
        const element = com.element;
        if (!element) {
            return;
        }
        element.removeMe();
    }

    private syncSprite(object: DisplayObject) {
        if (!object) return;
        const ele = object.element;
        if (!ele) return;
        const pkt = new PBpacket(op_editor.OPCODE._OP_CLIENT_REQ_EDITOR_SYNC_SPRITE);
        const content: op_editor.IOP_CLIENT_REQ_EDITOR_SYNC_SPRITE = pkt.content;
        content.sprites = [ele.toSprite()];
        this.connection.send(pkt);
        Logger.log("syncSprite", content);
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
                if (!this.mSelectedObject) {
                    return;
                }
                if (this.mSelectedElementEffect) {
                    this.mSelectedElementEffect.setPosition();
                }
                if (!this.mouseFollow) {
                    return;
                }
                const pos = this.mMouseFollow.transitionGrid(pointer.worldX, pointer.worldY);
                if (pos) {
                    this.mSelectedObject.x = pos.x;
                    this.mSelectedObject.y = pos.y;
                }
                break;
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
}
