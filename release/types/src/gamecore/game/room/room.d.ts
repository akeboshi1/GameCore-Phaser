import { op_client, op_def } from "pixelpai_proto";
import { PacketHandler } from "net-socket-packet";
import { AStar, ConnectionService, IPos, IPosition45Obj, LogicPos } from "structure";
import { Game } from "../../game";
import { IScenery, ISprite } from "structure";
import IActor = op_client.IActor;
import { TerrainManager } from "./terrain/terrain.manager";
import { ElementManager } from "./element/element.manager";
import { PlayerManager } from "./player/player.manager";
import { ICameraService } from "./camera/cameras.worker.manager";
import { EffectManager } from "./effect/effect.manager";
import { SkyBoxManager } from "./sky.box/sky.box.manager";
import { WallManager } from "./element/wall.manager";
import { CollsionManager } from "../collsion";
import { IBlockObject } from "./block/iblock.object";
import { IElement } from "./element/element";
import { ClockReadyListener } from "../loop";
import { IViewBlockManager } from "./viewblock/iviewblock.manager";
import { RoomStateManager } from "./state";
import { IRoomManager } from "./room.manager";
export interface SpriteAddCompletedListener {
    onFullPacketReceived(sprite_t: op_def.NodeType): void;
}
export interface IRoomService {
    readonly id: number;
    readonly terrainManager: TerrainManager;
    readonly elementManager: ElementManager;
    readonly playerManager: PlayerManager;
    readonly cameraService: ICameraService;
    readonly effectManager: EffectManager;
    readonly skyboxManager: SkyBoxManager;
    readonly wallManager: WallManager;
    readonly collsionManager: CollsionManager;
    readonly roomSize: IPosition45Obj;
    readonly miniSize: IPosition45Obj;
    readonly game: Game;
    readonly sceneType: op_def.SceneTypeEnum;
    readonly isLoading: boolean;
    now(): number;
    enter(room: op_client.IScene): void;
    startPlay(): void;
    pause(): void;
    resume(name: string | string[]): void;
    transformTo45(p: IPos): IPos;
    transformTo90(p: IPos): IPos;
    transformToMini45(p: IPos): IPos;
    transformToMini90(p: IPos): IPos;
    addBlockObject(object: IBlockObject): Promise<any>;
    removeBlockObject(object: IBlockObject): any;
    updateBlockObject(object: IBlockObject): any;
    cameraFollowHandler(): any;
    getElement(id: number): IElement;
    update(time: number, delta: number): void;
    initUI(): void;
    findPath(start: IPos, targetPosList: IPos[], toReverse: boolean): LogicPos[];
    onManagerCreated(key: string): any;
    onManagerReady(key: string): any;
    onRoomReady(): any;
    addToWalkableMap(sprite: ISprite, isTerrain?: boolean): any;
    removeFromWalkableMap(sprite: ISprite, isTerrain?: boolean): any;
    isWalkable(x: number, y: number): boolean;
    checkSpriteConflictToWalkableMap(sprite: ISprite, isTerrain?: boolean, pos?: IPos): number[][];
    destroy(): any;
}
export declare class Room extends PacketHandler implements IRoomService, SpriteAddCompletedListener, ClockReadyListener {
    protected manager: IRoomManager;
    protected mGame: Game;
    protected mID: number;
    protected mTerrainManager: TerrainManager;
    protected mElementManager: ElementManager;
    protected mPlayerManager: PlayerManager;
    protected mSkyboxManager: SkyBoxManager;
    protected mEffectManager: EffectManager;
    protected mSize: IPosition45Obj;
    protected mMiniSize: IPosition45Obj;
    protected mCameraService: ICameraService;
    protected mBlocks: IViewBlockManager;
    protected mWallMamager: WallManager;
    protected mScaleRatio: number;
    protected mStateManager: RoomStateManager;
    protected mAstar: AStar;
    protected mIsLoading: boolean;
    protected mManagersReadyStates: Map<string, boolean>;
    protected mCollsionManager: CollsionManager;
    private moveStyle;
    private mActorData;
    private mUpdateHandlers;
    private mWalkableMap;
    private mWalkableMarkMap;
    constructor(manager: IRoomManager);
    addListen(): void;
    removeListen(): void;
    enter(data: op_client.IScene): void;
    onFullPacketReceived(sprite_t: op_def.NodeType): void;
    onClockReady(): void;
    pause(): void;
    resume(): void;
    addActor(data: IActor): void;
    addBlockObject(object: IBlockObject): Promise<any>;
    removeBlockObject(object: IBlockObject): void;
    updateBlockObject(object: IBlockObject): void;
    transformTo90(p: LogicPos): IPos;
    transformTo45(p: LogicPos): IPos;
    transformToMini90(p: LogicPos): IPos;
    transformToMini45(p: LogicPos): IPos;
    getElement(id: number): IElement;
    update(time: number, delta: number): void;
    updateClock(time: number, delta: number): void;
    now(): number;
    getMaxScene(): {
        width: number;
        height: number;
    };
    startPlay(): Promise<void>;
    initUI(): void;
    addToWalkableMap(sprite: ISprite, isTerrain?: boolean): void;
    removeFromWalkableMap(sprite: ISprite, isTerrain?: boolean): void;
    isWalkable(x: number, y: number): boolean;
    findPath(startPos: IPos, targetPosList: IPos[], toReverse: boolean): LogicPos[];
    clear(): void;
    destroy(): void;
    addUpdateHandler(caller: any, method: Function): void;
    removeUpdateHandler(caller: any, method: Function): void;
    destroyUpdateHandler(): void;
    get isLoading(): boolean;
    onManagerCreated(key: string): void;
    onManagerReady(key: string): void;
    onRoomReady(): void;
    cameraFollowHandler(): void;
    checkSpriteConflictToWalkableMap(sprite: ISprite, isTerrain?: boolean, pos?: IPos): number[][];
    protected initSkyBox(): void;
    protected addSkyBox(scenery: IScenery): void;
    get terrainManager(): TerrainManager;
    get elementManager(): ElementManager;
    get playerManager(): PlayerManager;
    get skyboxManager(): SkyBoxManager;
    get wallManager(): WallManager;
    get cameraService(): ICameraService;
    get effectManager(): EffectManager;
    get collsionManager(): CollsionManager;
    get id(): number;
    get roomSize(): IPosition45Obj | undefined;
    get miniSize(): IPosition45Obj | undefined;
    get blocks(): IViewBlockManager;
    get game(): Game | undefined;
    get connection(): ConnectionService | undefined;
    get sceneType(): op_def.SceneTypeEnum;
    private onShowMapTitle;
    private onCameraResetSizeHandler;
    private onCameraFollowHandler;
    private onAllSpriteReceived;
    private onReloadScene;
    private onSyncStateHandler;
    private onExtraRoomInfoHandler;
    private getSpriteWalkableData;
    private addWalkableMark;
    private removeWalkableMark;
    private caculateWalkableMark;
    private setWalkableMap;
    private mapPos2Idx;
    private setState;
}
