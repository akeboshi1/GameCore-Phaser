import { op_client, op_def, op_virtual_world } from "pixelpai_proto";
import { PacketHandler, PBpacket } from "net-socket-packet";
import { Handler, IPos, IPosition45Obj, Logger, LogicPos, Position45 } from "utils";
import { Game } from "../../game";
import { IBlockObject } from "../block/iblock.object";
import { ClockReadyListener } from "../../loop/clock/clock";
import { IRoomManager } from "../room.manager";
import { ConnectionService } from "../../../../lib/net/connection.service";
import { CamerasManager, ICameraService } from "../camera/cameras.manager";
import { ViewblockManager } from "../viewblock/viewblock.manager";
import { PlayerManager } from "../player/player.manager";
import { ElementManager } from "../element/element.manager";
import {IElement, InputEnable} from "../element/element";
import { IViewBlockManager } from "../viewblock/iviewblock.manager";
import { TerrainManager } from "../terrain/terrain.manager";
import { SkyBoxManager } from "../sky.box/sky.box.manager";
import { GameState, IScenery, ISprite, LoadState, ModuleName, SceneName } from "structure";
import { EffectManager } from "../effect/effect.manager";
import { DecorateManager } from "../decorate/decorate.manager";
import { WallManager } from "../element/wall.manager";
import { Sprite } from "baseModel";
import IActor = op_client.IActor;
import NodeType = op_def.NodeType;
import { BaseDataConfigManager } from "picaWorker";
import { RoomStateManager } from "../state/room.state.manager";
import {BlockObject} from "../block/block.object";

export interface SpriteAddCompletedListener {
    onFullPacketReceived(sprite_t: op_def.NodeType): void;
}

export interface IRoomService {
    readonly id: number;
    readonly terrainManager: TerrainManager;
    readonly elementManager: ElementManager;
    readonly playerManager: PlayerManager;
    readonly cameraService: ICameraService;
    // readonly layerManager: LayerManager;
    readonly effectManager: EffectManager;
    readonly decorateManager: DecorateManager;
    readonly skyboxManager: SkyBoxManager;
    // readonly handlerManager: HandlerManager;
    readonly roomSize: IPosition45Obj;
    readonly miniSize: IPosition45Obj;
    readonly game: Game;
    readonly enableDecorate: boolean;
    readonly sceneType: op_def.SceneTypeEnum;
    // readonly matterWorld: MatterWorld;

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

    // addToGround(element: ElementDisplay | ElementDisplay[], index?: number);

    // addToSurface(element: ElementDisplay | ElementDisplay[]);

    // addToSceneUI(element: Phaser.GameObjects.GameObject | Phaser.GameObjects.GameObject[]);

    getElement(id: number): IElement;

    update(time: number, delta: number): void;

    initUI(): void;

    // findPath(start: IPos, targetPosList: IPos[], toReverse: boolean): Promise<IPos[]>;

    onManagerCreated(key: string);

    onManagerReady(key: string);

    requestDecorate(id?: number, baseID?: string);

    startDecorating();

    stopDecorating();

    addToWalkableMap(sprite: ISprite, isTerrain?: boolean);

    removeFromWalkableMap(sprite: ISprite, isTerrain?: boolean);

    isWalkable(x: number, y: number): boolean;

    destroy();
}

