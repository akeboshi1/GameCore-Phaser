import { PacketHandler, PBpacket } from "net-socket-packet";
import { op_client, op_def, op_virtual_world } from "pixelpai_proto";
import { ConnectionService } from "../../../../lib/net/connection.service";
import { Handler, Logger, LogicPos } from "utils";
import { ISprite, Sprite } from "../display/sprite/sprite";
import { IElementStorage } from "../elementstorage/element.storage";
import { IRoomService, Room } from "../room/room";

import { IElement, Element, InputEnable } from "./element";
import NodeType = op_def.NodeType;
import { EventType, IFramesModel } from "structure";
import { IDragonbonesModel } from "structure";
import { ElementStateManager } from "./element.state.manager";
import { ElementDataManager } from "../../data.manager/element.dataManager";
import { DataMgrType } from "../../data.manager";
import { ElementActionManager } from "../elementaction/element.action.manager";
export interface IElementManager {
    hasAddComplete: boolean;
    readonly connection: ConnectionService | undefined;
    readonly roomService: IRoomService;
    readonly map: number[][];
    add(sprite: ISprite[]);
    remove(id: number): IElement;
    getElements(): IElement[];
    addToMap(sprite: ISprite);
    removeFromMap(sprite: ISprite);
    destroy();
}

export interface Task {
    action: string;
    loc: Partial<op_def.IMossMetaData>;
}

