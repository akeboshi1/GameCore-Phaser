import { PacketHandler, PBpacket } from "net-socket-packet";
import { op_client, op_def, op_virtual_world } from "pixelpai_proto";
import { ConnectionService } from "../../../../lib/net/connection.service";
import { Logger, LogicPos } from "utils";
import { EventType, IDragonbonesModel, IFramesModel, ISprite, MessageType } from "structure";
import { IRoomService, Room } from "../room/room";
import { Element, IElement, InputEnable } from "./element";
import { ElementStateManager } from "./element.state.manager";
import { ElementDataManager } from "../../data.manager/element.dataManager";
import { DataMgrType } from "../../data.manager";
import { ElementActionManager } from "../elementaction/element.action.manager";
import { Sprite, IElementStorage } from "baseModel";
import NodeType = op_def.NodeType;

export interface IElementManager {
    hasAddComplete: boolean;
    readonly connection: ConnectionService | undefined;
    readonly roomService: IRoomService;

    add(sprite: ISprite[]);

    remove(id: number): IElement;

    getElements(): IElement[];

    destroy();
}

export interface Task {
    action: string;
    loc: Partial<op_def.IMossMetaData>;
}

export class ElementManager extends PacketHandler implements IElementManager {
    public static ELEMENT_READY: string = "ELEMENT_READY";
    public hasAddComplete: boolean = false;
    protected mElements: Map<number, Element> = new Map();
    /**
     * 添加element缓存list
     */
    protected mCacheAddList: any[] = [];
    /**
     * 更新element缓存list
     */
    protected mCacheSyncList: any[] = [];

    /**
     * Add添加 End清空
     */
    protected mAddCache: any[] = [];
    /**
     * 移除缓存list
     */
    protected mCacheRemoveList: any[] = [];
    private mDealAddList: any[] = [];
    private mRequestSyncIdList: number[] = [];
    private mDealSyncMap: Map<number, boolean> = new Map();
    private mGameConfig: IElementStorage;
    private mStateMgr: ElementStateManager;
    private mActionMgr: ElementActionManager;
    private mLoadLen: number = 0;
    private mCurIndex: number = 0;

