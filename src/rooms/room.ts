import { IRoomManager } from "./room.manager";
import { ElementManager } from "./element/element.manager";
import { PlayerManager } from "./player/player.manager";
import { LayerManager } from "./layer/layer.manager";
import { TerrainManager } from "./terrain/terrain.manager";
import { ConnectionService } from "../net/connection.service";
import { op_client, op_def, op_virtual_world } from "pixelpai_proto";
import { IPosition45Obj, Position45 } from "../utils/position45";
import { CamerasManager, ICameraService } from "./cameras/cameras.manager";
import { PBpacket } from "net-socket-packet";
import { WorldService } from "../game/world.service";
import { PlayScene } from "../scenes/play";
import { ElementDisplay } from "./display/element.display";
import { Logger } from "../utils/log";
import { ViewblockManager, ViewblockService } from "./cameras/viewblock.manager";
import { Pos } from "../utils/pos";
import { LoadingScene } from "../scenes/loading";
import { Clock, ClockReadyListener } from "./clock";
import IActor = op_client.IActor;
import { MapEntity } from "./map/map.entity";
import { ActorEntity } from "./player/Actor.entity";
import { PlayerModel } from "./player/player.model";
import { Size } from "../utils/size";

export interface SpriteAddCompletedListener {
    onFullPacketReceived(sprite_t: op_def.NodeType): void;
}

export interface IRoomService {
    readonly id: number;
    readonly terrainManager: TerrainManager;
    readonly elementManager: ElementManager;
    readonly playerManager: PlayerManager;
    readonly layerManager: LayerManager;
    readonly cameraService: ICameraService;
    readonly roomSize: IPosition45Obj;
    readonly blocks: ViewblockService;
    readonly actor: ActorEntity;
    readonly world: WorldService;

    readonly scene: Phaser.Scene | undefined;

    readonly connection: ConnectionService | undefined;

    clockSyncComplete: boolean;

    now(): number;

    updateClock(time: number, delta: number): void;

    enter(room: op_client.IScene): void;

    pause(): void;

    resume(name: string | string[]): void;

    transformTo45(p: Pos): Pos;

    transformTo90(p: Pos): Pos;

    addToGround(element: ElementDisplay | ElementDisplay[]);

    addToSurface(element: ElementDisplay | ElementDisplay[]);

    addToSceneUI(element: Phaser.GameObjects.GameObject | Phaser.GameObjects.GameObject[]);

    addToUI(element: Phaser.GameObjects.Container | Phaser.GameObjects.Container[]);

    addMouseListen();

    requestActorMove(d: number, key: number[]);

    update(time: number, delta: number): void;
}

// 这一层管理数据和Phaser之间的逻辑衔接
// 消息处理让上层[RoomManager]处理
export class Room implements IRoomService, SpriteAddCompletedListener, ClockReadyListener {
    public clockSyncComplete: boolean = false;
    private mWorld: WorldService;
    private mActor: ActorEntity;
    private mActorData: IActor;

    private mMapEntity: MapEntity;

    private mID: number;
    private mTerainManager: TerrainManager;
    private mElementManager: ElementManager;
    private mPlayerManager: PlayerManager;
    private mLayManager: LayerManager;
    private mScene: Phaser.Scene | undefined;
    private mSize: IPosition45Obj;
    private mCameraService: ICameraService;
    private mBlocks: ViewblockService;
    private mClock: Clock;

    constructor(private manager: IRoomManager) {
        this.mWorld = this.manager.world;
        this.mCameraService = new CamerasManager(this);
        if (this.mWorld) {
            const size = this.mWorld.getSize();
            if (size) {
                this.mCameraService.resize(size.width, size.height);
            } else {
                throw new Error(`World::getSize undefined!`);
            }
        }
    }

