import {ElementManager} from "./element.manager";
import { ISprite } from "./sprite";
import {PBpacket} from "net-socket-packet";
import {op_editor, op_def, op_client} from "pixelpai_proto";
import {IRoomService} from "../room";
import {Logger} from "../../utils/log";
import {Pos} from "../../utils/pos";

export class EditorElementManager extends ElementManager {
    constructor(room: IRoomService) {
        super(room);
        if (this.connection) {
            this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_CREATE_SPRITE, this.onAdd);
            this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_SYNC_SPRITE, this.onSync);
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
        content.sprites = sprites.map((sprite) => sprite.toSprite());
        this.connection.send(pkt);
        Logger.log("add sprites: ", content);
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

    protected onSync(packet: PBpacket) {
        const content: op_editor.IOP_CLIENT_REQ_EDITOR_SYNC_SPRITE = packet.content;
        if (content.nodeType !== op_def.NodeType.ElementNodeType) {
            return;
        }
        const sprites = content.sprites;
        for (const  sprite of sprites) {
            this.trySync(sprite);
        }
    }

    protected trySync(sprite: op_client.ISprite) {
        const element = this.mElements.get(sprite.id);
        if (!element) {
            Logger.log("can't find element", sprite);
            return;
        }
        const point = sprite.point3f;
        if (point) {
            element.setPosition(new Pos(point.x, point.y, point.z));
        }
        if (sprite.direction) {
            element.setDirection(sprite.direction);
        }
    }
}
