import { IRoomManager } from "./room.manager";
import { ElementManager } from "./element/element.manager";
import { PlayerManager } from "./player/player.manager";
import { LayerManager } from "./layer/layer.manager";
import { TerrainManager } from "./terrain/terrain.manager";
import { ConnectionService } from "../net/connection.service";
import { op_client } from "pixelpai_proto";
import { ElementDisplay } from "./display/element.display";
import { IPosition45Obj, Position45 } from "../utils/position45";
import { Point3, IPoint3 } from "../utils/point3";
import { CamerasManager, ICameraService } from "./cameras/cameras.manager";
import { Block } from "./block/block";

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
  private mID: number;

  private mTerainManager: TerrainManager;
  private mElementManager: ElementManager;
  private mPlayerManager: PlayerManager;
  private mLayManager: LayerManager;
  private mScene: Phaser.Scene | undefined;
  private mPosition45Object: IPosition45Obj;
  private mCameraService: ICameraService;
  private mBlocks: Block[];

  constructor(private manager: IRoomManager, scene: Phaser.Scene) {
    this.mScene = scene;
    this.mTerainManager = new TerrainManager(this);
    this.mElementManager = new ElementManager(this);
    this.mPlayerManager = new PlayerManager(this);
    this.mCameraService = new CamerasManager(this);
    this.mLayManager = new LayerManager(manager, scene);

    const world = this.manager.world;
    if (world) {
      const size = world.getSize();
      this.mCameraService.resize(size.width, size.height);
    }
  }

  public enter(room: op_client.IScene, cb?: () => void): void {
    if (!room) {
      console.error("wrong room");
      return;
    }
    this.mID = room.id;
    this.mTerainManager.init();
    this.mElementManager.init();
    this.mPlayerManager.init();

    this.mPosition45Object = {
      cols: room.rows,
      rows: room.cols,
      tileHeight: room.tileHeight,
      tileWidth: room.tileWidth,
      sceneWidth: (room.rows + room.cols) * (room.tileWidth / 2),
      sceneHeight: (room.rows + room.cols) * (room.tileHeight / 2),
      offset: new Phaser.Geom.Point(room.rows * room.tileWidth >> 1, 0),
    };

    if (this.scene) {
      const cameras = this.scene.cameras.main;
      cameras.on("renderer", this.onCameraRender, this);
      this.mCameraService.setCameras(this.scene.cameras.main);

      this.initBlocks();
      cameras.zoom = 2;
    }

    if (cb) cb();
  }

  public setMainRoleInfo(obj: op_client.IActor) {
    this.playerManager.setMainRoleInfo(obj);
  }

  public addToGround(element: ElementDisplay | ElementDisplay[]) {
    this.layerManager.addToGround(element);
  }

  public addToSurface(element: ElementDisplay | ElementDisplay[]) {
    this.layerManager.addToSurface(element);
  }

  public removeElement(element: ElementDisplay) {
    if (element && element.parentContainer) {
      element.parentContainer.remove(element);
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
    if (!this.mPosition45Object) { return; }
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
