import {IRoomManager} from "./room.manager";
import {PBpacket} from "net-socket-packet";
import {op_client, op_virtual_world} from "pixelpai_proto";
import {ElementManager} from "./element/element.manager";
import {Logger} from "../utils/log";
import {Brush, BrushEnum} from "../const/brush";
import {TerrainManager} from "./terrain/terrain.manager";
import {Room} from "./room";
import {LayerManager} from "./layer/layer.manager";
import {ViewblockManager} from "./cameras/viewblock.manager";
import {EditScene} from "../scenes/edit";
import {MouseFollow} from "./editor/mouse.follow";
import {FramesDisplay} from "./display/frames.display";
import {TerrainDisplay} from "./display/terrain.display";
import {SelectedElement} from "./editor/selected.element";
import {DisplayObject} from "./display/display.object";

export class EditorRoom extends Room {
    private mBrush: Brush = new Brush();
    private mMouseFollow: MouseFollow;
    private mSelectedElementEffect: SelectedElement;
    private mSelectedObject: DisplayObject;
    constructor(manager: IRoomManager) {
        super(manager);
        if (this.connection) {
            this.connection.addPacketListener(this);
            this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_SET_EDITOR_MODE, this.onSetEditorModeHandler);
            this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_ALIGN_GRID, this.onAlignGridHandler);
            this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_VISIBLE_GRID, this.onVisibleGridHandler);
            this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_MOUSE_FOLLOW, this.onMouseFollowHandler);
        }
    }

    public enter(data: op_client.IScene) {
        if (!data) {
            Logger.error("wrong room");
            return;
        }
        this.mID = data.id;

        // TODO 拆分enter, 通用的不用重写一遍
        this.mSize = {
            cols: data.rows,
            rows: data.cols,
            tileHeight: data.tileHeight,
            tileWidth: data.tileWidth,
            sceneWidth: (data.rows + data.cols) * (data.tileWidth / 2),
            sceneHeight: (data.rows + data.cols) * (data.tileHeight / 2),
        };

        this.mTerainManager = new TerrainManager(this);
        this.mElementManager = new ElementManager(this);
        this.mBlocks = new ViewblockManager(this.mCameraService);
        // this.mPlayerManager = new PlayerManager(this);

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
    }

    private moveCameras(pointer) {
        const camera = this.mScene.cameras.main;
        camera.scrollX += pointer.prevPosition.x - pointer.position.x;
        camera.scrollY += pointer.prevPosition.y - pointer.position.y;
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
    }

    private onVisibleGridHandler(packet: PBpacket) {
        const content: op_client.IOP_EDITOR_REQ_CLIENT_VISIBLE_GRID = packet.content;
        this.layerManager.setGridVisible(content.visible);
    }

    private onMouseFollowHandler(packet: PBpacket) {
        const content: op_client.IOP_EDITOR_REQ_CLIENT_MOUSE_FOLLOW = packet.content;
        this.brush.setMouseFollow(content);
        if (this.mScene) {
            if (!this.mMouseFollow) this.mMouseFollow = new MouseFollow(this.mScene, this);
            this.mMouseFollow.setDisplay(this.brush.frameModel);
        }
    }

    private onPointerDownHandler() {
        this.mScene.input.on("pointermove", this.onPointerMoveHandler, this);
    }

    private onPointerUpHandler() {
        this.mScene.input.off("pointermove", this.onPointerMoveHandler, this);
    }

    private onGameobjectUpHandler(pointer, gameobject) {
        const com = gameobject.parentContainer;
        if (!com) {
            return;
        }
        switch (this.mBrush.mode) {
            case BrushEnum.SELECT:
                this.selectedElement(<DisplayObject> com);
                break;
            case BrushEnum.ERASER:

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

    private onPointerMoveHandler(pointer) {
        if (!this.mScene.cameras) {
            return;
        }
        switch (this.mBrush.mode) {
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
                this.mSelectedObject.x = pointer.x;
                this.mSelectedObject.y = pointer.y;
                break;
        }
    }

    get brush(): Brush {
        return this.mBrush;
    }
}
