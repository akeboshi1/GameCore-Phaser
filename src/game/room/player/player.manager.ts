import { PacketHandler, PBpacket } from "net-socket-packet";
import { op_client, op_def, op_gameconfig, op_virtual_world } from "pixelpai_proto";
import NodeType = op_def.NodeType;
import { Player } from "./player";
import { IElementManager } from "../element/element.manager";
import { User } from "../../actor/user";
import { IRoomService, Room } from "../room/room";
import { PlayerModel } from "./player.model";
import { ISprite, Sprite } from "../display/sprite/sprite";
import { EventType, MessageType } from "structure";
import { LogicPos, Logger } from "utils";
import { ConnectionService } from "../../../../lib/net/connection.service";
import { IElement } from "../element/element";

export class PlayerManager extends PacketHandler implements IElementManager {
    public hasAddComplete: boolean = false;
    private mActor: User;
    private mPlayerMap: Map<number, Player> = new Map();
    constructor(private mRoom: Room) {
        super();
        if (this.connection) {
            this.connection.addPacketListener(this);
            Logger.getInstance().log("playermanager ---- addpacklistener");
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_ADD_SPRITE, this.onAdd);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_ADD_SPRITE_END, this.addComplete);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_DELETE_SPRITE, this.onRemove);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_ADJUST_POSITION, this.onAdjust);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_MOVE_SPRITE, this.onMove);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_SHOW_EFFECT, this.onShowEffect);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_ONLY_BUBBLE, this.onOnlyBubbleHandler);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_CHAT, this.onShowBubble);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_ONLY_BUBBLE_CLEAN, this.onClearBubbleHandler);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_SYNC_SPRITE, this.onSync);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_CHANGE_SPRITE_ANIMATION, this.onChangeAnimation);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_SET_SPRITE_POSITION, this.onSetPosition);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_MOVE_SPRITE_BY_PATH, this.onMovePath);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_SET_POSITION, this.onSetPosition);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_STOP, this.onStop);
        }
        this.addLisenter();
    }

    public addLisenter() {
        this.mRoom.game.emitter.on(EventType.SCENE_ELEMENT_FIND, this.onQueryElementHandler, this);
    }

    public removeLisenter() {
        this.mRoom.game.emitter.off(EventType.SCENE_ELEMENT_FIND, this.onQueryElementHandler, this);
    }

    public createActor(actor: op_client.IActor) {
        const playModel = new PlayerModel(actor);
        this.mActor = new User(this.mRoom.game);
    }

    get actor(): User {
        return this.mActor;
    }

    public destroy() {
        this.removeLisenter();
        if (this.connection) {
            Logger.getInstance().log("playermanager ---- removepacklistener");
            this.connection.removePacketListener(this);
        }
        if (this.mActor) {
            this.mActor.destroy();
            this.mActor = null;
        }
        if (!this.mPlayerMap) return;
        this.mPlayerMap.forEach((player) => this.removeFromMap(player.id));
        this.mPlayerMap.clear();
    }

    public removeFromMap(id: number) {
        const player = this.mPlayerMap.get(id);
        if (player) {
            // MineCarSimulateData.destroyMineCar(this.roomService.elementManager, player.model);
            this.mPlayerMap.delete(id);
            player.destroy();
        }
    }

    public get(id: number): Player {
        if (!this.mPlayerMap) {
            return;
        }
        let player = this.mPlayerMap.get(id);
        if (!player) {
            const actor = this.actor;
            if (actor && actor.id === id) {
                player = actor;
            }
        }
        return player;
    }

    add(sprite: ISprite[]) {
    }

    public remove(id: number): IElement {
        const element = this.mPlayerMap.get(id);
        if (element) {
            this.mPlayerMap.delete(id);
            element.destroy();
        }
        if (this.mActor) {
            this.mActor.destroy();
            this.mActor = null;
        }
        return element;
    }

    public setMe(user: User) {
        this.mActor = user;
        this.mPlayerMap.set(user.id, user);
    }

    public getElements(): IElement[] {
        return Array.from(this.mPlayerMap.values());
    }

    public set(id: number, player: Player) {
        if (!this.mPlayerMap) {
            this.mPlayerMap = new Map();
        }
        this.mPlayerMap.set(id, player);
    }

    // public addPlayer(obj: op_client.IActor): void {
    //     const playerInfo: PlayerInfo = new PlayerInfo();
    //     playerInfo.setInfo(obj);
    //     if (obj.walkOriginPoint) {
    //         playerInfo.setOriginWalkPoint(obj.walkOriginPoint);
    //     }
    //     if (obj.originPoint) {
    //         playerInfo.setOriginCollisionPoint(obj.originPoint);
    //     }
    //     this.mPlayerInfoList.push(playerInfo);
    //     this.mModelDispatch.emit(MessageType.SCENE_ADD_PLAYER, playerInfo);
    // }

    public addPackItems(elementId: number, items: op_gameconfig.IItem[]): void {
        const character: Player = this.mPlayerMap.get(elementId);
        if (character && character.id === this.mActor.id) {
            if (!(character as User).package) {
                (character as User).package = op_gameconfig.Package.create();
            }
            (character as User).package.items = (character as User).package.items.concat(items);
            this.mRoom.game.peer.render.emitter.emit(MessageType.UPDATED_CHARACTER_PACKAGE);
        }
    }

    public removePackItems(elementId: number, itemId: number): boolean {
        const character: Player = this.mPlayerMap.get(elementId);
        if (character && this.mActor.id) {
            const itemList: any[] = (character as User).package.items;
            const len = itemList.length;
            for (let i = 0; i < len; i++) {
                if (itemId === itemList[i].id) {
                    itemList.splice(i, 1);
                    return true;
                }
            }
        }
        return false;
    }

    private onSync(packet: PBpacket) {
        const content: op_client.IOP_VIRTUAL_WORLD_REQ_CLIENT_SYNC_SPRITE = packet.content;
        if (content.nodeType !== op_def.NodeType.CharacterNodeType) {
            return;
        }
        let player: Player = null;
        const sprites = content.sprites;
        const command = content.command;
        for (const sprite of sprites) {
            player = this.get(sprite.id);
            if (player) {
                //  MineCarSimulateData.addSimulate(this.roomService, sprite, player.model);
                if (command === op_def.OpCommand.OP_COMMAND_UPDATE) {
                    player.model = new Sprite(sprite, content.nodeType);
                } else if (command === op_def.OpCommand.OP_COMMAND_PATCH) {
                    player.updateModel(sprite);
                }
            }
        }
    }

    private onAdjust(packet: PBpacket) {
        const content: op_client.IOP_VIRTUAL_WORLD_REQ_CLIENT_ADJUST_POSITION = packet.content;
        const positions = content.spritePositions;
        const type = content.nodeType;
        if (type !== op_def.NodeType.CharacterNodeType) {
            return;
        }
        if (this.mActor) {
            let player: Player;
            let point: op_def.IPBPoint3f;
            for (const position of positions) {
                player = this.mPlayerMap.get(position.id);
                // if (!player) {
                //     if (position.id === this.mActor.id) {
                //         player = this.mActor;
                //     } else {
                //         continue;
                //     }
                // }
                if (player) {
                    point = position.point3f;
                    player.setPosition(new LogicPos(point.x || 0, point.y || 0, point.z || 0));
                }
                // Logger.getInstance().debug(`adjust,x:${point.x},y:${point.y}`);
            }
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
        for (const sprite of sprites) {
            this._add(new Sprite(sprite, content.nodeType));
            // MineCarSimulateData.addSimulate(this.roomService, sprite);
        }
    }

    private _add(sprite: ISprite) {
        if (!this.mPlayerMap) this.mPlayerMap = new Map();
        if (!this.mPlayerMap.has(sprite.id)) {
            const player = new Player(sprite as Sprite, this);
            this.mPlayerMap.set(player.id || 0, player);
        }
    }

    private addComplete(packet: PBpacket) {
        this.hasAddComplete = true;
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
        const content: op_client.IOP_VIRTUAL_WORLD_REQ_CLIENT_MOVE_SPRITE = packet.content;
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
                if (player) {
                    // player.move(moveData);
                    const { x, y } = moveData.destinationPoint3f;
                    player.move([{ x, y }]);
                }
            }
        }
    }

    private onSetPosition(packet: PBpacket) {
        const content: op_client.IOP_VIRTUAL_WORLD_REQ_CLIENT_SET_SPRITE_POSITION = packet.content;
        const type: number = content.nodeType;
        const id: number = content.id;
        if (type !== NodeType.CharacterNodeType) {
            return;
        }
        const role: Player = this.get(id);
        if (role) {
            role.setPosition(new LogicPos(content.position.x, content.position.y, content.position.z));
        }
    }

    private onShowBubble(packet: PBpacket) {
        const content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_CHAT = packet.content;
        const player = this.get(content.chatSenderid);
        if (player) {
            player.showBubble(content.chatContext, content.chatSetting);
        }
    }

    private onOnlyBubbleHandler(packet: PBpacket) {
        const content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_ONLY_BUBBLE = packet.content;
        const player = this.get(content.receiverid);
        if (player) {
            player.showBubble(content.context, content.chatsetting);
        }
    }

    private onClearBubbleHandler(packet: PBpacket) {
        const content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_ONLY_BUBBLE_CLEAN = packet.content;
        const player = this.get(content.receiverid);
        if (player) {
            player.clearBubble();
        }
    }

    private onShowEffect(packet: PBpacket) {
        const content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_SHOW_EFFECT = packet.content;
        const ids = content.id;
        let player: Player;
        for (const id of ids) {
            player = this.get(id);
            if (player) {
                player.showEffected(null);
            }
        }
    }

    private onChangeAnimation(packet: PBpacket) {
        const content: op_client.IOP_VIRTUAL_WORLD_REQ_CLIENT_CHANGE_SPRITE_ANIMATION = packet.content;
        if (content.nodeType !== NodeType.CharacterNodeType) {
            return;
        }
        let player: Player = null;
        const ids = content.ids;
        for (const id of ids) {
            player = this.get(id);
            if (player) {
                player.setQueue(content.changeAnimation);
            }
        }
    }

    private onStop(packet: PBpacket) {
        const content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_STOP = packet.content;
        const sprites = content.sprites;
        let player: Player = null;
        for (const sprite of sprites) {
            if (sprite.id === this.mActor.id) {
                this.mActor.move([{ x: sprite.point3f.x, y: sprite.point3f.y}]);
                continue;
            }
            player = this.get(sprite.id);
            if (player) {
                // player.updateModel(sprite);
                // player.stopMove();
                const { point3f, direction } = sprite;
                player.stopAt({ x: point3f.x, y: point3f.y, stopDir: direction });
            }
        }
    }

    private onMovePath(packet: PBpacket) {
        let content: op_client.IOP_VIRTUAL_WORLD_REQ_CLIENT_MOVE_SPRITE_BY_PATH = packet.content;
        if (content.nodeType !== NodeType.CharacterNodeType) {
            return;
        }
        const play = this.get(content.id);
        if (play) {
            play.movePath(content);
        }
        content = null;
    }

    private onQueryElementHandler(id: number) {
        const ele = this.get(id);
        this.mRoom.game.emitter.emit(EventType.SCENE_RETURN_FIND_ELEMENT, ele);
    }

    get roomService(): IRoomService {
        return this.mRoom;
    }

    // get scene(): Phaser.Scene | undefined {
    //     if (this.mRoom) {
    //         return this.mRoom.scene;
    //     }
    // }

    get connection(): ConnectionService {
        if (this.mRoom) {
            return this.mRoom.connection;
        }
        Logger.getInstance().error("room is undefined");
    }

    get map(): number[][] {
        return [];
    }
}