export class ElementManager extends PacketHandler implements IElementManager {
    public hasAddComplete: boolean = false;
    protected mElements: Map<number, Element> = new Map();
    protected mMap: number[][];
    private mGameConfig: IElementStorage;
    private mStateMgr: ElementStateManager;
    private mActionMgr: ElementActionManager;
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
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_ACTIVE_SPRITE, this.onActiveSpriteHandler);
        }
        if (this.mRoom && this.mRoom.game) {
            this.mGameConfig = this.mRoom.game.elementStorage;
        }

        const size = this.mRoom.miniSize;
        this.mMap = new Array(size.rows);
        for (let i = 0; i < this.mMap.length; i++) {
            this.mMap[i] = new Array(size.cols).fill(-1);
        }
        this.mStateMgr = new ElementStateManager(mRoom);
        this.mActionMgr = new ElementActionManager(mRoom.game);
        this.eleDataMgr.on(EventType.SCENE_ELEMENT_FIND, this.onQueryElementHandler, this);
        this.mRoom.game.emitter.on(EventType.SCENE_INTERACTION_ELEMENT, this.checkElementAction, this);
    }

    public init() {
        // this.destroy();
    }

    public has(id: number) {
        return this.mElements.has(id);
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
            this.removeMap(element.model);
        }
        return element;
    }

    public getElements(): IElement[] {
        return Array.from(this.mElements.values());
    }

    public add(sprites: ISprite[], addMap?: boolean) {
        for (const sprite of sprites) {
            this._add(sprite, addMap);
        }
    }

    public addToMap(sprite: ISprite) {
        const displayInfo = sprite.displayInfo;
        if (!displayInfo) {
            return;
        }
        const collision = sprite.getCollisionArea();
        let walkable = sprite.getWalkableArea();
        const origin = sprite.getOriginPoint();
        if (!collision || !walkable) {
            return;
        }
        const rows = collision.length;
        const cols = collision[0].length;
        const pos = this.mRoom.transformToMini45(sprite.pos);
        if (!walkable) {
            walkable = new Array(rows);
            for (let i = 0; i < rows; i++) {
                walkable[i] = new Array(cols).fill(0);
            }
        }
        let row = 0;
        let col = 0;
        for (let i = 0; i < rows; i++) {
            row = pos.y + i - origin.y;
            for (let j = 0; j < cols; j++) {
                if (collision[i][j] === 1) {
                    col = pos.x + j - origin.x;
                    if (row >= 0 && row < this.mMap.length && col >= 0 && col < this.mMap[row].length) {
                        if (walkable[i] === undefined || walkable[i][j] === undefined) {
                            this.mMap[row][col] = 0;
                        } else {
                            this.mMap[row][col] = walkable[i][j];
                        }
                        (<Room>this.roomService).setElementWalkable(row, col, this.mMap[row][col] === 1);
                    }
                }
            }
        }
    }

    public removeFromMap(sprite: ISprite) {
        if (!sprite) return;
        const collision = sprite.getCollisionArea();
        if (collision) return;
        let walkable = sprite.getWalkableArea();
        const origin = sprite.getOriginPoint();
        if (!walkable) {
            return;
        }
        const rows = collision.length;
        const cols = collision[0].length;
        const pos = this.mRoom.transformToMini45(sprite.pos);
        if (!walkable) {
            walkable = new Array(rows);
            for (let i = 0; i < rows; i++) {
                walkable[i] = new Array(cols).fill(0);
            }
        }
        let row = 0;
        let col = 0;
        for (let i = 0; i < rows; i++) {
            row = pos.y + i - origin.y;
            for (let j = 0; j < cols; j++) {
                if (collision[i][j] === 1) {
                    col = pos.x + j - origin.x;
                    if (row >= 0 && row < this.mMap.length && col >= 0 && col < this.mMap[row].length) {
                        this.mMap[row][col] = 0;
                    }
                }
            }
        }
    }

    public setState(state: op_client.IStateGroup) {
        if (!state) {
            return;
        }
        const owner = state.owner;
        if (!owner || owner.type !== op_def.NodeType.ElementNodeType) {
            return;
        }
        const element = this.get(owner.id);
        if (!element) {
            return;
        }
        element.setState(state.state);
    }
    public checkElementAction(id: number, userid?: number): boolean {
        const ele = this.get(id);
        if (!ele) return;
        if (ele.model.nodeType !== NodeType.ElementNodeType) return false;
        if (this.mActionMgr.checkAllAction(ele.model).length > 0) {
            this.mActionMgr.executeElementActions(ele.model, userid);
        }
    }
    public destroy() {
        this.mRoom.game.emitter.off(EventType.SCENE_INTERACTION_ELEMENT, this.checkElementAction, this);
        if (this.eleDataMgr) this.eleDataMgr.off(EventType.SCENE_ELEMENT_FIND, this.onQueryElementHandler, this);
        if (this.connection) {
            Logger.getInstance().log("elementmanager ---- removepacklistener");
            this.connection.removePacketListener(this);
        }
        if (!this.mElements) return;
        this.mElements.forEach((element) => this.remove(element.id));
        this.mElements.clear();
        this.mStateMgr.destroy();
        this.mActionMgr.destroy();
    }

    public update(time: number, delta: number) { }

    protected addMap(sprite: ISprite) { }

    protected removeMap(sprite: ISprite) { }

    get connection(): ConnectionService {
        if (this.mRoom) {
            return this.mRoom.game.connection;
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
            ele.setPosition(new LogicPos(point.x || 0, point.y || 0, point.z || 0));
        }
    }

    protected onAdd(packet: PBpacket) {
        // if (!this.mRoom.layerManager) {
        //     Logger.getInstance().error("layer manager does not exist");
        //     return;
        // }
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
        const ids = [];
        const eles = [];
        for (const obj of objs) {
            point = obj.point3f;
            Logger.getInstance().log("add element: ", point);
            if (point) {
                sprite = new Sprite(obj, content.nodeType);
                if (!sprite.displayInfo) {
                    if (!this.checkDisplay(sprite)) {
                        ids.push(sprite.id);
                    }
                }
                const ele = this._add(sprite);
                eles.push(ele);
            }
        }
        this.fetchDisplay(ids);
        this.mStateMgr.add(eles);
        this.checkElementDataAction(eles);
    }

    protected _add(sprite: ISprite, addMap?: boolean): Element {
        if (addMap === undefined) addMap = true;
        let ele = this.mElements.get(sprite.id);
        if (ele) {
            ele.model = sprite;
        } else {
            ele = new Element(sprite, this);
            ele.setInputEnable(InputEnable.Interactive);
        }
        // if (!ele) ele = new Element(sprite, this);
        if (addMap) this.addMap(sprite);
        this.mElements.set(ele.id || 0, ele);
        return ele;
    }

    protected addComplete(packet: PBpacket) {
        this.hasAddComplete = true;
    }

    protected checkDisplay(sprite: ISprite): IFramesModel | IDragonbonesModel {
        if (!sprite.displayInfo) {
            const displayInfo = this.roomService.game.elementStorage.getDisplayModel(sprite.bindID || sprite.id);
            if (displayInfo) {
                sprite.setDisplayInfo(displayInfo);
                return displayInfo;
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

    get map(): number[][] {
        return this.mMap;
    }
    get eleDataMgr() {
        if (this.mRoom) {
            const game = this.mRoom.game;
            return game.getDataMgr<ElementDataManager>(DataMgrType.EleMgr);
        }
        return undefined;
    }
    protected onSetPosition(packet: PBpacket) {
        const content: op_client.IOP_VIRTUAL_WORLD_REQ_CLIENT_SET_SPRITE_POSITION = packet.content;
        const type: number = content.nodeType;
        const id: number = content.id;
        if (type !== NodeType.ElementNodeType) {
            return;
        }
        const ele: Element = this.get(id);
        ele.setPosition(new LogicPos(content.position.x, content.position.y, content.position.z));
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
            this.mStateMgr.remove(id);
            this.eleDataMgr.offAction(id, EventType.SCENE_ELEMENT_DATA_UPDATE, undefined, undefined);
        }
    }

    protected onSync(packet: PBpacket) {
        const content: op_client.IOP_VIRTUAL_WORLD_REQ_CLIENT_SYNC_SPRITE = packet.content;
        if (content.nodeType !== NodeType.ElementNodeType) {
            return;
        }
        let element: Element = null;
        const sprites = content.sprites;
        const command = content.command;
        const ele = [];
        for (const sprite of sprites) {
            element = this.get(sprite.id);
            if (element) {
                if (command === op_def.OpCommand.OP_COMMAND_UPDATE) {
                    element.model = new Sprite(sprite, content.nodeType);
                } else if (command === op_def.OpCommand.OP_COMMAND_PATCH) {
                    element.updateModel(sprite);
                }
                ele.push(element);
            }
        }
        this.mStateMgr.syncElement(ele);
        this.checkElementDataAction(ele);
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
                const { x, y } = moveData.destinationPoint3f;
                element.move([{ x, y }]);
                // element.move(moveData);
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
        let ele: IElement = null;
        const ids = content.ids;
        for (const id of ids) {
            ele = this.get(id);
            if (ele) {
                ele.setQueue(content.changeAnimation);
            }
        }
    }
    private checkElementDataAction(eles: Element[]) {
        const eleDataMgr = this.eleDataMgr;
        if (!eleDataMgr) return;
        for (const ele of eles) {
            if (eleDataMgr.hasAction(ele.id, EventType.SCENE_ELEMENT_DATA_UPDATE)) {
                eleDataMgr.actionEmitter(ele.id, EventType.SCENE_ELEMENT_DATA_UPDATE, this.mActionMgr.getActionData(ele.model, "TQ_PKT_Action").data);
            }
        }
    }

    private onQueryElementHandler(id: number) {
        const ele = this.get(id);
        this.eleDataMgr.emit(EventType.SCENE_RETURN_FIND_ELEMENT, ele);
    }
    private onActiveSpriteHandler(packet: PBpacket) {
        const content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_ACTIVE_SPRITE = packet.content;
        this.checkElementAction(content.targetId, content.spriteId);
    }
}
