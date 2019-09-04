import { PacketHandler, PBpacket } from "net-socket-packet";
import { ConnectionService } from "../../net/connection.service";
import { op_client, op_def } from "pixelpai_proto";
import { Terrain } from "./terrain";
import { IRoomService } from "../room";
import { FramesModel } from "../display/frames.model";
import { IElementManager } from "../element/element.manager";
import { Console } from "../../utils/log";

export class TerrainManager extends PacketHandler implements IElementManager {
    private mTerrains: Map<number, Terrain>;

    constructor(private mRoom: IRoomService) {
        super();

        if (this.connection) {
            this.connection.addPacketListener(this);

            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_ADD_ELEMENT, this.onAdd);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_DELETE_OBJECT, this.onRemove);
        }
    }

    public init() {
        if (!this.mTerrains) {
            this.mTerrains = new Map();
        }
        this.mTerrains.clear();
    }

    public get(id: number): Terrain {
        if (!this.mTerrains) {
            return;
        }
        const terrain: Terrain = this.mTerrains.get(id);
        if (!terrain) {
            return;
        }
        return terrain;
    }

    public removeFromMap(id: number) {
        if (!this.mTerrains) return;
        if (this.mTerrains.has(id)) {
            this.mTerrains.delete(id);
        }
    }

    private onAdd(packet: PBpacket) {
        if (!this.mTerrains) {
            this.mTerrains = new Map();
        }
        if (!this.mRoom.layerManager) {
            Console.error("layer manager is undefined");
            return;
        }
        const content: op_client.IOP_VIRTUAL_WORLD_REQ_CLIENT_ADD_OBJECT = packet.content;
        const positions = content.objectPositions;
        const type = content.nodeType;
        if (type !== op_def.NodeType.TerrainNodeType) {
            return;
        }
        let terrian: Terrain;
        for (const position of positions) {
            terrian = new Terrain(position, type, this);
            this.mTerrains.set(terrian.id || 0, terrian);
            this.mRoom.blocks.add(terrian);
        }
    }

    private onRemove(packet: PBpacket) {
        const content: op_client.IOP_VIRTUAL_WORLD_REQ_CLIENT_DELETE_OBJECT = packet.content;
        const type: number = content.nodeType;
        const ids: number[] = content.ids;
        if (type !== op_def.NodeType.TerrainNodeType) {
            return;
        }
        let terrian: Terrain;
        for (const id of ids) {
            terrian = this.get(id);
            if (!terrian) continue;
            this.removeFromMap(terrian.id);
            terrian.dispose();
        }
    }

    get connection(): ConnectionService | undefined {
        if (this.mRoom) {
            return this.mRoom.connection;
        }
        Console.error("room manager is undefined");
    }

    get roomService(): IRoomService {
        return this.mRoom;
    }

    get scene(): Phaser.Scene | undefined {
        if (this.mRoom) {
            return this.mRoom.scene;
        }
    }
}
