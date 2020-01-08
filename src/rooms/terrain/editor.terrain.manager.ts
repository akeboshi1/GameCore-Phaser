import {TerrainManager} from "./terrain.manager";
import {ISprite} from "../element/sprite";
import {PBpacket} from "net-socket-packet";
import {op_client, op_def, op_editor} from "pixelpai_proto";
import {IRoomService, SpriteAddCompletedListener} from "../room";
import {Terrain} from "./terrain";
import {Pos} from "../../utils/pos";
import {Logger} from "../../utils/log";
import { IElement } from "../element/element";

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
        const clientSprites = [];
        for (const sprite of sprites) {
            if (!this.canPut(sprite)) {
                continue;
            }
            this._add(sprite);
            clientSprites.push(sprite.toSprite());
        }
        if (clientSprites.length === 0) return;

        const pkt = new PBpacket(op_editor.OPCODE._OP_CLIENT_REQ_EDITOR_CREATE_SPRITE);
        const content: op_editor.OP_CLIENT_REQ_EDITOR_CREATE_SPRITE = pkt.content;
        content.nodeType = op_def.NodeType.TerrainNodeType;
        content.sprites = clientSprites;
        this.connection.send(pkt);
    }

    removeEditor(id: number): IElement {
        if (!this.mTerrains) return;
        const terrain = this.tryRemove(id);
        if (terrain) {
            const pkt = new PBpacket(op_editor.OPCODE._OP_CLIENT_REQ_EDITOR_DELETE_SPRITE);
            const content: op_editor.IOP_CLIENT_REQ_EDITOR_DELETE_SPRITE = pkt.content;
            content.ids = [id];
            content.nodeType = op_def.NodeType.TerrainNodeType;
            this.connection.send(pkt);
        }
        return terrain;
    }

    removeFormPositions(locations: Pos[]) {
        const terrains = Array.from(this.mTerrains.values());
        let terrain: Terrain = null;
        Logger.getInstance().log("locations: ", locations);
        for (const pos of locations) {
            terrain = terrains.find((ter) => {
                return pos.equal(ter.getPosition45());
            });
            if (terrain) {
                this.removeEditor(terrain.id);
            }
        }
    }

    protected _add(sprite: ISprite) {
        let terrain = this.mTerrains.get(sprite.id);
        if (!terrain) {
            terrain = new Terrain(sprite, this);
            terrain.setBlockable(false);
            terrain.setRenderable(true);
        } else {
            return;
        }
        // TODO update terrain
        this.mTerrains.set(terrain.id || 0, terrain);
        // this.roomService.blocks.add(terrain);
        return terrain;
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
            Logger.getInstance().log("can't find terrain", sprite);
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
        if (pos.x < 0 || pos.y < 0 || pos.x >= roomSize.cols || pos.y >= roomSize.rows) {
            return false;
        }
        const terrains = Array.from(this.mTerrains.values());
        for (const ter of terrains) {
            const pos45 = ter.getPosition45();
            if (sprite.pos.equal(pos45)) {
                if (sprite.bindID !== ter.model.bindID) {
                    // 编辑器判断重叠地块
                    // this.removeEditor(ter.id);
                    return true;
                }
                return false;
            }
        }
        return true;
    }
}
