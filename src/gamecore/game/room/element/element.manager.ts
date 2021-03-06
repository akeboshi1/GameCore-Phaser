import { PacketHandler, PBpacket } from "net-socket-packet";
import { op_client, op_def, op_virtual_world } from "pixelpai_proto";
import { ConnectionService, Logger, LogicPos, MessageType } from "structure";
import { IDragonbonesModel, IFramesModel, ISprite } from "structure";
import { Element, IElement } from "./element";
import { FramesModel, IElementStorage, Sprite } from "baseGame";
import NodeType = op_def.NodeType;
import { IRoomService } from "../room";
import { InputEnable } from "./input.enable";
import { IDisplayRef } from "baseGame";
export interface IElementManager {
    hasAddComplete: boolean;
    readonly connection: ConnectionService | undefined;
    readonly roomService: IRoomService;

    add(sprite: ISprite[]);

    remove(id: number): IElement;

    getElements(): IElement[];

    destroy();
}
export class ElementManager extends PacketHandler implements IElementManager {
    public static ELEMENT_READY: string = "ELEMENT_READY";
    public hasAddComplete: boolean = false;
    protected mElements: Map<number, Element> = new Map();
    /**
     * 添加element缓存list
     */
    protected mCacheAddList: op_client.ISprite[] = [];
    /**
     * 更新element缓存list
     */
    protected mCacheSyncList: ISyncSprite[] = [];

    /**
     * 配置文件等待渲染的物件。
     */
    protected mCacheDisplayRef: Map<number, IDisplayRef> = new Map();

    /**
     * Add添加 End清空
     */
    protected mAddCache: any[] = [];
    /**
     * 移除缓存list
     */
    protected mCacheRemoveList: any[] = [];
    protected mDealAddList: any[] = [];
    protected mRequestSyncIdList: number[] = [];
    protected mDealSyncMap: Map<number, boolean> = new Map();
    protected mGameConfig: IElementStorage;
    protected mLoadLen: number = 0;
    protected mCurIndex: number = 0;
    constructor(protected mRoom: IRoomService) {
        super();
        if (this.mRoom && this.mRoom.game) {
            this.mGameConfig = this.mRoom.game.elementStorage;
        }

        this.addListen();

        this.mRoom.onManagerCreated(this.constructor.name);
    }

