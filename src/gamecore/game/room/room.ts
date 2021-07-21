import { op_client, op_def, op_virtual_world } from "pixelpai_proto";
import { PacketHandler, PBpacket } from "net-socket-packet";
import { AStar, ConnectionService, Handler, IPos, IPosition45Obj, Logger, LogicPos, Position45 } from "structure";
import { Game } from "../../game";
import { EventType, IScenery, ISprite, LoadState, SceneName } from "structure";
import IActor = op_client.IActor;
// import { ExtraRoomInfo } from "custom_proto";
import { TerrainManager } from "./terrain/terrain.manager";
import { ElementManager } from "./element/element.manager";
import { PlayerManager } from "./player/player.manager";
import { CamerasManager, ICameraService } from "./camera/cameras.worker.manager";
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
import { ViewblockManager } from "./viewblock/viewblock.manager";
import { Sprite } from "baseGame";
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
    readonly enableDecorate: boolean;
    readonly sceneType: op_def.SceneTypeEnum;
    readonly isLoading: boolean;
    readonly isDecorating: boolean;

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

    removeBlockObject(object: IBlockObject);

    updateBlockObject(object: IBlockObject);

    cameraFollowHandler();

    getElement(id: number): IElement;

    update(time: number, delta: number): void;

    initUI(): void;

    findPath(start: IPos, targetPosList: IPos[], toReverse: boolean): LogicPos[];

    onManagerCreated(key: string);

    onManagerReady(key: string);

    onRoomReady();

    addToInteractiveMap(sprite: ISprite);

    removeFromInteractiveMap(sprite: ISprite);

    addToWalkableMap(sprite: ISprite, isTerrain?: boolean);

    removeFromWalkableMap(sprite: ISprite, isTerrain?: boolean);

    setGroundWalkable(pos: IPos, walkable: boolean);

    getInteractiveEles(x: number, y: number): number[][];

    isWalkable(x: number, y: number): boolean;

    checkSpriteConflictToWalkableMap(sprite: ISprite, isTerrain?: boolean, pos?: IPos): number[][];

    destroy();
}

