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
import { Logger } from "../utils/log";
import { ViewblockManager, ViewblockService } from "./cameras/viewblock.manager";
import { Pos } from "../utils/pos";
import { Clock } from "./clock";
import { ActorModel } from "./player/play.model";
import IActor = op_client.IActor;
import { LoadingScene } from "../scenes/loading";
import { MainUIScene } from "../scenes/main.ui";

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

    pause(): void;

    resume(name: string | string[]): void;

    transformTo45(p: Pos): Pos;

    transformTo90(p: Pos): Pos;

    addToGround(element: ElementDisplay | ElementDisplay[]);

    addToSurface(element: ElementDisplay | ElementDisplay[]);

    addToUI(element: Phaser.GameObjects.Container | Phaser.GameObjects.Container[]);

    addMouseListen();

    requestActorMove(d: number, key: number[]);

    update(time: number, delta: number): void;
}

// 这一层管理数据和Phaser之间的逻辑衔接
// 消息处理让上层[RoomManager]处理
export class Room implements IRoomService {
    private mWorld: WorldService;
    private mActor: Actor;
    private mActorData: IActor;
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
    private mInit: boolean = false;

    constructor(private manager: IRoomManager) {
        this.mWorld = this.manager.world;
        this.mClock = new Clock(this.mWorld.connection);
        this.mTerainManager = new TerrainManager(this);
        this.mElementManager = new ElementManager(this);
        this.mPlayerManager = new PlayerManager(this);
        this.mCameraService = new CamerasManager(this);
        this.mBlocks = new ViewblockManager(this.mCameraService);

        if (this.mWorld) {
            const size = this.mWorld.getSize();
            if (size) {
                this.mCameraService.resize(size.width, size.height);
            } else {
                throw new Error(`World::getSize undefined!`);
            }
        }
        this.mClock.sync(3);
    }

    public enter(data: op_client.IScene): void {
        if (!data) {
            Logger.error("wrong room");
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
            // this.mCameraService.setBounds(-100, -100, this.mSize.sceneWidth + 200, this.mSize.sceneHeight + 200, true);
            // cameras.zoom = 2;
        }

        this.mWorld.game.scene.start(LoadingScene.name, {
            room: this,
            callBack: () => {
                this.mWorld.game.scene.start(PlayScene.name, {
                    room: this,
                    callBack: () => {
                        // notify server, we are in.
                        if (this.connection) {
                            this.connection.send(new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_SCENE_CREATED));
                        }
                        this.mActor = new Actor(new ActorModel(this.mActorData), this.mPlayerManager);
                    },
                });
            },
        });
    }

    public pause() {
        this.mScene.scene.pause();
        // todo launch
    }

    public resume(name: string) {
        this.mScene.scene.resume(name);
        this.mScene.scene.stop();
    }

    public requestActorMove(dir: number, keyArr: number[]) {
        this.mActor.setDirection(dir);
        this.playerManager.startActorMove();
        const pkt: PBpacket = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_GATEWAY_KEYBOARD_DOWN);
        const content: op_virtual_world.IOP_CLIENT_REQ_GATEWAY_KEYBOARD_DOWN = pkt.content;
        content.keyCodes = keyArr;
        this.world.connection.send(pkt);
    }

    public addActor(data: IActor): void {
        this.mActorData = data;
    }

    public addToGround(element: ElementDisplay | ElementDisplay[]) {
        this.layerManager.addToGround(element);
    }

    public addToSurface(element: ElementDisplay | ElementDisplay[]) {
        this.layerManager.addToSurface(element);
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
            Logger.error("position object is undefined");
            return;
        }
        return Position45.transformTo90(p, this.mSize);
    }

    public transformTo45(p: Pos) {
        if (!this.mSize) {
            Logger.error("position object is undefined");
            return;
        }
        return Position45.transformTo45(p, this.mSize);
    }

    public addMouseListen() {
        this.layerManager.addMouseListen();
    }

    public update(time: number, delta: number) {
        this.mClock.update(time, delta);
        this.mBlocks.update(time, delta);
        if (this.layerManager) this.layerManager.update(time, delta);

        // 需要知道什么时候程序已经把当前镜头下的元素全部渲染好了，再开始把loadingscene给sleep掉
        if (time >= 10000 && !this.mInit) {
            this.mInit = true;
            this.mWorld.game.scene.getScene(LoadingScene.name).scene.sleep();
            this.mWorld.game.scene.getScene(PlayScene.name).scene.launch(MainUIScene.name, {
                room: this
            });
        }
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

    public clear() {
        this.mPlayerManager.destroy();
        this.mElementManager.destroy();
        this.mTerainManager.destroy();
    }

    public destroy() {
        if (this.mScene) {
            this.mScene.scene.stop();
            this.mScene = null;
        }
        this.manager = null;
        this.mPlayerManager.destroy();
        this.mLayManager.destroy();
        this.mClock.destroy();
    }
}