// 这一层管理数据和Phaser之间的逻辑衔接
// 消息处理让上层[RoomManager]处理
export class Room extends PacketHandler implements IRoomService, SpriteAddCompletedListener, ClockReadyListener {
    protected mGame: Game;
    // protected mMap: Map;
    protected mID: number;
    protected mTerrainManager: TerrainManager;
    protected mElementManager: ElementManager;
    protected mPlayerManager: PlayerManager;
    // protected mWallManager: WallManager;
    // protected mLayManager: LayerManager;
    // protected mGroupManager: GroupManager;
    // protected mHandlerManager: HandlerManager;
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
    // protected mAstar: AStar;
    protected mIsLoading: boolean = false;
    protected mManagersReadyStates: Map<string, boolean> = new Map();
    protected mDecorateManager: DecorateManager;
    private moveStyle: op_def.MoveStyle;
    private mActorData: IActor;
    private mUpdateHandlers: Handler[] = [];
    private mDecorateEntryData = null;
    // -1: out of range; 0: not walkable; 1: walkable
    private mWalkableMap: number[][];
    // 地块可行走标记map。每格标记由多个不同优先级（暂时仅地块和物件）标记组成，最终是否可行走由高优先级标记决定
    private mWalkableMarkMap: Map<number, Map<number, { level: number; walkable: boolean }>> =
        new Map<number, Map<number, { level: number; walkable: boolean }>>();
    private mIsWaitingForDecorateResponse: boolean = false;
    constructor(protected manager: IRoomManager) {
        super();
        this.mGame = this.manager.game;
        this.moveStyle = this.mGame.moveStyle;
        this.mScaleRatio = this.mGame.scaleRatio;
        if (this.mGame) {
            this.addListen();
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_ENABLE_EDIT_MODE, this.onEnableEditModeHandler);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_UNWALKABLE_BIT_MAP, this.onShowMapTitle);
            // this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_MOVE_SPRITE_BY_PATH, this.onMovePathHandler);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_SET_CAMERA_FOLLOW, this.onCameraFollowHandler);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_RESET_CAMERA_SIZE, this.onCameraResetSizeHandler);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_SYNC_STATE, this.onSyncStateHandler);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_START_EDIT_MODEL, this.onStartDecorate);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_EDIT_MODEL_RESULT, this.onDecorateResult);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_CURRENT_SCENE_ALL_SPRITE, this.onAllSpriteReceived);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_NOTICE_RELOAD_SCENE, this.onReloadScene);
        }
    }

    public addListen() {
        if (this.connection) {
            this.connection.addPacketListener(this);
        }
    }

    public removeListen() {
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

        this.mWalkableMap = new Array(this.mMiniSize.rows);
        for (let i = 0; i < this.mWalkableMap.length; i++) {
            this.mWalkableMap[i] = new Array(this.mMiniSize.cols).fill(-1);
        }

        // create render scene
        this.mGame.showLoading({
            "dpr": this.mScaleRatio,
            "sceneName": "PlayScene",
            "state": LoadState.CREATESCENE
        });
        this.mGame.peer.state = GameState.SceneCreate;
        this.mIsLoading = true;
    }

    // public completeLoad() {
    //     this.mGame.peer.render.
    //         if(this.mGame.scene.getScene(PlayScene.name)) {
    //         // const loadingScene: LoadingScene = this.mWorld.game.scene.getScene(LoadingScene.name) as LoadingScene;
    //         // if (loadingScene) loadingScene.sleep();
    //         return;
    //     }
    //     this.mGame.scene.add(PlayScene.name, PlayScene, true, {
    //         room: this,
    //     });
    // }

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
        if (!ele && this.mTerrainManager) {
            ele = this.mTerrainManager.get(id);
        }
        return ele;
    }

    public update(time: number, delta: number) {
        // if (this.matterWorld) this.matterWorld.update();
        this.updateClock(time, delta);
        // if (this.mBlocks) this.mBlocks.update(time, delta);
        // this.mViewBlockManager.update(time, delta);
        // if (this.layerManager) this.layerManager.update(time, delta);
        if (this.mElementManager) this.mElementManager.update(time, delta);
        if (this.mPlayerManager) this.mPlayerManager.update(time, delta);
        if (this.terrainManager) this.terrainManager.update(time, delta);
        // if (this.mHandlerManager) this.handlerManager.update(time, delta);
        if (this.mGame.httpClock) this.mGame.httpClock.update(time, delta);
        if (this.mCameraService) this.mCameraService.update(time, delta);
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
        // const blocks = this.mSkyboxManager.scenery;
        // for (const block of blocks) {
        //     if (block.scenery) {
        //         if (block.scenery.width > w) {
        //             w = block.scenery.width;
        //         }
        //         if (block.scenery.height > h) {
        //             h = block.scenery.height;
        //         }
        //     }
        // }
        return { width: w, height: h };
    }

    public async startPlay() {
        // if (this.mLayManager) {

        //     this.layerManager.destroy();
        // }
        Logger.getInstance().debug("room startplay =====");
        this.game.renderPeer.showPlay();
        // Logger.getInstance().debug("roomstartPlay");
        this.mCameraService = new CamerasManager(this.mGame, this);
        // this.mScene = this.world.game.scene.getScene(PlayScene.name);
        this.mTerrainManager = new TerrainManager(this, this);
        this.mElementManager = new ElementManager(this);
        this.mPlayerManager = new PlayerManager(this);
        // this.mWallManager = new WallManager(this);
        this.mBlocks = new ViewblockManager(this.mCameraService);
        // this.mLayManager = new LayerManager(this);
        // this.mGroupManager = new GroupManager(this);
        // this.mFrameManager = new FrameManager();
        this.mSkyboxManager = new SkyBoxManager(this);
        // mainworker通知physicalWorker创建matterworld
        this.mGame.peer.physicalPeer.createMatterWorld();
        // 将场景尺寸传递给physical进程
        this.mGame.physicalPeer.setRoomSize(this.mSize);
        this.mGame.physicalPeer.setMiniRoomSize(this.miniSize);
        // this.mMatterWorld = new MatterWorld(this);
        this.mEffectManager = new EffectManager(this);
        this.mWallMamager = new WallManager(this);
        // if (this.scene) {
        //     const camera = this.scene.cameras.main;
        //     this.mCameraService.camera = camera;
        const padding = 199 * this.mScaleRatio;
        const offsetX = this.mSize.rows * (this.mSize.tileWidth / 2);
        this.mGame.peer.render.roomstartPlay();
        this.mGame.peer.render.drawGrids(this.mSize);
        this.mGame.peer.render.setCamerasBounds(-padding - offsetX * this.mScaleRatio, -padding, this.mSize.sceneWidth * this.mScaleRatio + padding * 2, this.mSize.sceneHeight * this.mScaleRatio + padding * 2);
        //     // init block
        this.mBlocks.int(this.mSize);

        //     if (this.mWorld.moveStyle !== op_def.MoveStyle.DIRECTION_MOVE_STYLE) {
        //         this.mFallEffectContainer = new FallEffectContainer(this.mScene, this);
        //     }
        // }
        // // this.mPlayerManager.createActor(new PlayerModel(this.mActorData));
        // // this.mPlayerManager.createActor(this.mActorData);
        this.mGame.user.enterScene(this, this.mActorData);
        // const loadingScene: LoadingScene = this.mWorld.game.scene.getScene(LoadingScene.name) as LoadingScene;
        // this.world.emitter.on(MessageType.PRESS_ELEMENT, this.onPressElementHandler, this);
        // // if (loadingScene) loadingScene.sleep();
        // this.world.changeRoom(this);
        // // if (this.world.uiManager) this.world.uiManager.showMainUI();

        if (this.connection) {
            await this.cameraService.syncCamera();
            if (this.cameraService.initialize) await this.cameraService.syncCameraScroll();
            this.connection.send(new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_SCENE_CREATED));
        }

        // this.scene.input.on("pointerdown", this.onPointerDownHandler, this);
        // this.scene.input.on("pointerup", this.onPointerUpHandler, this);
        // this.world.emitter.on(ClickEvent.Tap, this.onTapHandler, this);

        // this.mLoadState = [];
        // this.mWorld.showLoading(LoadingTips.loadingResources());
        // this.scene.load.on(Phaser.Loader.Events.COMPLETE, this.onLoadCompleteHandler, this);

        this.initSkyBox();
        this.mTerrainManager.init();
        this.mWallMamager.init();

        // this.mAstar = new AStar(this);
        const map = [];
        for (let i = 0; i < this.miniSize.rows; i++) {
            map[i] = [];
            for (let j = 0; j < this.miniSize.cols; j++) {
                map[i][j] = 1;
            }
        }
        this.game.physicalPeer.initAstar(map);
        // this.mAstar.init(map);

        // const joystick = new JoystickManager(this.game);
    }

    public initUI() {
        // if (this.game.uiManager) this.game.uiManager.showMainUI();
        this.mIsLoading = false;
    }

    public addToWalkableMap(sprite: ISprite, isTerrain: boolean = false) {
        const displayInfo = sprite.displayInfo;
        if (!displayInfo) {
            return;
        }

        const walkableData = this.getSpriteWalkableData(sprite, isTerrain);
        if (!walkableData) return;

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

                const canWalk = collisionArea[i][j] === 0 || walkableArea[i][j] === 1;
                this.addWalkableMark(tempX, tempY, sprite.id, isTerrain ? 0 : 1, canWalk);
            }
        }
    }

    public removeFromWalkableMap(sprite: ISprite, isTerrain: boolean = false) {
        if (!sprite) return;

        const walkableData = this.getSpriteWalkableData(sprite, isTerrain);
        if (!walkableData) return;

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

    public isWalkable(x: number, y: number): boolean {
        if (y < 0 || y >= this.mWalkableMap.length || x < 0 || x >= this.mWalkableMap[y].length) {
            return false;
        }

        // Logger.getInstance().log("#place walkableMap: ", x, y, this.mWalkableMap[y][x] === 1, this.mWalkableMap);
        return this.mWalkableMap[y][x] === 1;
    }

    // public async findPath(startPos: IPos, targetPosList: IPos[], toReverse: boolean) {
    //     return await this.game.physicalPeer.getPath(startPos, targetPosList, toReverse);
    // }

    public clear() {
        this.mGame.peer.physicalPeer.destroyMatterWorld();
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
        // if (this.mWallManager) this.mWallManager.destroy();
        if (this.mDecorateManager) this.mDecorateManager.destroy();
        if (this.mActorData) this.mActorData = null;
        Logger.getInstance().debug("room clear");
        this.game.renderPeer.clearRoom();
        this.game.uiManager.recover();
        this.mWalkableMap = [];
        this.mWalkableMarkMap.clear();
    }

    // public move(id: number, x: number, y: number, nodeType: NodeType) {
    //     if (this.moveStyle !== op_def.MoveStyle.PATH_MOVE_STYLE) {
    //         return;
    //     }
    //     if (!this.mPlayerManager) {
    //         return;
    //     }
    //     const actor = this.mPlayerManager.actor;
    //     if (!actor) {
    //         return;
    //     }
    //     const pkt: PBpacket = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_MOVE_TO_TARGET_BY_PATH);
    //     const content: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_MOVE_TO_TARGET_BY_PATH = pkt.content;
    //     if (id) content.id = id;
    //     if (nodeType) content.nodeType = nodeType;

    //     content.point3f = {x, y};
    //     this.connection.send(pkt);

    //     this.tryMove();

    // }

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

    // public tryMove() {
    //     const player = this.mPlayerManager.actor;
    //     if (!player) {
    //         return;
    //     }
    //     const moveData = player.moveData;
    //     const pos = moveData.path;
    //     if (!pos || pos.length < 0) {
    //         return;
    //     }

    //     const step = moveData.step || 0;
    //     if (step >= pos.length) {
    //         return;
    //     }

    //     const playerPosition = player.getPosition();
    //     const position = op_def.PBPoint3f.create();
    //     position.x = playerPosition.x;
    //     position.y = playerPosition.y;

    //     if (pos[step] === undefined) {
    //         // Logger.getInstance().debug("move error", pos, step);
    //     }
    //     const nextPosition = op_def.PBPoint3f.create();
    //     nextPosition.x = pos[step].x;
    //     nextPosition.y = pos[step].y;

    //     const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_CHECK_MOVE_PATH_NEXT_POINT);
    //     const conten: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_CHECK_MOVE_PATH_NEXT_POINT = packet.content;
    //     conten.timestemp = this.now();
    //     conten.position = position;
    //     conten.nextPoint = nextPosition;
    //     this.connection.send(packet);
    // }

    // room创建状态管理
    public onManagerCreated(key: string) {
        if (this.mManagersReadyStates.has(key)) return;

        this.mManagersReadyStates.set(key, false);
    }

    public onManagerReady(key: string) {
        if (!this.mManagersReadyStates.has(key)) return;

        Logger.getInstance().debug("room.onManagerReady ", key);

        this.mManagersReadyStates.set(key, true);
        let allReady = true;
        this.mManagersReadyStates.forEach((val) => {
            if (val === false) {
                allReady = false;
            }
        });

        if (allReady) {
            this.game.renderPeer.roomReady();
        }
    }

    public requestDecorate(id?: number, baseID?: string) {
        if (id !== undefined) {
            const element = this.elementManager.get(id);
            if (!element) return;
            const locked = this.elementManager.isElementLocked(element);
            // 未解锁家具不给选中
            if (locked) return;
        }

        if (this.mIsWaitingForDecorateResponse) return;
        this.mIsWaitingForDecorateResponse = true;

        this.mDecorateEntryData = { id, baseID };

        this.connection.send(new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_START_EDIT_MODEL));

        // waite for <OP_VIRTUAL_WORLD_RES_CLIENT_START_EDIT_MODEL>
    }

    public startDecorating() {
        if (this.mIsDecorating) return;
        this.mIsDecorating = true;

        this.cameraService.stopFollow();

        // hide players (with animations)
        this.playerManager.hideAll();

        // set all element interactive
        const elements = this.elementManager.getElements();
        for (const element of elements) {
            if (!(element instanceof BlockObject)) continue;
            element.setInputEnable(InputEnable.Enable);
        }

        // new decorate manager
        this.mDecorateManager = new DecorateManager(this, this.mDecorateEntryData);

        // switch ui
        this.game.uiManager.hideMed(ModuleName.PICANEWMAIN_NAME);
        this.game.uiManager.hideMed(ModuleName.BOTTOM);
        this.game.uiManager.showMed(ModuleName.PICADECORATE_NAME,
            { closeAlertText: (<BaseDataConfigManager>this.game.configManager).getI18n("PKT_SYS0000021") });
        this.game.uiManager.hideMed(ModuleName.CUTINMENU_NAME);
        // switch mouse manager
        this.game.renderPeer.switchDecorateMouseManager();
    }

    public cameraFollowHandler() {
        if (!this.cameraService.initialize) return;
        this.cameraService.syncCameraScroll();
    }

    public stopDecorating() {
        if (this.mIsWaitingForDecorateResponse) return;
        if (!this.mIsDecorating) return;
        this.mIsDecorating = false;

        // camera follow
        this.cameraService.startFollow(this.playerManager.actor.id);

        // set user pos
        // const entrePos = new LogicPos(this.mActorData.x, this.mActorData.y);
        // this.playerManager.actor.setPosition(entrePos);
        // this.game.renderPeer.setPosition(this.playerManager.actor.id, entrePos.x, entrePos.y);

        // show players
        this.playerManager.showAll();

        // set all element interactive
        const elements = this.elementManager.getElements();
        for (const element of elements) {
            if (!(element instanceof BlockObject)) continue;
            element.setInputEnable(InputEnable.Interactive);
        }

        // switch ui
        this.game.uiManager.hideMed(ModuleName.PICADECORATE_NAME);
        this.game.uiManager.showMed(ModuleName.PICANEWMAIN_NAME);
        this.game.uiManager.showMed(ModuleName.BOTTOM);
        this.game.uiManager.showMed(ModuleName.CUTINMENU_NAME, { button: [{ text: "editor" }] });
        // switch mouse manager
        this.game.renderPeer.switchBaseMouseManager();

        // destroy decorate manager
        this.mDecorateManager.destroy();
        this.mDecorateManager = null;

        // cleat entry data
        this.mDecorateEntryData = null;

        this.mIsWaitingForDecorateResponse = false;
    }

    public requestSaveDecorating(pkt: PBpacket) {
        if (this.mIsWaitingForDecorateResponse) return;
        this.mIsWaitingForDecorateResponse = true;

        this.connection.send(pkt);

        // waite for response: _OP_VIRTUAL_WORLD_RES_CLIENT_EDIT_MODEL_RESULT
    }

    // 检测sprite是否与现有walkableMap有碰撞重叠
    public checkSpriteConflictToWalkableMap(sprite: ISprite, isTerrain: boolean = false): boolean {
        const walkableData = this.getSpriteWalkableData(sprite, isTerrain);
        if (!walkableData) return true;

        const { origin, collisionArea, walkableArea, pos45, rows, cols } = walkableData;

        let tempY = 0;
        let tempX = 0;
        for (let i = 0; i < rows; i++) {
            tempY = pos45.y + i - origin.y;
            for (let j = 0; j < cols; j++) {
                tempX = pos45.x + j - origin.x;
                if (collisionArea[i][j] === 0 || walkableArea[i][j] === 1) continue;
                const val = this.isWalkable(tempX, tempY);
                if (!val) {
                    // Logger.getInstance().debug("#place ", val, pos, tempX, tempY);
                    return true;
                }
            }
        }
        return false;
    }

    //

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

    // get layerManager(): LayerManager {
    //     return this.mLayManager || undefined;
    // }

    // get groupManager(): GroupManager {
    //     return this.mGroupManager || undefined;
    // }

    // get handlerManager(): HandlerManager {
    //     return this.mHandlerManager || undefined;
    // }

    get cameraService(): ICameraService {
        return this.mCameraService || undefined;
    }

    get effectManager(): EffectManager {
        return this.mEffectManager;
    }

    get decorateManager(): DecorateManager {
        return this.mDecorateManager;
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

    private onEnableEditModeHandler(packet: PBpacket) {
        this.mEnableDecorate = true;
        this.game.uiManager.showMed(ModuleName.CUTINMENU_NAME, { button: [{ text: "editor" }] });
    }

    private onShowMapTitle(packet: PBpacket) {
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

    // private addFillEffect(pos: IPoint, status: op_def.PathReachableStatus) {
    //     // if (!this.scene) {
    //     //     Logger.getInstance().debug("Room scene  does not exist");
    //     //     return;
    //     // }
    //     // const fall = new FallEffect(this.scene, this.mScaleRatio);
    //     // fall.show(status);
    //     // fall.setPosition(pos.x * this.mScaleRatio, pos.y * this.mScaleRatio);
    //     // this.addToSceneUI(fall);
    //     this.mGame.addFillEffect(pos, status);
    // }

    // private onMovePathHandler(packet: PBpacket) {
    //     const content: op_client.IOP_VIRTUAL_WORLD_REQ_CLIENT_MOVE_SPRITE_BY_PATH = packet.content;
    //     const status = content.pathStatus;
    //     if (!status) {
    //         return;
    //     }
    //     const pos = content.targetPos;
    //     // this.addFillEffect({ x: pos.x, y: pos.y }, status);
    // }

    private onCameraResetSizeHandler() {
        this.cameraService.initialize = true;
        // this.cameraService.syncCameraScroll();
    }

    private onCameraFollowHandler(packet: PBpacket) {
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

    private onAllSpriteReceived(packet: PBpacket) {
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
            for (const sp of content.sprites) {
                if (this.mTerrainManager.get(sp.id)) continue;
                const sprite = new Sprite(sp, nodeType);
                addList.push(sprite);
            }
            this.mTerrainManager.add(addList);
        }
    }

    private async onStartDecorate(packet: PBpacket) {
        this.mIsWaitingForDecorateResponse = false;
        const content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_START_EDIT_MODEL = packet.content;
        if (!content.status) {
            this.game.renderPeer.showAlert(content.msg, true);
            // Logger.getInstance().warn("enter decorate error: ", content.msg);
            return;
        }

        if (this.isDecorating) {
            Logger.getInstance().error("current room is decorating");
            return;
        }

        this.startDecorating();
    }

    private onDecorateResult(packet: PBpacket) {
        this.mIsWaitingForDecorateResponse = false;
        const content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_EDIT_MODEL_RESULT = packet.content;
        if (!content.status) {
            this.game.renderPeer.showAlert(content.msg, true);
            // Logger.getInstance().warn("enter decorate error: ", content.msg);
            return;
        }

        this.stopDecorating();

        // waite for OP_VIRTUAL_WORLD_REQ_CLIENT_NOTICE_RELOAD_SCENE
    }

    private onReloadScene(packet: PBpacket) {
        const content: op_client.IOP_VIRTUAL_WORLD_REQ_CLIENT_NOTICE_RELOAD_SCENE = packet.content;
        const sprites: op_client.ISprite[] | undefined = content.sprites;
        if (!sprites) {
            Logger.getInstance().error("<OP_VIRTUAL_WORLD_REQ_CLIENT_NOTICE_RELOAD_SCENE> content.sprites is undefined");
            return;
        }
        const nodeType = content.nodeType;
        const addList = [];
        for (const sp of content.sprites) {
            const sprite = new Sprite(sp, nodeType);
            addList.push(sprite);
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
            if (content.packet.currentFrame !== undefined && content.packet.currentFrame === 1) {
                // remove all elements
                const terrains = this.terrainManager.getElements();
                for (const terrain of terrains) {
                    this.terrainManager.remove(terrain.id);
                }
            }
            this.mTerrainManager.add(addList);
        }
    }

    private onSyncStateHandler(packet: PBpacket) {
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

    private getSpriteWalkableData(sprite: ISprite, isTerrain: boolean): { origin: IPos, collisionArea: number[][], walkableArea: number[][], pos45: IPos, rows: number, cols: number } {
        let collisionArea = sprite.getCollisionArea();
        let walkableArea = sprite.getWalkableArea();
        const origin = sprite.getOriginPoint();
        if (!collisionArea) {
            return null;
        }
        let rows = collisionArea.length;
        let cols = collisionArea[0].length;
        let pos45: IPos;
        if (isTerrain) {
            pos45 = this.transformTo45(new LogicPos(sprite.pos.x, sprite.pos.y));
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
            pos45 = this.transformToMini45(new LogicPos(sprite.pos.x, sprite.pos.y));
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

    private addWalkableMark(x: number, y: number, id: number, level: number, walkable: boolean) {
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

    private removeWalkableMark(x: number, y: number, id: number) {
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

    private caculateWalkableMark(x: number, y: number) {
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

    private setWalkableMap(x: number, y: number, walkable: boolean) {
        if (y < 0 || y >= this.mWalkableMap.length || x < 0 || x >= this.mWalkableMap[y].length) {
            return;
        }
        const newVal = walkable ? 1 : 0;
        if (this.mWalkableMap[y][x] === newVal) return;

        this.mWalkableMap[y][x] = newVal;
        this.game.physicalPeer.setWalkableAt(x, y, walkable);
    }

    private mapPos2Idx(x: number, y: number): number {
        return x + y * this.mMiniSize.cols;
    }

    private setState(state: op_client.IStateGroup) {
        if (!this.mStateManager) this.mStateManager = new RoomStateManager(this);
        this.mStateManager.setState(state);
    }
}
