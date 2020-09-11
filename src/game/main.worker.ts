import { RPCPeer, RPCFunction } from "../../lib/rpc/rpc.peer";
import { webworker_rpc, op_gateway, op_virtual_world, op_editor, op_client, op_def } from "pixelpai_proto";
import { PBpacket, Buffer, PacketHandler } from "net-socket-packet";
import { IConnectListener, SocketConnection, SocketConnectionError } from "../../lib/net/socket";
import { Logger } from "../utils/log";
import { ServerAddress } from "../../lib/net/address";
import HeartBeatWorker from "worker-loader?filename=[hash][name].js!../game/heartBeat.worker";
import IOP_CLIENT_REQ_VIRTUAL_WORLD_SYNC_TIME = op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_SYNC_TIME;
import { Connection } from "../../lib/net/connection.service";
import { Lite } from "game-capsule";
import { IPosition45Obj, Position45 } from "../utils/position45";
import { ICameraService, CamerasManager } from "./cameras/cameras.manager";
import { WorldService } from "../game/world.service";
import { PlayScene } from "../scenes/play";
import { ViewblockManager, ViewblockService } from "./cameras/viewblock.manager";
import { Pos } from "../utils/pos";
import { ClockReadyListener } from "./clock";
import IActor = op_client.IActor;
import { Element, IElement } from "./element/element";
import { IBlockObject } from "./cameras/block.object";
import { Size } from "../utils/size";
import { MessageType } from "../const/MessageType";
import { ReferenceArea } from "./editor/reference.area";
import { IPoint } from "game-capsule";
import { IScenery } from "./sky.box/scenery";
import { State } from "./state/state.group";
import { Brush, BrushEnum } from "../const/brush";
import { MouseFollow } from "./editor/mouse.follow";
import { SelectedElement } from "./editor/selected.element";
import { DisplayObjectPool } from "./display-object.pool";

import * as protos from "pixelpai_proto";
import Connection from "../../lib/net/connection";
for (const key in protos) {
    PBpacket.addProtocol(protos[key]);
}
class ConnListener implements IConnectListener {
    onConnected(): void {
        mainPeer.onConnected();
        Logger.getInstance().info(`MainWorker[已连接]`);
    }

    onDisConnected(): void {
        mainPeer.onDisConnected();
        Logger.getInstance().info(`MainWorker[已断开]`);
    }

    // reason: SocketConnectionError | undefined
    onError(reason: SocketConnectionError | undefined): void {
        if (reason) {
            mainPeer.onConnectError(reason.message);
            Logger.getInstance().error(`MainWorker[错误]:${reason.message}`);
        } else {
            Logger.getInstance().error(`MainWorker[错误]:${reason}`);
        }
    }
}
class WorkerClient extends SocketConnection {
    protected mUuid: number = 0;
    private _pause: boolean = false;
    constructor($listener: IConnectListener) {
        super($listener);
    }
    send(data: any): void {
        if (this._pause) return;
        const protobuf_packet: PBpacket = new PBpacket();
        protobuf_packet.Deserialization(new Buffer(data));
        protobuf_packet.header.uuid = this.mUuid || 0;
        super.send(protobuf_packet.Serialization());
        Logger.getInstance().info(`MainWorker[发送] >>> ${protobuf_packet.toString()}`);
    }
    onData(data: any) {
        if (this._pause) return;
        const protobuf_packet: PBpacket = new PBpacket();
        protobuf_packet.Deserialization(new Buffer(data));
        this.mUuid = protobuf_packet.header.uuid;
        Logger.getInstance().info(`MainWorker[接收] <<< ${protobuf_packet.toString()} `);
        // Send the packet to parent thread
        const buffer = protobuf_packet.Serialization();
        mainPeer.onData(buffer);
    }

    set pause(value: boolean) {
        this._pause = value;
    }
}

// 网络连接器
// 使用webworker启动socket，无webworker时直接启动socket
class Connection {
    public isConnect: boolean = false;
    protected mPacketHandlers: PacketHandler[] = [];
    addPacketListener(listener: PacketHandler) {
        this.mPacketHandlers.push(listener);
    }

    removePacketListener(listener: PacketHandler) {
        const idx: number = this.mPacketHandlers.indexOf(listener);
        if (idx !== -1) {
            this.mPacketHandlers.splice(idx, 1);
        }
    }

    clearPacketListeners() {
        if (!this.mPacketHandlers || this.mPacketHandlers.length < 1) {
            return;
        }
        const len: number = this.mPacketHandlers.length;
        for (let i: number = 0; i < len; i++) {
            const listener: PacketHandler = this.mPacketHandlers[i];
            if (!listener) continue;
            this.removePacketListener(listener);
            i--;
        }
    }

    onData(data: ArrayBuffer) {
        const protobufPacket: PBpacket = new PBpacket();
        protobufPacket.Deserialization(new Buffer(data));
        const handlers = this.mPacketHandlers;
        handlers.forEach((handler: PacketHandler) => {
            handler.onPacketArrived(protobufPacket);
        });
    }
}
class MainPeer extends RPCPeer {
    private heartBeatWorker: HeartBeatWorker;
    private mRoomManager: RoomManager;
    constructor() {
        const t = self as any;
        super("mainWorker", t);
        this.heartBeatWorker = new HeartBeatWorker();
        this.linkTo(HEARTBEAT_WORKER, "worker-loader?filename=[hash][name].js!../game/heartBeat.worker").onReady(() => {

        });
    }
    // ============= connection调用主进程
    public onConnected() {
        connect.isConnect = true;
        // 告诉主进程链接成功
        this.remote[RENDER_PEER].Rener.onConnected(null);
        // 调用心跳
        this.startBeat();
        // 逻辑层world链接成功
        world.onConnected();
    }

    public onDisConnected() {
        connect.isConnect = false;
        // 告诉主进程断开链接
        this.remote[RENDER_PEER].Rener.onDisConnected(null);
        // 停止心跳
        this.endBeat();
        world.onDisConnected();
    }

    public onConnectError(error: string) {
        connect.isConnect = false;
        // 告诉主进程链接错误
        this.remote[RENDER_PEER].Render.onConnectError(null, error);
        // 停止心跳
        this.endBeat();
        world.onError();
    }

    public onData(buffer: Buffer) {
        world.onData(buffer);
    }

    public createAnotherGame(gameId: string, worldId: string, sceneId?: number, px?: number, py?: number, pz?: number) {
        this.remote[RENDER_PEER].Render.createAnotherGame(gameId, worldId, sceneId, px, py, pz);
    }

    // ============= 主进程调用心跳
    public startBeat() {
        this.remote[HEARTBEAT_WORKER].HeartBeatPeer.startBeat(null);
    }
    public endBeat() {
        this.remote[HEARTBEAT_WORKER].HeartBeatPeer.endBeat(null);
    }
    public clearBeat() {
        this.remote[HEARTBEAT_WORKER].HeartBeatPeer.endBeat(null);
    }

