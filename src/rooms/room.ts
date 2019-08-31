import {IRoomManager} from "./room.manager";
import {ElementManager} from "./element/element.manager";
import {PlayerManager} from "./player/player.manager";
import {LayerManager} from "./layer/layer.manager";
import {TerrainManager} from "./terrain/terrain.manager";
import {ConnectionService} from "../net/connection.service";
import {op_client, op_virtual_world} from "pixelpai_proto";
import {IPosition45Obj, Position45} from "../utils/position45";
import {Point3, IPoint3} from "../utils/point3";
import {CamerasManager, ICameraService} from "./cameras/cameras.manager";
import {Block} from "./block/block";
import IActor = op_client.IActor;
import {Actor} from "./player/Actor";
import {PBpacket} from "net-socket-packet";
import {WorldService} from "../game/world.service";
import {PlayScene} from "../scenes/play";
import {ElementDisplay} from "./display/element.display";

export interface IRoomService {
    readonly id: number;
    readonly terrainManager: TerrainManager;
    readonly elementManager: ElementManager;
    readonly playerManager: PlayerManager;
    readonly layerManager: LayerManager;
    readonly cameraService: ICameraService;
    readonly roomSize: IPosition45Obj;
    readonly blocks: Block[];

    readonly scene: Phaser.Scene | undefined;

    readonly connection: ConnectionService | undefined;

    enter(room: op_client.IScene): void;

    transformTo45(point3: IPoint3): Phaser.Geom.Point;

    transformTo90(point3: Phaser.Geom.Point): Point3;

    addToGround(element: ElementDisplay | ElementDisplay[]);

    addToSurface(element: ElementDisplay | ElementDisplay[]);

    addMouseListen(callback?: (ground) => void);
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
    private mPosition45Object: IPosition45Obj;
    private mCameraService: ICameraService;
    private mBlocks: Block[];

    constructor(private manager: IRoomManager) {
        this.mTerainManager = new TerrainManager(this);
        this.mElementManager = new ElementManager(this);
        this.mPlayerManager = new PlayerManager(this);
        this.mCameraService = new CamerasManager(this);

        this.mWorld = this.manager.world;
        if (this.mWorld) {
            const size = this.mWorld.getSize();
            this.mCameraService.resize(size.width, size.height);
        }
    }

    public enter(data: op_client.IScene): void {
        if (!data) {
            console.error("wrong room");
            return;
        }
        this.mID = data.id;
        this.mTerainManager.init();
        this.mElementManager.init();
        this.mPlayerManager.init();

        this.mPosition45Object = {
            cols: data.rows,
            rows: data.cols,
            tileHeight: data.tileHeight,
            tileWidth: data.tileWidth,
            sceneWidth: (data.rows + data.cols) * (data.tileWidth / 2),
            sceneHeight: (data.rows + data.cols) * (data.tileHeight / 2),
            offset: new Phaser.Geom.Point(data.rows * data.tileWidth >> 1, 0),
        };

        if (this.scene) {
            const cameras = this.scene.cameras.main;
            cameras.on("renderer", this.onCameraRender, this);
            this.mCameraService.setCameras(this.scene.cameras.main);

            this.initBlocks();
            cameras.zoom = 2;
        }

        this.mScene = this.mWorld.game.scene.getScene(PlayScene.name);
        // TODO Layer manager 应该改为room，而不是roomMgr，并且不需要传递scene 变量作为入参！从mgr上拿scene！
        this.mLayManager = new LayerManager(this.manager, this.mScene);
        this.mWorld.game.scene.start(PlayScene.name, {
            callBack: () => {
                // notify server, we are in.
                if (this.connection) {
                    this.connection.send(new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_SCENE_CREATED));
                }
            }
        });
    }

    public addActor(data: IActor): void {
        this.mActor = new Actor(data, this.mPlayerManager);
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

    public getViewPort(): Phaser.Geom.Rectangle {
        const cameras = this.scene.cameras.main;
        if (!this.scene) {
            return;
        }
        const worldView = cameras.worldView;
        const out = new Phaser.Geom.Rectangle(worldView.x, worldView.y, worldView.width, worldView.height);
        out.x -= out.width >> 1;
        out.y -= out.height >> 1;
        out.width *= 2;
        out.height *= 2;
        return out;
    }

    public resize(width: number, height: number) {
        this.layerManager.resize(width, height);
        this.mCameraService.resize(width, height);
    }

    public transformTo90(point3d: Phaser.Geom.Point) {
        if (!this.mPosition45Object) {
            console.error("position object is undefined");
            return;
        }
        return Position45.transformTo90(point3d, this.mPosition45Object);
    }

    public transformTo45(point3d: Point3) {
        if (!this.mPosition45Object) {
            console.error("position object is undefined");
            return;
        }
        return Position45.transformTo45(point3d, this.mPosition45Object);
    }

    public addMouseListen(callback?: (layer) => void) {
        this.layerManager.addMouseListen(callback);
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
        return this.mPosition45Object || undefined;
    }

    get blocks(): Block[] | undefined {
        return this.mBlocks || undefined;
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
        // this.mTerainManager.dispose();
        this.mPlayerManager.dispose();
        this.mLayManager.dispose();
        // this.mElementManager.dispose();
    }

    private initBlocks() {
        if (!this.mPosition45Object) {
            return;
        }
        this.mBlocks = [];
        const colSize = 10;
        const viewW = (colSize + colSize) * (this.mPosition45Object.tileWidth / 2);
        const viewH = (colSize + colSize) * (this.mPosition45Object.tileHeight / 2);
        const blockW = this.mPosition45Object.sceneWidth / viewW;
        const blockH = this.mPosition45Object.sceneHeight / viewH;
        for (let i = 0; i < blockW; i++) {
            for (let j = 0; j < blockH; j++) {
                this.mBlocks.push(new Block(new Phaser.Geom.Rectangle(i * viewW, j * viewH, viewW, viewH)));
            }
        }
    }

    private onCameraRender() {
        const viewport = this.getViewPort();
        for (const block of this.blocks) {
            block.check(viewport);
        }
    }
}
