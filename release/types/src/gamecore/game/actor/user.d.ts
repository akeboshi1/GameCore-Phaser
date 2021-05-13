import { op_client, op_gameconfig } from "pixelpai_proto";
import { Player } from "../room/player/player";
import { IRoomService } from "../room/room";
import { UserDataManager } from "./data/user.dataManager";
import { IDragonbonesModel, IFramesModel, ISprite, IPos } from "structure";
export declare class User extends Player {
    protected game: any;
    stopBoxMove: boolean;
    private mDebugPoint;
    private mUserData;
    private mMoveStyle;
    private mSyncTime;
    private mSyncDirty;
    private mInputMask;
    private mSetPostionTime;
    private mPreTargetID;
    private holdTime;
    private holdDelay;
    private readonly mMoveDelayTime;
    private mMoveTime;
    private readonly mMoveSyncDelay;
    private mMoveSyncTime;
    private mMovePoints;
    constructor(game: any);
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
    setQueue(animations: op_client.IChangeAnimation[]): void;
    requestPushBox(targetId: number): void;
    setRenderable(isRenderable: boolean): Promise<any>;
    clear(): void;
    stopActiveSprite(pos?: IPos): void;
    tryActiveAction(targetId: number, param?: any, needBroadcast?: boolean): void;
    updateModel(model: op_client.IActor): void;
    destroy(): void;
    setPosition(pos: IPos): void;
    activeSprite(targetId: number, param?: any, needBroadcast?: boolean): Promise<void>;
    protected unmountSprite(id: number, pos: IPos): void;
    protected addToBlock(): Promise<any>;
    protected addBody(): void;
    protected syncCameraPosition(): void;
    set model(val: ISprite);
    get model(): ISprite;
    get package(): op_gameconfig.IPackage;
    set package(value: op_gameconfig.IPackage);
    get userData(): UserDataManager;
    set moveStyle(val: number);
    get moveStyle(): number;
    private addFillEffect;
}