    // ============== render调用主进程
    @RPCFunction([webworker_rpc.ParamType.str, webworker_rpc.ParamType.num, webworker_rpc.ParamType.boolean])
    public startConnect(host: string, port: number, secure?: boolean) {
        const addr: ServerAddress = { host, port, secure };
        socket.startConnect(addr);
    }
    @RPCFunction()
    public focus() {
        socket.pause = false;
    }
    @RPCFunction()
    public blur() {
        socket.pause = true;
    }
    /**
     * 初始化world中的各个管理器,并添加socket事件监听
     */
    @RPCFunction()
    public initWorld() {
        world.initWorld();
    }
    /**
     * 添加world中的socket消息监听
     */
    @RPCFunction()
    public initGame() {
        world.initGame();
    }
    @RPCFunction([webworker_rpc.ParamType.num, webworker_rpc.ParamType.num])
    public setSize(width, height) {
        world.setSize(width, height);
    }
    // ============= 心跳调用主进程
    @RPCFunction()
    public heartBeat() {
        // ==========同步心跳
        const pkt: PBpacket = new PBpacket(op_gateway.OPCODE._OP_CLIENT_REQ_GATEWAY_PING);
        socket.send(pkt.Serialization);
    }
    @RPCFunction()
    public reconnect() {
        // 告诉主进程重新连接
        this.remote[RENDER_PEER].render.reconnect();
    }
    @RPCFunction()
    public syncClock() {
        // ==========同步clock时间
        const pkt: PBpacket = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_SYNC_TIME);
        const ct: IOP_CLIENT_REQ_VIRTUAL_WORLD_SYNC_TIME = pkt.content;
        ct.clientStartTs = new Date().getTime();
        socket.send(pkt.Serialization);
    }
    // ==== todo
    protected terminate() {
        this.remote[HEARTBEAT_WORKER].HeartBeatPeer.terminate();
        this.terminate();
        // super.terminate();
    }
}

interface ISize {
    width: number;
    height: number;
}

class LogicWorld extends PacketHandler implements IConnectListener {
    public connect: Connection;
    private mMoveStyle: number = -1;
    private mSize: ISize;

    public initWorld() {
        this.connect = new Connection();
        this.connect.addPacketListener(this);
        this.addHandlerFun(op_client.OPCODE._OP_GATEWAY_RES_CLIENT_VIRTUAL_WORLD_INIT, this.onInitVirtualWorldPlayerInit);
        this.addHandlerFun(op_client.OPCODE._OP_GATEWAY_RES_CLIENT_ERROR, this.onClientErrorHandler);
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_SELECT_CHARACTER, this.onSelectCharacter);
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_GOTO_ANOTHER_GAME, this.onGotoAnotherGame);
        this.addHandlerFun(op_client.OPCODE._OP_GATEWAY_RES_CLIENT_PONG, this.heartBeatCallBack);
        this.mRoomMamager = new RoomManager(this);
        this.mUiManager = new UiManager(this);
        this.mMouseManager = new MouseManager(this);
        this.mElementStorage = new ElementStorage();
        this.mHttpService = new HttpService(this);
        this.mRoleManager = new RoleManager(this);
        this.mSoundManager = new SoundManager(this);
        this.mLoadingManager = new LoadingManager(this);
        this.mPlayerDataManager = new PlayerDataManager(this);

        this.mRoleManager.register();
        this.mRoomMamager.addPackListener();
        this.mUiManager.addPackListener();
        this.mSoundManager.addPackListener();
        this.mPlayerDataManager.addPackListener();
        this.mAccount = new Account();
        this.mAccount.enterGame(this.mConfig.game_id, this.mConfig.virtual_world_id, null, null);
    }
    public initGame() {
        if (this.mRoomMamager) this.mRoomMamager.addPackListener();
        if (this.mUiManager) this.mUiManager.addPackListener();
        if (this.mRoleManager) this.mRoleManager.register();
        if (this.mSoundManager) this.mSoundManager.addPackListener();
        if (this.mPlayerDataManager) this.mPlayerDataManager.addPackListener();
        if (this.mElementStorage) {
            this.mElementStorage.on("SCENE_PI_LOAD_COMPELETE", this.loadSceneConfig);
        }
    }
    public onConnected() {
        if (!this.mClock) this.mClock = new Clock(connect, this);
        if (!this.mHttpClock) this.mHttpClock = new HttpClock(this);
        // Logger.getInstance().info(`enterVirtualWorld`);
        this.enterVirtualWorld();
        // this.login();
    }
    public onDisConnected() {
        Logger.getInstance().log("app connectFail=====");
        if (!this.game || this.isPause) return;
        if (this.mConfig.connectFail) {
            this.onError();
        } else {
            this.clearGame().then(() => {
                this.initWorld(this.mConfig, this.mCallBack);
            });
        }
    }
    public onError() {
        this.gameState = GameState.SOCKET_ERROR;
        Logger.getInstance().log("socket error");
        if (!this.mConnection.connect) {
            if (this.mConfig.connectFail) {
                Logger.getInstance().log("app connectFail");
                return this.mConfig.connectFail();
            } else {
                this.reconnect();
            }
        }
    }
    public onData(buffer: Buffer) {
        world.connect.onData(buffer.buffer);
    }

    public onClientErrorHandler(packet: PBpacket): void {
        const content: op_client.OP_GATEWAY_RES_CLIENT_ERROR = packet.content;
        Logger.getInstance().error(`Remote Error[${content.responseStatus}]: ${content.msg}`);
    }
    public setSize(width, height) {
        this.mSize = {
            width,
            height
        };
    }
    public getSize(): ISize {
        return this.mSize;
    }

    private onGotoAnotherGame(packet: PBpacket) {
        const content: op_client.IOP_VIRTUAL_WORLD_REQ_CLIENT_GOTO_ANOTHER_GAME = packet.content;
        mainPeer.createAnotherGame(content.gameId, content.virtualWorldId, content.sceneId, content.loc.x, content.loc.y, content.loc.z);
    }

    private onInitVirtualWorldPlayerInit(packet: PBpacket) {
        // if (this.mClock) this.mClock.sync(); // Manual sync remote time.
        // TODO 进游戏前预加载资源
        const content: op_client.IOP_GATEWAY_RES_CLIENT_VIRTUAL_WORLD_INIT = packet.content;
        const configUrls = content.configUrls;
        this.mMoveStyle = content.moveStyle;

        this.clock.sync(-1);

        this.initgameConfigUrls(configUrls);

        if (!configUrls || configUrls.length <= 0) {
            Logger.getInstance().error(`configUrls error: , ${configUrls}, gameId: ${this.mAccount.gameID}`);
            this.createGame(content.keyEvents);
            return;
        }
        Logger.getInstance().log(`mMoveStyle:${content.moveStyle}`);
        let game_id = this.mAccount.gameID;
        if (game_id.indexOf(".") > -1) {
            game_id = game_id.split(".")[1];
        }

        const mainGameConfigUrl = this.gameConfigUrl;

        this.mLoadingManager.start(LoadingTips.downloadGameConfig());
        // this.mConnection.loadRes([mainGameConfigUrl]);
        this.loadGameConfig(mainGameConfigUrl)
            .then((gameConfig: Lite) => {
                this.mElementStorage.setGameConfig(gameConfig);
                this.createGame(content.keyEvents);
                Logger.getInstance().debug("created game suc");
            })
            .catch((err: any) => {
                Logger.getInstance().log(err);
            });
    }

    private loadGameConfig(remotePath): Promise<Lite> {
        const configPath = ResUtils.getGameConfig(remotePath);
        return load(configPath, "arraybuffer").then((req: any) => {
            Logger.getInstance().log("start decodeConfig");
            this.mLoadingManager.start(LoadingTips.parseConfig());
            return this.decodeConfigs(req);
        });
    }

    private decodeConfigs(req): Promise<Lite> {
        return new Promise((resolve, reject) => {
            const arraybuffer = req.response;
            if (arraybuffer) {
                try {
                    const gameConfig = new Lite();
                    gameConfig.deserialize(new Uint8Array(arraybuffer));
                    Logger.getInstance().log("TCL: World -> gameConfig", gameConfig);
                    resolve(gameConfig);
                } catch (error) {
                    reject(error);
                }
            } else {
                reject("error");
            }
        });
    }


}

