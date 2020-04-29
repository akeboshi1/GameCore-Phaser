import { SkyBoxManager } from "./sky.box.manager";
import { IRoomService } from "../room";
import { op_client } from "pixelpai_proto";
import { PBpacket } from "net-socket-packet";
import { Scenery } from "./scenery";
import { BlockManager } from "./block.manager";
import { op_editor, op_def } from "pixelpai_proto";

export class EditorSkyBoxManager extends SkyBoxManager {
    private mSelected: BlockManager;
    constructor(room: IRoomService) {
        super(room);
        const connection = room.connection;
        if (connection) {
            connection.addPacketListener(this);
            this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_ADD_SCENERY, this.onAddSceneryHandler);
            this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_UPDATE_SCENERY, this.onUpdateSceneryHandler);
            this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_DELETE_SCENERY, this.onDeleteSceneryHandler);
            this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_FETCH_SCENERY, this.onFetchSceneryHandler);
        }
    }

    public onMove(keyCode: number) {
        if (!this.mSelected) {
            return;
        }
        const scenery = this.mSelected.scenery;
        if (!scenery) {
            return;
        }
        const offset = scenery.offset;
        switch (keyCode) {
            case 37:
            case 65:
                offset.x--;
                break;
            case 38:
            case 87:
                offset.y--;
                break;
            case 39:
            case 68:
                offset.x++;
                break;
            case 40:
            case 83:
                offset.y++;
                break;
        }
        this.mSelected.updatePosition();
        this.onSyncSceneryOffset();
    }

    public removeSelect() {
        if (this.mSelected) {
            this.mSelected = undefined;
        }
    }

    private onAddSceneryHandler(packet: PBpacket) {
        const content: op_client.IOP_EDITOR_REQ_CLIENT_ADD_SCENERY = packet.content;
        this.add(new Scenery(content));
    }

    private onUpdateSceneryHandler(packet: PBpacket) {
        const content: op_client.IOP_EDITOR_REQ_CLIENT_UPDATE_SCENERY = packet.content;
        this.update(new Scenery(content));
    }

    private onDeleteSceneryHandler(packet: PBpacket) {
        const content: op_client.IOP_EDITOR_REQ_CLIENT_DELETE_SCENERY = packet.content;
        const ids = content.ids;
        for (const id of ids) {
            this.remove(id);
        }
    }

    private onFetchSceneryHandler(packet: PBpacket) {
        const content: op_client.IOP_EDITOR_REQ_CLIENT_FETCH_SCENERY = packet.content;
        this.mSelected = this.mScenetys.get(content.id);
    }

    private onSyncSceneryOffset() {
        const scenery = this.mSelected.scenery;
        const packet = new PBpacket(op_editor.OPCODE._OP_CLIENT_REQ_EDITOR_UPDATE_SCENERY);
        const content: op_editor.IOP_CLIENT_REQ_EDITOR_UPDATE_SCENERY = packet.content;
        content.id = scenery.id;
        const offset = op_def.PBPoint2f.create();
        Object.assign(offset, scenery.offset);
        content.offset = offset;
        this.mRoom.connection.send(packet);
    }

    private onKeyDownHandler(event) {
        if (this.mSelected) {
            return;
        }
        this.onMove(event.keyCode);
    }

    get selected() {
        return this.mSelected;
    }
}
