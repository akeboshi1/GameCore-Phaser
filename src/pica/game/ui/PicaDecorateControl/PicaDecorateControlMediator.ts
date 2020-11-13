import { BasicMediator, Game } from "gamecore";
import { ConnectionService } from "lib/net/connection.service";
import { PBpacket } from "net-socket-packet";
import { op_virtual_world } from "pixelpai_proto";
import { MessageType, ModuleName, RENDER_PEER } from "structure";

export class PicaDecorateControlMediator extends BasicMediator {
    constructor(game: Game) {
        super(ModuleName.PICADECORATECONTROL_NAME, game);
        game.emitter.on(MessageType.SELECTED_DECORATE_ELEMENT, this.onSelectedDecorateHandler, this);
        game.emitter.on(MessageType.CANCEL_DECORATE_ELEMENT, this.onCancelDecorateHandler, this);
    }

    show(param?: any) {
        super.show(param);
        this.game.emitter.on(RENDER_PEER + "_" + this.key + "_exit", this.onExitHandler, this);
        this.game.emitter.on(RENDER_PEER + "_" + this.key + "_recycleAll", this.onRecycleAllHandler, this);
        this.game.emitter.on(RENDER_PEER + "_" + this.key + "_redo", this.onRedoHandler, this);
        this.game.emitter.on(RENDER_PEER + "_" + this.key + "_showFurni", this.onShowFurniHandler, this);
        this.game.emitter.on(RENDER_PEER + "_" + this.key + "_save", this.onSaveHandler, this);
        this.game.emitter.on(RENDER_PEER + "_" + this.key + "_getDoor", this.onGetDoorHandler, this);
    }

    hide() {
        this.game.emitter.off(RENDER_PEER + "_" + this.key + "_exit", this.onExitHandler, this);
        this.game.emitter.off(RENDER_PEER + "_" + this.key + "_recycleAll", this.onRecycleAllHandler, this);
        this.game.emitter.off(RENDER_PEER + "_" + this.key + "_redo", this.onRedoHandler, this);
        this.game.emitter.off(RENDER_PEER + "_" + this.key + "_showFurni", this.onShowFurniHandler, this);
        this.game.emitter.off(RENDER_PEER + "_" + this.key + "_save", this.onSaveHandler, this);
        this.game.emitter.off(RENDER_PEER + "_" + this.key + "_getDoor", this.onGetDoorHandler, this);
        super.hide();
    }

    destroy() {
        if (this.game) {
            this.game.emitter.off(MessageType.SELECTED_DECORATE_ELEMENT, this.onSelectedDecorateHandler, this);
            this.game.emitter.off(MessageType.CANCEL_DECORATE_ELEMENT, this.onCancelDecorateHandler, this);
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
        // this.layerManager.addToUILayer(this.mView);
    }

    private onExitHandler() {
        if (!this.connection) {
            return;
        }
        const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_EDIT_MODE_LEAVE);
        const content: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_EDIT_MODE_LEAVE = packet.content;
        content.needSaveEditScene = false;
        this.game.connection.send(packet);
    }

    private onRecycleAllHandler() {
        if (!this.connection) {
            return;
        }
        const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_EDIT_MODE_RECYCLE_ALL);
        this.game.connection.send(packet);
    }

    private onRedoHandler() {
        if (!this.connection) {
            return;
        }
        const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_EDIT_MODE_RECYCLE_LAST_SPRITE);
        this.connection.send(packet);
    }

    private onShowFurniHandler() {
        const uiManager = this.game.uiManager;
        if (uiManager) {
            uiManager.showMed(ModuleName.PICABAG_NAME);
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
        if (!this.game) {
            return;
        }
        return this.game.connection;
    }
}
