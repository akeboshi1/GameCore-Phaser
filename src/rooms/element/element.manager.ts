import { PacketHandler, PBpacket } from "net-socket-packet";
import { op_client, op_def, op_virtual_world } from "pixelpai_proto";
import { ConnectionService } from "../../net/connection.service";
import { Element, IElement } from "./element";
import { IRoomService } from "../room";
import { Logger } from "../../utils/log";
import { Pos } from "../../utils/pos";
import { IElementStorage } from "../../game/element.storage";
import { ISprite, Sprite } from "./sprite";
import NodeType = op_def.NodeType;

export interface IElementManager {
    hasAddComplete: boolean;
    readonly connection: ConnectionService | undefined;
    readonly roomService: IRoomService;
    readonly scene: Phaser.Scene | undefined;
    readonly camera: Phaser.Cameras.Scene2D.Camera | undefined;
    add(sprite: ISprite[]);
    remove(id: number): IElement;
    getElements(): IElement[];
    destroy();
}

export class ElementManager extends PacketHandler implements IElementManager {
    public hasAddComplete: boolean = false;
    protected mElements: Map<number, Element> = new Map();
    private mGameConfig: IElementStorage;
    constructor(protected mRoom: IRoomService) {
        super();
        if (this.connection) {
            this.connection.addPacketListener(this);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_ADD_SPRITE, this.onAdd);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_ADD_SPRITE_END, this.addComplete);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_DELETE_SPRITE, this.onRemove);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_MOVE_SPRITE, this.onMove);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_ADJUST_POSITION, this.onAdjust);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_SYNC_SPRITE, this.onSync);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_ONLY_BUBBLE, this.onShowBubble);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_ONLY_BUBBLE_CLEAN, this.onClearBubbleHandler);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_CHANGE_SPRITE_ANIMATION, this.onChangeAnimation);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_SET_SPRITE_POSITION, this.onSetPosition);

        }
        if (this.mRoom && this.mRoom.world) {
            this.mGameConfig = this.mRoom.world.elementStorage;
        }
    }

    public init() {
        // this.destroy();
    }

    public get(id: number): Element {
        const element: Element = this.mElements.get(id);
        if (!element) {
            return;
        }
        return element;
    }

    public remove(id: number): IElement {
        const element = this.mElements.get(id);
        if (element) {
            this.mElements.delete(id);
            element.destroy();
        }
        return element;
    }

    public getElements(): IElement[] {
        return Array.from(this.mElements.values());
    }

    public add(sprite: ISprite[]) {
    }

    public destroy() {
        if (this.connection) {
            this.connection.removePacketListener(this);
        }
        if (!this.mElements) return;
        this.mElements.forEach((element) => this.remove(element.id));
        this.mElements.clear();
    }

    get camera(): Phaser.Cameras.Scene2D.Camera | undefined {
        return this.mRoom.cameraService.camera;
    }

    get connection(): ConnectionService {
        if (this.mRoom) {
            return this.mRoom.connection;
        }
        Logger.getInstance().log("roomManager is undefined");
        return;
    }

    protected onAdjust(packet: PBpacket) {
        const content: op_client.IOP_VIRTUAL_WORLD_REQ_CLIENT_ADJUST_POSITION = packet.content;
        const sprites = content.spritePositions;
        const type = content.nodeType;
        if (type !== NodeType.ElementNodeType) {
            return;
        }
        let ele: Element;
        let point: op_def.IPBPoint3f;
        for (const sprite of sprites) {
            ele = this.mElements.get(sprite.id);
            if (!ele) {
                continue;
            }
            point = sprite.point3f;
            ele.setPosition(new Pos(point.x || 0, point.y || 0, point.z || 0));
        }
    }

    protected onAdd(packet: PBpacket) {
        if (!this.mRoom.layerManager) {
            Logger.getInstance().error("layer manager does not exist");
            return;
        }
        if (!this.mGameConfig) {
            Logger.getInstance().error("gameConfig does not exist");
            return;
        }
        const content: op_client.IOP_VIRTUAL_WORLD_REQ_CLIENT_ADD_SPRITE = packet.content;
        const objs: op_client.ISprite[] | undefined = content.sprites;
        if (!objs) return;
        const type = content.nodeType;
        if (type !== NodeType.ElementNodeType) {
            return;
        }
        let point: op_def.IPBPoint3f;
        let sprite: ISprite = null;
        for (const obj of objs) {
            point = obj.point3f;
            if (point) {
                sprite = new Sprite(obj, content.nodeType);
                if (!sprite.displayInfo) {
                    this.checkDisplay(sprite);
                }
                this._add(sprite);
            }
        }
    }

    protected _add(sprite: ISprite): Element {
        let ele = this.mElements.get(sprite.id);
        if (!ele) ele = new Element(sprite, this);
        // TODO udpate element
        this.mElements.set(ele.id || 0, ele);
        return ele;
    }

    protected addComplete(packet: PBpacket) {
        this.hasAddComplete = true;
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

    get roomService(): IRoomService {
        return this.mRoom;
    }

    get scene(): Phaser.Scene | undefined {
        if (this.mRoom) {
            return this.mRoom.scene;
        }
    }

    protected onSetPosition(packet: PBpacket) {
        const content: op_client.IOP_VIRTUAL_WORLD_REQ_CLIENT_SET_SPRITE_POSITION = packet.content;
        const type: number = content.nodeType;
        const id: number = content.id;
        if (type !== NodeType.ElementNodeType) {
            return;
        }
        const ele: Element = this.get(id);
        ele.setPosition(new Pos(content.position.x, content.position.y, content.position.z));
    }

    protected onRemove(packet: PBpacket) {
        const content: op_client.IOP_VIRTUAL_WORLD_REQ_CLIENT_DELETE_SPRITE = packet.content;
        const type: number = content.nodeType;
        const ids: number[] = content.ids;
        if (type !== NodeType.ElementNodeType) {
            return;
        }
        for (const id of ids) {
            this.remove(id);
        }
    }

    protected onSync(packet: PBpacket) {
        const content: op_client.IOP_EDITOR_REQ_CLIENT_SYNC_SPRITE = packet.content;
        if (content.nodeType !== NodeType.ElementNodeType) {
            return;
        }
        let element: Element = null;
        const sprites = content.sprites;
        for (const sprite of sprites) {
            element = this.get(sprite.id);
            if (element) {
                element.model = new Sprite(sprite, content.nodeType);
            }
        }
    }

    protected onMove(packet: PBpacket) {
        const content: op_client.IOP_VIRTUAL_WORLD_REQ_CLIENT_MOVE_SPRITE = packet.content;
        if (content.moveData) {
            const moveDataList: op_client.IMoveData[] = content.moveData;
            const len: number = moveDataList.length;
            const type: op_def.NodeType = content.nodeType || null;
            let moveData: op_client.IMoveData;
            let elementID: number;
            let element: Element;
            for (let i: number = 0; i < len; i++) {
                moveData = moveDataList[i];
                elementID = moveData.moveObjectId;
                element = this.get(elementID);
                // Console.log(player.x + "," + player.y + ":" + moveData.destinationPoint3f.x + "," + moveData.destinationPoint3f.y + ":" + moveData.timeSpan);
                if (!element) {
                    continue;
                }
                element.move(moveData);
            }
        }
    }

    private onShowBubble(packet: PBpacket) {
        const content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_ONLY_BUBBLE = packet.content;
        const element = this.get(content.receiverid);
        if (element) {
            element.showBubble(content.context, content.chatsetting);
        }
    }

    private onClearBubbleHandler(packet: PBpacket) {
        const content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_ONLY_BUBBLE_CLEAN = packet.content;
        const element = this.get(content.receiverid);
        if (element) {
            element.clearBubble();
        }
    }

    private onChangeAnimation(packet: PBpacket) {
        const content: op_client.IOP_VIRTUAL_WORLD_REQ_CLIENT_CHANGE_SPRITE_ANIMATION = packet.content;
        if (content.nodeType !== NodeType.ElementNodeType) {
            return;
        }
        const anis = content.changeAnimation;
        let ele = null;
        for (const ani of anis) {
            ele = this.get((ani.id));
            if (ele) {
                ele.play(ani.animationName);
            }
        }
    }
}
