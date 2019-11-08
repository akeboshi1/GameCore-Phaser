import {TerrainManager} from "./terrain.manager";
import {ISprite} from "../element/sprite";
import {PBpacket} from "net-socket-packet";
import {op_def, op_editor} from "pixelpai_proto";
import {Logger} from "../../utils/log";

export class EditorTerrainManager extends TerrainManager {
    add(sprite: ISprite) {
        if (!this.canPut(sprite)) {
            return;
        }
        this._add(sprite);

        const pkt = new PBpacket(op_editor.OPCODE._OP_CLIENT_REQ_EDITOR_CREATE_SPRITE);
        const content: op_editor.OP_CLIENT_REQ_EDITOR_CREATE_SPRITE = pkt.content;
        content.nodeType = op_def.NodeType.TerrainNodeType;
        content.sprites = [sprite];
        this.connection.send(pkt);
    }

    remove(id: number): void {
        if (!this.mTerrains) return;
        const terrain = this.mTerrains.get(id);
        if (terrain) {
            this.mTerrains.delete(id);
            terrain.destroy();
            if (this.roomService) {
                this.roomService.blocks.remove(terrain);
            }
            const pkt = new PBpacket(op_editor.OPCODE._OP_CLIENT_REQ_EDITOR_DELETE_SPRITE);
            const content: op_editor.IOP_CLIENT_REQ_EDITOR_DELETE_SPRITE = pkt.content;
            content.ids = [id];
            this.connection.send(pkt);
        }
    }

    private canPut(sprite: ISprite) {
        const terrains = Array.from(this.mTerrains.values());
        for (const ter of terrains) {
            const pos45 = ter.getPosition45();
            if (sprite.pos.equal(pos45)) {
                return false;
            }
        }
        return true;
    }
}
