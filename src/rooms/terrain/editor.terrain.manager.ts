import {TerrainManager} from "./terrain.manager";
import {ISprite} from "../element/sprite";
import {PBpacket} from "net-socket-packet";
import {op_client, op_def, op_editor} from "pixelpai_proto";
import {IRoomService, SpriteAddCompletedListener} from "../room";
import {Terrain} from "./terrain";
import {Pos} from "../../utils/pos";
import {Logger} from "../../utils/log";

export class EditorTerrainManager extends TerrainManager {
    constructor(room: IRoomService, listener?: SpriteAddCompletedListener) {
        super(room, listener);
        if (this.connection) {
            this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_CREATE_SPRITE, this.onAdd);
            this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_SYNC_SPRITE, this.onSync);
            this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_DELETE_SPRITE , this.onRemove);
        }
    }

    add(sprites: ISprite[]) {
        for (const sprite of sprites) {
            if (!this.canPut(sprite)) {
                continue;
            }
            this._add(sprite);
        }

        const pkt = new PBpacket(op_editor.OPCODE._OP_CLIENT_REQ_EDITOR_CREATE_SPRITE);
        const content: op_editor.OP_CLIENT_REQ_EDITOR_CREATE_SPRITE = pkt.content;
        content.nodeType = op_def.NodeType.TerrainNodeType;
        content.sprites = sprites;
        this.connection.send(pkt);
    }

    remove(id: number): void {
        if (!this.mTerrains) return;
        if (this.tryRemove(id)) {
            const pkt = new PBpacket(op_editor.OPCODE._OP_CLIENT_REQ_EDITOR_DELETE_SPRITE);
            const content: op_editor.IOP_CLIENT_REQ_EDITOR_DELETE_SPRITE = pkt.content;
            content.ids = [id];
            this.connection.send(pkt);
        }
    }

    protected onRemove(packet: PBpacket) {
        const content: op_client.IOP_VIRTUAL_WORLD_REQ_CLIENT_DELETE_SPRITE = packet.content;
        const type: number = content.nodeType;
        const ids: number[] = content.ids;
        if (type !== op_def.NodeType.TerrainNodeType) {
            return;
        }
        for (const id of ids) {
            this.tryRemove(id);
        }
    }

    protected onSync(packet: PBpacket) {
        const content: op_editor.IOP_CLIENT_REQ_EDITOR_SYNC_SPRITE = packet.content;
        if (content.nodeType !== op_def.NodeType.TerrainNodeType) {
            return;
        }
        const sprites = content.sprites;
        for (const  sprite of sprites) {
            this.trySync(sprite);
        }
    }

    protected trySync(sprite: op_client.ISprite) {
        const terrain = this.mTerrains.get(sprite.id);
        if (!terrain) {
            Logger.log("can't find terrain", sprite);
            return;
        }
        const point = sprite.point3f;
        if (point) {
            terrain.setPosition(new Pos(point.x, point.y, point.z));
        }
    }

    private tryRemove(id: number): Terrain {
        const terrain = this.mTerrains.get(id);
        if (terrain) {
            this.mTerrains.delete(id);
            terrain.destroy();
            if (this.roomService) {
                this.roomService.blocks.remove(terrain);
            }
            return terrain;
        }
    }

    private canPut(sprite: ISprite) {
        const pos = sprite.pos;
        const roomSize = this.roomService.roomSize;
        if (!roomSize) return false;
        if (pos.x < 0 || pos.y < 0 || pos.x > roomSize.rows || pos.y > roomSize.cols) {
            return false;
        }
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
