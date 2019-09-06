import { PacketHandler, PBpacket } from "net-socket-packet";
import { ConnectionService } from "../../net/connection.service";
import { op_client, op_def } from "pixelpai_proto";
import { Terrain } from "./terrain";
import { IRoomService } from "../room";
import { FramesModel } from "../display/frames.model";
import { IElementManager } from "../element/element.manager";
import { Console } from "../../utils/log";
import { GameConfigService } from "../../config/gameconfig.service";
import {Element} from "../element/element";
import {Pos} from "../../utils/pos";

export class TerrainManager extends PacketHandler implements IElementManager {
    private mTerrains: Map<number, Terrain>;
    private mGameConfig: GameConfigService;

    constructor(private mRoom: IRoomService) {
        super();

        if (this.connection) {
            this.connection.addPacketListener(this);

            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_ADD_OBJECT, this.onAdd);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_DELETE_OBJECT, this.onRemove);
        }
        if (this.mRoom && this.mRoom.world) {
            this.mGameConfig = this.mRoom.world.gameConfigService;
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
        if (!this.mGameConfig) {
            Console.error("gameconfig is undefined");
            return;
        }
        const content: op_client.IOP_VIRTUAL_WORLD_REQ_CLIENT_ADD_OBJECT = packet.content;
        const objs: op_client.IObjectPosition[]|undefined = content.objectPositions;
        if (!objs) return;
        const type = content.nodeType;
        if (type !== op_def.NodeType.TerrainNodeType) {
            return;
        }
        let terrain: Terrain;
        let point: op_def.IPBPoint3f;
        for (const obj of objs) {
            point = obj.point3f;
            if (point) {
                terrain = new Terrain(obj.id, this);
                terrain.setPosition(new Pos(point.x, point.y, point.z));
                this._add(terrain);
            }
        }
    }

    private _add(terrain: Terrain) {
        if (!this.mTerrains) {
            this.mTerrains = new Map();
        }
        if (!terrain) return;
        this.mTerrains.set(terrain.id || 0, terrain);
        if (this.roomService) {
            this.roomService.blocks.add(terrain);
        }
    }

    private _remove(terrain: Terrain) {
        if (!terrain || this.mTerrains) return;
        if (this.mTerrains.has(terrain.id)) {
            this.mTerrains.delete(terrain.id);
            if (this.roomService) {
                this.roomService.blocks.remove(terrain);
            }
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

    get gameconfig(): GameConfigService {
        return this.mGameConfig;
    }

    get camera(): Phaser.Cameras.Scene2D.Camera {
        return this.camera;
    }
}
