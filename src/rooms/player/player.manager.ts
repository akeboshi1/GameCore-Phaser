import { IElementManager } from "../element/element.manager";
import { PBpacket, PacketHandler } from "net-socket-packet";
import { op_client } from "pixelpai_proto";
import { ConnectionService } from "../../net/connection.service";
import { Player } from "./player";
import { Room, IRoomService } from "../room";
import { ElementDisplay } from "../display/element.display";
import { DragonbonesModel } from "../display/dragonbones.model";
import { Actor } from "./Actor";
import { Console } from "../../utils/log";

export class PlayerManager extends PacketHandler implements IElementManager {
    private mPlayerMap: Map<number, Player>;

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
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_ADD_CHARACTER, this.onAdd);
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_REMOVE_CHARACTER, this.onRemove);
        this.addHandlerFun(op_client.OPCODE._OP_GATEWAY_REQ_CLIENT_MOVE_CHARACTER, this.onMove);
        this.addHandlerFun(op_client.OPCODE._OP_GATEWAY_REQ_CLIENT_SET_CHARACTER_POSITION, this.onSetPosition);
        // todo playState change 由客户端进行修改
        this.mPlayerMap.clear();
    }

    public setMainRoleInfo(obj: op_client.IActor): Actor {
        const player: Actor = new Actor(obj, this);
        this.mPlayerMap.set(obj.id, player);
        const cameraService = this.mRoom.cameraService;
        if (cameraService) {
            const dis: ElementDisplay = player.getDisplay();
            if (dis) cameraService.startFollow(dis.GameObject);
        }
        return player;
    }

    public addToMap(id: number, player: Player) {
        if (!this.mPlayerMap) {
            this.mPlayerMap = new Map();
        }
        this.mPlayerMap.set(id, player);
    }

    public removeFromMap(id: number) {
        if (!this.mPlayerMap) return;
        if (this.mPlayerMap.has(id)) {
            this.mPlayerMap.delete(id);
        }
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

    private onAdd(packet: PBpacket) {
        const content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_ADD_CHARACTER = packet.content;
        const players = content.actors;
        if (players) {
            let displayInfo: DragonbonesModel;
            let plyer: Player;
            for (const player of players) {
                plyer = new Player(this);
                displayInfo = new DragonbonesModel();
                displayInfo.setInfo(player);
                plyer.load(displayInfo);
                // this.mPlayerMap.set(player.id || 0, plyer);
                this.addToMap(player.id || 0, plyer);
            }
        }
    }

    private onRemove(packet: PBpacket) {
        const content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_REMOVE_CHARACTER = packet.content;
        const player = this.get(content.uuid);
        if (player) {
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
