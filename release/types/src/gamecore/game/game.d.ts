import { UIManager } from "./ui/ui.manager";
import { PBpacket, PacketHandler } from "net-socket-packet";
import { op_def } from "pixelpai_proto";
import { Lite } from "game-capsule";
import { HttpLoadManager } from "utils";
import { Connection, GameSocket } from "./net/connection";
import { Clock, ClockReadyListener } from "./loop/clock/clock";
import { HttpClock } from "./loop/httpClock/http.clock";
import { HttpService } from "./loop/httpClock/http.service";
import { LoadingManager } from "./loading/loading.manager";
import { ILauncherConfig, EventDispatcher, IConfigPath } from "structure";
import { IRoomService } from "./room";
import { RoomManager } from "./room/room.manager";
import { User } from "./actor/user";
import { NetworkManager } from "./command";
import { MainPeer } from "./main.peer";
import { GuideWorkerManager } from "./guide.manager";
import { SoundWorkerManager } from "./sound.manager";
import { CustomProtoManager } from "./custom.proto";
import { IConnectListener } from "src/structure/net";
import { ElementStorage } from "baseGame";
import { BaseDataControlManager, DataMgrType } from "./config";
interface ISize {
    width: number;
    height: number;
}
export declare const wokerfps: number;
export declare const interval: number;
export declare class Game extends PacketHandler implements IConnectListener, ClockReadyListener {
    isDestroy: boolean;
    protected mainPeer: any;
    protected connect: Connection;
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
    protected mCustomProtoManager: CustomProtoManager;
    protected gameConfigUrls: Map<string, string>;
    protected gameConfigUrl: string;
    protected gameConfigState: Map<string, boolean>;
    protected isPause: boolean;
    protected isAuto: boolean;
    protected mMoveStyle: number;
    protected mReconnect: number;
    protected hasClear: boolean;
    protected currentTime: number;
    protected mWorkerLoop: any;
    protected mAvatarType: op_def.AvatarStyle;
    protected mRunning: boolean;
    protected mConfigPath: IConfigPath;
    protected remoteIndex: number;
    protected isSyncPackage: boolean;
    constructor(peer: MainPeer);
    setConfigPath(path: any): void;
    addPacketListener(): void;
    removePacketListener(): void;
    get scaleRatio(): number;
    createGame(config?: ILauncherConfig): Promise<void>;
    setConfig(config: ILauncherConfig): void;
    startConnect(): void;
    showLoading(data?: any): void;
    onConnected(isAuto?: boolean): void;
    onDisConnected(isAuto?: boolean): any;
    onRefreshConnect(isAuto?: boolean): void;
    onError(): void;
    reconnect(): Promise<any>;
    exitUser(): void;
    onClientErrorHandler(packet: PBpacket): void;
    destroyClock(): void;
    /**
     * todo
     * 试验性方法，尝试后台加载场景pi
     * @returns
     */
    loadTotalSceneConfig(): void;
    loadSceneConfig(sceneID: string): Promise<any>;
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
    initgameConfigUrls(urls: string[]): void;
    getConfigUrl(sceneId: string): string;
    onClockReady(): void;
    syncClock(times?: number): void;
    set moveStyle(moveStyle: number);
    get moveStyle(): number;
    get httpService(): HttpService;
    get peer(): any;
    get connection(): Connection;
    get socket(): GameSocket;
    get uiManager(): UIManager;
    get SoundWorkerManager(): SoundWorkerManager;
    get clock(): Clock;
    get httpClock(): HttpClock;
    get elementStorage(): ElementStorage;
    get roomManager(): RoomManager;
    get guideWorkerManager(): GuideWorkerManager;
    get loadingManager(): LoadingManager;
    get dataControlManager(): BaseDataControlManager;
    get httpLoaderManager(): HttpLoadManager;
    get emitter(): EventDispatcher;
    get user(): User;
    get renderPeer(): any;
    get physicalPeer(): any;
    get avatarType(): op_def.AvatarStyle;
    get customProto(): CustomProtoManager;
    onFocus(): any;
    onBlur(): void;
    enterVirtualWorld(): Promise<void>;
    login(): void;
    refreshToken(): Promise<void>;
    loginEnterWorld(): Promise<void>;
    leaveRoom(room: IRoomService): void;
    showByName(name: string, data?: any): void;
    showMediator(name: string, isShow: boolean, param?: any): void;
    hideMediator(name: any): void;
    gameCreated(): void;
    /**
     * 加载前端json文件
     * @param name
     */
    loadJson(): void;
    preloadGameConfig(): Promise<any>;
    sendCustomProto(msgName: string, cmd: string, msg: any): void;
    protected initWorld(): Promise<void>;
    protected createManager(): void;
    protected onClearGame(): void;
    protected onInitVirtualWorldPlayerInit(packet: PBpacket): Promise<void>;
    protected onSelectCharacter(): void;
    protected onGotoAnotherGame(packet: PBpacket): void;
    protected onAvatarGameModeHandler(packet: PBpacket): void;
    protected update(current: number, delta?: number): void;
    protected loadGameConfig(remotePath: any): Promise<Lite>;
    private initGame;
    private _createAnotherGame;
    private _onGotoAnotherGame;
    private clearGame;
    private decodeConfigs;
    private _run;
}
export {};
