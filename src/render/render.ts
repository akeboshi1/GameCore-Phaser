import { RPCPeer, Export, webworker_rpc } from "webworker-rpc";
import { op_def } from "pixelpai_proto";
import { DisplayObject } from "./rooms/display/display.object";
import { Logger } from "../utils/log";
import { ServerAddress } from "../../lib/net/address";
import { Buffer, PBpacket } from "net-socket-packet";
export class Render extends RPCPeer {
    public isConnect: boolean = false;

    private nodes = {
        [op_def.NodeType.GameNodeType]: new Map<number, DisplayObject>(),
        [op_def.NodeType.SceneNodeType]: new Map<number, DisplayObject>(),
        [op_def.NodeType.ElementNodeType]: new Map<number, DisplayObject>(),
        [op_def.NodeType.TerrainNodeType]: new Map<number, DisplayObject>(),
        [op_def.NodeType.CharacterNodeType]: new Map<number, DisplayObject>(),
        [op_def.NodeType.LocationType]: new Map<number, DisplayObject>(),
        [op_def.NodeType.MovableType]: new Map<number, DisplayObject>(),
        [op_def.NodeType.DisplayType]: new Map<number, DisplayObject>(),
        [op_def.NodeType.AttributeType]: new Map<number, DisplayObject>(),
        [op_def.NodeType.FunctionType]: new Map<number, DisplayObject>(),
        [op_def.NodeType.AnimationsType]: new Map<number, DisplayObject>(),
        [op_def.NodeType.EventType]: new Map<number, DisplayObject>(),
        [op_def.NodeType.MapSizeType]: new Map<number, DisplayObject>(),
        [op_def.NodeType.UIType]: new Map<number, DisplayObject>(),
        [op_def.NodeType.TimerType]: new Map<number, DisplayObject>(),
        [op_def.NodeType.PackageType]: new Map<number, DisplayObject>(),
        [op_def.NodeType.PackageItemType]: new Map<number, DisplayObject>(),
        [op_def.NodeType.AvatarType]: new Map<number, DisplayObject>(),
        [op_def.NodeType.SettingsType]: new Map<number, DisplayObject>(),
        [op_def.NodeType.CampType]: new Map<number, DisplayObject>(),
        [op_def.NodeType.MutexType]: new Map<number, DisplayObject>(),
        [op_def.NodeType.AnimationDataType]: new Map<number, DisplayObject>(),
        [op_def.NodeType.ForkType]: new Map<number, DisplayObject>(),
        [op_def.NodeType.ButtonType]: new Map<number, DisplayObject>(),
        [op_def.NodeType.TextType]: new Map<number, DisplayObject>(),
        [op_def.NodeType.AccessType]: new Map<number, DisplayObject>(),
        [op_def.NodeType.SpawnPointType]: new Map<number, DisplayObject>(),
        [op_def.NodeType.CommodityType]: new Map<number, DisplayObject>(),
        [op_def.NodeType.ShopType]: new Map<number, DisplayObject>(),
        [op_def.NodeType.PaletteType]: new Map<number, DisplayObject>(),
        [op_def.NodeType.TerrainCollectionType]: new Map<number, DisplayObject>(),
        [op_def.NodeType.AssetsType]: new Map<number, DisplayObject>(),
        [op_def.NodeType.MossType]: new Map<number, DisplayObject>(),
        [op_def.NodeType.MossCollectionType]: new Map<number, DisplayObject>(),
        [op_def.NodeType.SceneryType]: new Map<number, DisplayObject>(),
        [op_def.NodeType.ModsType]: new Map<number, DisplayObject>(),
        [op_def.NodeType.InputTextType]: new Map<number, DisplayObject>()
    };

    private _moveStyle: number = 0;
    private _curTime: number;
    private mainPeer: any;
    constructor() {
        super("render");
        this.linkTo(MAIN_WORKER, "../game/main.worker").onceReady(() => {
            this.mainPeer = this.remote[MAIN_WORKER].MainPeer;
        });
    }

    @Export()
    public add(type: number, id: number, data: Uint8Array) {
        if (!Object.prototype.hasOwnProperty.call(this.nodes, type)) {
            Logger.getInstance().error("type error: ", type, this.nodes);
            return;
        }
        const nodesMap: Map<number, DisplayObject> = this.nodes[type];
        if (nodesMap.has(id)) {
            Logger.getInstance().warn("repeated id: ", id);
        }
        // TODO: data转换为iSprite；创建displayObject 存入nodes
    }

    @Export()
    public remove(type: number, id: number) {
        if (!Object.prototype.hasOwnProperty.call(this.nodes, type)) {
            Logger.getInstance().error("type error: ", type, this.nodes);
            return;
        }
        const nodesMap: Map<number, DisplayObject> = this.nodes[type];
        nodesMap.delete(id);
    }

    @Export()
    public setData(type: number, id: number, data: Uint8Array) {
        if (!Object.prototype.hasOwnProperty.call(this.nodes, type)) {
            Logger.getInstance().error("type error: ", type, this.nodes);
            return;
        }
        const nodesMap: Map<number, DisplayObject> = this.nodes[type];
        if (!nodesMap.has(id)) {
            Logger.getInstance().error("id error: ", id, nodesMap);
            return;
        }
        const node = nodesMap.get(id);
        // TODO: data转换为iSprite；修改displayObject
    }

    get curTime(): number {
        return this._curTime;
    }

    get moveStyle(): number {
        return this._moveStyle;
    }

