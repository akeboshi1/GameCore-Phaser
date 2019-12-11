import { IRoomService } from "./room";
import { IRoomManager } from "./room.manager";
import {Actor} from "./player/Actor";
import {ViewblockService} from "./cameras/viewblock.manager";
import {CamerasManager, ICameraService} from "./cameras/cameras.manager";
import {ConnectionService} from "../net/connection.service";
import {ElementManager} from "./element/element.manager";
import {LayerManager} from "./layer/layer.manager";
import {IPosition45Obj} from "../utils/position45";
import {TerrainManager} from "./terrain/terrain.manager";
import { WorldService } from "../game/world.service";
import {IElement} from "./element/element";
import {ElementDisplay} from "./display/element.display";
import { op_client } from "pixelpai_proto";
import {Pos} from "../utils/pos";
import {PlayerManager} from "./player/player.manager";
import { Map } from "./map/map";
import {PacketHandler} from "net-socket-packet";

export class DecorateRoom extends PacketHandler implements IRoomService {
    readonly actor: Actor;
    readonly blocks: ViewblockService;
    clockSyncComplete: boolean;
    readonly playerManager: PlayerManager;
    readonly world: WorldService;
    private mID: number;
    private mSize: IPosition45Obj;
    private mTerrainManager: TerrainManager;
    private mElementManager: ElementManager;
    private mLayerManager: LayerManager;
    private mCameraService: ICameraService;
    private mScene: Phaser.Scene | undefined;

    constructor(manager: IRoomManager) {
        super();
        this.world = manager.world;
        this.mCameraService = new CamerasManager(this);
        if (this.connection) {
            this.connection.addPacketListener(this);
        }
    }

    enter(room: op_client.IScene): void {
        // this.mID = room.id;
        this.mID = room.id;
        this.mSize = {
            cols: room.cols,
            rows: room.rows,
            tileHeight: room.tileHeight,
            tileWidth: room.tileWidth,
            sceneWidth: (room.rows + room.cols) * (room.tileWidth / 2),
            sceneHeight: (room.rows + room.cols) * (room.tileHeight / 2)
        };
    }

    addBlockObject(object: IElement) {
    }

    addMouseListen() {
    }

    addToGround(element: ElementDisplay | ElementDisplay[]) {
    }

    addToSceneUI(element: Phaser.GameObjects.GameObject | Phaser.GameObjects.GameObject[]) {
    }

    addToSurface(element: ElementDisplay | ElementDisplay[]) {
    }

    addToUI(element: Phaser.GameObjects.Container | Phaser.GameObjects.Container[]) {
    }

    completeLoad() {
    }

    destroy() {
    }

    now(): number {
        return 0;
    }

    pause(): void {
    }

    removeBlockObject(object: IElement) {
    }

    requestActorMove(d: number, key: number[]) {
    }

    resume(name: string | string[]): void {
    }

    startLoad() {
    }

    startPlay() {
    }

    transformTo45(p: Pos): Pos {
        return undefined;
    }

    transformTo90(p: Pos): Pos {
        return undefined;
    }

    update(time: number, delta: number): void {
    }

    updateClock(time: number, delta: number): void {
    }

    get id(): number {
        return this.mID;
    }

    get roomSize(): IPosition45Obj {
        return this.mSize;
    }

    get terrainManager(): TerrainManager {
        return this.mTerrainManager;
    }

    get elementManager(): ElementManager {
        return this.mElementManager;
    }

    get layerManager(): LayerManager {
        return this.mLayerManager;
    }

    get cameraService(): ICameraService {
        return this.mCameraService;
    }

    get scene(): Phaser.Scene | undefined {
        return this.mScene;
    }

    get map(): Map {
        return null;
    }

    get connection(): ConnectionService {
        return this.world.connection;
    }
}
