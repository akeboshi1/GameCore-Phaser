import { IElementManager } from "../element/element.manager";
import { PBpacket, PacketHandler } from "net-socket-packet";
import { op_client, op_def } from "pixelpai_proto";
import { ConnectionService } from "../../net/connection.service";
import { Player } from "./player";
import { Room, IRoomService } from "../room";
import { ElementDisplay } from "../display/element.display";
import { DragonbonesModel } from "../display/dragonbones.model";
import { Actor } from "./Actor";
import { Console } from "../../utils/log";

export class PlayerManager extends PacketHandler implements IElementManager {
    private mPlayerMap: Map<number, Player>;
    private mActorID: number;
    constructor(private mRoom: Room) {
        super();
        if (this.connection) {
            this.connection.addPacketListener(this);
            // this.mMainRoleInfo = new PlayerInfo();
            // this.mPlayerMap = new Map();
            // this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_ADD_CHARACTER, this.onAdd);
            // this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_REMOVE_CHARACTER, this.onRemove);
            // this.addHandlerFun(op_client.OPCODE._OP_GATEWAY_REQ_CLIENT_MOVE_CHARACTER, this.onMove);
            // this.addHandlerFun(op_client.OPCODE._OP_GATEWAY_REQ_CLIENT_SET_CHARACTER_POSITION, this.onSetPosition);
            // //todo playState change
            // this.addHandlerFun(1, this.onChangeState);
        }
    }

    public init() {
        if (!this.mPlayerMap) {
            this.mPlayerMap = new Map();
        }
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_ADD_OBJECT, this.onAdd);
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_DELETE_OBJECT, this.onRemove);
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_ADJUST_POSITION, this.onAdjust);
        this.addHandlerFun(op_client.OPCODE._OP_GATEWAY_REQ_CLIENT_MOVE_CHARACTER, this.onMove);
        this.addHandlerFun(op_client.OPCODE._OP_GATEWAY_REQ_CLIENT_SET_CHARACTER_POSITION, this.onSetPosition);
        // todo playState change 由客户端进行修改
        this.mPlayerMap.clear();
    }

    public removeFromMap(id: number) {
        if (!this.mPlayerMap) return;
        if (this.mPlayerMap.has(id)) {
            this.mPlayerMap.delete(id);
        }
    }

    public stopActorMove() {
        if (!this.mRoom.actor) {
            Console.error("MainHero miss");
            return;
        }
        this.mRoom.actor.stopMove();
    }

    public dispose() {
        if (this.mPlayerMap) {
            this.mPlayerMap.forEach((player: Player) => {
                player.dispose();
            });
            this.mPlayerMap = null;
        }
    }

    public get(id: number): Player {
        if (!this.mPlayerMap) {
            return;
        }
        let player = this.mPlayerMap.get(id);
        if (!player) {
            const actor = this.roomService.actor;
            if (actor && actor.id === id) {
                player = actor;
            }
        }
        return player;
    }

    get camera(): Phaser.Cameras.Scene2D.Camera {
        return this.mRoom.cameraService.camera;
    }

    private onAdjust(packet: PBpacket) {
        const content: op_client.IOP_VIRTUAL_WORLD_REQ_CLIENT_ADJUST_POSITION = packet.content;
        const positions = content.objectPositions;
        const type = content.nodeType;
        if (type !== op_def.NodeType.CharacterNodeType) {
            return;
        }
        let player: Player;
        let point: op_def.IPBPoint3f;
        for (const position of positions) {
            player = this.mPlayerMap.get(position.id);
            if (!player) {
                continue;
            }
            point = position.point3f;
            player.setPosition(new Pos(point.x | 0, point.y | 0, point.z | 0));
        }
    }

    private onAdd(packet: PBpacket) {
        if (!this.mPlayerMap) {
            this.mPlayerMap = new Map();
        }
        const content: op_client.IOP_VIRTUAL_WORLD_REQ_CLIENT_ADD_OBJECT = packet.content;
        const positions = content.objectPositions;
        const type = content.nodeType;
        if (type !== op_def.NodeType.CharacterNodeType) {
            return;
        }
        let player: Player;
        for (const position of positions) {
            player = new Player(position.id, this);
            player.setPosition(new Pos(position.point3f.x, position.point3f.y, position.point3f.z | 0));
            this.mPlayerMap.set(player.id || 0, player);
        }
    }

    private onRemove(packet: PBpacket) {
        const content: op_client.IOP_VIRTUAL_WORLD_REQ_CLIENT_DELETE_OBJECT = packet.content;
        const type: number = content.nodeType;
        const ids: number[] = content.ids;
        if (type !== op_def.NodeType.CharacterNodeType) {
            return;
        }
        let player: Player;
        for (const id of ids) {
            player = this.get(id);
            if (!player) continue;
            this.removeFromMap(player.id);
            player.dispose();
        }
    }

    private onMove(packet: PBpacket) {
        const content: op_client.IOP_GATEWAY_REQ_CLIENT_MOVE_CHARACTER = packet.content;
        if (content.moveData) {
            const moveDataList: op_client.IMoveData[] = content.moveData;
            const len: number = moveDataList.length;
            let moveData: op_client.IMoveData;
            let playID: number;
            let player: Player;
            for (let i: number = 0; i < len; i++) {
                moveData = moveDataList[i];
                playID = moveData.moveObjectId;
                player = this.get(playID);
                // Console.log(player.x + "," + player.y + ":" + moveData.destinationPoint3f.x + "," + moveData.destinationPoint3f.y + ":" + moveData.timeSpan);
                if (!player) {
                    continue;
                }
                player.move(moveData);
            }
        }
    }

    private onSetPosition(packet: PBpacket) {
    }

    get roomService(): IRoomService {
        return this.mRoom;
    }

    get scene(): Phaser.Scene | undefined {
        if (this.mRoom) {
            return this.mRoom.scene;
        }
    }

    get connection(): ConnectionService {
        if (this.mRoom) {
            return this.mRoom.connection;
        }
        Console.error("room is undefined");
    }
}