    constructor(protected mRoom: IRoomService) {
        super();
        if (this.connection) {
            this.connection.addPacketListener(this);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_ADD_SPRITE, this.onAdd);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_ADD_SPRITE_END, this.addComplete);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_DELETE_SPRITE, this.onRemove);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_MOVE_SPRITE, this.onMove);
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

        // 进入房间创建地图后将其拷贝给物理进程
        // this.roomService.game.physicalPeer.createMap(this.mMap);
        this.mStateMgr = new ElementStateManager(mRoom);
        this.mActionMgr = new ElementActionManager(mRoom.game);
        this.eleDataMgr.on(EventType.SCENE_ELEMENT_FIND, this.onQueryElementHandler, this);
        this.mRoom.game.emitter.on(EventType.SCENE_INTERACTION_ELEMENT, this.checkElementAction, this);

        this.mRoom.onManagerCreated(this.constructor.name);
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
            element.removeFromWalkableMap();
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
        if (!ele) return false;
        if (ele.model.nodeType !== NodeType.ElementNodeType) return false;
        if (this.mActionMgr.checkAllAction(ele.model).length > 0) {
            this.mActionMgr.executeElementActions(ele.model, userid);
            return true;
        }
        return false;
    }

    public isElementLocked(element: IElement) {
        if (!this.mStateMgr) return false;
        return this.mStateMgr.isLocked(element);
    }

    public destroy() {
        this.hasAddComplete = false;
        this.mRoom.game.emitter.off(EventType.SCENE_INTERACTION_ELEMENT, this.checkElementAction, this);
        if (this.eleDataMgr) this.eleDataMgr.off(EventType.SCENE_ELEMENT_FIND, this.onQueryElementHandler, this);
        if (this.connection) {
            Logger.getInstance().debug("elementmanager ---- removepacklistener");
            this.connection.removePacketListener(this);
        }
        if (this.mElements) {
            this.mElements.forEach((element) => this.remove(element.id));
            this.mElements.clear();
            this.mStateMgr.destroy();
            this.mActionMgr.destroy();
        }
        if (this.mDealAddList) this.mDealAddList.length = 0;
        if (this.mRequestSyncIdList) this.mRequestSyncIdList.length = 0;
        if (this.mDealSyncMap) this.mDealSyncMap.clear();
        if (this.mCacheAddList) {
            this.mCacheAddList.length = 0;
            this.mCacheAddList = [];
        }

        if (this.mCacheSyncList) {
            this.mCacheSyncList.length = 0;
            this.mCacheSyncList = [];
        }
        this.mCurIndex = 0;
        this.mLoadLen = 0;
    }

    public update(time: number, delta: number) {
        if (!this.hasAddComplete) return;
        if (this.mCacheAddList && this.mCacheAddList.length < 1 && this.mCacheSyncList && this.mCacheSyncList.length < 1
            && this.mDealAddList && this.mDealAddList.length < 1) {
            this.roomService.game.emitter.emit(ElementManager.ELEMENT_READY);
        }
        this.mElements.forEach((ele) => ele.update(time, delta));
        if (this.mCacheRemoveList.length > 0) this.dealRemoveList(this.mCacheRemoveList);
    }

    /**
     * render 反馈给worker，某些element加载成功/失败
     * @param id
     */
    public elementLoadCallBack(id: number) {
        let loadAll: boolean = true;
        for (let i: number = 0, len = this.mDealAddList.length; i < len; i++) {
            const ele = this.mDealAddList[i];
            if (ele.id === id) {
                ele.state = true;
            }
            if (!ele.state) {
                loadAll = false;
            }
        }

        if (!loadAll) return;
        // 如果所有sprite都已经有反馈，则重新获取缓存队列进行处理
        this.mDealAddList.length = 0;
        this.mDealAddList = [];
        if (this.mCacheSyncList.length < 1) {
            this.dealAddList();
        } else {
            this.dealSyncList();
        }
    }

    public dealAddList(spliceBoo: boolean = false) {
        const len = 3;
        let point: op_def.IPBPoint3f;
        let sprite: ISprite = null;
        const ids = [];
        const eles = [];
        const tmpLen = !spliceBoo ? (this.mCacheAddList.length > len ? len : this.mCacheAddList.length) : this.mDealAddList.length;
        const tmpList = !spliceBoo ? this.mCacheAddList.splice(0, tmpLen) : (this.mDealAddList.length > 0 ? this.mDealAddList : this.mRequestSyncIdList.splice(0, tmpLen));
        for (let i: number = 0; i < tmpLen; i++) {
            const obj = tmpList[i];
            if (!obj) continue;
            point = obj.point3f;
            if (point) {
                sprite = new Sprite(obj, 3);
                if (!this.checkDisplay(sprite)) {
                    ids.push(sprite.id);
                } else {
                    obj.state = true;
                    if (this.mDealAddList.indexOf(obj) === -1) {
                        this.mDealAddList.push(obj);
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

    /**
     * render 反馈给worker，某些element更新成功
     * @param id
     */
    public elementDisplaySyncReady(id: number) {
        this.mDealSyncMap.set(id, true);
        let syncAll: boolean = true;
        this.mDealSyncMap.forEach((val, key) => {
            if (!val) {
                syncAll = false;
                return;
            }
        });
        if (!syncAll) return;
        // 如果所有sprite都已经有反馈，则把缓存列表处理
        this.mDealSyncMap.clear();
        this.dealSyncList();
    }

    public dealSyncList() {
        const len = 3;
        if (this.mCacheSyncList && this.mCacheSyncList.length > 0) {
            let element: Element = null;
            const tmpLen = this.mCacheSyncList.length > len ? len : this.mCacheSyncList.length;
            const tmpList = this.mCacheSyncList.splice(0, tmpLen);
            const ele = [];
            for (let i: number = 0; i < tmpLen; i++) {
                const sprite = tmpList[i];
                if (!sprite) continue;
                if (this.mRequestSyncIdList.length > 0 && this.mRequestSyncIdList.indexOf(sprite.id) === -1) {
                    continue;
                }
                // 更新elementstorage中显示对象的数据信息
                const data = new Sprite(sprite, 3);
                this.mRoom.game.elementStorage.add(<any>data);
                element = this.get(sprite.id);
                if (element) {
                    this.mDealSyncMap.set(sprite.id, false);
                    const command = (<any>sprite).command;
                    if (command === op_def.OpCommand.OP_COMMAND_UPDATE) { //  全部
                        element.model = data;
                    } else if (command === op_def.OpCommand.OP_COMMAND_PATCH) { //  增量
                        element.updateModel(sprite);
                    }
                    ele.push(element);
                } else {
                    this.mDealAddList.push(sprite);
                }
            }
            this.dealAddList(true);
            this.mStateMgr.syncElement(ele);
            this.checkElementDataAction(ele);
        }
    }

    public onDisplayReady(id: number) {
        const element = this.mElements.get(id);
        if (!element) return;
        element.state = true;
        // 编辑小屋时，更新浮动功能栏
        if (this.mRoom.isDecorating) {
            this.mRoom.game.emitter.emit(MessageType.DECORATE_ELEMENT_CREATED, id);
        }
        // 回馈给load缓存队列逻辑
        this.elementLoadCallBack(id);
        // 没有完成全部元素添加或者当物件添加队列缓存存在，则不做创建状态检测
        if (!this.hasAddComplete || (this.mCacheAddList && this.mCacheAddList.length > 0)) return;
        // Logger.getInstance().debug("#loading onDisplayReady ", id);
        const notReadyElements = [];
        this.mElements.forEach((ele, key) => {
            if (ele.state === false) {
                // todo 遍历优化
                notReadyElements.push(ele);
            }
        });

        if (notReadyElements.length < 10) {
            Logger.getInstance().debug("#loading left not ready display: ", notReadyElements);
        } else {
            Logger.getInstance().debug("#loading left not ready display: ", notReadyElements.length);
        }

        if (this.mLoadLen > 0) {
            this.mRoom.game.renderPeer.updateProgress(this.mCurIndex++ / this.mLoadLen);
        }
        if (notReadyElements.length < 1) {
            Logger.getInstance().debug("#loading onManagerReady ", this.constructor.name);
            this.mRoom.onManagerReady(this.constructor.name);
            if (this.mRequestSyncIdList && this.mRequestSyncIdList.length > 0) {
                this.fetchDisplay(this.mRequestSyncIdList);
                this.mRequestSyncIdList.length = 0;
                this.mRequestSyncIdList = [];
            }
            for (const cacheId of this.mAddCache) {
                const ele = this.mElements.get(cacheId);
                if (ele) {
                    ele.asociate();
                }
            }
            this.mAddCache = [];
        }
    }

    public showReferenceArea() {
        this.mElements.forEach((ele) => {
            ele.showRefernceArea();
        });
    }

    public hideReferenceArea() {
        this.mElements.forEach((ele) => {
            ele.hideRefernceArea();
        });
    }

    public addSpritesToCache(objs: op_client.ISprite[]) {
        for (const obj of objs) {
            this.mAddCache.push(obj.id);
            if (this.checkDisplay(new Sprite(obj, 3))) {
                this.mCacheAddList.push(obj);
            } else {
                this.mRequestSyncIdList.push(obj.id);
            }
        }
    }

    get connection(): ConnectionService {
        if (this.mRoom) {
            return this.mRoom.game.connection;
        }
        Logger.getInstance().error("roomManager is undefined");
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

        // test debug
        // for (const obj of objs) {
        //     if (obj.id === 680015589) {
        //         Logger.getInstance().log("#decorate wrong pos: ", obj);
        //         break;
        //     }
        // }

        this.addSpritesToCache(objs);
    }

    protected _add(sprite: ISprite, addMap: boolean = false): Element {
        if (addMap === undefined) addMap = true;
        let ele = this.mElements.get(sprite.id);
        if (ele) {
            ele.model = sprite;
        } else {
            ele = new Element(sprite, this);
            ele.setInputEnable(InputEnable.Interactive);
        }
        // if (!ele) ele = new Element(sprite, this);
        if (addMap) ele.addToWalkableMap();
        this.mElements.set(ele.id || 0, ele);
        return ele;
    }

    protected addComplete(packet: PBpacket) {
        this.hasAddComplete = true;
        this.mCurIndex = 0;
        this.mLoadLen = 0;
        // 接收到addcomplete，则开始处理缓存列表内的数据
        if (this.mCacheAddList && this.mCacheAddList.length > 0) {
            this.mLoadLen = this.mCacheAddList.length;
            this.mRoom.game.renderPeer.updateProgress(this.mCurIndex / this.mLoadLen);
            this.dealAddList();
        } else {
            this.dealSyncList();
        }
        if (!this.mCacheAddList || this.mCacheAddList.length === 0) {
            this.mRoom.onManagerReady(this.constructor.name);
            if (this.mRequestSyncIdList && this.mRequestSyncIdList.length > 0) {
                this.fetchDisplay(this.mRequestSyncIdList);
                this.mRequestSyncIdList.length = 0;
                this.mRequestSyncIdList = [];
            }
        }
    }

    protected checkDisplay(sprite: ISprite): IFramesModel | IDragonbonesModel {
        if (!sprite.displayInfo) {
            // const displayInfo = this.roomService.game.elementStorage.getDisplayModel(sprite.bindID || sprite.id);
            const elementRef = this.roomService.game.elementStorage.getElementRef(sprite.bindID || sprite.id);
            if (elementRef) {
                // 名字以服务器发送为主。没有从pi中读取
                if (!sprite.nickname) sprite.nickname = elementRef.name;
                const displayInfo = elementRef.displayModel;
                if (displayInfo) {
                    sprite.setDisplayInfo(displayInfo);
                    // 更新物理进程的物件/人物element
                    this.mRoom.game.physicalPeer.updateAnimations(sprite);
                    return displayInfo;
                }
            }
        }
        return sprite.displayInfo;
    }

    protected fetchDisplay(ids: number[]) {
        if (ids.length < 1) return;
        const packet = new PBpacket(op_virtual_world.OPCODE._OP_REQ_VIRTUAL_WORLD_QUERY_SPRITE_RESOURCE);
        const content: op_virtual_world.IOP_REQ_VIRTUAL_WORLD_QUERY_SPRITE_RESOURCE = packet.content;
        content.ids = ids;
        this.connection.send(packet);
    }

    get roomService(): IRoomService {
        return this.mRoom;
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
        if (type !== NodeType.ElementNodeType && type !== NodeType.CharacterNodeType) {
            return;
        }
        const ele: Element = this.get(id);
        if (ele) ele.setPosition(new LogicPos(content.position.x, content.position.y, content.position.z));

        this.mRoom.game.physicalPeer.setPosition(id, content.position.x, content.position.y, content.position.z);
    }

    protected onRemove(packet: PBpacket) {
        const content: op_client.IOP_VIRTUAL_WORLD_REQ_CLIENT_DELETE_SPRITE = packet.content;
        const type: number = content.nodeType;
        const ids: number[] = content.ids;
        if (type !== NodeType.ElementNodeType) {
            return;
        }
        this.dealRemoveList(ids);
    }

    protected dealRemoveList(list: number[]) {
        const tmpList = [];
        for (const id of list) {
            const ele = this.get(id);
            if (!ele) continue;
            if (!ele.state) {
                tmpList.push(ele);
                continue;
            }
            this.remove(id);
            this.mStateMgr.remove(id);
            this.eleDataMgr.offAction(id, EventType.SCENE_ELEMENT_DATA_UPDATE, undefined, undefined);
        }
        this.mCacheRemoveList = tmpList;
    }

    protected onSync(packet: PBpacket) {
        const content: op_client.IOP_VIRTUAL_WORLD_REQ_CLIENT_SYNC_SPRITE = packet.content;
        if (content.nodeType !== NodeType.ElementNodeType) {
            return;
        }
        const command = content.command;
        const sprites = content.sprites;
        for (const sprite of sprites) {
            (<any>sprite).command = command;
            this.mCacheSyncList.push(sprite);
        }
        this.dealSyncList();
    }

    protected onMove(packet: PBpacket) {
        const content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_MOVE_SPRITE = packet.content;
        if (content.movePath) {
            const moveDataList: op_def.IMovePath[] = content.movePath;
            const len: number = moveDataList.length;
            let moveData: op_def.IMovePath;
            let elementID: number;
            let element: Element;
            for (let i: number = 0; i < len; i++) {
                moveData = moveDataList[i];
                elementID = moveData.id;
                element = this.get(elementID);
                if (!element) {
                    continue;
                }
                element.move(moveData.movePos);
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
