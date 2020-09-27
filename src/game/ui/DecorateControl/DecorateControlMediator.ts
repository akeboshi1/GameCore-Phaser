import { WorldService } from "../../game/world.service";
import { DecorateControlPanel } from "./DecorateControlPanel";
import { ILayerManager } from "../layer.manager";
import { ConnectionService } from "../../../../lib/net/connection.service";
import { PBpacket } from "net-socket-packet";
import { op_virtual_world } from "pixelpai_proto";
import { MessageType } from "../../../const/MessageType";
import { BaseMediator } from "apowophaserui";

export class DecorateControlMediator extends BaseMediator {
    public static NAME: string = "DecorateControlMediator";
    protected mView: DecorateControlPanel;
    private world: WorldService;
    constructor(private layerManager: ILayerManager, private scene: Phaser.Scene, world: WorldService) {
        super();
        this.world = world;
        if (world) {
            world.emitter.on(MessageType.SELECTED_DECORATE_ELEMENT, this.onSelectedDecorateHandler, this);
            world.emitter.on(MessageType.CANCEL_DECORATE_ELEMENT, this.onCancelDecorateHandler, this);
        }
    }

    show() {
        if (this.mView && this.mView.isShow() || this.mShow) {
            return;
        }
        if (!this.mView) {
            this.mView = new DecorateControlPanel(this.scene, this.world);
        }
        this.addActionListener();
        this.mView.show();
        this.layerManager.addToUILayer(this.mView);
    }

    destroy() {
        if (this.world) {
            this.world.emitter.on(MessageType.SELECTED_DECORATE_ELEMENT, this.onSelectedDecorateHandler, this);
            this.world.emitter.on(MessageType.CANCEL_DECORATE_ELEMENT, this.onCancelDecorateHandler, this);
        }
        super.destroy();
    }

    isSceneUI(): boolean {
        return true;
    }

    private onSelectedDecorateHandler() {
        if (!this.mView) {
            return;
        }
        if (this.mView.parentContainer) {
            this.mView.parentContainer.remove(this.mView);
        }
    }

    private onCancelDecorateHandler() {
        if (!this.mView) {
            return;
        }
        this.layerManager.addToUILayer(this.mView);
    }

    private addActionListener() {
        if (!this.mView) {
            return;
        }
        this.mView.on("exit", this.onExitHandler, this);
        this.mView.on("recycleAll", this.onRecycleAllHandler, this);
        this.mView.on("redo", this.onRedoHandler, this);
        this.mView.on("showFurni", this.onShowFurniHandler, this);
        this.mView.on("save", this.onSaveHandler, this);
        this.mView.on("getDoor", this.onGetDoorHandler, this);
    }

    private onExitHandler() {
        if (!this.connection) {
            return;
        }
        const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_EDIT_MODE_LEAVE);
        const content: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_EDIT_MODE_LEAVE = packet.content;
        content.needSaveEditScene = false;
        this.world.connection.send(packet);
    }

    private onRecycleAllHandler() {
        if (!this.connection) {
            return;
        }
        const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_EDIT_MODE_RECYCLE_ALL);
        this.world.connection.send(packet);
    }

    private onRedoHandler() {
        if (!this.connection) {
            return;
        }
        const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_EDIT_MODE_RECYCLE_LAST_SPRITE);
        this.connection.send(packet);
    }

    private onShowFurniHandler() {
        const uiManager = this.world.uiManager;
        if (uiManager) {
            uiManager.showMed("FurniBag");
        }
    }

    private onSaveHandler() {
        if (!this.connection) {
            return;
        }
        const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_EDIT_MODE_LEAVE);
        const content: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_EDIT_MODE_LEAVE = packet.content;
        content.needSaveEditScene = true;
        this.connection.send(packet);
    }

    private onGetDoorHandler() {
        if (!this.connection) {
            return;
        }
        const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_EDIT_MODE_GET_SPAWN_POINT);
        this.connection.send(packet);
    }

    get connection(): ConnectionService {
        if (!this.world) {
            return;
        }
        return this.world.connection;
    }
}
