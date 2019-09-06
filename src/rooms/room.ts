import { IRoomManager } from "./room.manager";
import { ElementManager } from "./element/element.manager";
import { PlayerManager } from "./player/player.manager";
import { LayerManager } from "./layer/layer.manager";
import { TerrainManager } from "./terrain/terrain.manager";
import { ConnectionService } from "../net/connection.service";
import { op_client, op_virtual_world } from "pixelpai_proto";
import { IPosition45Obj, Position45 } from "../utils/position45";
import { CamerasManager, ICameraService } from "./cameras/cameras.manager";
import { Actor } from "./player/Actor";
import { PBpacket } from "net-socket-packet";
import { WorldService } from "../game/world.service";
import { PlayScene } from "../scenes/play";
import { ElementDisplay } from "./display/element.display";
import { Console } from "../utils/log";
import { ViewblockManager, ViewblockService } from "./cameras/viewblock.manager";
import { Pos } from "../utils/pos";
import IActor = op_client.IActor;

export interface IRoomService {
    readonly id: number;
    readonly terrainManager: TerrainManager;
    readonly elementManager: ElementManager;
    readonly playerManager: PlayerManager;
    readonly layerManager: LayerManager;
    readonly cameraService: ICameraService;
    readonly roomSize: IPosition45Obj;
    readonly blocks: ViewblockService;
    readonly actor: Actor;
    readonly world: WorldService;

    readonly scene: Phaser.Scene | undefined;

    readonly connection: ConnectionService | undefined;

    now(): number;

    enter(room: op_client.IScene): void;

    transformTo45(p: Pos): Pos;

    transformTo90(p: Pos): Pos;

    addToGround(element: ElementDisplay | ElementDisplay[]);

    addToSurface(element: ElementDisplay | ElementDisplay[]);

    addMouseListen();

    update(time: number, delta: number): void;
}

// 这一层管理数据和Phaser之间的逻辑衔接
// 消息处理让上层[RoomManager]处理
export class Room implements IRoomService {
    private mWorld: WorldService;
    private mActor: Actor;
    private mID: number;
    private mTerainManager: TerrainManager;
    private mElementManager: ElementManager;
    private mPlayerManager: PlayerManager;
    private mLayManager: LayerManager;
    private mScene: Phaser.Scene | undefined;
    private mSize: IPosition45Obj;
    private mCameraService: ICameraService;
    private mBlocks: ViewblockService;

    constructor(private manager: IRoomManager) {
        this.mWorld = this.manager.world;
        this.mTerainManager = new TerrainManager(this);
        this.mElementManager = new ElementManager(this);
        this.mPlayerManager = new PlayerManager(this);
        this.mCameraService = new CamerasManager(this);
        this.mBlocks = new ViewblockManager(this.mCameraService);

        if (this.mWorld) {
            const size = this.mWorld.getSize();
            this.mCameraService.resize(size.width, size.height);
        }
    }

    public enter(data: op_client.IScene): void {
        if (!data) {
            Console.error("wrong room");
            return;
        }
        this.mID = data.id;
        this.mTerainManager.init();
        this.mElementManager.init();
        this.mPlayerManager.init();

        this.mSize = {
            cols: data.rows,
            rows: data.cols,
            tileHeight: data.tileHeight,
            tileWidth: data.tileWidth,
            sceneWidth: (data.rows + data.cols) * (data.tileWidth / 2),
            sceneHeight: (data.rows + data.cols) * (data.tileHeight / 2),
        };

        this.mScene = this.mWorld.game.scene.getScene(PlayScene.name);
        this.mLayManager = new LayerManager(this);
        if (this.scene) {
            const cameras = this.mCameraService.camera = this.scene.cameras.main;
            // init block
            this.mBlocks.int(this.mSize);
            cameras.zoom = 2;
        }

        // TODO Layer manager 应该改为room，而不是roomMgr，并且不需要传递scene 变量作为入参！从mgr上拿scene！
        this.mWorld.game.scene.start(PlayScene.name, {
            room: this,
            callBack: () => {
                // notify server, we are in.
                if (this.connection) {
                    this.connection.send(new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_SCENE_CREATED));
                }
            },
        });
    }

    public addActor(data: IActor): void {
        this.mActor = new Actor(data, this.mPlayerManager); // new Actor(data, this.mPlayerManager);
    }

    public addToGround(element: ElementDisplay | ElementDisplay[]) {
        this.layerManager.addToGround(element);
    }

    public addToSurface(element: ElementDisplay | ElementDisplay[]) {
        this.layerManager.addToSurface(element);
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
            Console.error("position object is undefined");
            return;
        }
        return Position45.transformTo90(p, this.mSize);
    }

    public transformTo45(p: Pos) {
        if (!this.mSize) {
            Console.error("position object is undefined");
            return;
        }
        return Position45.transformTo45(p, this.mSize);
    }

    public addMouseListen() {
        this.layerManager.addMouseListen();
    }

    public update(time: number, delta: number) {
        this.mBlocks.update(time, delta);
        if (this.layerManager) {
            this.layerManager.update(time, delta);
        }
    }

    public now(): number {
        return this.mWorld.getServerTime();
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

    get actor(): Actor | undefined {
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

    public dispose() {
        if (this.mScene) {
            this.mScene.scene.stop();
            this.mScene = null;
        }
        this.manager = null;
        this.mPlayerManager.dispose();
        this.mLayManager.dispose();
    }
}
