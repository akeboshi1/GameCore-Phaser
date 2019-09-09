import {PacketHandler, PBpacket} from "net-socket-packet";
import {ConnectionService} from "../../net/connection.service";
import {op_client, op_def} from "pixelpai_proto";
import {Terrain} from "./terrain";
import {IRoomService} from "../room";
import {IElementManager} from "../element/element.manager";
import {Logger} from "../../utils/log";
import {Pos} from "../../utils/pos";
import {IElementStorage} from "../../game/element.storage";

export class TerrainManager extends PacketHandler implements IElementManager {
    private mTerrains: Map<number, Terrain> = new Map<number, Terrain>();
    private mGameConfig: IElementStorage;

    constructor(private mRoom: IRoomService) {
        super();

        if (this.connection) {
            this.connection.addPacketListener(this);

            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_ADD_SPRITE, this.onAdd);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_DELETE_SPRITE, this.onRemove);
        }
        if (this.mRoom && this.mRoom.world) {
            this.mGameConfig = this.mRoom.world.elementStorage;
        }
    }

    public init() {
        this.destroy();
    }

    public destroy() {
        if (!this.mTerrains) return;
        this.mTerrains.forEach((terrain) => this.removeFromMap(terrain.id));
        this.mTerrains.clear();
    }

    public get(id: number): Terrain {
        const terrain: Terrain = this.mTerrains.get(id);
        if (!terrain) {
            return;
        }
        return terrain;
    }

    public removeFromMap(id: number) {
        if (!this.mTerrains) return;
        const terrain = this.mTerrains.get(id);
        if (terrain) {
            this.mTerrains.delete(id);
            terrain.destroy();
            if (this.roomService) {
                this.roomService.blocks.remove(terrain);
            }
        }
    }

    private onAdd(packet: PBpacket) {
        if (!this.mGameConfig) {
            Logger.error("gameconfig is undefined");
            return;
        }
        const content: op_client.IOP_VIRTUAL_WORLD_REQ_CLIENT_ADD_SPRITE = packet.content;
        const sprites = content.sprites;
        const type = content.nodeType;
        if (type !== op_def.NodeType.TerrainNodeType) {
            return;
        }
        let point: op_def.IPBPoint3f;
        for (const sprite of sprites) {
            point = sprite.point3f;
            if (point) {
                this._add(sprite.id, new Pos(point.x, point.y, point.z));
            }
        }
    }

    private _add(id: number, pos: Pos) {
        if (!this.mTerrains.has(id)) {
            const terrain = new Terrain(id, pos, this);
            this.mTerrains.set(terrain.id || 0, terrain);
            this.roomService.blocks.add(terrain);
        }
    }

    private onRemove(packet: PBpacket) {
        const content: op_client.IOP_VIRTUAL_WORLD_REQ_CLIENT_DELETE_SPRITE = packet.content;
        const type: number = content.nodeType;
        const ids: number[] = content.ids;
        if (type !== op_def.NodeType.TerrainNodeType) {
            return;
        }
        for (const id of ids) {
            this.removeFromMap(id);
        }
    }

    get connection(): ConnectionService | undefined {
        if (this.mRoom) {
            return this.mRoom.connection;
        }
        Logger.error("room manager is undefined");
    }

    get roomService(): IRoomService {
        return this.mRoom;
    }

    get scene(): Phaser.Scene | undefined {
        if (this.mRoom) {
            return this.mRoom.scene;
        }
    }

    get camera(): Phaser.Cameras.Scene2D.Camera {
        return this.camera;
    }
}
