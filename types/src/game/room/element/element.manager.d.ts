import { PacketHandler, PBpacket } from "net-socket-packet";
import { op_client, op_def } from "pixelpai_proto";
import { ConnectionService } from "../../../../lib/net/connection.service";
import { IDragonbonesModel, IFramesModel, ISprite } from "structure";
import { IRoomService } from "../room/room";
import { Element, IElement } from "./element";
import { ElementDataManager } from "../../data.manager/element.dataManager";
export interface IElementManager {
    hasAddComplete: boolean;
    readonly connection: ConnectionService | undefined;
    readonly roomService: IRoomService;
    add(sprite: ISprite[]): any;
    remove(id: number): IElement;
    getElements(): IElement[];
    destroy(): any;
}
export interface Task {
    action: string;
    loc: Partial<op_def.IMossMetaData>;
}
export declare class ElementManager extends PacketHandler implements IElementManager {
    protected mRoom: IRoomService;
    static ELEMENT_READY: string;
    hasAddComplete: boolean;
    protected mElements: Map<number, Element>;
    /**
     * 添加element缓存list
     */
    protected mCacheAddList: any[];
    /**
     * 更新element缓存list
     */
    protected mCacheSyncList: any[];
    /**
     * Add添加 End清空
     */
    protected mAddCache: any[];
    /**
     * 移除缓存list
     */
    protected mCacheRemoveList: any[];
    private mDealAddList;
    private mRequestSyncIdList;
    private mDealSyncMap;
    private mGameConfig;
    private mStateMgr;
    private mActionMgr;
    private mLoadLen;
    private mCurIndex;
    constructor(mRoom: IRoomService);
    addListen(): void;
    removeListen(): void;
    init(): void;
    has(id: number): boolean;
    get(id: number): Element;
    remove(id: number): IElement;
    getElements(): IElement[];
    add(sprites: ISprite[], addMap?: boolean): void;
    checkElementAction(id: number, userid?: number): boolean;
    checkActionNeedBroadcast(id: number, userid?: number): boolean;
    checkFurnitureSurvey(id: number, userid?: number): boolean;
    isElementLocked(element: IElement): boolean;
    setState(state: op_client.IStateGroup): void;
    destroy(): void;
    update(time: number, delta: number): void;
    /**
     * render 反馈给worker，某些element加载成功/失败
     * @param id
     */
    elementLoadCallBack(id: number): void;
    dealAddList(spliceBoo?: boolean): void;
    /**
     * render 反馈给worker，某些element更新成功
     * @param id
     */
    elementDisplaySyncReady(id: number): void;
    dealSyncList(): void;
    onDisplayReady(id: number): void;
    showReferenceArea(): void;
    hideReferenceArea(): void;
    addSpritesToCache(objs: op_client.ISprite[]): void;
    get connection(): ConnectionService;
    protected onAdjust(packet: PBpacket): void;
    protected onAdd(packet: PBpacket): void;
    protected _add(sprite: ISprite, addMap?: boolean): Element;
    protected addComplete(packet: PBpacket): void;
    protected checkDisplay(sprite: ISprite): IFramesModel | IDragonbonesModel;
    protected fetchDisplay(ids: number[]): void;
    get roomService(): IRoomService;
    get eleDataMgr(): ElementDataManager;
    protected onSetPosition(packet: PBpacket): void;
    protected onRemove(packet: PBpacket): void;
    protected dealRemoveList(list: number[]): void;
    protected onSync(packet: PBpacket): void;
    protected onMove(packet: PBpacket): void;
    private onTiggerMove;
    private onShowBubble;
    private onClearBubbleHandler;
    private onChangeAnimation;
    private checkElementDataAction;
    private onQueryElementHandler;
    private onActiveSpriteHandler;
}
