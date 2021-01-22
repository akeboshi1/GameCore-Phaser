import { op_client, op_def, op_virtual_world } from "pixelpai_proto";
import IActor = op_client.IActor;
import NodeType = op_def.NodeType;
import { PacketHandler, PBpacket } from "net-socket-packet";
import { IPosition45Obj, Position45, IPos, LogicPos, Handler, Logger } from "utils";
import { Game } from "../../game";
import { IBlockObject } from "../block/iblock.object";
import { ClockReadyListener } from "../../loop/clock/clock";
import { State } from "../state/state.group";
import { IRoomManager } from "../room.manager";
import { ConnectionService } from "../../../../lib/net/connection.service";
import { CamerasManager, ICameraService } from "../camera/cameras.manager";
import { ViewblockManager } from "../viewblock/viewblock.manager";
import { PlayerManager } from "../player/player.manager";
import { ElementManager } from "../element/element.manager";
import { IElement } from "../element/element";
import { IViewBlockManager } from "../viewblock/iviewblock.manager";
import { TerrainManager } from "../terrain/terrain.manager";
import { SkyBoxManager } from "../sky.box/sky.box.manager";
import { GameState, IScenery, LoadState, SceneName } from "structure";
import { EffectManager } from "../effect/effect.manager";
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
    // readonly handlerManager: HandlerManager;
    readonly roomSize: IPosition45Obj;
    readonly miniSize: IPosition45Obj;
    readonly game: Game;
    readonly enableEdit: boolean;
    readonly sceneType: op_def.SceneTypeEnum;
    // readonly matterWorld: MatterWorld;

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

    removeBlockObject(object: IBlockObject);

    updateBlockObject(object: IBlockObject);

    // addToGround(element: ElementDisplay | ElementDisplay[], index?: number);

    // addToSurface(element: ElementDisplay | ElementDisplay[]);

    // addToSceneUI(element: Phaser.GameObjects.GameObject | Phaser.GameObjects.GameObject[]);

    getElement(id: number): IElement;

    update(time: number, delta: number): void;

    initUI(): void;

    findPath(start: IPos, targetPosList: IPos[], toReverse: boolean): Promise<IPos[]>;

    onManagerCreated(key: string);

    onManagerReady(key: string);

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
    protected mEnableEdit: boolean = false;
    protected mScaleRatio: number;
    protected mStateMap: Map<string, State>;
    // protected mMatterWorld: MatterWorld;
    // protected mAstar: AStar;
    protected mIsLoading: boolean = false;
    protected mManagersReadyStates: Map<string, boolean> = new Map();
    private moveStyle: op_def.MoveStyle;
    private mActorData: IActor;
    private mUpdateHandlers: Handler[] = [];
    constructor(protected manager: IRoomManager) {
        super();
        this.mGame = this.manager.game;
        this.moveStyle = this.mGame.moveStyle;
        this.mScaleRatio = this.mGame.scaleRatio;
        if (this.mGame) {
            this.addListen();
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_ENABLE_EDIT_MODE, this.onEnableEditModeHandler);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_UNWALKABLE_BIT_MAP, this.onShowMapTitle);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_MOVE_SPRITE_BY_PATH, this.onMovePathHandler);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_SET_CAMERA_FOLLOW, this.onCameraFollowHandler);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_SYNC_STATE, this.onSyncStateHandler);
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
        // Logger.getInstance().log("room====enter");
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
        // Logger.getInstance().log("rooms remove");
        if (this.blocks) {
            this.blocks.remove(object);
        }
    }

    public updateBlockObject(object: IBlockObject) {
        // Logger.getInstance().log("rooms update");
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
        Logger.getInstance().log("room startplay =====");
        this.game.renderPeer.showPlay();
        // Logger.getInstance().log("roomstartPlay");
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
            await this.cameraService.syncCameraScroll();
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

    public setState(states: op_def.IState[]) {
        if (!this.mStateMap) this.mStateMap = new Map();
        let state: State;
        for (const sta of states) {
            switch (sta.execCode) {
                case op_def.ExecCode.EXEC_CODE_ADD:
                case op_def.ExecCode.EXEC_CODE_UPDATE:
                    state = new State(sta);
                    this.mStateMap.set(sta.name, new State(sta));
                    this.handlerState(state);
                    break;
                case op_def.ExecCode.EXEC_CODE_DELETE:
                    this.mStateMap.delete(sta.name);
                    break;
            }
        }
    }

    public initUI() {
        // if (this.game.uiManager) this.game.uiManager.showMainUI();
        this.mIsLoading = false;
    }

    // public isWalkableAt(x: number, y: number) {
    //     const reult = this.mAstar.isWalkableAt(x, y);
    //     return reult;
    // }

    public setTerrainWalkable(x: number, y: number, val: boolean) {
        const map = this.mElementManager.map;
        const value = map[x][y];
        if (value === 0) {
            this.game.physicalPeer.setWalkableAt(x, y, false);
            // this.mAstar.setWalkableAt(y, x, false);
        } else {
            this.game.physicalPeer.setWalkableAt(x, y, val);
            // this.mAstar.setWalkableAt(y, x, val);
        }
    }

    public setElementWalkable(x: number, y: number, val: boolean) {
        this.game.physicalPeer.setWalkableAt(x, y, val);
        // this.mAstar.setWalkableAt(y, x, val);
    }

    public async findPath(startPos: IPos, targetPosList: IPos[], toReverse: boolean) {
        return await this.game.physicalPeer.getPath(startPos, targetPosList, toReverse);
    }

    public clear() {
        this.mGame.peer.physicalPeer.destroyMatterWorld();
        // if (this.mLayManager) this.mLayManager.destroy();
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
        // if (this.mWallManager) this.mWallManager.destroy();
        if (this.mActorData) this.mActorData = null;
        if (this.mStateMap) this.mStateMap = null;
        Logger.getInstance().log("room clear");
        this.game.renderPeer.clearRoom();
        this.game.uiManager.recover();
    }

    public move(id: number, x: number, y: number, nodeType: NodeType) {
        if (this.moveStyle !== op_def.MoveStyle.PATH_MOVE_STYLE) {
            return;
        }
        if (!this.mPlayerManager) {
            return;
        }
        const actor = this.mPlayerManager.actor;
        if (!actor) {
            return;
        }
        // const pos45 = actor.getPosition45();
        // const click45 = this.transformTo45(new LogicPos(x, y));
        // if (Math.abs(pos45.x - click45.x) > 20 || Math.abs(pos45.y - click45.y) > 20) {
        // this.addFillEffect({ x, y }, op_def.PathReachableStatus.PATH_UNREACHABLE_AREA);
        //     return;
        // }

        const pkt: PBpacket = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_MOVE_TO_TARGET_BY_PATH);
        const content: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_MOVE_TO_TARGET_BY_PATH = pkt.content;
        if (id) content.id = id;
        if (nodeType) content.nodeType = nodeType;

        // content.mouseEvent = [9];
        content.point3f = { x, y };
        this.connection.send(pkt);

        this.tryMove();

        // this.game.physicalPeer.tryMove();
    }

    public destroy() {
        this.removeListen();
        this.clear();
        this.game.renderPeer.removeScene(SceneName.PLAY_SCENE);
        // if (this.mScene) {
        //   this.mScene = null;
        // }
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

    public tryMove() {
        const player = this.mPlayerManager.actor;
        if (!player) {
            return;
        }
        const moveData = player.moveData;
        const pos = moveData.posPath;
        if (!pos || pos.length < 0) {
            return;
        }

        const step = moveData.step || 0;
        if (step >= pos.length) {
            return;
        }

        const playerPosition = player.getPosition();
        const position = op_def.PBPoint3f.create();
        position.x = playerPosition.x;
        position.y = playerPosition.y;

        if (pos[step] === undefined) {
            // Logger.getInstance().log("move error", pos, step);
        }
        const nextPosition = op_def.PBPoint3f.create();
        nextPosition.x = pos[step].x;
        nextPosition.y = pos[step].y;

        const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_CHECK_MOVE_PATH_NEXT_POINT);
        const conten: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_CHECK_MOVE_PATH_NEXT_POINT = packet.content;
        conten.timestemp = this.now();
        conten.position = position;
        conten.nextPoint = nextPosition;
        this.connection.send(packet);
    }
    // room创建状态管理
    public onManagerCreated(key: string) {
        if (this.mManagersReadyStates.has(key)) return;

        this.mManagersReadyStates.set(key, false);
    }

    public onManagerReady(key: string) {
        if (!this.mManagersReadyStates.has(key)) return;

        Logger.getInstance().log("room.onManagerReady ", key);

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

    protected handlerState(state: State) {
        switch (state.name) {
            case "skyBoxAnimation":
                this.mSkyboxManager.setState(state);
                break;
            case "setCameraBounds":
                const bounds = state.packet;
                if (!bounds || !bounds.width || !bounds.height) {
                    // Logger.getInstance().log("setCameraBounds error", bounds);
                    return;
                }
                let { x, y, width, height } = bounds;
                x = -width * 0.5 + (x ? x : 0);
                y = (this.mSize.sceneHeight - height) * 0.5 + (y ? y : 0);
                x *= this.mScaleRatio;
                y *= this.mScaleRatio;
                width *= this.mScaleRatio;
                height *= this.mScaleRatio;
                this.mGame.renderPeer.setCamerasBounds(x, y, width, height);
                break;
        }
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

    get enableEdit() {
        return this.mEnableEdit;
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
        this.mEnableEdit = true;
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
    //     //     Logger.getInstance().log("Room scene  does not exist");
    //     //     return;
    //     // }
    //     // const fall = new FallEffect(this.scene, this.mScaleRatio);
    //     // fall.show(status);
    //     // fall.setPosition(pos.x * this.mScaleRatio, pos.y * this.mScaleRatio);
    //     // this.addToSceneUI(fall);
    //     this.mGame.addFillEffect(pos, status);
    // }

    private onMovePathHandler(packet: PBpacket) {
        const content: op_client.IOP_VIRTUAL_WORLD_REQ_CLIENT_MOVE_SPRITE_BY_PATH = packet.content;
        const status = content.pathStatus;
        if (!status) {
            return;
        }
        const pos = content.targetPos;
        // this.addFillEffect({ x: pos.x, y: pos.y }, status);
    }

    private onCameraFollowHandler(packet: PBpacket) {
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

    private onSyncStateHandler(packet: PBpacket) {
        const content: op_client.IOP_VIRTUAL_WORLD_REQ_CLIENT_SYNC_STATE = packet.content;
        const group = content.stateGroup;
        for (const states of group) {
            switch (states.owner.type) {
                case op_def.NodeType.SceneNodeType:
                    this.setState(states.state);
                    break;
                case op_def.NodeType.ElementNodeType:
                    this.elementManager.setState(states);
                    break;
            }
        }
    }
}