interface IRoomManager {
    readonly currentRoom: IRoomService | undefined;
    readonly connection: Connection | undefined;
    addPackListener();
    removePackListener();
}

class RoomManager extends PacketHandler implements IRoomManager {
    private mRooms: IRoomService[] = [];
    private mCurRoom: IRoomService;
    constructor() {
        super();
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_ENTER_SCENE, this.onEnterSceneHandler);
        this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_CHANGE_TO_EDITOR_MODE, this.onEnterEditor);
    }

    public addPackListener() {
        if (this.connection) {
            this.connection.addPacketListener(this);
        }
    }

    public removePackListener() {
        if (this.connection) {
            this.connection.removePacketListener(this);
        }
    }

    public getRoom(id: number): IRoomService | undefined {
        return this.mRooms.find((room: Room) => {
            return room.id === id;
        });
    }

    public onFocus() {
        this.mRooms.forEach((room: Room) => {
            if (room && room.scene) room.resume(room.scene.scene.key);
        });
    }

    public onBlur() {
        this.mRooms.forEach((room: Room) => {
            if (room && room.scene) room.pause();
        });
    }

    public pasuseRoom(id: number) {
        const idx = this.mRooms.findIndex((room: Room, index: number) => id === room.id);
        if (idx >= 0) {
            const room: IRoomService = this.mRooms[idx];
            room.pause();
        }
    }

    public resumeRoom(id: number) {
        const idx = this.mRooms.findIndex((room: Room, index: number) => id === room.id);
        if (idx >= 0) {
            const room: IRoomService = this.mRooms[idx];
            if (room && room.scene) room.resume(room.scene.scene.key);
        }
    }

    public stop() {
        this.mRooms.forEach((room: Room) => {
            if (room && room.scene) room.destroy();
        });
    }

    public resize(width: number, height: number) {
        this.mRooms.forEach((room: Room) => {
            if (room) room.resize(width, height);
        });
    }

    public destroy() {
        this.removePackListener();
        this.mCurRoom = null;
        for (let room of this.mRooms) {
            room.destroy();
            room = null;
        }
        this.mRooms.length = 0;
    }

    private hasRoom(id: number): boolean {
        const idx = this.mRooms.findIndex((room: Room, index: number) => id === room.id);
        return idx >= 0;
    }

    private async onEnterScene(scene: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_ENTER_SCENE) {
        const vw = scene;
        if (this.hasRoom(vw.scene.id)) {
            this.onEnterRoom(scene);
        } else {
            // load this scene config in gameConfig
            this.world.loadSceneConfig(vw.scene.id.toString()).then(async (config: Lite) => {
                this.world.elementStorage.setSceneConfig(config);
                this.onEnterRoom(scene);
            });
        }
    }

    private async onEnterRoom(scene: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_ENTER_SCENE) {
        if (this.mCurRoom) {
            await this.leaveScene(this.mCurRoom);
        }
        const room = new Room(this);
        this.mRooms.push(room);
        room.addActor(scene.actor);
        room.enter(scene.scene);
        this.mCurRoom = room;
    }

    private async onEnterDecorate(scene: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_ENTER_SCENE) {
        if (this.mCurRoom) {
            await this.leaveScene(this.mCurRoom);
        }
        const room: DecorateRoom = new DecorateRoom(this);
        room.enter(scene.scene);
        const actor = scene.actor;
        if (actor) room.setEnterPos(actor.x, actor.y);
        this.mRooms.push(room);
        this.mCurRoom = room;
    }

    private onEnterEditor(packet: PBpacket) {
        const content: op_client.IOP_EDITOR_REQ_CLIENT_CHANGE_TO_EDITOR_MODE = packet.content;
        const room = new EditorRoom(this);
        room.enter(content.scene);
        this.mCurRoom = room;
        this.mRooms.push(room);
    }

    private async leaveScene(room: IRoomService) {
        if (!room) return;
        return new Promise((resolve, reject) => {
            const loading: LoadingScene = <LoadingScene>this.mWorld.game.scene.getScene(LoadingScene.name);
            if (loading) {
                loading.show().then(() => {
                    this.mRooms = this.mRooms.filter((r: IRoomService) => r.id !== room.id);
                    room.destroy();
                    resolve();
                });
            }
        });
    }

    private onEnterSceneHandler(packet: PBpacket) {
        const content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_ENTER_SCENE = packet.content;
        const scene = content.scene;
        switch (scene.sceneType) {
            case op_def.SceneTypeEnum.NORMAL_SCENE_TYPE:
                this.onEnterScene(content);
                break;
            case op_def.SceneTypeEnum.EDIT_SCENE_TYPE:
                this.onEnterDecorate(content);
                break;
        }
    }

    get currentRoom(): Room {
        return <Room>this.mCurRoom;
    }

    get connection(): Connection {
        return connect;
    }
}

interface SpriteAddCompletedListener {
    onFullPacketReceived(sprite_t: op_def.NodeType): void;
}

interface IRoomService {
    readonly id: number;
    readonly terrainManager: TerrainManager;
    readonly elementManager: ElementManager;
    readonly playerManager: PlayerManager;
    readonly layerManager: LayerManager;
    readonly cameraService: ICameraService;
    readonly effectManager: EffectManager;
    readonly roomSize: IPosition45Obj;
    readonly miniSize: IPosition45Obj;
    readonly blocks: ViewblockService;
    readonly enableEdit: boolean;
    readonly sceneType: op_def.SceneTypeEnum;
    readonly connection: Connection | undefined;
    now(): number;

    startLoad();

    completeLoad();

    startPlay();

    enter(room: op_client.IScene): void;

    pause(): void;

    resume(name: string | string[]): void;

    transformTo45(p: Pos): Pos;

    transformTo90(p: Pos): Pos;

    transformToMini45(p: Pos): Pos;

    transformToMini90(p: Pos): Pos;

    addBlockObject(object: IBlockObject);

    removeBlockObject(object: IBlockObject);

    updateBlockObject(object: IBlockObject);

    addToGround(element: ElementDisplay | ElementDisplay[], index?: number);

    addToSurface(element: ElementDisplay | ElementDisplay[]);

    addToSceneUI(element: Phaser.GameObjects.GameObject | Phaser.GameObjects.GameObject[]);

    addToUI(element: Phaser.GameObjects.Container | Phaser.GameObjects.Container[]);

    addMouseListen();

    getElement(id: number): IElement;

    update(time: number, delta: number): void;

    initUI(): void;

    destroy();
}

