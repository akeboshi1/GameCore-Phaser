import { PacketHandler, PBpacket } from "net-socket-packet";
import { ConnectionService } from "../../net/connection.service";
import { op_client, op_def, op_virtual_world } from "pixelpai_proto";
import { Terrain } from "./terrain";
import { IRoomService, SpriteAddCompletedListener } from "../room";
import { IElementManager } from "../element/element.manager";
import { Logger } from "../../utils/log";
import { IElementStorage } from "../../game/element.storage";
import { ISprite, Sprite } from "../element/sprite";
import { IElement } from "../element/element";

export class TerrainManager extends PacketHandler implements IElementManager {
    protected mTerrains: Map<number, Terrain> = new Map<number, Terrain>();
    protected mGameConfig: IElementStorage;
    // add by 7 ----
    protected mPacketFrameCount: number = 0;
    protected mListener: SpriteAddCompletedListener;
    // ---- by 7

    constructor(protected mRoom: IRoomService, listener?: SpriteAddCompletedListener) {
        super();
        this.mListener = listener;
        if (this.connection) {
            this.connection.addPacketListener(this);

            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_ADD_SPRITE, this.onAdd);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_DELETE_SPRITE, this.onRemove);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_SYNC_SPRITE, this.onSyncSprite);
        }
        if (this.mRoom && this.mRoom.world) {
            this.mGameConfig = this.mRoom.world.elementStorage;
        }
    }

    public init() {
        // this.destroy();
    }

    public destroy() {
        if (this.connection) {
            this.connection.removePacketListener(this);
        }
        if (!this.mTerrains) return;
        this.mTerrains.forEach((terrain) => this.remove(terrain.id));
        this.mTerrains.clear();
    }

    public get(id: number): Terrain {
        const terrain: Terrain = this.mTerrains.get(id);
        if (!terrain) {
            return;
        }
        return terrain;
    }

    public add(sprite: ISprite[]) {
    }

    public remove(id: number): IElement {
        if (!this.mTerrains) return;
        const terrain = this.mTerrains.get(id);
        if (terrain) {
            this.mTerrains.delete(id);
            terrain.destroy();
        }
        return terrain;
    }

    protected onAdd(packet: PBpacket) {
        this.mPacketFrameCount++;
        if (!this.mGameConfig) {
            Logger.getInstance().error("gameconfig is undefined");
            return;
        }
        const content: op_client.IOP_VIRTUAL_WORLD_REQ_CLIENT_ADD_SPRITE = packet.content;
        const sprites = content.sprites;
        const type = content.nodeType;
        const pf: op_def.IPacket = content.packet;
        if (type !== op_def.NodeType.TerrainNodeType) {
            return;
        }
        let point: op_def.IPBPoint3f;
        for (const sprite of sprites) {
            point = sprite.point3f;
            if (point) {
                const s = new Sprite(sprite);
                if (!s.displayInfo) {
                    this.checkDisplay(s);
                }
                this._add(s);
            }
        }
        if (this.mListener && this.mPacketFrameCount === pf.totalFrame) {
            this.mListener.onFullPacketReceived(type);
        }
        Logger.getInstance().log("terrain number: ", this.mTerrains.size);
    }

    protected _add(sprite: ISprite): Terrain {
        let terrain = this.mTerrains.get(sprite.id);
        if (!terrain) {
            terrain = new Terrain(sprite, this);
            // terrain.setRenderable(true);
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
            this.remove(id);
        }
        Logger.getInstance().log("remove terrain length: ", ids.length);
    }

    protected onSyncSprite(packet: PBpacket) {
        const content: op_client.IOP_EDITOR_REQ_CLIENT_SYNC_SPRITE = packet.content;
        if (content.nodeType !== op_def.NodeType.TerrainNodeType) {
            return;
        }
        let terrain: Terrain = null;
        const sprites = content.sprites;
        for (const sprite of sprites) {
            terrain = this.get(sprite.id);
            if (terrain) {
                terrain.model = new Sprite(sprite);
                terrain.setRenderable(true);
            }
        }
    }

    protected checkDisplay(sprite: ISprite) {
        if (!sprite.displayInfo) {
            const displayInfo = this.roomService.world.elementStorage.getObject(sprite.bindID || sprite.id);
            if (displayInfo) {
                sprite.displayInfo = displayInfo;
            } else {
                this.fetchDisplay([sprite.id]);
            }
        }
    }

    protected fetchDisplay(ids: number[]) {
        const packet = new PBpacket(op_virtual_world.OPCODE._OP_REQ_VIRTUAL_WORLD_QUERY_SPRITE_RESOURCE);
        const content: op_virtual_world.IOP_REQ_VIRTUAL_WORLD_QUERY_SPRITE_RESOURCE = packet.content;
        content.ids = ids;
        this.connection.send(packet);
    }

    get connection(): ConnectionService | undefined {
        if (this.mRoom) {
            return this.mRoom.connection;
        }
        Logger.getInstance().error("room manager is undefined");
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
