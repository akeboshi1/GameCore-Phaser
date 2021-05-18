import { PacketHandler, PBpacket } from "net-socket-packet";
import { op_client, op_def, op_gameconfig } from "pixelpai_proto";
import { Player } from "./player";
import { IElementManager } from "../element/element.manager";
import { User } from "../../actor/user";
import { IRoomService, Room } from "../room/room";
import { PlayerModel } from "./player.model";
import { AvatarSuitType, EventType, ISprite, MessageType, PlayerState } from "structure";
import { Logger, LogicPos } from "utils";
import { ConnectionService } from "../../../../lib/net/connection.service";
import { IElement } from "../element/element";
import { Sprite } from "baseModel";
import NodeType = op_def.NodeType;
import { PlayerElementAction } from "gamecore";
import { PicaPlayerActionManager } from "../elementaction";

export class PlayerManager extends PacketHandler implements IElementManager {
    public hasAddComplete: boolean = false;
    private mActor: User;
    private mPlayerMap: Map<number, Player> = new Map();
    private mActionMgr: PicaPlayerActionManager;

    constructor(private mRoom: Room) {
        super();
        if (this.connection) {
            this.connection.addPacketListener(this);
            Logger.getInstance().debug("playermanager ---- addpacklistener");
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_ADD_SPRITE, this.onAdd);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_ADD_SPRITE_END, this.addComplete);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_DELETE_SPRITE, this.onRemove);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_ADJUST_POSITION, this.onAdjust);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_MOVE_SPRITE, this.onMove);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_SHOW_EFFECT, this.onShowEffect);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_ONLY_BUBBLE, this.onOnlyBubbleHandler);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_CHAT, this.onShowBubble);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_ONLY_BUBBLE_CLEAN, this.onClearBubbleHandler);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_SYNC_SPRITE, this.onSync);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_CHANGE_SPRITE_ANIMATION, this.onChangeAnimation);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_SET_SPRITE_POSITION, this.onSetPosition);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_SET_POSITION, this.onSetPosition);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_ACTIVE_SPRITE, this.onActiveSpriteHandler);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_ACTIVE_SPRITE_END, this.onActiveSpriteEndHandler);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_SYNC_ACTOR, this.onSyncActorHandler);
        }
        this.mActionMgr = new PicaPlayerActionManager(this.mRoom.game);
        this.addLisenter();
    }

    public addLisenter() {
        this.mRoom.game.emitter.on(EventType.SCENE_ELEMENT_FIND, this.onQueryElementHandler, this);
        this.mRoom.game.emitter.on(EventType.SCENE_INTERACTION_ELEMENT, this.checkPlayerAction, this);
        this.mRoom.game.emitter.on(EventType.SCENE_PLAYER_ACTION, this.onActiveSprite, this);
    }

    public removeLisenter() {
        this.mRoom.game.emitter.off(EventType.SCENE_ELEMENT_FIND, this.onQueryElementHandler, this);
        this.mRoom.game.emitter.off(EventType.SCENE_INTERACTION_ELEMENT, this.checkPlayerAction, this);
        this.mRoom.game.emitter.off(EventType.SCENE_PLAYER_ACTION, this.onActiveSprite, this);
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
            Logger.getInstance().debug("playermanager ---- removepacklistener");
            this.connection.removePacketListener(this);
        }
        if (this.mActor) {
            this.mActor.destroy();
            this.mActor = null;
        }
        if (this.mPlayerMap) {
            this.mPlayerMap.forEach((player) => this.remove(player.id));
            this.mPlayerMap.clear();
        }
    }

    update(time: number, delta: number) {
        this.mPlayerMap.forEach((player) => player.update(time, delta));
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

    has(id: number) {
        return this.mPlayerMap.has(id);
    }

    add(sprite: ISprite[]) {
    }

    public remove(id: number): IElement {
        const element = this.mPlayerMap.get(id);
        if (element) {
            this.mPlayerMap.delete(id);
            element.destroy();
        }
        return element;
    }

    public setMe(user: User) {
        this.mActor = user;
        this.mPlayerMap.set(user.id, user);
    }

    public addToWalkableMap(sprite: ISprite) {
    }

    public removeFromWalkableMap(sprite: ISprite) {
    }

    public resetWalkable(sprite: ISprite) {
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

    public onActiveSprite(id: number, targetId: number, data: any) {
        id = id || this.mRoom.game.user.id;
        if (this.has(id)) {
            if (data) {
                if (typeof data === "string") data = JSON.parse(data);
                const element = this.get(id);
                if (data.weaponID) {
                    element.setWeapon(data.weaponID);
                }
                const target = this.roomService.getElement(targetId);
                if (target) {
                    element.calcDirection(element.getPosition(), target.getPosition());
                }
                if (data.animation) {
                    element.play(data.animation, data.times);
                }
                this.mActionMgr.executeElementActions(data.action, { targetId, id: data.id }, id);
            }
        }
    }

    public addWeapon(id: number, weaponID: string) {
        if (this.has(id)) {
            const element = this.get(id);
            element.setWeapon(weaponID);
        }
    }

    public playAnimator(id: number, aniName: string, times?: number) {
        if (this.has(id)) {
            const element = this.get(id);
            element.play(aniName, times);
        }
    }

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

    public onDisplayCreated(id: number) {
    }

    public onDisplayRemoved(id: number) {
    }

    public hideAll() {
        this.mPlayerMap.forEach((val, key) => {
            this.mRoom.game.renderPeer.SetDisplayVisible(val.id, false);
        });
    }

    public showAll() {
        this.mPlayerMap.forEach((val, key) => {
            this.mRoom.game.renderPeer.SetDisplayVisible(val.id, true);
        });
    }

    public setState(state: op_client.IStateGroup) {
        const ele = this.get(state.owner.id);
        if (ele) ele.setState(state);
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
                this._loadSprite(sprite);
                if (command === op_def.OpCommand.OP_COMMAND_UPDATE) {
                    this.checkSuitAvatarSprite(sprite);
                    player.model = new Sprite(sprite, content.nodeType);
                } else if (command === op_def.OpCommand.OP_COMMAND_PATCH) {
                    player.updateModel(sprite, this.mRoom.game.avatarType);
                }
            }
        }
    }

    private _loadSprite(sprite: op_client.ISprite) {
        const configMgr = <any>this.mRoom.game.configManager;
        const attrs = sprite.attrs;
        for (const attr of attrs) {
            if (!attr.value) continue;
            const valueObj = JSON.parse(attr.value);
            const len = Object.keys(valueObj).length;
            if (len > 0) {
                const newAttrs = [];
                valueObj.forEach((v) => {
                    if (v.id) {
                        const config = configMgr.getItemBaseByID(v.id);
                        newAttrs.push({
                            suit_type: config.suitType,
                            sn: config.sn,
                            version: config.version,
                            slot: config.slot,
                            tag: config.tag,
                            id: config.id
                        });
                    }
                });
                attr.value = JSON.stringify(newAttrs);
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
                if (player) {
                    point = position.point3f;
                    player.setPosition(new LogicPos(point.x || 0, point.y || 0, point.z || 0));
                }
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
            this._loadSprite(sprite);
            this.checkSuitAvatarSprite(sprite);
            this._add(new Sprite(sprite, content.nodeType));
        }
    }

    private _add(sprite: ISprite) {
        if (!this.mPlayerMap) this.mPlayerMap = new Map();
        if (!this.mPlayerMap.has(sprite.id)) {
            const player = new Player(this.mRoom.game, sprite as Sprite, this);
            this.mPlayerMap.set(player.id || 0, player);
        }
    }

    private checkSuitAvatarSprite(sprite: op_client.ISprite) {
        if (this.mRoom.game.avatarType === op_def.AvatarStyle.SuitType) {
            if (!AvatarSuitType.hasAvatarSuit(sprite["attrs"])) {
                if (!sprite.avatar) sprite.avatar = <any>(AvatarSuitType.createBaseAvatar());
            }
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
            this.remove(id);
        }
    }

    private onMove(packet: PBpacket) {
        const content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_MOVE_SPRITE = packet.content;
        if (content.movePath) {
            const movePaths: op_def.IMovePath[] = content.movePath;
            const len: number = movePaths.length;
            let movePath: op_def.IMovePath;
            let playID: number;
            let player: Player;
            for (let i: number = 0; i < len; i++) {
                movePath = movePaths[i];
                playID = movePath.id;
                player = this.get(playID);
                if (player && movePath.movePos && movePath.movePos.length > 0) {
                    player.move(movePath.movePos);
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
            role.stopMove();
            role.setPosition(new LogicPos(content.position.x, content.position.y, content.position.z), id === this.mActor.id);
            this.mRoom.game.renderPeer.setPosition(id, content.position.x, content.position.y, content.position.z);
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

    private onQueryElementHandler(id: number) {
        const ele = this.get(id);
        this.mRoom.game.emitter.emit(EventType.SCENE_RETURN_FIND_ELEMENT, ele);
    }

    private checkPlayerAction(id: number) {
        if (this.has(id) && id !== this.mRoom.game.user.id) {
            const ele = this.get(id);
            const action = new PlayerElementAction(this.mRoom.game, ele.model);
            action.executeAction();
        }
    }

    private onActiveSpriteHandler(packet: PBpacket) {
        const content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_ACTIVE_SPRITE = packet.content;
        if (this.has(content.targetId)) {
            this.onActiveSprite(content.spriteId, content.targetId, content.param);
        }
    }

    private onActiveSpriteEndHandler(packet: PBpacket) {
        const content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_ACTIVE_SPRITE_END = packet.content;
        const playerid = content.spriteId;
        if (this.has(playerid)) {
            const element = this.get(playerid);
            element.removeWeapon();
            element.play(PlayerState.IDLE);
        }
    }

    private onSyncActorHandler(packet: PBpacket) {
        const content: op_client.IOP_VIRTUAL_WORLD_REQ_CLIENT_SYNC_ACTOR = packet.content;
        this.mActor.updateModel(content.actor);
    }

    get roomService(): IRoomService {
        return this.mRoom;
    }

    get connection(): ConnectionService {
        if (this.mRoom) {
            return this.mRoom.connection;
        }
        Logger.getInstance().error("room is undefined");
    }
}
