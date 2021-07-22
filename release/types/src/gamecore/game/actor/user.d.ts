import { op_client, op_gameconfig } from "pixelpai_proto";
import { Player } from "../room/player/player";
import { IDragonbonesModel, IFramesModel, ISprite, IPos } from "structure";
import { IElement, IRoomService } from "../room";
export declare class User extends Player {
    stopBoxMove: boolean;
    protected mDebugPoint: boolean;
    protected mMoveStyle: MoveStyleEnum;
    protected mSyncTime: number;
    protected mSyncDirty: boolean;
    protected mInputMask: number;
    protected mSetPostionTime: number;
    protected mPreTargetID: number;
    protected holdTime: number;
    protected holdDelay: number;
    protected mNearEle: IElement;
    constructor();
    get nearEle(): IElement;
    set debugPoint(val: boolean);
    get debugPoint(): boolean;
    load(displayInfo: IFramesModel | IDragonbonesModel, isUser?: boolean): Promise<any>;
    addPackListener(): void;
    removePackListener(): void;
    enterScene(room: IRoomService, actor: op_client.IActor): void;
    update(time?: number, delta?: number): void;
    findPath(targets: IPos[], targetId?: number, toReverse?: boolean): Promise<void>;
    moveMotion(x: number, y: number): void;
    unmount(targetPos?: IPos): Promise<this>;
    syncPosition(): void;
    startMove(): void;
    stopMove(stopPos?: IPos): void;
    move(moveData: any): void;
    setQueue(animations: op_client.IChangeAnimation[], finishAnimationBehavior?: number): void;
    requestPushBox(targetId: number): void;
    setRenderable(isRenderable: boolean): Promise<any>;
    clear(): void;
    stopActiveSprite(pos?: IPos): void;
    tryActiveAction(targetId: number, param?: any, needBroadcast?: boolean): void;
    updateModel(model: op_client.IActor): void;
    destroy(): void;
    setPosition(pos: IPos, syncPos?: boolean): void;
    /**
     * 检测角色当前位置附近的可交互element
     * @param pos
     */
    checkNearEle(pos: IPos): IElement;
    activeSprite(targetId: number, param?: any, needBroadcast?: boolean): Promise<void>;
    protected unmountSprite(id: number, pos: IPos): void;
    protected addToBlock(): Promise<any>;
    protected addBody(): void;
    protected syncCameraPosition(): void;
    protected checkDirection(): void;
    set model(val: ISprite);
    get model(): ISprite;
    get package(): op_gameconfig.IPackage;
    set package(value: op_gameconfig.IPackage);
    set moveStyle(val: number);
    get moveStyle(): number;
    private addFillEffect;
}
declare enum MoveStyleEnum {
    Null = 0,
    Astar = 1,
    Motion = 2
}
export {};
