import {ElementManager} from "./element.manager";
import { ISprite } from "./sprite";
import {PBpacket} from "net-socket-packet";
import { op_editor, op_def } from "pixelpai_proto";

export class EditorElementManager extends ElementManager {
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
        const element = this.mElements.get(id);
        if (element) {
            this.mElements.delete(id);
            element.destroy();
            if (this.roomService) {
                this.roomService.blocks.remove(element);
            }

            const pkt = new PBpacket(op_editor.OPCODE._OP_CLIENT_REQ_EDITOR_DELETE_SPRITE);
            const content: op_editor.IOP_CLIENT_REQ_EDITOR_DELETE_SPRITE = pkt.content;
            content.ids = [id];
            this.connection.send(pkt);
        }
    }
}