// 这一层管理数据和Phaser之间的逻辑衔接
// 消息处理让上层[RoomManager]处理
export class Room extends PacketHandler implements IRoomService, SpriteAddCompletedListener, ClockReadyListener {
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
    protected mEnableDecorate: boolean = false;
    protected mIsDecorating: boolean = false;
    protected mWallMamager: WallManager;
    protected mScaleRatio: number;
    protected mStateManager: RoomStateManager;
    // protected mMatterWorld: MatterWorld;
    protected mAstar: AStar;
    protected mIsLoading: boolean = false;
    protected mManagersReadyStates: Map<string, boolean> = new Map();
    protected mCollsionManager: CollsionManager;
    protected mActorData: IActor;
    protected mUpdateHandlers: Handler[] = [];
    protected mDecorateEntryData = null;
    // 地块区域记录 -1: out of range; 0: not walkable terrain; 1: walkable terrain
    protected mTerrainMap: number[][];
    // 可行走区域最终记录值 -1: out of range; 0: not walkable; 1: walkable
    protected mWalkableMap: number[][];
    // 地块可行走标记map。每格标记由多个不同优先级（暂时仅地块和物件）标记组成，最终是否可行走由高优先级标记决定
    protected mWalkableMarkMap: Map<number, Map<number, { level: number; walkable: boolean }>> =
        new Map<number, Map<number, { level: number; walkable: boolean }>>();
    // 地图每个坐标点可交互id 列表
    protected mInteractiveList: number[][][];
    protected mIsWaitingForDecorateResponse: boolean = false;
    constructor(protected manager: IRoomManager) {
        super();
        this.mGame = this.manager.game;
        this.mScaleRatio = this.mGame.scaleRatio;
        if (this.mGame) {
            this.addListen();
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_ENABLE_EDIT_MODE, this.onEnableEditModeHandler);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_UNWALKABLE_BIT_MAP, this.onShowMapTitle);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_SET_CAMERA_FOLLOW, this.onCameraFollowHandler);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_RESET_CAMERA_SIZE, this.onCameraResetSizeHandler);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_SYNC_STATE, this.onSyncStateHandler);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_CURRENT_SCENE_ALL_SPRITE, this.onAllSpriteReceived);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_NOTICE_RELOAD_SCENE, this.onReloadScene);
        }
    }

    public addListen() {
        // if (this.game.emitter) this.mGame.emitter.on(EventType.UPDATE_EXTRA_ROOM_INFO, this.onExtraRoomInfoHandler, this);
        if (this.connection) {
            this.connection.addPacketListener(this);
        }
    }

    public removeListen() {
        // if (this.game.emitter) this.mGame.emitter.off(EventType.UPDATE_EXTRA_ROOM_INFO, this.onExtraRoomInfoHandler, this);
        if (this.connection) {
            this.connection.removePacketListener(this);
        }
    }

    public enter(data: op_client.IScene): void {
        if (!data) {
            return;
        }
        // Logger.getInstance().debug("room====enter");
        this.mID = data.id;
        this.mSize = {
            cols: data.cols,
            rows: data.rows,
            tileHeight: data.tileHeight,
            tileWidth: data.tileWidth,
            sceneWidth: (data.rows + data.cols) * (data.tileWidth / 2),
            sceneHeight: (data.rows + data.cols) * (data.tileHeight / 2),
        };

        this.mMiniSize = {
            cols: data.cols * 2,
            rows: data.rows * 2,
            tileWidth: data.tileWidth / 2,
            tileHeight: data.tileHeight / 2,
        };

        this.game.renderPeer.setRoomSize(this.mSize, this.mMiniSize);

        this.mWalkableMap = new Array(this.mMiniSize.rows);
        for (let i = 0; i < this.mWalkableMap.length; i++) {
            this.mWalkableMap[i] = new Array(this.mMiniSize.cols).fill(-1);
        }
        this.mTerrainMap = new Array(this.mMiniSize.rows);
        for (let i = 0; i < this.mTerrainMap.length; i++) {
            this.mTerrainMap[i] = new Array(this.mMiniSize.cols).fill(-1);
        }

        this.mInteractiveList = new Array(this.mMiniSize.rows);
        for (let i = 0; i < this.mInteractiveList.length; i++) {
            this.mInteractiveList[i] = new Array(this.mMiniSize.cols);
        }

        // create render scene
        this.mGame.showLoading({
            "dpr": this.mScaleRatio,
            "sceneName": "PlayScene",
            "state": LoadState.CREATESCENE
        });
        this.mIsLoading = true;
    }

    public onFullPacketReceived(sprite_t: op_def.NodeType): void {
        if (sprite_t !== op_def.NodeType.TerrainNodeType) {
            return;
        }
    }

    public onClockReady(): void {
        // TODO: Unload loading-scene
    }

    public pause() {
        this.mGame.roomPause(this.mID);
    }

    public resume() {
        this.mGame.roomResume(this.mID);
    }

    public addActor(data: IActor): void {
        this.mActorData = data;
    }

    public addBlockObject(object: IBlockObject): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            if (this.blocks) {
                this.blocks.add(object).then((val) => {
                    resolve(val);
                });
            } else {
                reject(false);
            }
        });
    }

    public removeBlockObject(object: IBlockObject) {
        // Logger.getInstance().debug("rooms remove");
        if (this.blocks) {
            this.blocks.remove(object);
        }
    }

    public updateBlockObject(object: IBlockObject) {
        // Logger.getInstance().debug("rooms update");
        if (this.blocks) {
            this.blocks.check(object);
        }
    }

    public transformTo90(p: LogicPos): IPos {
        if (!this.mSize) {
            return;
        }
        return Position45.transformTo90(p, this.mSize);
    }

    public transformTo45(p: LogicPos): IPos {
        if (!this.mSize) {
            return;
        }
        return Position45.transformTo45(p, this.mSize);
    }

    public transformToMini90(p: LogicPos): IPos {
        if (!this.mMiniSize) {
            return;
        }
        return Position45.transformTo90(p, this.miniSize);
    }

    public transformToMini45(p: LogicPos): IPos {
        if (!this.mMiniSize) {
            return;
        }
        return Position45.transformTo45(p, this.mMiniSize);
    }

    public getElement(id: number): IElement {
        let ele = null;
        if (this.mPlayerManager) {
            ele = this.mPlayerManager.get(id);
        }
        if (!ele && this.mElementManager) {
            ele = this.mElementManager.get(id);
        }
        return ele;
    }

    public update(time: number, delta: number) {
        this.updateClock(time, delta);
        if (this.mElementManager) this.mElementManager.update(time, delta);
        if (this.mPlayerManager) this.mPlayerManager.update(time, delta);
        if (this.terrainManager) this.terrainManager.update(time, delta);
        if (this.mGame.httpClock) this.mGame.httpClock.update(time, delta);
        if (this.mCameraService) this.mCameraService.update(time, delta);
        if (this.mCollsionManager) this.mCollsionManager.update(time, delta);
        for (const oneHandler of this.mUpdateHandlers) {
            oneHandler.runWith([time, delta]);
        }
    }

    public updateClock(time: number, delta: number) {
        // 客户端自己通过delta来更新游戏时间戳 *现改为使用sysTime+deltaTime的形式，就不需要update了*
        // if (this.mGame.clock) this.mGame.clock.update(time, delta);
    }

    public now(): number {
        return this.mGame.clock.unixTime;
    }

    public getMaxScene() {
        if (!this.mSize) {
            return;
        }
        const w = this.mSize.sceneWidth;
        const h = this.mSize.sceneHeight;
        return { width: w, height: h };
    }

    public createManager() {
        this.mCameraService = new CamerasManager(this.mGame, this);
        this.mTerrainManager = new TerrainManager(this, this);
        this.mElementManager = new ElementManager(this);
        this.mPlayerManager = new PlayerManager(this);
        this.mBlocks = new ViewblockManager(this.mCameraService);
        this.mSkyboxManager = new SkyBoxManager(this);
        this.mEffectManager = new EffectManager(this);
        this.mWallMamager = new WallManager(this);
        this.mCollsionManager = new CollsionManager(this);
        this.mCollsionManager.addWall();
    }

    public async startPlay() {
        Logger.getInstance().debug("room startplay =====");
        // 优先创建manager，用于后续操作
        this.createManager();
        this.game.renderPeer.showPlay().then(() => {
            // ======> 等待playscene创建完成
            const padding = 199 * this.mScaleRatio;
            const offsetX = this.mSize.rows * (this.mSize.tileWidth / 2);
            this.mGame.peer.render.roomstartPlay();
            this.mGame.peer.render.gridsDebugger.setData(this.mSize);
            this.mGame.peer.render.setCamerasBounds(-padding - offsetX * this.mScaleRatio, -padding, this.mSize.sceneWidth * this.mScaleRatio + padding * 2, this.mSize.sceneHeight * this.mScaleRatio + padding * 2);
            //     // init block
            this.mBlocks.int(this.mSize);
            this.mGame.user.enterScene(this, this.mActorData);

            this.initSkyBox();
            this.mAstar = new AStar(this);
            const map = [];
            for (let i = 0; i < this.miniSize.rows; i++) {
                map[i] = [];
                for (let j = 0; j < this.miniSize.cols; j++) {
                    map[i][j] = 1;
                }
            }
            this.mAstar.init(map);

            this.mTerrainManager.init().then(() => {
                this.mWallMamager.init();
                if (this.connection) {
                    this.game.emitter.on("CameraSync", this.syncCameraScroll, this);
                    this.cameraService.syncCamera().then(() => {
                        Logger.getInstance().log("scene send scene_created");
                    }).catch((error) => {
                        Logger.getInstance().log(error);
                    });
                }
            });
        });
    }

    public syncCameraScroll() {
        this.game.emitter.off("CameraSync", this.syncCameraScroll, this);
        if (this.cameraService.initialize) {
            this.cameraService.syncCameraScroll().then(() => {
                this.connection.send(new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_SCENE_CREATED));
            });
        }
    }

    public initUI() {
        // if (this.game.uiManager) this.game.uiManager.showMainUI();
        this.mIsLoading = false;
    }

    public addToInteractiveMap(sprite: ISprite) {
        const displayInfo = sprite.displayInfo;
        if (!displayInfo) {
            return;
        }
        // op_def.IPBPoint2i[]
        const interactiveList = sprite.getInteractive();
        if (!interactiveList) {
            this.removeFromInteractiveMap(sprite);
            return;
        }
        const id = sprite.id;
        const addPos = sprite.getOriginPoint();
        const pos = sprite.pos;
        const index45 = this.transformToMini45(new LogicPos(pos.x, pos.y));
        // const rows = interactiveList.length;
        // const cols = interactiveList[0].length;
        const len = interactiveList.length;
        if (!this.mInteractiveList) this.mInteractiveList = [];
        for (let i: number = 0; i < len; i++) {
            const interactivePos = interactiveList[i];
            const x = interactivePos.x + index45.x - addPos.x;
            const y = interactivePos.y + index45.y - addPos.y;
            // tslint:disable-next-line:no-console
            // console.log("interactive ===>", x, y, id, len, interactiveList);
            if (!this.mInteractiveList[y]) this.mInteractiveList[y] = [];
            if (!this.mInteractiveList[y][x]) this.mInteractiveList[y][x] = [];
            if (this.mInteractiveList[y][x].indexOf(id) === -1) this.mInteractiveList[y][x].push(id);
        }
    }

    public removeFromInteractiveMap(sprite: ISprite) {
        // const displayInfo = sprite.displayInfo;
        // if (!displayInfo) {
        //     return;
        // }
        // const interactiveList = sprite.getInteractive();
        // if (!interactiveList) return;
        const id = sprite.id;
        if (!this.mInteractiveList) return;
        const len = this.mInteractiveList.length;
        for (let i: number = 0; i < len; i++) {
            if (!this.mInteractiveList[i]) continue;
            const tmpLen = this.mInteractiveList[i].length;
            for (let j: number = 0; j < tmpLen; j++) {
                const ids = this.mInteractiveList[i][j];
                if (!ids || ids.length < 1) continue;
                const tmpLen1 = ids.length;
                for (let k: number = 0; k < tmpLen1; k++) {
                    const tmpId = ids[k];
                    if (id === tmpId) {
                        this.mInteractiveList[i][j].splice(k, 1);
                    }
                }
            }
        }
    }

    public addToWalkableMap(sprite: ISprite, isTerrain: boolean = false) {
        const displayInfo = sprite.displayInfo;
        if (!displayInfo) {
            return;
        }
        const walkableData = this.getSpriteWalkableData(sprite, isTerrain);
        if (!walkableData) return;
        // tslint:disable-next-line:no-console
        // console.log("addWalk ===>", sprite);
        const { origin, collisionArea, walkableArea, pos45, rows, cols } = walkableData;
        let tempY = 0;
        let tempX = 0;
        for (let i = 0; i < rows; i++) {
            // pos45 sprite在45度坐标系中的索引，pad(origin) sprite, i(y), j(x)
            tempY = pos45.y + i - origin.y;
            for (let j = 0; j < cols; j++) {
                tempX = pos45.x + j - origin.x;
                if (tempY < 0 || tempY >= this.mWalkableMap.length || tempX < 0 || tempX >= this.mWalkableMap[tempY].length) {
                    continue;
                }
                const canWalk = collisionArea[i][j] === 0 || walkableArea[i][j] === 1;
                this.addWalkableMark(tempX, tempY, sprite.id, isTerrain ? 0 : 1, canWalk);
                if (isTerrain) this.setTerrainMap(tempX, tempY, canWalk);
            }
        }
        if (isTerrain) this.showDecorateGrid();
    }

    public removeFromWalkableMap(sprite: ISprite, isTerrain: boolean = false) {
        if (!sprite) return;
        const walkableData = this.getSpriteWalkableData(sprite, isTerrain);
        if (!walkableData) return;
        // tslint:disable-next-line:no-console
        // console.log("removeWalk ===>", sprite);
        const { origin, collisionArea, walkableArea, pos45, rows, cols } = walkableData;
        let tempY = 0;
        let tempX = 0;
        for (let i = 0; i < rows; i++) {
            tempY = pos45.y + i - origin.y;
            for (let j = 0; j < cols; j++) {
                tempX = pos45.x + j - origin.x;
                if (tempY < 0 || tempY >= this.mWalkableMap.length || tempX < 0 || tempX >= this.mWalkableMap[tempY].length) {
                    continue;
                }
                this.removeWalkableMark(tempX, tempY, sprite.id);
            }
        }
    }

    public setGroundWalkable(pos: IPos, walkable: boolean) {
        this.addWalkableMark(pos.x * 2, pos.y * 2, 0, 0, walkable);
        this.addWalkableMark(pos.x * 2 + 1, pos.y * 2, 0, 0, walkable);
        this.addWalkableMark(pos.x * 2, pos.y * 2 + 1, 0, 0, walkable);
        this.addWalkableMark(pos.x * 2 + 1, pos.y * 2 + 1, 0, 0, walkable);
        this.setTerrainMap(pos.x * 2, pos.y * 2, walkable);
        this.setTerrainMap(pos.x * 2 + 1, pos.y * 2, walkable);
        this.setTerrainMap(pos.x * 2, pos.y * 2 + 1, walkable);
        this.setTerrainMap(pos.x * 2 + 1, pos.y * 2 + 1, walkable);
    }

    public getInteractiveEles(x: number, y: number): number[][] {
        if (!this.mInteractiveList) return null;
        // 前后10个格子直接可交互物件,正负gridlen格子
        const gridLen = 80;
        const list = [];
        const pos = this.transformToMini45(new LogicPos(x, y));
        const baseX = pos.x;
        const baseY = pos.y;
        const rows = this.miniSize.rows;
        const cols = this.miniSize.cols;
        for (let i: number = -gridLen; i <= gridLen; i++) {
            if (baseY + i < 0 || baseY + i >= rows) continue;
            for (let j: number = -gridLen; j < gridLen; j++) {
                if (baseX + j < 0 || baseX + j >= cols) continue;
                const idPos = { x: baseX + j, y: baseY + i };
                const ids = this.mInteractiveList[idPos.y][idPos.x];
                if (ids && ids.length > 0) {
                    list.push(ids);
                }
            }
        }
        // tslint:disable-next-line:no-console
        // console.log(list);
        return list;
    }

    public isWalkable(x: number, y: number): boolean {
        if (y < 0 || y >= this.mWalkableMap.length || x < 0 || x >= this.mWalkableMap[y].length) {
            return false;
        }
        return this.mWalkableMap[y][x] === 1;
    }

    public findPath(startPos: IPos, targetPosList: IPos[], toReverse: boolean) {
        return this.mAstar.find(startPos, targetPosList, toReverse);
    }

    public clear() {
        // if (this.mLayManager) this.mLayManager.destroy();
        if (this.mStateManager) {
            this.mStateManager.destroy();
        }
        if (this.mTerrainManager) {
            this.mTerrainManager.destroy();
        }
        if (this.mElementManager) {
            this.mElementManager.destroy();
        }
        if (this.mPlayerManager) {
            this.mPlayerManager.destroy();
        }
        if (this.mBlocks) {
            this.mBlocks.destroy();
        }
        if (this.mEffectManager) this.mEffectManager.destroy();
        if (this.mSkyboxManager) this.mSkyboxManager.destroy();
        if (this.mWallMamager) this.mWallMamager.destroy();
        if (this.mCollsionManager) this.mCollsionManager.destroy();
        if (this.mActorData) this.mActorData = null;
        Logger.getInstance().debug("room clear");
        if (this.game) {
            if (this.game.renderPeer) this.game.renderPeer.clearRoom();
            if (this.game.uiManager) this.game.uiManager.recover();
        }
        this.mTerrainMap = [];
        this.mWalkableMap = [];
        this.mInteractiveList = [];
        this.mWalkableMarkMap.clear();
    }

    public destroy() {
        this.removeListen();
        this.clear();
        this.game.renderPeer.removeScene(SceneName.PLAY_SCENE);
    }

    // update handlers. TODO: remove method
    public addUpdateHandler(caller: any, method: Function) {
        this.removeUpdateHandler(caller, method);
        const handler = new Handler(caller, method);
        this.mUpdateHandlers.push(handler);
    }

    public removeUpdateHandler(caller: any, method: Function) {
        let removeid: number = -1;
        for (let i = 0; i < this.mUpdateHandlers.length; i++) {
            const item = this.mUpdateHandlers[i];
            if (item.caller === caller && item.method === method) {
                removeid = i;
                break;
            }
        }
        if (removeid !== -1) {
            const hander = this.mUpdateHandlers.splice(removeid, 1)[0];
            hander.clear();
        }
    }

    public destroyUpdateHandler() {
        for (const item of this.mUpdateHandlers) {
            item.clear();
        }
        this.mUpdateHandlers.length = 0;
    }

    public get isLoading(): boolean {
        return this.mIsLoading;
    }

    // room创建状态管理
    public onManagerCreated(key: string) {
        if (this.mManagersReadyStates.has(key)) return;

        this.mManagersReadyStates.set(key, false);
    }

    public onManagerReady(key: string) {
        if (!this.mManagersReadyStates.has(key)) return;

        this.mManagersReadyStates.set(key, true);
        let allReady = true;
        this.mManagersReadyStates.forEach((val) => {
            if (val === false) {
                allReady = false;
            }
        });
        if (allReady) {
            this.game.renderPeer.roomReady();
            this.onRoomReady();
        }
    }

    public onRoomReady() {
        if (!this.terrainManager.isDealEmptyTerrain) {
            this.terrainManager.dealEmptyTerrain();
        }
    }

    public cameraFollowHandler() {
        if (!this.cameraService.initialize) return;
        this.cameraService.syncCameraScroll();
    }

    public requestSaveDecorating(pkt: PBpacket) {
        if (this.mIsWaitingForDecorateResponse) return;
        this.mIsWaitingForDecorateResponse = true;

        this.connection.send(pkt);

        // waite for response: _OP_VIRTUAL_WORLD_RES_CLIENT_EDIT_MODEL_RESULT
    }

    // 检测sprite是否与现有walkableMap有碰撞重叠，无碰撞区域为0，无碰撞重叠为1，有碰撞重叠为2
    public checkSpriteConflictToWalkableMap(sprite: ISprite, isTerrain: boolean = false, pos?: IPos): number[][] {
        const walkableData = this.getSpriteWalkableData(sprite, isTerrain, pos);
        if (!walkableData) {
            Logger.getInstance().error("data error check sprite: ", sprite);
            return [];
        }

        const { origin, collisionArea, walkableArea, pos45, rows, cols } = walkableData;

        const result = new Array(rows);
        for (let i = 0; i < rows; i++) {
            result[i] = new Array(cols).fill(1);
        }
        let tempY = 0;
        let tempX = 0;
        for (let i = 0; i < rows; i++) {
            tempY = pos45.y + i - origin.y;
            for (let j = 0; j < cols; j++) {
                result[i][j] = collisionArea[i][j];
                tempX = pos45.x + j - origin.x;
                if (collisionArea[i][j] === 0 || walkableArea[i][j] === 1) {
                    continue;
                }
                const val = this.isWalkable(tempX, tempY);
                if (!val) {
                    // Logger.getInstance().debug("#place ", val, pos, tempX, tempY);
                    result[i][j] = 2;
                }
            }
        }
        return result;
    }

    protected initSkyBox() {
        const scenerys = this.game.elementStorage.getScenerys();
        if (scenerys) {
            for (const scenery of scenerys) {
                this.addSkyBox({
                    id: scenery.id,
                    uris: scenery.uris,
                    depth: scenery.depth,
                    width: scenery.width,
                    height: scenery.height,
                    speed: scenery.speed,
                    offset: scenery.offset,
                    fit: scenery.fit
                });
            }
        }
    }

    protected addSkyBox(scenery: IScenery) {
        this.mSkyboxManager.add(scenery);
    }

    get terrainManager(): TerrainManager {
        return this.mTerrainManager || undefined;
    }

    get elementManager(): ElementManager {
        return this.mElementManager || undefined;
    }

    get playerManager(): PlayerManager {
        return this.mPlayerManager || undefined;
    }

    get skyboxManager() {
        return this.mSkyboxManager;
    }

    get wallManager() {
        return this.mWallMamager;
    }

    get cameraService(): ICameraService {
        return this.mCameraService || undefined;
    }

    get effectManager(): EffectManager {
        return this.mEffectManager;
    }

    get collsionManager() {
        return this.mCollsionManager;
    }

    get id(): number {
        return this.mID;
    }

    get roomSize(): IPosition45Obj | undefined {
        return this.mSize || undefined;
    }

    get miniSize(): IPosition45Obj | undefined {
        return this.mMiniSize;
    }

    get blocks(): IViewBlockManager {
        return this.mBlocks;
    }

    get game(): Game | undefined {
        return this.mGame;
    }

    get enableDecorate() {
        return this.mEnableDecorate;
    }

    get isDecorating(): boolean {
        return this.mIsDecorating;
    }

    get connection(): ConnectionService | undefined {
        if (this.manager) {
            return this.manager.connection;
        }
    }

    get sceneType(): op_def.SceneTypeEnum {
        return op_def.SceneTypeEnum.NORMAL_SCENE_TYPE;
    }

    protected onEnableEditModeHandler(packet: PBpacket) {
        this.mEnableDecorate = true;
        // this.game.uiManager.showMed(ModuleName.CUTINMENU_NAME, { button: [{ text: "editor" }] });
    }

    protected onShowMapTitle(packet: PBpacket) {
        // if (!this.scene) {
        //     return;
        // }
        // const content: op_client.IOP_VIRTUAL_WORLD_REQ_CLIENT_UNWALKABLE_BIT_MAP = packet.content;
        // const area = new ReferenceArea(this.scene, this);
        // const num = [];
        // const intArray: op_def.IIntArray[] = content.intArray;
        // for (let i = 0; i < intArray.length; i++) {
        //     num[i] = [];
        //     for (let j = 0; j < intArray[i].value.length; j++) {
        //         num[i][j] = intArray[i].value[j];
        //     }
        //     // num[i] = intArray[i];
        // }
        // area.draw(num, new Phaser.Geom.Point(0, 0));
        // area.setAlpha(0.1);
        // if (area.size) {
        //     area.setPosition(area.size.sceneWidth / 2, 0);
        //     this.mLayManager.addToMiddle(area);
        // }
    }

    protected onCameraResetSizeHandler() {
        this.cameraService.initialize = true;
        this.game.emitter.emit("CameraSync");
        // this.cameraService.syncCameraScroll();
    }

    protected onCameraFollowHandler(packet: PBpacket) {
        if (!this.cameraService.initialize) return;
        const content: op_client.IOP_VIRTUAL_WORLD_REQ_CLIENT_SET_CAMERA_FOLLOW = packet.content;
        if (content.hasOwnProperty("id")) {
            const id = content.id ? content.id : 0;
            this.cameraService.startFollow(id, content.effect);
        } else {
            this.cameraService.stopFollow();
        }
        if (content.hasOwnProperty("pos")) {
            const pos = content.pos;
            this.cameraService.setCamerasScroll(pos.x, pos.y, content.effect);
        }
    }

    protected onAllSpriteReceived(packet: PBpacket) {
        const content: op_client.IOP_VIRTUAL_WORLD_REQ_CLIENT_CURRENT_SCENE_ALL_SPRITE = packet.content;
        const sprites: op_client.ISprite[] | undefined = content.sprites;
        if (!sprites) {
            Logger.getInstance().error("<OP_VIRTUAL_WORLD_REQ_CLIENT_CURRENT_SCENE_ALL_SPRITE> content.sprites is undefined");
            return;
        }
        const nodeType = content.nodeType;
        const addList = [];

        if (nodeType === op_def.NodeType.ElementNodeType || nodeType === op_def.NodeType.SpawnPointType) {
            for (const sp of content.sprites) {
                if (this.mElementManager.get(sp.id)) continue;
                addList.push(sp);
            }
            this.mElementManager.addSpritesToCache(addList);
        } else if (nodeType === op_def.NodeType.TerrainNodeType) {
            // for (const sp of content.sprites) {
            //     if (this.mTerrainManager.get(sp.id)) continue;
            //     addList.push(sp);
            // }
            // this.mTerrainManager.addSpritesToCache(addList);
        }
    }

    protected onReloadScene(packet: PBpacket) {
        const content: op_client.IOP_VIRTUAL_WORLD_REQ_CLIENT_NOTICE_RELOAD_SCENE = packet.content;
        const sprites: op_client.ISprite[] | undefined = content.sprites;
        if (!sprites) {
            Logger.getInstance().error("<OP_VIRTUAL_WORLD_REQ_CLIENT_NOTICE_RELOAD_SCENE> content.sprites is undefined");
            return;
        }
        const nodeType = content.nodeType;
        const addList = [];
        for (const sp of content.sprites) {
            const _sprite = new Sprite(sp, nodeType);
            addList.push(_sprite);
        }

        if (nodeType === op_def.NodeType.ElementNodeType || nodeType === op_def.NodeType.SpawnPointType) {
            if (content.packet.currentFrame !== undefined && content.packet.currentFrame === 1) {
                // remove all elements
                const elements = this.elementManager.getElements();
                for (const element of elements) {
                    this.elementManager.remove(element.id);
                }
            }
            this.mElementManager.addSpritesToCache(content.sprites);
        } else if (nodeType === op_def.NodeType.TerrainNodeType) {
            // if (content.packet.currentFrame !== undefined && content.packet.currentFrame === 1) {
            //     // remove all elements
            //     const terrains = this.terrainManager.getElements();
            //     for (const terrain of terrains) {
            //         this.terrainManager.remove(terrain.id);
            //     }
            // }
            // this.mTerrainManager.add(addList);
        }
    }

    protected onSyncStateHandler(packet: PBpacket) {
        const content: op_client.IOP_VIRTUAL_WORLD_REQ_CLIENT_SYNC_STATE = packet.content;
        const states = content.stateGroup;
        for (const state of states) {
            switch (state.owner.type) {
                case op_def.NodeType.ElementNodeType:
                    this.mElementManager.setState(state);
                    break;
                case op_def.NodeType.CharacterNodeType:
                    this.mPlayerManager.setState(state);
                    break;
                case op_def.NodeType.SceneNodeType:
                    this.setState(state);
                    break;
            }
        }
    }

    // protected onExtraRoomInfoHandler(content: ExtraRoomInfo) {
    //     if (this.wallManager) {
    //         this.wallManager.changeAllDisplayData(content.wallId);
    //     }
    //     if (this.terrainManager) {
    //         this.terrainManager.changeAllDisplayData(content.floorId);
    //     }
    // }

    protected getSpriteWalkableData(sprite: ISprite, isTerrain: boolean, pos?: IPos): { origin: IPos, collisionArea: number[][], walkableArea: number[][], pos45: IPos, rows: number, cols: number } {
        let collisionArea = sprite.getCollisionArea();
        let walkableArea = sprite.getWalkableArea();
        const origin = sprite.getOriginPoint();
        if (!collisionArea) {
            return null;
        }
        let rows = collisionArea.length;
        let cols = collisionArea[0].length;
        let pos45: IPos;
        let pos90: IPos;
        if (pos === undefined) {
            pos90 = sprite.pos;
        } else {
            pos90 = pos;
        }
        if (isTerrain) {
            pos45 = this.transformTo45(new LogicPos(pos90.x, pos90.y));
            pos45.x *= 2;
            pos45.y *= 2;
            if (rows === 1 && cols === 1) {
                rows = 2;
                cols = 2;

                const colVal = collisionArea[0][0];
                collisionArea = new Array(rows);
                for (let i = 0; i < rows; i++) {
                    collisionArea[i] = new Array(cols).fill(colVal);
                }

                walkableArea = new Array(rows);
                for (let i = 0; i < rows; i++) {
                    walkableArea[i] = new Array(cols).fill(0);
                }
            }
        } else {
            pos45 = this.transformToMini45(new LogicPos(pos90.x, pos90.y));
        }
        if (!walkableArea || walkableArea.length === 0) {
            walkableArea = new Array(rows);
            for (let i = 0; i < rows; i++) {
                walkableArea[i] = new Array(cols).fill(0);
            }
        } else {
            const wRows = walkableArea.length;
            const wCols = walkableArea[0].length;
            if (rows !== wRows || cols !== wCols) {
                // 数据尺寸不一致 做求交集处理
                // Logger.getInstance().debug("#walkable before ", walkableArea);

                const temp = new Array(rows);
                for (let i = 0; i < rows; i++) {
                    temp[i] = new Array(cols).fill(0);
                }
                for (let i = 0; i < rows; i++) {
                    for (let j = 0; j < cols; j++) {
                        if (i >= wRows || j >= wCols) {
                            continue;
                        }
                        temp[i][j] = walkableArea[i][j];
                    }
                }
                walkableArea = temp;
                // Logger.getInstance().debug("#walkable after ", walkableArea);
            }
        }

        return { origin, collisionArea, walkableArea, pos45, rows, cols };
    }

    protected addWalkableMark(x: number, y: number, id: number, level: number, walkable: boolean) {
        const idx = this.mapPos2Idx(x, y);

        if (!this.mWalkableMarkMap.has(idx)) {
            this.mWalkableMarkMap.set(idx, new Map<number, { level: number; walkable: boolean }>());
        }

        const marks = this.mWalkableMarkMap.get(idx);
        if (marks.has(id)) {
            marks.delete(id);
        }

        marks.set(id, { level, walkable });
        this.caculateWalkableMark(x, y);
    }

    protected removeWalkableMark(x: number, y: number, id: number) {
        const idx = this.mapPos2Idx(x, y);

        if (!this.mWalkableMarkMap.has(idx)) {
            this.mWalkableMarkMap.set(idx, new Map<number, { level: number; walkable: boolean }>());
        }

        const marks = this.mWalkableMarkMap.get(idx);
        if (marks.has(id)) {
            marks.delete(id);
        }
        this.caculateWalkableMark(x, y);
    }

    protected caculateWalkableMark(x: number, y: number) {
        const idx = this.mapPos2Idx(x, y);
        if (!this.mWalkableMarkMap.has(idx)) {
            this.setWalkableMap(x, y, false);
            return;
        }

        const marks = this.mWalkableMarkMap.get(idx);
        if (marks.size === 0) {
            this.setWalkableMap(x, y, false);
            return;
        }
        let highestLv = -1;
        let result = false;
        marks.forEach((val) => {
            // 低优先级不影响结果
            if (val.level < highestLv) return;

            // 高优先级 直接覆盖
            if (val.level > highestLv) {
                highestLv = val.level;
                result = val.walkable;
                return;
            }

            // 相同优先级 不可行走覆盖可行走
            if (!val.walkable) {
                result = false;
            }
        });

        this.setWalkableMap(x, y, result);
    }

    protected setWalkableMap(x: number, y: number, walkable: boolean) {
        if (y < 0 || y >= this.mWalkableMap.length || x < 0 || x >= this.mWalkableMap[y].length) {
            return;
        }
        const newVal = walkable ? 1 : 0;
        if (this.mWalkableMap[y][x] === newVal) return;

        this.mWalkableMap[y][x] = newVal;
        this.mAstar.setWalkableAt(x, y, walkable);
    }

    protected setTerrainMap(x: number, y: number, walkable: boolean) {
        if (y < 0 || y >= this.mTerrainMap.length || x < 0 || x >= this.mTerrainMap[y].length) {
            return;
        }
        const newVal = walkable ? 1 : 0;
        if (this.mTerrainMap[y][x] === newVal) return;

        this.mTerrainMap[y][x] = newVal;
    }

    protected mapPos2Idx(x: number, y: number): number {
        return x + y * this.mMiniSize.cols;
    }

    protected setState(state: op_client.IStateGroup) {
        if (!this.mStateManager) this.mStateManager = new RoomStateManager(this);
        this.mStateManager.setState(state);
    }

    protected showDecorateGrid() {
        if (!this.isDecorating) return;
        if (!this.mTerrainManager.hasAddComplete) return;
        this.game.renderPeer.showEditGrids(this.mMiniSize, this.mTerrainMap);
    }
}
