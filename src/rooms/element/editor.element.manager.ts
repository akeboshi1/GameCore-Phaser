import {ElementManager} from "./element.manager";
import { ISprite } from "./sprite";
import {PBpacket} from "net-socket-packet";
import {op_editor, op_def, op_client} from "pixelpai_proto";
import {IRoomService} from "../room";

export class EditorElementManager extends ElementManager {
    constructor(room: IRoomService) {
        super(room);
        if (this.connection) {
            this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_DELETE_SPRITE , this.onRemove);
        }
    }

    add(sprites: ISprite[]) {
        for (const sprite of sprites) {
            this._add(sprite);
        }
        const pkt = new PBpacket(op_editor.OPCODE._OP_CLIENT_REQ_EDITOR_CREATE_SPRITE);
        const content: op_editor.OP_CLIENT_REQ_EDITOR_CREATE_SPRITE = pkt.content;
        content.nodeType = op_def.NodeType.ElementNodeType;
        content.sprites = sprites;
        this.connection.send(pkt);
    }

    remove(id: number) {
        if (this.tryRemove(id)) {
            const pkt = new PBpacket(op_editor.OPCODE._OP_CLIENT_REQ_EDITOR_DELETE_SPRITE);
            const content: op_editor.IOP_CLIENT_REQ_EDITOR_DELETE_SPRITE = pkt.content;
            content.ids = [id];
            this.connection.send(pkt);
        }
    }

    protected tryRemove(id) {
        const element = this.mElements.get(id);
        if (element) {
            this.mElements.delete(id);
            element.destroy();
            if (this.roomService) {
                this.roomService.blocks.remove(element);
            }
            return element;
        }
    }

    protected onRemove(packet: PBpacket) {
        const content: op_editor.IOP_CLIENT_REQ_EDITOR_DELETE_SPRITE = packet.content;
        const type: number = content.nodeType;
        const ids: number[] = content.ids;
        if (type !== op_def.NodeType.ElementNodeType) {
            return;
        }
        for (const id of ids) {
            this.tryRemove(id);
        }
    }
}