    public addListen() {
        if (this.connection) {
            this.connection.addPacketListener(this);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_ADD_SPRITE, this.onAdd);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_ADD_SPRITE_END, this.addComplete);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_DELETE_SPRITE, this.onRemove);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_MOVE_SPRITE, this.onMove);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_ADJUST_POSITION, this.onAdjust);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_SYNC_SPRITE, this.onSync);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_HOT_BLOCK_SYNC_SPRITE, this.onBlockSyncSprite);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_HOT_BLOCK_DELETE_SPRITE, this.onBlockDeleteSprite);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_HOT_BLOCK_SYNC_SPRITE_END, this.onBlockSpriteEnd);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_ONLY_BUBBLE, this.onShowBubble);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_ONLY_BUBBLE_CLEAN, this.onClearBubbleHandler);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_CHANGE_SPRITE_ANIMATION, this.onChangeAnimation);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_SET_SPRITE_POSITION, this.onSetPosition);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_TRIGGER_MOVE_SPRITE, this.onTiggerMove);
        }
    }

    public removeListen() {
        if (this.connection) {
            this.connection.removePacketListener(this);
        }
    }

    public init() {
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

    public addDisplayRef(displays: IDisplayRef[]) {
        for (const display of displays) {
            if (!this.get(display.id)) this.mCacheDisplayRef.set(display.id, display);
        }
        this.dealSyncList();
    }

    public setState(state: op_client.IStateGroup) {
        const ele = this.get(state.owner.id);
        if (ele) ele.setState(state);
    }

    public destroy() {
        this.hasAddComplete = false;
        this.removeListen();
        if (this.mElements) {
            this.mElements.forEach((element) => this.remove(element.id));
            this.mElements.clear();
        }
        if (this.mDealAddList) this.mDealAddList.length = 0;
        if (this.mRequestSyncIdList) this.mRequestSyncIdList.length = 0;
        if (this.mDealSyncMap) this.mDealSyncMap.clear();
        if (this.mCacheAddList) {
            this.mCacheAddList.length = 0;
        }

        if (this.mCacheSyncList) {
            this.mCacheSyncList.length = 0;
        }
        if (this.mCacheDisplayRef) {
            this.mCacheDisplayRef.clear();
        }
        if (this.mAddCache) {
            this.mAddCache.length = 0;
        }
        if (this.mCacheRemoveList) {
            this.mCacheRemoveList.length = 0;
        }
        this.mCurIndex = 0;
        this.mLoadLen = 0;
        this.mGameConfig = null;
    }

    public update(time: number, delta: number) {
        if (!this.hasAddComplete) return;
        if (this.mCacheAddList && this.mCacheAddList.length < 1 && this.mCacheSyncList && this.mCacheSyncList.length < 1
            && this.mDealAddList && this.mDealAddList.length < 1) {
            if (this.roomService.game.emitter) this.roomService.game.emitter.emit(ElementManager.ELEMENT_READY);
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

    public dealAddList() {
        const len = 30;
        let point: op_def.IPBPoint3f;
        let sprite: ISprite = null;
        const ids = [];
        const eles = [];
        const tmpLen = this.mCacheAddList.length > len ? len : this.mCacheAddList.length;
        const tmpList = this.mCacheAddList.splice(0, tmpLen);
        for (let i: number = 0; i < tmpLen; i++) {
            const obj = tmpList[i];
            if (!obj) continue;
            point = obj.point3f;
            if (point) {
                if (this.mCacheDisplayRef.has(obj.id)) {
                    this.mCacheDisplayRef.delete(obj.id);
                }
                sprite = new Sprite(obj, 3);
                if (!this.checkDisplay(sprite)) {
                    ids.push(sprite.id);
                } else {
                    // obj.state = true;
                    // if (this.mDealAddList.indexOf(obj) === -1) {
                    //     this.mDealAddList.push(obj);
                    // }
                }
                const ele = this._add(sprite);
                eles.push(ele);
            }
        }
        this.fetchDisplay(ids);
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
        const len = 30;
        if (this.mCacheSyncList && this.mCacheSyncList.length > 0) {
            let element: Element = null;
            const tmpLen = this.mCacheSyncList.length > len ? len : this.mCacheSyncList.length;
            const tmpList: ISyncSprite[] = this.mCacheSyncList.splice(0, tmpLen);
            const ids = [];
            const addCaches = [];
            for (let i: number = 0; i < tmpLen; i++) {
                const { sprite, command, patchKeys } = tmpList[i];
                if (!sprite) continue;
                element = this.get(sprite.id);
                if (element) {
                    this.mDealSyncMap.set(sprite.id, false);
                    if (command === op_def.OpCommand.OP_COMMAND_UPDATE) { //  全部
                        const data = new Sprite(sprite, 3);
                        if (!data.displayInfo) {
                            if (!this.checkDisplay(data)) {
                                const index = this.mRequestSyncIdList.indexOf(sprite.id);
                                if (index === -1) {
                                    ids.push(sprite.id);
                                }
                            }
                        }
                        element.model = data;
                    } else if (command === op_def.OpCommand.OP_COMMAND_PATCH) { //  增量
                        // 更新数据
                        element.updateModel(sprite, patchKeys);
                    }
                    if (sprite.animations && sprite.display) this.removeRequestSyncId(element);
                } else {
                    addCaches.push(sprite);
                }
            }
            this.addSpritesToCache(addCaches);
            this.fetchDisplay(ids);
            this.dealAddList();
        }
    }

    public dealDisplayRef() {
        this.mCacheDisplayRef.forEach((ref) => {
            const { sn, id, pos, name, layer, direction, mountSprites, attrs } = ref;
            this.addSpritesToCache([{
                id,
                sn,
                point3f: pos,
                nickname: name,
                direction,
                layer,
                mountSprites,
                attrs
            }]);
        });
        this.mCacheDisplayRef.clear();
    }

    public onDisplayReady(id: number) {
        const element = this.mElements.get(id);
        if (!element) return;
        element.state = true;
        // 编辑小屋
        if (this.mRoom.isDecorating && this.mRoom.game.emitter) {
            this.mRoom.game.emitter.emit(MessageType.DECORATE_ELEMENT_CREATED, id);
        }
        // 回馈给load缓存队列逻辑
        this.elementLoadCallBack(id);
        // 没有完成全部元素添加或者当物件添加队列缓存存在，则不做创建状态检测
        if (!this.hasAddComplete || (this.mCacheAddList && this.mCacheAddList.length > 0)) return;
        const notReadyElements = [];
        this.mElements.forEach((ele, key) => {
            if (ele.state === false) {
                // todo 遍历优化
                notReadyElements.push(ele);
            }
        });

        if (this.mLoadLen > 0) {
            this.mRoom.game.renderPeer.updateProgress(this.mCurIndex++ / this.mLoadLen);
        }
        if (notReadyElements.length < 1) {
            Logger.getInstance().debug("#loading onManagerReady ", this.constructor.name);
            this.mRoom.onManagerReady(this.constructor.name);
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
        const ids = [];
        for (const obj of objs) {
            if (this.get(obj.id)) {
                continue;
            }
            this.mAddCache.push(obj.id);
            const sprite = new Sprite(obj, 3);
            if (!this.checkDisplay(sprite)) {
                ids.push(obj.id);
            }
            this.mCacheAddList.push(obj);
        }
        this.fetchDisplay(ids);
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
        this.addSpritesToCache(objs);
    }

    protected _add(sprite: ISprite, addMap: boolean = false): Element {
        if (addMap === undefined) addMap = true;
        let ele = this.mElements.get(sprite.id);
        if (ele) {
            ele.model = sprite;
        } else {
            ele = new Element(sprite, this);
            // 有小屋装扮权限时，设置全部家具可互动
            // if (this.roomService.enableDecorate) {
            //     ele.setInputEnable(InputEnable.Enable);
            // } else {
            ele.setInputEnable(InputEnable.Interactive);
            // }
        }
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
        }
    }

    protected checkDisplay(sprite: ISprite): IFramesModel | IDragonbonesModel {
        if (!sprite.displayInfo) {
            const elementRef = this.roomService.game.elementStorage.getElementRef(sprite.bindID || sprite.id);
            if (elementRef) {
                // 名字以服务器发送为主。没有从pi中读取
                if (!sprite.nickname) sprite.nickname = elementRef.name;
                const displayInfo = elementRef.displayModel;
                if (displayInfo) {
                    sprite.setDisplayInfo(displayInfo);
                    // 更新物理进程的物件/人物element
                    // this.mRoom.game.physicalPeer.updateAnimations(sprite);
                    return displayInfo;
                }
            }
        }
        return sprite.displayInfo;
    }

    protected fetchDisplay(ids: number[]) {
        if (ids.length < 1) return;
        const result = [];
        for (const id of ids) {
            if (!this.mRequestSyncIdList.includes(id)) {
                result.push(id);
                this.mRequestSyncIdList.push(id);
            }
        }
        if (result.length < 1) {
            return;
        }
        const packet = new PBpacket(op_virtual_world.OPCODE._OP_REQ_VIRTUAL_WORLD_QUERY_SPRITE_RESOURCE);
        const content: op_virtual_world.IOP_REQ_VIRTUAL_WORLD_QUERY_SPRITE_RESOURCE = packet.content;
        content.ids = result;
        this.connection.send(packet);
    }

    protected removeRequestSyncId(element: IElement) {
        const id = element.id;
        const index = this.mRequestSyncIdList.indexOf(id);
        if (index > -1) {
            if (element.model) this.mRoom.game.elementStorage.add(<FramesModel>element.model.displayInfo);
            this.mRequestSyncIdList.splice(index, 1);
        }
    }

    get roomService(): IRoomService {
        return this.mRoom;
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

        // this.mRoom.game.physicalPeer.setPosition(id, content.position.x, content.position.y, content.position.z);
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
            this.mCacheSyncList.push({ sprite, command, patchKeys: content.patchKeys });
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

    private onTiggerMove(packet: PBpacket) {
        const content: op_client.IOP_VIRTUAL_WORLD_REQ_CLIENT_TRIGGER_MOVE_SPRITE = packet.content;
        const id = content.id;
        const veloctiy = content.velocity;
        const len = content.length;
        this.mRoom.playerManager.actor.stopBoxMove = true;
        const ele = this.get(id);
        if (ele) {
            const pos = ele.moveBasePos();
            if (pos) ele.moveMotion(veloctiy.x * 400 + pos.x, veloctiy.y * 400 + pos.y);
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
                ele.setQueue(content.changeAnimation, content.finishAnimationBehavior);
            }
        }
    }

    private onBlockSyncSprite(packet: PBpacket) {
        const content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_HOT_BLOCK_SYNC_SPRITE = packet.content;
        if (content.nodeType !== op_def.NodeType.ElementNodeType) {
            return;
        }
        const sprites = content.sprites;
        const add = [];
        for (const sprite of sprites) {
            if (this.get(sprite.id)) {
                this.mCacheSyncList.push({ sprite, command: content.command, patchKeys: content.patchKeys });
                continue;
            }
            if (this.mCacheDisplayRef.has(sprite.id)) {
                this.mCacheDisplayRef.delete(sprite.id);
            }
            add.push(sprite);
            const syncIndex = this.mRequestSyncIdList.indexOf(sprite.id)
            if (syncIndex > -1) {
                this.mRequestSyncIdList.splice(syncIndex, 1);
            }
        }
        if (add.length > 0) this.addSpritesToCache(add);
        if (this.mCacheSyncList.length > 0) this.dealSyncList();
    }

    private onBlockDeleteSprite(packet: PBpacket) {
        const content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_HOT_BLOCK_DELETE_SPRITE = packet.content;
        if (content.nodeType !== op_def.NodeType.ElementNodeType) {
            return;
        }
        const ids = content.spriteIds;
        for (const id of ids) {
            if (this.mCacheDisplayRef.has(id)) this.mCacheDisplayRef.delete(id);
            if (this.get(id)) this.remove(id);
        }
    }

    private onBlockSpriteEnd(packet: PBpacket) {
        this.dealDisplayRef();
        this.addComplete(packet);
        this.mRoom.onManagerReady(this.constructor.name);
    }
}


interface ISyncSprite {
    sprite: op_client.ISprite;
    command: op_def.OpCommand;
    patchKeys: string[];
}