    public enter(data: op_client.IScene): void {
        const size: Size = this.mWorld.getSize();
        if (!data) {
            Logger.getInstance().error("wrong room");
            return;
        }
        this.mID = data.id;
        // let sWidth: number = 0;
        // let sHeight: number = 0;
        // let dataSceneWidth: number = 0;
        // let dataSceneHeight: number = 0;
        // if (!this.mWorld.game.device.os.desktop) {
        //     sWidth = size.width;
        //     sHeight = size.height;
        //     dataSceneWidth = sWidth < (data.rows + data.cols) * (data.tileWidth / 2) ? Math.ceil(sWidth * 2 / data.tileWidth) * (data.tileWidth / 2) : (data.rows + data.cols) * (data.tileWidth / 2);
        //     dataSceneHeight = sHeight < (data.rows + data.cols) * (data.tileHeight / 2) ? Math.ceil(sHeight * 2 / data.tileHeight) * (data.tileHeight / 2) : (data.rows + data.cols) * (data.tileHeight / 2);
        // }
        this.mSize = {
            cols: data.rows,
            rows: data.cols,
            tileHeight: data.tileHeight,
            tileWidth: data.tileWidth,
            sceneWidth: (data.rows + data.cols) * (data.tileWidth / 2),
            sceneHeight: (data.rows + data.cols) * (data.tileHeight / 2),
        };

        this.mScene = this.mWorld.game.scene.getScene(PlayScene.name);
        this.mMapEntity = new MapEntity(this.mWorld);
        this.mMapEntity.setMapInfo(data);
        this.mClock = new Clock(this.mWorld.connection, this);
        this.mTerainManager = new TerrainManager(this, this);
        this.mElementManager = new ElementManager(this);
        this.mPlayerManager = new PlayerManager(this);
        this.mBlocks = new ViewblockManager(this.mCameraService);
        this.mLayManager = new LayerManager(this);
        this.mTerainManager.init();
        this.mElementManager.init();
        this.mPlayerManager.init();
        if (this.scene) {
            const cameras = this.mCameraService.camera = this.scene.cameras.main;
            // init block
            this.mBlocks.int(this.mSize);
        }
        if (!this.mWorld.game.scene.getScene(LoadingScene.name)) this.mWorld.game.scene.add(LoadingScene.name, LoadingScene);
        this.mWorld.game.scene.start(LoadingScene.name, {
            world: this.world,
            room: this,
            startBack: () => {
                this.mClock.sync(-1);
            },
            callBack: () => {
                this.mWorld.game.scene.start(PlayScene.name, {
                    room: this,
                    callBack: () => {
                        if (this.connection) {
                            this.connection.send(new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_SCENE_CREATED));
                        }
                        this.mActor = new ActorEntity(new PlayerModel(this.mActorData), this.mPlayerManager);
                        const loadingScene: LoadingScene = this.mWorld.game.scene.getScene(LoadingScene.name) as LoadingScene;
                        if (loadingScene) loadingScene.sleep();
                        // this.mWorld.game.scene.getScene(LoadingScene.name).scene.sleep();
                    },
                });
            },
        });
    }

    public onFullPacketReceived(sprite_t: op_def.NodeType): void {
        if (sprite_t !== op_def.NodeType.TerrainNodeType) {
            return;
        }
        // this.mClock.sync(3);
    }

    public onClockReady(): void {
        // TODO: Unload loading-scene
        Logger.getInstance().debug("onClockReady");
        this.clockSyncComplete = true;
    }

    public pause() {
        this.mScene.scene.pause();
        this.clockSyncComplete = false;
        // todo launch
    }

    public resume(name: string) {
        this.mScene.scene.resume(name);
        this.mClock.sync(-1);
    }

    public getHeroEntity(): ActorEntity {
        return this.mActor;
    }

    public getMapEntity(): MapEntity {
        return this.mMapEntity;
    }

    public requestActorMove(dir: number, keyArr: number[]) {
        this.mActor.setDirection(dir);
        this.playerManager.startActorMove();
        const pkt: PBpacket = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_GATEWAY_KEYBOARD_DOWN);
        const content: op_virtual_world.IOP_CLIENT_REQ_GATEWAY_KEYBOARD_DOWN = pkt.content;
        content.keyCodes = keyArr;
        this.connection.send(pkt);
    }

    public addActor(data: IActor): void {
        this.mActorData = data;
        // const playerDataModel = this.mWorld.modelManager.getModel(PlayerDataModel.NAME) as PlayerDataModel;
        // playerDataModel.setmainPlayerInfo(data);
    }

    public addToGround(element: ElementDisplay | ElementDisplay[]) {
        this.layerManager.addToGround(element);
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

    public removeElement(element: ElementDisplay) {
        if (element) {
            element.removeFromParent();
        }
    }

    public resize(width: number, height: number) {
        this.layerManager.resize(width, height);
        this.mCameraService.resize(width, height);
    }

    public transformTo90(p: Pos) {
        if (!this.mSize) {
            Logger.getInstance().error("position object is undefined");
            return;
        }
        return Position45.transformTo90(p, this.mSize);
    }

    public transformTo45(p: Pos) {
        if (!this.mSize) {
            Logger.getInstance().error("position object is undefined");
            return;
        }
        return Position45.transformTo45(p, this.mSize);
    }

    public addMouseListen() {
        this.layerManager.addMouseListen();
    }

    public update(time: number, delta: number) {
        this.updateClock(time, delta);
        this.mBlocks.update(time, delta);
        if (this.layerManager) this.layerManager.update(time, delta);
    }

    public updateClock(time: number, delta: number) {
        if (this.mClock) this.mClock.update(time, delta);
    }

    public now(): number {
        return this.mClock.unixTime;
    }

    get scene(): Phaser.Scene | undefined {
        return this.mScene || undefined;
    }

    get terrainManager(): TerrainManager {
        return this.mTerainManager || undefined;
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

    get cameraService(): ICameraService {
        return this.mCameraService || undefined;
    }

    get id(): number {
        return this.mID;
    }

    get roomSize(): IPosition45Obj | undefined {
        return this.mSize || undefined;
    }

    get blocks(): ViewblockService {
        return this.mBlocks;
    }

    get actor(): ActorEntity | undefined {
        return this.mActor;
    }

    get world(): WorldService | undefined {
        return this.mWorld;
    }

    get connection(): ConnectionService | undefined {
        if (this.manager) {
            return this.manager.connection;
        }
    }

    public clear() {
        this.mActor.destroy();
        this.mLayManager.destroy();
        this.mClock.destroy();
        this.mTerainManager.destroy();
        this.mElementManager.destroy();
        this.mPlayerManager.destroy();
        this.mBlocks.destroy();
        if (this.mActorData) {
            this.mActorData = null;
        }
    }

    public destroy() {
        this.clear();
        if (this.mActor) {
            this.mActor.destroy();
        }
        if (this.mScene) {
            this.mScene.scene.stop();
            this.mScene = null;
            // this.mScene.scene.stop();
            // this.mWorld.game.scene.stop(PlayScene.name);
            // this.mWorld.game.scene.stop(MainUIScene.name);
            // this.mScene = null;
        }
    }
}
