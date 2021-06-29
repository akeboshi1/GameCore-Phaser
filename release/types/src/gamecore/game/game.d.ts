import { UIManager } from "./ui/ui.manager";
import { PBpacket, PacketHandler } from "net-socket-packet";
import { MainPeer } from "./main.peer";
import { op_def } from "pixelpai_proto";
import { HttpLoadManager } from "utils";
import { GameSocket } from "./net/connection";
import { Clock, ClockReadyListener } from "./loop/clock/clock";
import { HttpClock } from "./loop/httpClock/http.clock";
import { HttpService } from "./loop/httpClock/http.service";
import { LoadingManager } from "./loading/loading.manager";
import { ChatCommandInterface, ConnectionService, EventDispatcher, IConfigPath, IConnectListener, ILauncherConfig } from "structure";
import { RoomManager } from "./room/room.manager";
import { User } from "./actor/user";
import { NetworkManager } from "./command";
import { ElementStorage } from "baseGame";
import { BaseDataControlManager, DataMgrType } from "./config";
import { GuideWorkerManager } from "./guide.manager";
import { SoundWorkerManager } from "./sound.manager";
import { IRoomService } from "./room";
import { GameStateManager } from "./state/game.state.manager";
interface ISize {
    width: number;
    height: number;
}
export declare const fps: number;
export declare const interval: number;
export declare class Game extends PacketHandler implements IConnectListener, ClockReadyListener, ChatCommandInterface {
    isDestroy: boolean;
    isAuto: boolean;
    protected mainPeer: MainPeer;
    protected connect: ConnectionService;
    protected mUser: User;
    protected mSize: ISize;
    protected mClock: Clock;
    protected mHttpClock: HttpClock;
    protected mHttpService: HttpService;
    protected mConfig: ILauncherConfig;
    protected mDataControlManager: BaseDataControlManager;
    protected mGuideWorkerManager: GuideWorkerManager;
    protected mRoomManager: RoomManager;
    protected mElementStorage: ElementStorage;
    protected mUIManager: UIManager;
    protected mSoundManager: SoundWorkerManager;
    protected mLoadingManager: LoadingManager;
    protected mNetWorkManager: NetworkManager;
    protected mHttpLoadManager: HttpLoadManager;
    protected mGameStateManager: GameStateManager;
    protected mGameConfigUrls: Map<string, string>;
    protected mGameConfigUrl: string;
    protected mGameConfigState: Map<string, boolean>;
    protected isPause: boolean;
    /**
     * 自动重连开关
     */
    protected mDebugReconnect: boolean;
    protected mMoveStyle: number;
    protected mReconnect: number;
    protected hasClear: boolean;
    protected currentTime: number;
    protected mHeartBeat: any;
    protected mHeartBeatDelay: number;
    protected mAvatarType: op_def.AvatarStyle;
    protected mRunning: boolean;
    protected remoteIndex: number;
    protected isSyncPackage: boolean;
    protected mConfigPath: IConfigPath;
    constructor(peer: MainPeer);
    setConfigPath(path: any): void;
    /**
     * 初始化
     * @param config
     */
    init(config: ILauncherConfig): void;
    /**
     * 登陆
     */
    login(): void;
    /**
     * 开始链接
     */
    startConnect(): void;
    /**
     * 链接成功
     * @param isAuto
     */
    onConnected(isAuto?: boolean): void;
    /**
     * 登陆游戏返回
     */
    loginEnterWorld(): Promise<void>;
    v(): void;
    q(): void;
    addPacketListener(): void;
    removePacketListener(): void;
    createGame(config?: ILauncherConfig): Promise<void>;
    setConfig(config: ILauncherConfig): void;
    showLoading(data?: any): void;
    onDisConnected(isAuto?: boolean): any;
    onRefreshConnect(isAuto?: boolean): void;
    onError(): void;
    reconnect(): Promise<void>;
    manualReconnect(): Promise<any>;
    exitUser(): void;
    onClientErrorHandler(packet: PBpacket): void;
    destroyClock(): void;
    /**
     * todo
     * 试验性方法，尝试后台加载场景pi
     * @returns
     */
    loadTotalSceneConfig(): void;
    clearGameComplete(): void;
    setSize(width: any, height: any): void;
    getSize(): ISize;
    setGameConfig(config: any): void;
    getGameConfig(): ILauncherConfig;
    getDataMgr<T>(type: DataMgrType): T;
    clearClock(): void;
    roomResume(roomID: number): void;
    roomPause(roomID: number): void;
    setCamerasBounds(x: number, y: number, width: number, height: number): void;
    getConfigUrl(sceneId: string): string;
    onClockReady(): void;
    syncClock(times?: number): void;
    set moveStyle(moveStyle: number);
    get moveStyle(): number;
    get scaleRatio(): number;
    get debugReconnect(): boolean;
    set debugReconnect(val: boolean);
    get httpService(): HttpService;
    get peer(): MainPeer;
    get connection(): ConnectionService;
    get socket(): GameSocket;
    get uiManager(): UIManager;
    get soundManager(): SoundWorkerManager;
    get clock(): Clock;
    set clock(val: Clock);
    get httpClock(): HttpClock;
    set httpClock(val: HttpClock);
    get elementStorage(): ElementStorage;
    get roomManager(): RoomManager;
    get guideWorkerManager(): GuideWorkerManager;
    get loadingManager(): LoadingManager;
    get dataControlManager(): BaseDataControlManager;
    get gameConfigUrl(): string;
    set gameConfigUrl(val: string);
    get gameConfigUrls(): Map<string, string>;
    get gameConfigState(): Map<string, boolean>;
    get httpLoaderManager(): HttpLoadManager;
    get emitter(): EventDispatcher;
    get user(): User;
    get renderPeer(): any;
    get gameStateManager(): GameStateManager;
    get avatarType(): op_def.AvatarStyle;
    onFocus(): any;
    onBlur(): void;
    refreshToken(): Promise<void>;
    leaveRoom(room: IRoomService): void;
    showByName(name: string, data?: any): void;
    showMediator(name: string, isShow: boolean, param?: any): void;
    hideMediator(name: any): void;
    /**
     * 加载前端json文件
     * @param name
     */
    loadJson(): void;
    preloadGameConfig(): Promise<any>;
    protected initWorld(): Promise<void>;
    protected createUser(): void;
    protected createManager(): void;
    protected onClearGame(): void;
    protected onSelectCharacter(): void;
    protected onGotoAnotherGame(packet: PBpacket): void;
    protected onAvatarGameModeHandler(packet: PBpacket): void;
    protected update(current?: number, delta?: number): void;
    protected clearGame(bool?: boolean): Promise<void>;
    private _createAnotherGame;
    private _onGotoAnotherGame;
    private decodeConfigs;
    private onClientPingHandler;
    private _run;
}
export {};