// 这一层管理数据和Phaser之间的逻辑衔接
// 消息处理让上层[RoomManager]处理
class Room extends PacketHandler implements IRoomService, SpriteAddCompletedListener, ClockReadyListener {
    protected mID: number;
    protected mTerrainManager: TerrainManager;
    protected mElementManager: ElementManager;
    protected mPlayerManager: PlayerManager;
    protected mWallManager: WallManager;
    protected mLayManager: LayerManager;
    protected mGroupManager: GroupManager;
    protected mFrameManager: FrameManager;
    protected mSkyboxManager: SkyBoxManager;
    protected mEffectManager: EffectManager;
    protected mScene: Phaser.Scene | undefined;
    protected mSize: IPosition45Obj;
    protected mMiniSize: IPosition45Obj;
    protected mCameraService: ICameraService;
    protected mBlocks: ViewblockService;
    protected mEnableEdit: boolean = false;
    protected mScaleRatio: number;
    protected mStateMap: Map<string, State>;
    private readonly moveStyle: op_def.MoveStyle;
    private mActorData: IActor;
    constructor(protected manager: IRoomManager) {
        super();
        this.moveStyle = this.mWorld.moveStyle;
        this.mScaleRatio = this.mWorld.scaleRatio;
        connect.addPacketListener(this);
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_ENABLE_EDIT_MODE, this.onEnableEditModeHandler);
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_UNWALKABLE_BIT_MAP, this.onShowMapTitle);
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_MOVE_SPRITE_BY_PATH, this.onMovePathHandler);
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_SET_CAMERA_FOLLOW, this.onCameraFollowHandler);
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_SYNC_STATE, this.onSyncStateHandler);
    }

    public enter(data: op_client.IScene): void {
        const size: Size = this.mWorld.getSize();
        if (!data) {
            // Logger.getInstance().error("wrong room");
            return;
        }
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
        // if (this.mMap) this.mMap.destroy();
        // this.mMap = new Map(this.mWorld);
        // this.mMap.setMapInfo(data);
        this.world.showLoading().then(() => {
            this.completeLoad();
        });
    }

    public onFullPacketReceived(sprite_t: op_def.NodeType): void {
        if (sprite_t !== op_def.NodeType.TerrainNodeType) {
            return;
        }
    }

    public onClockReady(): void {
        // TODO: Unload loading-scene
    }

    public startLoad() { }

    public completeLoad() {
        if (this.mWorld.game.scene.getScene(PlayScene.name)) {
            const loadingScene: LoadingScene = this.mWorld.game.scene.getScene(LoadingScene.name) as LoadingScene;
            if (loadingScene) loadingScene.sleep();
            return;
        }
        this.mWorld.game.scene.add(PlayScene.name, PlayScene, true, {
            room: this,
        });
    }

    public startPlay() {
        if (this.mLayManager) {
            this.layerManager.destroy();
        }
        this.mCameraService = new CamerasManager(this);
        this.mScene = this.world.game.scene.getScene(PlayScene.name);
        this.mTerrainManager = new TerrainManager(this, this);
        this.mElementManager = new ElementManager(this);
        this.mPlayerManager = new PlayerManager(this);
        this.mWallManager = new WallManager(this);
        this.mBlocks = new ViewblockManager(this.mCameraService);
        this.mLayManager = new LayerManager(this);
        this.mGroupManager = new GroupManager(this);
        this.mFrameManager = new FrameManager();
        this.mSkyboxManager = new SkyBoxManager(this);
        this.mEffectManager = new EffectManager(this);
        if (this.scene) {
            const camera = this.scene.cameras.main;
            // setTimeout(() => {
            //     camera.flash(6000, 1, 1, 1, true, undefined, this.scene);
            // }, 6000);
            this.mCameraService.camera = camera;
            const padding = 199 * this.mScaleRatio;
            this.mCameraService.setBounds(-padding, -padding, this.mSize.sceneWidth * this.mScaleRatio + padding * 2, this.mSize.sceneHeight * this.mScaleRatio + padding * 2);
            // init block
            this.mBlocks.int(this.mSize);

            if (this.mWorld.moveStyle !== op_def.MoveStyle.DIRECTION_MOVE_STYLE) {
                this.mFallEffectContainer = new FallEffectContainer(this.mScene, this);
            }
        }
        // this.mPlayerManager.createActor(new PlayerModel(this.mActorData));
        this.mPlayerManager.createActor(this.mActorData);
        const loadingScene: LoadingScene = this.mWorld.game.scene.getScene(LoadingScene.name) as LoadingScene;
        this.world.emitter.on(MessageType.PRESS_ELEMENT, this.onPressElementHandler, this);
        if (loadingScene) loadingScene.sleep();
        this.world.changeRoom(this);
        // if (this.world.uiManager) this.world.uiManager.showMainUI();

        if (this.connection) {
            this.cameraService.syncCamera();
            this.connection.send(new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_SCENE_CREATED));
        }

        this.scene.input.on("pointerdown", this.onPointerDownHandler, this);
        this.scene.input.on("pointerup", this.onPointerUpHandler, this);
        this.world.emitter.on("Tap", this.onTapHandler, this);

        this.initSkyBox();
    }

    public pause() {
        Logger.getInstance().log(`#BlackSceneFromBackground; room.pause(); mScene:${this.mScene}`);
        if (this.mScene) this.mScene.scene.pause();
        if (this.mWorld && this.mWorld.inputManager) this.mWorld.inputManager.enable = false;
    }

    public resume(name: string) {
        Logger.getInstance().log(`#BlackSceneFromBackground; room.resume(); name:${name}; mScene:${this.mScene}`);
        if (this.mScene) this.mScene.scene.resume(name);
        if (this.mWorld && this.mWorld.inputManager) this.mWorld.inputManager.enable = true;
        // this.mClock.sync(-1);
    }

    public addActor(data: IActor): void {
        this.mActorData = data;
    }

    public addBlockObject(object: IBlockObject) {
        if (this.blocks) {
            this.blocks.add(object);
        }
    }

    public removeBlockObject(object: IBlockObject) {
        if (this.blocks) {
            this.blocks.remove(object);
        }
    }

    public updateBlockObject(object: IBlockObject) {
        if (this.blocks) {
            this.blocks.check(object);
        }
    }

    public addToGround(element: ElementDisplay | ElementDisplay[], index?: number) {
        this.layerManager.addToGround(element, index);
    }

    public addToSurface(element: ElementDisplay | ElementDisplay[]) {
        this.layerManager.addToSurface(element);
    }

    public addToSceneUI(element: Phaser.GameObjects.GameObject | Phaser.GameObjects.GameObject[]) {
        this.layerManager.addToSceneToUI(element);
    }

    public addToUI(element: Phaser.GameObjects.Container | Phaser.GameObjects.Container[]) {
        this.layerManager.addToUI(element);
    }

    public resize(width: number, height: number) {
        this.mScaleRatio = this.mWorld.scaleRatio;
        if (this.layerManager) this.layerManager.resize(width, height);
        if (this.mCameraService) {
            const padding = 199 * this.mScaleRatio;
            this.mCameraService.setBounds(-padding, -padding, this.mSize.sceneWidth * this.mScaleRatio + padding * 2, this.mSize.sceneHeight * this.mScaleRatio + padding * 2);
            this.mCameraService.resize(width, height);
        }
        if (this.mSkyboxManager) {
            this.mSkyboxManager.resize(width, height);
        }
    }

    public transformTo90(p: Pos) {
        if (!this.mSize) {
            // Logger.getInstance().error("position object is undefined");
            return;
        }
        return Position45.transformTo90(p, this.mSize);
    }

    public transformTo45(p: Pos) {
        if (!this.mSize) {
            // Logger.getInstance().error("position object is undefined");
            return;
        }
        return Position45.transformTo45(p, this.mSize);
    }

    public transformToMini90(p: Pos) {
        if (!this.mMiniSize) {
            return;
        }
        return Position45.transformTo90(p, this.miniSize);
    }

    public transformToMini45(p: Pos) {
        if (!this.mMiniSize) {
            return;
        }
        return Position45.transformTo45(p, this.mMiniSize);
    }

    public addMouseListen() {
        this.layerManager.addMouseListen();
    }

    public getElement(id: number): IElement {
        let ele = null;
        if (this.mPlayerManager) {
            ele = this.mPlayerManager.get(id);
        }
        if (!ele && this.mElementManager) {
            ele = this.elementManager.get(id);
        }
        return ele;
    }

    public moveable(pos: Pos): boolean {
        const pos45 = this.transformToMini45(pos);
        const map = this.mElementManager.map;
        if (pos45.x < 0 || pos45.x > map.length || pos45.y < 0 || pos45.y > map[0].length) {
            return false;
        }
        if (map[pos45.y][pos45.x] === 0) {
            return false;
        }
        return true;
    }

    public update(time: number, delta: number) {
        this.updateClock(time, delta);
        this.mBlocks.update(time, delta);
        if (this.layerManager) this.layerManager.update(time, delta);
        if (this.elementManager) this.elementManager.update(time, delta);
        if (this.mFrameManager) this.frameManager.update(time, delta);
        if (this.mWorld.httpClock) this.mWorld.httpClock.update(time, delta);
    }

    public updateClock(time: number, delta: number) {
        // 客户端自己通过delta来更新游戏时间戳
        if (this.mWorld.clock) this.mWorld.clock.update(time, delta);
    }

    public now(): number {
        return this.mWorld.clock.unixTime;
    }

    public getMaxScene() {
        if (!this.mSize) {
            return;
        }
        let w = this.mSize.sceneWidth;
        let h = this.mSize.sceneHeight;
        const blocks = this.mSkyboxManager.scenery;
        for (const block of blocks) {
            if (block.scenery) {
                if (block.scenery.width > w) {
                    w = block.scenery.width;
                }
                if (block.scenery.height > h) {
                    h = block.scenery.height;
                }
            }
        }
        return { width: w, height: h };
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
        if (this.world.uiManager) this.world.uiManager.showMainUI();
    }

    public clear() {
        if (this.mLayManager) this.mLayManager.destroy();
        if (this.mTerrainManager) this.mTerrainManager.destroy();
        if (this.mElementManager) this.mElementManager.destroy();
        if (this.mPlayerManager) this.mPlayerManager.destroy();
        if (this.mBlocks) this.mBlocks.destroy();
        if (this.mSkyboxManager) this.mSkyboxManager.destroy();
        if (this.mWallManager) this.mWallManager.destroy();
        if (this.mActorData) {
            this.mActorData = null;
        }
        if (this.mStateMap) this.mStateMap = null;
        if (this.mCameraService) this.mCameraService.destroy();
        if (this.mEffectManager) this.mEffectManager.destroy();
    }

    public destroy() {
        this.world.emitter.off("Tap", this.onTapHandler, this);
        if (this.connection) this.connection.removePacketListener(this);
        this.clear();
        Logger.getInstance().log("#BlackSceneFromBackground; remove scene: ", PlayScene.name);
        this.mWorld.game.scene.remove(PlayScene.name);
        this.world.emitter.off(MessageType.PRESS_ELEMENT, this.onPressElementHandler, this);
        // if (this.mScene) {
        //   this.mScene = null;
        // }
    }

    protected initSkyBox() {
        const scenerys = this.world.elementStorage.getScenerys();
        if (scenerys) {
            for (const scenery of scenerys) {
                this.addSkyBox(scenery);
            }
        }
    }

    protected addSkyBox(scenery: IScenery) {
        this.mSkyboxManager.add(scenery);
    }

    protected onPointerDownHandler(pointer: Phaser.Input.Pointer) {
        this.addPointerMoveHandler();
    }

    protected onPointerUpHandler(pointer: Phaser.Input.Pointer) {
        this.removePointerMoveHandler();
    }

    protected addPointerMoveHandler() {
        this.mScene.input.on("pointermove", this.onPointerMoveHandler, this);
        this.mScene.input.on("gameout", this.onGameOutHandler, this);
    }

    protected removePointerMoveHandler() {
        this.mScene.input.off("pointermove", this.onPointerMoveHandler, this);
        this.mScene.input.off("gameout", this.onGameOutHandler, this);
        if (this.cameraService.moving) {
            this.cameraService.syncCameraScroll();
            this.cameraService.moving = false;
        }
    }

    protected onPointerMoveHandler(pointer: Phaser.Input.Pointer) {
        if (!this.mCameraService.targetFollow) {
            this.cameraService.offsetScroll(
                pointer.prevPosition.x - pointer.position.x,
                pointer.prevPosition.y - pointer.position.y
            );
        }
    }

    protected onGameOutHandler() {
        this.removePointerMoveHandler();
    }

    protected handlerState(state: State) {
        switch (state.name) {
            case "skyBoxAnimation":
                this.mSkyboxManager.setState(state);
                break;
            case "setCameraBounds":
                if (this.mCameraService) {
                    const bounds = state.packet;
                    if (!bounds || !bounds.width || !bounds.height) {
                        Logger.getInstance().log("setCameraBounds error", bounds);
                        return;
                    }
                    let { x, y, width, height } = bounds;
                    if (x === null || y === null) {
                        x = (this.mSize.sceneWidth - width) * 0.5;
                        y = (this.mSize.sceneHeight - height) * 0.5;
                    }
                    x *= this.mScaleRatio;
                    y *= this.mScaleRatio;
                    width *= this.mScaleRatio;
                    height *= this.mScaleRatio;
                    this.mCameraService.setBounds(x, y, width, height);
                }
                break;
        }
    }

    get scene(): Phaser.Scene | undefined {
        return this.mScene || undefined;
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

    get layerManager(): LayerManager {
        return this.mLayManager || undefined;
    }

    get groupManager(): GroupManager {
        return this.mGroupManager || undefined;
    }

    get frameManager(): FrameManager {
        return this.mFrameManager || undefined;
    }

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

    get blocks(): ViewblockService {
        return this.mBlocks;
    }

    get world(): WorldService | undefined {
        return this.mWorld;
    }

    get enableEdit() {
        return this.mEnableEdit;
    }

    get connection(): Connection | undefined {
        if (this.manager) {
            return this.manager.connection;
        }
    }

    get sceneType(): op_def.SceneTypeEnum {
        return op_def.SceneTypeEnum.NORMAL_SCENE_TYPE;
    }

    private onPressElementHandler(pointer, gameObject) {
        if (!gameObject || !gameObject.parentContainer) {
            return;
        }
        const com = gameObject.parentContainer;
        if (!(com instanceof DisplayObject)) {
            return;
        }
        const ele = com.element;
        if (!(ele instanceof Element)) {
            return;
        }

        if (this.mEnableEdit) {
            const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_EDIT_MODE_ENTER);
            this.connection.send(packet);
        }
    }

    private onEnableEditModeHandler(packet: PBpacket) {
        this.mEnableEdit = true;
    }

    private onShowMapTitle(packet: PBpacket) {
        if (!this.scene) {
            return;
        }
        const content: op_client.IOP_VIRTUAL_WORLD_REQ_CLIENT_UNWALKABLE_BIT_MAP = packet.content;
        const area = new ReferenceArea(this.scene, this);
        const num = [];
        const intArray: op_def.IIntArray[] = content.intArray;
        for (let i = 0; i < intArray.length; i++) {
            num[i] = [];
            for (let j = 0; j < intArray[i].value.length; j++) {
                num[i][j] = intArray[i].value[j];
            }
            // num[i] = intArray[i];
        }
        area.draw(num, new Phaser.Geom.Point(0, 0));
        area.setAlpha(0.1);
        if (area.size) {
            area.setPosition(area.size.sceneWidth / 2, 0);
            this.mLayManager.addToMiddle(area);
        }
    }

    private addFillEffect(pos: IPoint, status: op_def.PathReachableStatus) {
        if (!this.scene) {
            Logger.getInstance().log("Room scene  does not exist");
            return;
        }
        const fall = new FallEffect(this.scene, this.mScaleRatio);
        fall.show(status);
        fall.setPosition(pos.x * this.mScaleRatio, pos.y * this.mScaleRatio);
        this.addToSceneUI(fall);
    }

    private onMovePathHandler(packet: PBpacket) {
        const content: op_client.IOP_VIRTUAL_WORLD_REQ_CLIENT_MOVE_SPRITE_BY_PATH = packet.content;
        const status = content.pathStatus;
        if (!status) {
            return;
        }
        const pos = content.targetPos;
        this.addFillEffect({ x: pos.x, y: pos.y }, status);
    }

    private onCameraFollowHandler(packet: PBpacket) {
        const content: op_client.IOP_VIRTUAL_WORLD_REQ_CLIENT_SET_CAMERA_FOLLOW = packet.content;
        const target = this.getElement(content.id);
        if (target) {
            if (this.mCameraService) this.mCameraService.startFollow(target.getDisplay());
        } else {
            if (this.mCameraService) this.mCameraService.stopFollow();
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

    private move(x: number, y: number, gameObject: Phaser.GameObjects.GameObject) {
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
        const pos45 = actor.getPosition45();
        const click45 = this.transformTo45(new Pos(x, y));
        if (Math.abs(pos45.x - click45.x) > 20 || Math.abs(pos45.y - click45.y) > 20) {
            this.addFillEffect({ x, y }, op_def.PathReachableStatus.PATH_UNREACHABLE_AREA);
            return;
        }

        const pkt: PBpacket = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_MOVE_TO_TARGET_BY_PATH);
        const content: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_MOVE_TO_TARGET_BY_PATH = pkt.content;
        // const pkt: PBpacket = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_MOUSE_EVENT);
        // const content: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_MOUSE_EVENT = pkt.content;

        if (gameObject) {
            const displsy = gameObject.parentContainer.parentContainer || gameObject.parentContainer;
            if (displsy && displsy instanceof DisplayObject) {
                const ele = displsy.element;
                if (ele && ele.model) {
                    content.id = ele.model.id;
                    content.nodeType = ele.model.nodeType;
                }
            }
        }
        // content.mouseEvent = [9];
        content.point3f = { x, y };
        this.connection.send(pkt);

        this.tryMove();
    }

    private tryMove() {
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
            Logger.getInstance().log("move error", pos, step);
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

    // Move through the location returned by the server
    private onTapHandler(pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.GameObject) {
        this.move(pointer.worldX / this.mScaleRatio, pointer.worldY / this.mScaleRatio, gameObject);
    }

    private enterRoom() {
        this.mWorld.game.scene.run(PlayScene.name, {
            room: this,
        });
    }
}
interface EditorRoomService extends IRoomService {
    readonly brush: Brush;
    readonly miniSize: IPosition45Obj;
    displayObjectPool: DisplayObjectPool;

    transformToMini45(p: Pos): Pos;

    transformToMini90(p: Pos): Pos;

    removeSelected(): void;
}

class EditorRoom extends Room implements EditorRoomService {
    public displayObjectPool: DisplayObjectPool;
    protected editorTerrainManager: EditorTerrainManager;
    protected editorElementManager: EditorElementManager;
    protected editorMossManager: EditorMossManager;
    protected editorSkyboxManager: EditorSkyBoxManager;

    private mBrush: Brush = new Brush(this);
    private mMouseFollow: MouseFollow;
    private mSelectedElementEffect: SelectedElement;
    private mNimiSize: IPosition45Obj;
    private mPointerDelta: Pos = null;

    constructor(manager: IRoomManager) {
        super(manager);
        if (this.connection) {
            this.connection.addPacketListener(this);
            this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_SET_EDITOR_MODE, this.onSetEditorModeHandler);
            this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_ALIGN_GRID, this.onAlignGridHandler);
            this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_VISIBLE_GRID, this.onVisibleGridHandler);
            this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_MOUSE_FOLLOW, this.onMouseFollowHandler);
            this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_MOUSE_SELECTED_SPRITE, this.onMouseFollowHandler);
            this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_FETCH_SPRITE, this.onFetchSpriteHandler);
            this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_FETCH_SCENERY, this.onFetchSceneryHandler);
        }
    }

    public enter(data: op_client.IScene) {
        if (!data) {
            Logger.getInstance().error("wrong room");
            return;
        }
        this.mID = data.id;

        let { rows, cols, tileWidth, tileHeight } = data;
        this.mSize = {
            cols,
            rows,
            tileHeight,
            tileWidth,
            sceneWidth: (rows + cols) * (tileWidth / 2),
            sceneHeight: (rows + cols) * (tileHeight / 2),
        };

        rows *= 2;
        cols *= 2;
        tileWidth /= 2;
        tileHeight /= 2;
        this.mNimiSize = {
            cols,
            rows,
            tileHeight,
            tileWidth,
            sceneWidth: (rows + cols) * (tileWidth / 2),
            sceneHeight: (rows + cols) * (tileHeight / 2),
        };

        this.editorTerrainManager = new EditorTerrainManager(this);
        this.editorElementManager = new EditorElementManager(this);
        this.editorMossManager = new EditorMossManager(this);
        this.editorSkyboxManager = new EditorSkyBoxManager(this);
        this.mCameraService = new EditorCamerasManager(this);
        this.displayObjectPool = new DisplayObjectPool();

        // this.mWorld.game.scene.start(EditScene.name, { room: this });
        this.mWorld.game.scene.add(EditScene.name, EditScene, false, { room: this });
        this.mWorld.game.scene.start(EditScene.name, { room: this });
    }

    public startPlay() {
        this.mScene = this.mWorld.game.scene.getScene(EditScene.name);
        this.mLayManager = new LayerManager(this);
        this.mLayManager.drawGrid(this);
        const camera = this.scene.cameras.main;
        this.mCameraService.camera = camera;
        const zoom = this.world.scaleRatio;
        // mainCameras.setBounds(-200, -200, this.mSize.sceneWidth + 400, this.mSize.sceneHeight + 400);
        this.mCameraService.setBounds(
            -camera.width >> 1,
            -camera.height >> 1,
            this.mSize.sceneWidth * zoom + camera.width,
            this.mSize.sceneHeight * zoom + camera.height
        );

        const loadingScene: LoadingScene = this.mWorld.game.scene.getScene(LoadingScene.name) as LoadingScene;
        if (loadingScene) loadingScene.sleep();

        this.connection.send(new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_SCENE_CREATED));
        this.mCameraService.centerCameas();

        this.mScene.input.on("pointerdown", this.onPointerDownHandler, this);
        this.mScene.input.on("pointerup", this.onPointerUpHandler, this);
        this.mScene.input.on("gameobjectdown", this.onGameobjectDownHandler, this);
        this.mScene.input.on("gameout", this.onGameOutHandler, this);
        this.mScene.input.keyboard.on("keydown", this.onKeyDownHandler, this);

        // this.addSkyBox();
    }

    public destroy() {
        if (this.mWorld && this.mWorld.connection) {
            this.mWorld.connection.removePacketListener(this);
        }
        if (this.editorTerrainManager) {
            this.editorTerrainManager.destroy();
        }
        if (this.editorMossManager) {
            this.editorMossManager.destroy();
        }
        if (this.editorElementManager) {
            this.editorElementManager.destroy();
        }
        if (this.displayObjectPool) {
            this.displayObjectPool.destroy();
        }
        if (this.editorSkyboxManager) {
            this.editorSkyboxManager.destroy();
        }
        super.destroy();
    }

    public update(time: number, delta: number) {
        if (this.layerManager) this.layerManager.update(time, delta);
        if (this.mSelectedElementEffect) {
            this.mSelectedElementEffect.update();
        }
        if (this.editorTerrainManager) {
            this.editorTerrainManager.update();
        }
        if (this.editorMossManager) {
            this.editorMossManager.update();
        }
        if (this.editorElementManager) {
            this.editorElementManager.update();
        }
    }

    transformToMini90(p: Pos): undefined | Pos {
        if (!this.mNimiSize) {
            Logger.getInstance().error("position object is undefined");
            return;
        }
        return Position45.transformTo90(p, this.mNimiSize);
    }

    transformToMini45(p: Pos): undefined | Pos {
        if (!this.mNimiSize) {
            Logger.getInstance().error("position object is undefined");
            return;
        }
        return Position45.transformTo45(p, this.mNimiSize);
    }

    removeSelected() {
        if (this.mSelectedElementEffect) {
            this.mSelectedElementEffect.remove();
            this.mPointerDelta = null;
        }
    }

    protected addPointerMoveHandler() {
        this.mScene.input.on("pointermove", this.onPointerMoveHandler, this);
    }

    protected removePointerMoveHandler() {
        this.mScene.input.off("pointermove", this.onPointerMoveHandler, this);
    }

    protected addPointerDownHandler() {
        this.mScene.input.on("pointerdown", this.onPointerDownHandler, this);
    }
    protected removePointerDownHandler() {
        this.mScene.input.off("pointerdown", this.onPointerDownHandler, this);
    }

    protected addPointerUpHandler() {
        this.mScene.input.on("pointerup", this.onPointerUpHandler, this);
    }
    protected removePointerUpHandler() {
        this.mScene.input.off("pointerup", this.onPointerUpHandler, this);
    }

    protected addGameObjectDownHandler() {
        this.mScene.input.on("gameobjectdown", this.onGameobjectDownHandler, this);
    }
    protected removeGameObjectDownHandler() {
        this.mScene.input.off("gameobjectdown", this.onGameobjectDownHandler, this);
    }

    protected addKeydownHandler() {
        this.mScene.input.keyboard.on("keydown", this.onKeyDownHandler, this);
    }

    protected removeKeydownHandler() {
        this.mScene.input.keyboard.off("keydown", this.onKeyDownHandler, this);
    }

    protected onPointerDownHandler() {
        const nodeType = this.mouseFollow.nodeType;

        if (this.mouseFollow.key) {
            if (nodeType === op_def.NodeType.TerrainNodeType) {
                if (!this.world.elementStorage.getTerrainPalette(this.mouseFollow.key)) {
                    this.reqEditorSyncPaletteOrMoss(this.mouseFollow.key, this.mouseFollow.nodeType);
                }
            } else if (nodeType === op_def.NodeType.ElementNodeType) {
                if (!this.world.elementStorage.getMossPalette(this.mouseFollow.key)) {
                    this.reqEditorSyncPaletteOrMoss(this.mouseFollow.key, this.mouseFollow.nodeType);
                }
            }
        }

        this.addPointerMoveHandler();
    }

    protected onPointerUpHandler(pointer: Phaser.Input.Pointer) {
        this.removePointerMoveHandler();
        switch (this.brush.mode) {
            case BrushEnum.BRUSH:
                this.createElements();
                break;
            case BrushEnum.SELECT:
                if (this.mSelectedElementEffect && this.mSelectedElementEffect.selecting) {
                    if (pointer.downX !== pointer.upX && pointer.downY !== pointer.upY) {
                        if (this.mSelectedElementEffect.sprite.isMoss) {
                            this.editorMossManager.updateMosses([this.mSelectedElementEffect]);
                        } else {
                            const sprite = (this.mSelectedElementEffect
                                .display as ElementDisplay).element.model.toSprite();
                            this.editorElementManager.updateElements([sprite]);
                        }
                    }
                    this.mSelectedElementEffect.selecting = false;
                    this.mPointerDelta = null;
                }
                break;
            case BrushEnum.ERASER:
                this.eraserTerrains();
                break;
            case BrushEnum.MOVE:
                this.mCameraService.syncCameraScroll();
                break;
        }
    }

    protected onPointerMoveHandler(pointer) {
        if (!this.mScene.cameras) {
            return;
        }
        switch (this.mBrush.mode) {
            case BrushEnum.BRUSH:
                if (this.mMouseFollow.nodeType === op_def.NodeType.TerrainNodeType) {
                    this.createElements();
                }
                break;
            case BrushEnum.MOVE:
                this.moveCameras(pointer);
                break;
            case BrushEnum.SELECT:
                if (this.editorSkyboxManager) {
                    this.editorSkyboxManager.move(pointer);
                }
                this.moveElement(pointer);
                break;
            case BrushEnum.ERASER:
                this.eraserTerrains();
                break;
        }
    }

    private moveCameras(pointer) {
        this.cameraService.offsetScroll(
            pointer.prevPosition.x - pointer.position.x,
            pointer.prevPosition.y - pointer.position.y
        );
    }

    private reqEditorSyncPaletteOrMoss(key: number, nodeType: op_def.NodeType) {
        const pkt = new PBpacket(op_editor.OPCODE._OP_CLIENT_REQ_EDITOR_SYNC_PALETTE_MOSS);
        const content: op_editor.OP_CLIENT_REQ_EDITOR_SYNC_PALETTE_MOSS = pkt.content;
        content.key = key;
        content.type = nodeType;
        this.connection.send(pkt);
    }

    private createElements() {
        if (!this.mMouseFollow.sprite) {
            return;
        }

        if (this.mMouseFollow.nodeType === op_def.NodeType.TerrainNodeType) {
            const terrainCoorData = this.mMouseFollow.createTerrainsOrMossesData();
            if (this.editorTerrainManager) {
                this.editorTerrainManager.addTerrains(terrainCoorData);
            }
        } else if (this.mMouseFollow.nodeType === op_def.NodeType.ElementNodeType) {
            const sprites = this.mMouseFollow.createSprites();
            if (!sprites) {
                return;
            }
            if (!this.editorElementManager) {
                return;
            }
            if (this.mMouseFollow.isMoss) {
                const mossesCoorData = this.mMouseFollow.createTerrainsOrMossesData();
                this.editorMossManager.addMosses(mossesCoorData);
            } else {
                this.editorElementManager.addElements(sprites);
            }
        } else if (this.mMouseFollow.nodeType === op_def.NodeType.SpawnPointType) {
            const sprites = this.mMouseFollow.createSprites();
            this.editorElementManager.addElements(sprites);
        }
    }

    private eraserTerrains() {
        const positions = this.mMouseFollow.getEaserPosition();
        this.editorTerrainManager.removeTerrains(positions);
    }

    private onSetEditorModeHandler(packet: PBpacket) {
        const mode: op_client.IOP_EDITOR_REQ_CLIENT_SET_EDITOR_MODE = packet.content;
        this.mBrush.mode = <BrushEnum>mode.mode;
        if (this.mMouseFollow) this.mMouseFollow.destroy();

        if (this.mBrush.mode !== BrushEnum.SELECT) {
            if (this.mSelectedElementEffect) {
                this.mSelectedElementEffect.destroy();
                this.mSelectedElementEffect = null;
                this.mPointerDelta = null;
            }
        }

        if (this.mBrush.mode === BrushEnum.SELECT) {
            this.removeGameObjectDownHandler();
            this.addGameObjectDownHandler();
        } else {
            this.removeGameObjectDownHandler();
        }

        if (this.mBrush.mode === BrushEnum.ERASER) {
            if (!this.mMouseFollow) {
                this.mMouseFollow = new MouseFollow(this.mScene, this);
            }
            this.mMouseFollow.showEraserArea();
        }
        if (this.editorSkyboxManager) {
            this.editorSkyboxManager.removeSelect();
        }

        this.layerManager.setSurfaceInteractive(this.mBrush.mode !== BrushEnum.ERASER);
    }

    private onAlignGridHandler(packet: PBpacket) {
        const content: op_client.IOP_EDITOR_REQ_CLIENT_ALIGN_GRID = packet.content;
        this.mouseFollow.alignGrid = content.align;
    }

    private onVisibleGridHandler(packet: PBpacket) {
        const content: op_client.IOP_EDITOR_REQ_CLIENT_VISIBLE_GRID = packet.content;
        this.layerManager.setGridVisible(content.visible);
    }

    private onMouseFollowHandler(packet: PBpacket) {
        const content: op_client.IOP_EDITOR_REQ_CLIENT_MOUSE_SELECTED_SPRITE = packet.content;
        if (this.mScene) {
            this.mouseFollow.setDisplay(content);
        }
    }

    private onFetchSpriteHandler(packet: PBpacket) {
        const content: op_client.IOP_EDITOR_REQ_CLIENT_FETCH_SPRITE = packet.content;
        const { ids, nodeType } = content;

        const map = {
            [op_def.NodeType.SpawnPointType]: "elements",
            [op_def.NodeType.ElementNodeType]: "elements",
            [op_def.NodeType.MossCollectionType]: "mosses",
        };

        for (const id of ids) {
            const poolName = map[nodeType];
            const pool = this.displayObjectPool.getPool(poolName);
            const displayObj = pool.get(id.toString());
            if (displayObj) {
                this.selectedElement(displayObj.getDisplay());
            }
        }
    }

    private sendFetch(ids: number[], nodetype: op_def.NodeType, isMoss?: boolean) {
        if (!this.mSelectedElementEffect || !this.mSelectedElementEffect.display) {
            return;
        }
        const pkt: PBpacket = new PBpacket(op_editor.OPCODE._OP_CLIENT_REQ_EDITOR_FETCH_SPRITE);
        const content: op_editor.IOP_CLIENT_REQ_EDITOR_FETCH_SPRITE = pkt.content;
        content.ids = ids;
        content.isMoss = isMoss;
        content.nodeType = nodetype;
        this.connection.send(pkt);
        Logger.getInstance().log("fetch sprite", content);
    }

    private onFetchSceneryHandler(packet: PBpacket) {
        if (this.mSelectedElementEffect) {
            this.mSelectedElementEffect.destroy();
            this.mSelectedElementEffect = null;
            this.mPointerDelta = null;
        }
        if (!this.editorSkyboxManager) {
            return;
        }
        const content: op_client.IOP_EDITOR_REQ_CLIENT_FETCH_SCENERY = packet.content;
        this.editorSkyboxManager.fetch(content.id);
    }

    private onGameobjectDownHandler(pointer, gameobject) {
        const com = gameobject.parentContainer.parentContainer || gameobject.parentContainer;
        if (!com) {
            return;
        }

        const selected = this.selectedElement(com);
        if (selected) {
            this.sendFetch([selected.element.id], op_def.NodeType.ElementNodeType, selected.element.model.isMoss);
        }
    }

    private selectedElement(com: ElementDisplay): DisplayObject {
        if (!(com instanceof DisplayObject)) {
            return;
        }
        if (com instanceof TerrainDisplay) {
            return;
        }
        if (!this.mSelectedElementEffect) {
            this.mSelectedElementEffect = new SelectedElement(this.mScene, this.layerManager);
        }
        this.mSelectedElementEffect.setElement(<FramesDisplay>com);
        if (this.editorSkyboxManager) {
            this.editorSkyboxManager.removeSelect();
        }
        return com;
    }

    private onKeyDownHandler(event) {
        if (this.editorSkyboxManager) {
            this.editorSkyboxManager.keyboardMove(event.keyCode);
        }
        if (!this.mSelectedElementEffect) {
            return;
        }
        switch (event.keyCode) {
            case 37:
            case 38:
            case 39:
            case 40:
            case 65:
            case 87:
            case 83:
            case 68:
                this.keyboardMoveElement(event.keyCode);
                break;
            // case 8:
            // case 46:
            //     this.removeDisplay(this.mSelectedElementEffect);
            //     break;
        }
    }

    private keyboardMoveElement(keyCode: number) {
        const display = this.mSelectedElementEffect.display;
        if (!display) {
            return;
        }
        const pos = new Pos(display.x, display.y, display.z);
        switch (keyCode) {
            case 37:
                pos.x--;
                break;
            case 38:
                pos.y--;
                break;
            case 39:
                pos.x++;
                break;
            case 40:
                pos.y++;
                break;
        }
        display.setPosition(pos.x, pos.y, pos.z);
        // TOOD 通过统一接口设置depth
        this.layerManager.depthSurfaceDirty = true;
    }

    private moveElement(pointer: Phaser.Input.Pointer) {
        if (!this.mSelectedElementEffect) {
            return;
        }
        if (!this.mSelectedElementEffect.selecting) {
            return;
        }
        if (!this.mouseFollow) {
            return;
        }
        if (!this.mSelectedElementEffect.display) {
            return;
        }

        if (!this.mPointerDelta) {
            const matrix = new Phaser.GameObjects.Components.TransformMatrix();
            const parentMatrix = new Phaser.GameObjects.Components.TransformMatrix();
            this.mSelectedElementEffect.display.getWorldTransformMatrix(matrix, parentMatrix);

            this.mPointerDelta = new Pos(
                matrix.tx - pointer.worldX,
                matrix.ty - pointer.worldY
            );
        }
        const elementWorldPos = new Pos(this.mPointerDelta.x + pointer.worldX, this.mPointerDelta.y + pointer.worldY);

        const gridPos = this.mMouseFollow.transitionGrid(
            elementWorldPos.x / this.mScaleRatio,
            elementWorldPos.y / this.mScaleRatio
        );
        if (gridPos) {
            if (gridPos.x !== this.mSelectedElementEffect.display.x || gridPos.y !== this.mSelectedElementEffect.display.y) {
                this.mSelectedElementEffect.setDisplayPos(gridPos.x, gridPos.y);
                this.mLayManager.depthSurfaceDirty = true;
            }
        }
    }

    get brush(): Brush {
        return this.mBrush;
    }

    get miniSize(): IPosition45Obj {
        return this.mNimiSize;
    }

    private get mouseFollow(): MouseFollow {
        if (!this.mMouseFollow) {
            this.mMouseFollow = new MouseFollow(this.mScene, this);
        }
        return this.mMouseFollow;
    }

    private removeDisplay(element: SelectedElement) {
        if (element.sprite.isMoss) {
            this.editorMossManager.deleteMosses([element.sprite.id]);
        } else {
            this.editorElementManager.deleteElements([element.sprite.id]);
        }
        this.removeSelected();
    }
}



const world: LogicWorld = new LogicWorld();
const socket: WorkerClient = new WorkerClient(new ConnListener());
const RENDER_PEER = "renderPeer";
const MAIN_WORKER = "mainWorker";
const HEARTBEAT_WORKER = "heartBeatWorker";
const mainPeer: MainPeer = new MainPeer();
