/// <reference types="tooqinggamephaser" />
import "dragonBones";
import { RPCPeer } from "webworker-rpc";
import { PBpacket } from "net-socket-packet";
import { op_client } from "pixelpai_proto";
import { Account } from "./account";
import { SceneManager } from "./scenes/scene.manager";
import { LocalStorageManager } from "./managers/local.storage.manager";
import { CamerasManager } from "./cameras/cameras.manager";
import { ElementStateType, GameMain, IDragonbonesModel, IFramesModel, ILauncherConfig, IScenery, IPos, IPosition45Obj, LogicPos, Size } from "structure";
import { DisplayManager } from "./managers/display.manager";
import { InputManager } from "./input/input.manager";
import { EditorCanvasManager } from "./managers/editor.canvas.manager";
import { IRender } from "baseRender";
import { AstarDebugger } from "./display/debugs/astar";
import { EditorModeDebugger } from "./display/debugs/editor.mode.debugger";
import { GridsDebugger } from "./display/debugs/grids";
import { SortDebugger } from "./display/debugs/sort.debugger";
import { UiManager } from "./ui";
import { GuideManager } from "./guide";
import { SoundManager } from "./managers";
export interface GlobalGameConfig {
    Orientation: number;
    PlatForm: number;
}
export declare class Render extends RPCPeer implements GameMain, IRender {
    static SCENE_CREATED: string;
    static SCENE_DESTROY: string;
    isConnect: boolean;
    sceneCreated: boolean;
    emitter: Phaser.Events.EventEmitter;
    gridsDebugger: GridsDebugger;
    astarDebugger: AstarDebugger;
    sortDebugger: SortDebugger;
    editorModeDebugger: EditorModeDebugger;
    protected readonly DEFAULT_WIDTH = 360;
    protected readonly DEFAULT_HEIGHT = 640;
    protected mGuideManager: GuideManager;
    protected mSceneManager: SceneManager;
    protected mCameraManager: CamerasManager;
    protected mInputManager: InputManager;
    protected mSoundManager: SoundManager;
    protected mConfig: ILauncherConfig;
    protected mUiManager: UiManager;
    protected mDisplayManager: DisplayManager;
    protected mLocalStorageManager: LocalStorageManager;
    protected mEditorCanvasManager: EditorCanvasManager;
    private mCallBack;
    private _moveStyle;
    private _curTime;
    private mGame;
    private gameConfig;
    private mAccount;
    /**
     * 场景缩放系数（layermanager，缩放场景中容器大小）
     */
    private mScaleRatio;
    /**
     * 判断加载几x资源
     */
    private mUIRatio;
    /**
     * 面板缩放系数
     */
    private mUIScale;
    private mMainPeer;
    private mPhysicalPeer;
    private isPause;
    private mConnectFailFunc;
    private mGameCreatedFunc;
    private mGameLoadedFunc;
    private mWorkerDestroyMap;
    private mCacheTarget;
    private readonly hiddenDelay;
    private mHiddenTime;
    constructor(config: ILauncherConfig, callBack?: Function);
    get physicalPeer(): any;
    setKeyBoardHeight(height: number): void;
    get config(): ILauncherConfig;
    get uiRatio(): number;
    get devicePixelRatio(): number;
    get uiScale(): number;
    get scaleRatio(): number;
    get account(): Account;
    get uiManager(): UiManager;
    get sceneManager(): SceneManager;
    get guideManager(): GuideManager;
    get camerasManager(): CamerasManager;
    get displayManager(): DisplayManager;
    get soundManager(): SoundManager;
    get localStorageManager(): LocalStorageManager;
    get editorCanvasManager(): EditorCanvasManager;
    get game(): Phaser.Game;
    getSize(): Size | undefined;
    createGame(): void;
    createManager(): void;
    destroyManager(): void;
    clearManager(): void;
    enterGame(): void;
    resize(width: number, height: number): void;
    onOrientationChange(oriation: number, newWidth: number, newHeight: number): void;
    scaleChange(scale: number): void;
    enableClick(): void;
    disableClick(): void;
    keyboardDidShow(keyboardHeight: number): void;
    keyboardDidHide(): void;
    visibilitychange(state: string): void;
    hidden(): void;
    startFullscreen(): void;
    stopFullscreen(): void;
    setGameConfig(config: any): void;
    updatePalette(palette: any): void;
    updateMoss(moss: any): void;
    restart(config?: ILauncherConfig, callBack?: Function): void;
    initUI(): void;
    startRoomPlay(): void;
    updateRoom(time: number, delta: number): void;
    destroyWorker(workers: string[]): Promise<any>;
    destroy(destroyPeer?: boolean): Promise<void>;
    get curTime(): number;
    get moveStyle(): number;
    initGameConfig(config: any): void;
    newGame(): Promise<any>;
    closeConnect(boo: boolean): void;
    send(packet: PBpacket): void;
    terminate(): void;
    changeScene(scene: Phaser.Scene): void;
    onFocus(): void;
    onBlur(): void;
    syncClock(times: number): void;
    clearClock(): void;
    destroyClock(): void;
    exitUser(): void;
    requestCurTime(): void;
    setDirection(id: number, direction: number): void;
    onLoginErrorHanlerCallBack(name: string, idcard: string): void;
    onShowErrorHandlerCallBack(error: any, okText: any): void;
    getCurrentRoomSize(): any;
    getCurrentRoomMiniSize(): any;
    syncCameraScroll(): void;
    renderEmitter(eventType: string, data?: any): void;
    renderToPhysicalEmitter(eventType: string, data?: any): void;
    showMediator(name: string, isShow: boolean): void;
    getMainScene(): Phaser.Scene;
    updateGateway(): void;
    destroyAccount(): Promise<void>;
    reconnect(): void;
    showLogin(): void;
    hideLogin(): void;
    checkContains(id: number, x: number, y: number): Promise<boolean>;
    showCreateRolePanel(data?: any): Promise<boolean>;
    updateModel(id: number, displayInfo: any): void;
    changeLayer(id: number, layerName: string): void;
    showCreateRole(params?: any): void;
    hideCreateRole(): void;
    showPlay(params?: any): void;
    updateFPS(): void;
    endFPS(): void;
    hidePlay(): void;
    showPanel(panelName: string, params?: any): Promise<boolean>;
    hidePanel(type: string): void;
    showBatchPanel(type: string, data?: any): void;
    hideBatchPanel(type: any): void;
    reload(): void;
    showJoystick(): void;
    setInputVisible(allow: boolean): void;
    onShowErrorHandler(error: any, okText: any): void;
    onLoginErrorHanler(name: string, idcard: string): void;
    updateCharacterPackage(): void;
    displayReady(id: number, animation: any): void;
    soundChangeRoom(roomID: number): void;
    playOsdSound(content: any): void;
    playSound(content: any): void;
    stopAllSound(): void;
    pauseAll(): void;
    startFireMove(id: number, pos: any): void;
    resume(): void;
    onConnected(): void;
    onDisConnected(): void;
    onConnectError(error: string): void;
    connectFail(): void;
    updateUIState(panelName: string, ui: any): void;
    setMoveStyle(moveStyle: number): void;
    onEnterRoom(scene: any): void;
    scaleTween(id: number, type: number): void;
    getRenderPosition(id: number, type: number): any;
    createAccount(gameID: string, worldID: string, sceneID?: number, loc?: IPos, spawnPointId?: number): Promise<any>;
    refreshAccount(account: any): void;
    getAccount(): any;
    setAccount(val: any): void;
    clearAccount(): void;
    getWorldView(): Promise<any>;
    onClockReady(): void;
    i18nString(val: string): string;
    showAlert(text: string, ok: boolean): Promise<unknown>;
    showAlertReconnect(text: string): void;
    showLoading(data?: any): void;
    updateProgress(progress: number): void;
    hideLoading(): void;
    loadStart(str: string, scene: any): void;
    roomPause(roomID: number): void;
    roomResume(roomID: number): void;
    removeScene(sceneName: string): void;
    showCreatePanelError(content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_CREATE_ROLE_ERROR_MESSAGE): void;
    createSetNickName(name: string): void;
    createAnotherGame(gameId: string, virtualWorldId: string, sceneId?: number, px?: number, py?: number, pz?: number, spawnPointId?: any, worldId?: string): void;
    setCamerasBounds(x: number, y: number, width: number, height: number): void;
    getCameraMidPos(): LogicPos;
    setCamerasScroll(x: number, y: number, effect?: string): void;
    setInteractive(id: number, type: number): void;
    disableInteractive(id: number, type: number): void;
    fadeIn(id: number, type: number): void;
    fadeOut(id: number, type: number): void;
    fadeAlpha(id: number, type: number, alpha: number): void;
    getCurTime(curTime: number): number;
    gameLoadedCallBack(): void;
    createGameCallBack(keyEvents: any): void;
    addFillEffect(posX: number, posY: number, status: any): void;
    clearRoom(): void;
    clearGame(boo: boolean): Promise<void>;
    getMessage(val: string): string;
    setLocalStorage(key: string, value: string): void;
    getLocalStorage(key: string): string;
    removeLocalStorage(key: string): void;
    createPanel(name: string, key: string): Promise<any>;
    roomstartPlay(): void;
    drawGrids(posObj: IPosition45Obj | undefined): void;
    drawAstar_init(map: number[][], posObj: IPosition45Obj): void;
    drawAstar_update(x: number, y: number, val: boolean): void;
    drawAstar_findPath(start: IPos, tar: IPos, points: IPos[]): void;
    roomReady(): void;
    playAnimation(id: number, animation: any, field?: any, times?: number): void;
    setCameraScroller(actorX: number, actorY: number): void;
    createDragonBones(id: number, displayInfo: IFramesModel | IDragonbonesModel, layer: number): void;
    createUserDragonBones(displayInfo: IFramesModel | IDragonbonesModel, layer: number): void;
    createFramesDisplay(id: number, displayInfo: IFramesModel, layer: number): void;
    createTerrainDisplay(id: number, displayInfo: IFramesModel, layer: number): void;
    setModel(sprite: any): void;
    setPlayerModel(sprite: any): void;
    addSkybox(scenery: IScenery): void;
    removeSkybox(id: number): void;
    showMatterDebug(vertices: any): void;
    hideMatterDebug(): void;
    drawServerPosition(x: number, y: number): void;
    hideServerPosition(): void;
    changeAlpha(id: number, alpha: number): void;
    removeBlockObject(id: number): void;
    setPosition(id: number, x: number, y: number, z?: number): void;
    showBubble(id: number, text: string, setting: op_client.IChat_Setting): void;
    clearBubble(id: number): void;
    startFollow(id: number): void;
    stopFollow(): void;
    cameraFollow(id: number, effect: string): Promise<void>;
    cameraPan(id: number): void;
    updateSkyboxState(state: any): void;
    setLayerDepth(val: boolean): void;
    doMove(id: number, moveData: any): void;
    showNickname(id: number, name: string): void;
    showTopDisplay(id: number, state?: ElementStateType): void;
    SetDisplayVisible(id: number, visible: boolean): void;
    showRefernceArea(id: number, area: number[][], origin: IPos): void;
    hideRefernceArea(id: number): void;
    displayAnimationChange(data: any): void;
    workerEmitter(eventType: string, data?: any): void;
    physicalEmitter(eventType: string, data?: any): void;
    mount(id: number, targetID: number, targetIndex: number): void;
    unmount(id: number, targetID: number): void;
    updateInput(val: number): void;
    addEffect(target: number, effectID: number, display: IFramesModel): void;
    removeEffect(target: number, effectID: number): void;
    switchBaseMouseManager(): void;
    liftItem(id: number, display: any, animation: any): void;
    clearMount(id: number): void;
    throwElement(userid: number, target: number, display: any, animation: any): void;
    switchDecorateMouseManager(): void;
    protected onWorkerUnlinked(worker: string): void;
    private onFullScreenChange;
    private gameCreated;
    private initConfig;
    private initRatio;
    private resumeScene;
    private pauseScene;
    private dealTipsScene;
    get mainPeer(): any;
}
