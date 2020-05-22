import { IElementManager } from "../element/element.manager";
import { PacketHandler, PBpacket } from "net-socket-packet";
import { op_client, op_def, op_gameconfig, op_virtual_world } from "pixelpai_proto";
import { ConnectionService } from "../../net/connection.service";
import { IRoomService, Room } from "../room";
import { Logger } from "../../utils/log";
import { Pos } from "../../utils/pos";
import { ISprite, Sprite } from "../element/sprite";
import { MessageType } from "../../const/MessageType";
import { Player } from "./player";
import { IElement } from "../element/element";
import { Actor } from "./Actor";
import NodeType = op_def.NodeType;
import { PlayerModel } from "./player.model";
import { FollowGroup } from "../group/FollowGroup";
import { GroupType } from "../group/GroupManager";
import { FollowAction } from "../action/FollowAction";
import { MineCarSimulateData } from "./MineCarSimulateData";

export class PlayerManager extends PacketHandler implements IElementManager {
    public hasAddComplete: boolean = false;
    private mActor: Actor;
    private mPlayerMap: Map<number, Player> = new Map();
    constructor(private mRoom: Room) {
        super();
        if (this.connection) {
            this.connection.addPacketListener(this);
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
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_SET_CAMERA_FOLLOW, this.onCameraFollow);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_MOVE_SPRITE_BY_PATH, this.onMovePath);
        }
    }

    // public createActor(playModel: PlayerModel) {
    //     this.mActor = new Actor(playModel, this);
    //     if (sprite.attrs) {
    //         for (const attr of sprite.attrs) {
    //             this._addSimulate(sprite.id, attr);
    //         }
    //     }
    // }

    public createActor(actor: op_client.IActor) {
        const playModel = new PlayerModel(actor);
        this.mActor = new Actor(playModel, this);
    }

    get actor(): Actor {
        return this.mActor;
    }

    public destroy() {
        if (this.connection) {
            this.connection.removePacketListener(this);
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

    public requestActorMove(dir: number, keyArr: number[]) {

        this.startActorMove();
        if (!this.roomService.world.game.device.os.desktop) {
            // 按下键盘的时候已经发了一次了，如果再发一次后端会有问题
            const pkt: PBpacket = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_GATEWAY_KEYBOARD_DOWN);
            const content: op_virtual_world.IOP_CLIENT_REQ_GATEWAY_KEYBOARD_DOWN = pkt.content;
            content.keyCodes = keyArr;
            this.connection.send(pkt);
        }
    }

    public startActorMove() {
        if (!this.mActor) {
            Logger.getInstance().error("MainHero miss");
            return;
        }
        this.mActor.startMove();
    }

    public stopActorMove() {
        if (!this.mActor) {
            Logger.getInstance().error("MainHero miss");
            return;
        }
        this.mActor.stopMove();
    }

    public get(id: number): Player {
        if (!this.mPlayerMap) {
            return;
        }
        let player = this.mPlayerMap.get(id);
        if (!player) {
            const actor = this.mActor;
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

    public getElements(): IElement[] {
        return Array.from(this.mPlayerMap.values());
    }

    public set(id: number, player: Player) {
        if (!this.mPlayerMap) {
            this.mPlayerMap = new Map();
        }
        this.mPlayerMap.set(id, player);
    }

    get camera(): Phaser.Cameras.Scene2D.Camera {
        return this.mRoom.cameraService.camera;
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
            if (!(character as Actor).package) {
                (character as Actor).package = op_gameconfig.Package.create();
            }
            (character as Actor).package.items = (character as Actor).package.items.concat(items);
            this.mRoom.world.emitter.emit(MessageType.UPDATED_CHARACTER_PACKAGE);
        }
    }

    public removePackItems(elementId: number, itemId: number): boolean {
        const character: Player = this.mPlayerMap.get(elementId);
        if (character && this.mActor.id) {
            const itemList: any[] = (character as Actor).package.items;
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
                    player.model = new Sprite(sprite);
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
                    player.setPosition(new Pos(point.x || 0, point.y || 0, point.z || 0));
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
            this._add(new Sprite(sprite));
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
            const type: op_def.NodeType = content.nodeType || null;
            let moveData: op_client.IMoveData;
            let playID: number;
            let player: Player;
            for (let i: number = 0; i < len; i++) {
                moveData = moveDataList[i];
                playID = moveData.moveObjectId;
                player = this.get(playID);
                if (player) {
                    player.move(moveData);
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
            role.setPosition(new Pos(content.position.x, content.position.y, content.position.z));
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
                player.showEffected();
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

    private onCameraFollow(packet: PBpacket) {
        const content: op_client.IOP_VIRTUAL_WORLD_REQ_CLIENT_SET_CAMERA_FOLLOW = packet.content;
        const player = this.get(content.id);
        const camera = this.roomService.cameraService;
        if (!camera) {
            return;
        }
        if (player) {
            camera.startFollow(player.getDisplay());
        } else {
            camera.stopFollow();
        }
    }

    private onMovePath(packet: PBpacket) {
        const content: op_client.IOP_VIRTUAL_WORLD_REQ_CLIENT_MOVE_SPRITE_BY_PATH = packet.content;
        if (content.nodeType !== NodeType.CharacterNodeType) {
            return;
        }
        const play = this.get(content.id);
        if (play) {
            play.movePath(content);
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
        Logger.getInstance().error("room is undefined");
    }

    get map(): number[][] {
        return [];
    }
}
