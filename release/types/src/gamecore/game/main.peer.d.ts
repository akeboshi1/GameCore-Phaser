import { RPCPeer } from "webworker-rpc";
import { Buffer } from "net-socket-packet";
import * as protos from "pixelpai_proto";
import { Game } from "./game";
import { IPos, ILauncherConfig, IWorkerParam } from "structure";
import { BaseState } from "./state";
export declare class MainPeer extends RPCPeer {
    protected mGame: Game;
    protected mRenderParam: IWorkerParam;
    protected mMainPeerParam: IWorkerParam;
    private gameState;
    private stateTime;
    private mConfig;
    /**
     * 主进程和render之间完全链接成功
     */
    private isReady;
    private delayTime;
    private reConnectCount;
    private startDelay;
    private isStartUpdateFps;
    private startUpdateFps;
    constructor(workerName: string);
    get renderParam(): IWorkerParam;
    get mainPeerParam(): IWorkerParam;
    get render(): any;
    get config(): ILauncherConfig;
    get game(): Game;
    set game(val: Game);
    get state(): BaseState;
    set state(val: BaseState);
    onConnected(isAuto: boolean): void;
    onDisConnected(isAuto: any): void;
    onConnectError(error: string): void;
    onData(buffer: Buffer): void;
    workerEmitter(eventType: string, data: any): void;
    updateFps(): void;
    endFps(): void;
    startBeat(): void;
    endBeat(): void;
    clearBeat(): void;
    refrehActiveUIState(panel: string): void;
    showMovePoint(val: boolean): void;
    createGame(config: ILauncherConfig): void;
    getScaleRatio(): number;
    updateMoss(moss: any): void;
    updatePalette(palette: any): void;
    removeElement(id: number): void;
    refreshToken(): void;
    changePlayerState(id: number, state: string, times?: number): void;
    setDragonBonesQueue(id: number, animation: any): void;
    loginEnterWorld(): void;
    closeConnect(boo: boolean): void;
    reconnect(isAuto: boolean): void;
    refreshConnect(): void;
    onFocus(): void;
    onBlur(): void;
    setSize(width: any, height: any): void;
    setGameConfig(configStr: string): void;
    send(buffer: Buffer): void;
    destroyClock(): void;
    clearGameComplete(): void;
    initUI(): void;
    getActiveUIData(str: string): any;
    startRoomPlay(): void;
    onVerifiedHandler(name: string, idcard: string): void;
    getRoomTransformTo90(p: any): IPos;
    getCurrentRoomSize(): any;
    getCurrentRoomMiniSize(): any;
    getPlayerName(id: number): string;
    getPlayerAvatar(): any;
    resetGameraSize(width: number, height: number): void;
    syncCameraScroll(): void;
    sendMouseEvent(id: number, mouseEvent: any[], point3f: any): void;
    exitUser(): void;
    displayCompleteMove(id: number): void;
    syncPosition(targetPoint: any): void;
    syncElementPosition(id: any, targetPoint: any): void;
    setSyncDirty(boo: boolean): void;
    elementDisplayReady(id: number): void;
    elementDisplaySyncReady(id: number): void;
    now(): number;
    setDirection(id: number, direction: number): void;
    elementsShowReferenceArea(): void;
    elementsHideReferenceArea(): void;
    pushMovePoints(id: number, points: any): void;
    onTapHandler(obj: any): void;
    getCurrentRoomType(): protos.op_def.SceneTypeEnum;
    activePlayer(id: number): void;
    getInteractivePosition(id: number): IPos[];
    stopGuide(id: string): void;
    findPath(targets: [], targetId?: number, toReverse?: boolean): void;
    startFireMove(pointer: any): void;
    syncClock(times: number): void;
    clearClock(): void;
    requestCurTime(): Promise<number>;
    httpClockEnable(enable: boolean): void;
    showNoticeHandler(text: string): void;
    showPanelHandler(name: string, data?: any): void;
    closePanelHandler(id: number): void;
    showMediator(name: string, isShow: boolean, param?: any): void;
    exportUimanager(): Promise<boolean>;
    hideMediator(name: string): void;
    renderEmitter(eventType: string, data: any): void;
    fetchProjectionSize(id: number): import("../../structure").IProjection;
    getUserData_PlayerProperty(): any;
    getRoomUserName(): string;
    getClockNow(): number;
    setPosition(id: number, updateBoo: boolean, x: number, y: number, z?: number): void;
    selfStartMove(): void;
    tryStopMove(id: number, interactiveBoo: boolean, targetId?: number, stopPos?: any): void;
    tryStopElementMove(id: number, points?: any): void;
    requestPushBox(id: number): void;
    removeMount(id: number, mountID: number, stopPos: IPos): Promise<void>;
    stopMove(x: number, y: number): void;
    uploadHeadImage(url: string): void;
    uploadDBTexture(key: string, url: string, json: string): Promise<any>;
    completeDragonBonesAnimationQueue(id: number): void;
    completeFrameAnimationQueue(id: number): void;
    setConfig(config: ILauncherConfig): void;
    moveMotion(x: number, y: number): void;
    terminate(): void;
    /**
     * 慎用，super.destroy()会使worker.terminator,致使整个游戏进程关闭
     */
    destroy(): void;
    isPlatform_PC(): boolean;
}