    public initGameConfig(config: any) {
        this.mainPeer.initGameConfig(JSON.stringify(config));
    }
    public createAccount(gameID: string, worldID: string, sceneID?: number, loc?: any) {
        this.mainPeer.startConnect(gameID, worldID, sceneID, loc);
    }
    public startConnect(gateway: ServerAddress) {
        this.mainPeer.startConnect(gateway.host, gateway.port, gateway.secure);
    }

    public closeConnect() {
        this.mainPeer.closeConnect();
    }

    public initWorld(desk: boolean) {
        this.mainPeer.initWorld(desk);
    }

    public initGame() {
        this.mainPeer.initGame();
    }

    public send(packet: PBpacket) {
        this.mainPeer.send(packet.Serialization);
    }

    public terminate() {
        this.mainPeer.terminate();
    }

    public onFocus() {
        this.mainPeer.focus();
    }

    public onBlur() {
        this.mainPeer.blur();
    }

    public syncClock(times: number) {
        this.mainPeer.syncClock(times);
    }

    public clearClock() {
        this.mainPeer.clearClock();
    }

    public destroyClock() {
        this.mainPeer.destroyClock();
    }

    public clearGameComplete() {
        this.mainPeer.clearGameComplete();
    }

    public requestCurTime() {
        this.mainPeer.requestCurTime();
    }

    @Export()
    public onConnected() {
        this.isConnect = true;
    }

    @Export()
    public onDisConnected() {
        this.isConnect = false;
    }

    @Export([webworker_rpc.ParamType.str])
    public onConnectError(error: string) {
        this.isConnect = false;
    }

    @Export([webworker_rpc.ParamType.num])
    public loadSceneConfig(sceneID: number) {
        // todo world loadSceneConfig
    }

    @Export()
    public connectFail() {
        // this.mWorld.connectFail();
    }

    @Export()
    public reconnect() {
        // this.mWorld.reconnect();
    }

    @Export([webworker_rpc.ParamType.str, webworker_rpc.ParamType.str, webworker_rpc.ParamType.num, webworker_rpc.ParamType.num, webworker_rpc.ParamType.num])
    public onGotoAnotherGame(gameId: string, worldId: string, sceneId?: number, x?: number, y?: number, z?: number) {
        // this.mWorld.onGotoAnotherGame(gameId, worldId, sceneId, { x, y, z });
    }

    @Export([webworker_rpc.ParamType.num])
    public setMoveStyle(moveStyle: number) {
        this._moveStyle = moveStyle;
    }

    @Export([webworker_rpc.ParamType.num, webworker_rpc.ParamType.num])
    public getRenderPosition(id: number, type: number): any {
        // todo
        return [];
    }

    @Export()
    public enterVirtualWorld() {
        // this.mWorld.enterVirtualWorld();
    }

    @Export()
    public onClockReady() {
        // this.mWorld.onClockReady();
    }

    @Export([webworker_rpc.ParamType.str, webworker_rpc.ParamType.str])
    public showAlert(text: string, title: string) {
        // 告诉render显示警告框
    }

    @Export()
    public showLoading() {

    }

    @Export([webworker_rpc.ParamType.num])
    public roomPause(roomID: number) {

    }

    @Export([webworker_rpc.ParamType.num])
    public roomResume(roomID: number) {

    }
    @Export()
    public renderReconnect() {

    }

    @Export([webworker_rpc.ParamType.str, webworker_rpc.ParamType.str, webworker_rpc.ParamType.num, webworker_rpc.ParamType.num, webworker_rpc.ParamType.num, webworker_rpc.ParamType.num])
    public createAnotherGame(gameId: string, worldId: string, sceneId?: number, px?: number, py?: number, pz?: number) {

    }

    @Export([webworker_rpc.ParamType.num, webworker_rpc.ParamType.num, webworker_rpc.ParamType.num, webworker_rpc.ParamType.num])
    public setCameraBounds(x: number, y: number, width: number, height: number) {

    }

    @Export([webworker_rpc.ParamType.num, webworker_rpc.ParamType.num])
    public setInteractive(id: number, type: number) {

    }

    @Export([webworker_rpc.ParamType.num, webworker_rpc.ParamType.num])
    public disableInteractive(id: number, type: number) {

    }

    @Export([webworker_rpc.ParamType.num, webworker_rpc.ParamType.num])
    public removeDisplay(id: number, type: number) {

    }

    @Export([webworker_rpc.ParamType.num, webworker_rpc.ParamType.num])
    public fadeIn(id: number, type: number) {

    }

    @Export([webworker_rpc.ParamType.num, webworker_rpc.ParamType.num])
    public fadeOut(id: number, type: number) {

    }
    @Export([webworker_rpc.ParamType.num, webworker_rpc.ParamType.num, webworker_rpc.ParamType.num])
    public fadeAlpha(id: number, type: number, alpha: number) {

    }

    @Export([webworker_rpc.ParamType.num])
    public getCurTime(curTime: number) {
        this._curTime = curTime;
    }

    @Export([webworker_rpc.ParamType.num, webworker_rpc.ParamType.num])
    public displayDestroy(id: number, type: number) {

    }

    @Export([webworker_rpc.ParamType.unit8array])
    public createGame(buffer: Buffer) {

    }

    @Export([webworker_rpc.ParamType.num, webworker_rpc.ParamType.num, webworker_rpc.ParamType.num])
    public addFillEffect(posX: number, posY: number, status: number) {

    }

    @Export()
    public clearGame() {
        // this.mWorld.clearGame();
    }
}
const MAIN_WORKER = "mainWorker";
