import { IElementManager } from "../element/element.manager";
import { PacketHandler, PBpacket } from "net-socket-packet";
import { op_client, op_def } from "pixelpai_proto";
import { ConnectionService } from "../../net/connection.service";
import { Player } from "./player";
import { IRoomService, Room } from "../room";
import { Logger } from "../../utils/log";
import { Pos } from "../../utils/pos";
import { ISprite, Sprite } from "../element/sprite";

export class PlayerManager extends PacketHandler implements IElementManager {
    private mPlayerMap: Map<number, Player> = new Map();
    private mActorID: number;
    constructor(private mRoom: Room) {
        super();
        if (this.connection) {
            this.connection.addPacketListener(this);
        }
    }

    public init() {
        this.destroy();
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_ADD_SPRITE, this.onAdd);
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_DELETE_SPRITE, this.onRemove);
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_ADJUST_POSITION, this.onAdjust);
        this.addHandlerFun(op_client.OPCODE._OP_GATEWAY_REQ_CLIENT_MOVE_CHARACTER, this.onMove);
        this.addHandlerFun(op_client.OPCODE._OP_GATEWAY_REQ_CLIENT_SET_CHARACTER_POSITION, this.onSetPosition);

        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_CHAT, this.onShowBubble);
    }

    public destroy() {
        if (!this.mPlayerMap) return;
        this.mPlayerMap.forEach((player) => this.removeFromMap(player.id));
        this.mPlayerMap.clear();
    }

    public removeFromMap(id: number) {
        const player = this.mPlayerMap.get(id);
        if (player) {
            this.mPlayerMap.delete(id);
            player.destroy();
            if (this.roomService) {
                this.roomService.blocks.remove(player);
            }
        }
    }

    public startActorMove() {
        if (!this.mRoom.actor) {
            Logger.error("MainHero miss");
            return;
        }
        this.mRoom.actor.startMove();
    }

    public stopActorMove() {
        if (!this.mRoom.actor) {
            Logger.error("MainHero miss");
            return;
        }
        this.mRoom.actor.stopMove();
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
        const positions = content.spritePositions;
        const type = content.nodeType;
        if (type !== op_def.NodeType.CharacterNodeType) {
            return;
        }
        let player: Player;
        let point: op_def.IPBPoint3f;
        for (const position of positions) {
            player = this.mPlayerMap.get(position.id);
            if (!player) {
                if (position.id === this.mRoom.actor.id) {
                    player = this.mRoom.actor;
                } else {
                    continue;
                }
            }
            point = position.point3f;
            player.setPosition(new Pos(point.x | 0, point.y | 0, point.z | 0));
            Logger.debug(`adjust,x:${point.x},y:${point.y}`);
        }
    }

    private onAdd(packet: PBpacket) {
        if (!this.mPlayerMap) {
            this.mPlayerMap = new Map();
        }
        const content: op_client.IOP_VIRTUAL_WORLD_REQ_CLIENT_ADD_SPRITE = packet.content;
        const sprites = content.sprites;
        const type = content.nodeType;
        if (type !== op_def.NodeType.CharacterNodeType) {
            return;
        }
        let point: op_def.IPBPoint3f;
        for (const sprite of sprites) {
            point = sprite.point3f;
            this._add(new Sprite(sprite));
        }
    }

    private _add(sprite: ISprite) {
        if (!this.mPlayerMap) this.mPlayerMap = new Map();
        if (!this.mPlayerMap.has(sprite.id)) {
            const player = new Player(sprite, this);
            this.mPlayerMap.set(player.id || 0, player);
            this.roomService.blocks.add(player);
        }
    }

    private onRemove(packet: PBpacket) {
        const content: op_client.IOP_VIRTUAL_WORLD_REQ_CLIENT_DELETE_SPRITE = packet.content;
        const type: number = content.nodeType;
        const ids: number[] = content.ids;
        if (type !== op_def.NodeType.CharacterNodeType) {
            return;
        }
        for (const id of ids) {
            this.removeFromMap(id);
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

    private onShowBubble(packet: PBpacket) {
        const content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_CHAT = packet.content;
        const player = this.get(content.chatSenderid);
        if (player) {
            player.showBubble(content.chatContext, content.chatSetting);
        }
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
        Logger.error("room is undefined");
    }
}
