import { IRoomManager } from "./room.manager";
import { ElementManager } from "./element/element.manager";
import { PlayerManager } from "./player/player.mamager";
import { LayerManager } from "./layer/layer.manager";
import { TerrainManager } from "./terrain/terrain.manager";
import { ConnectionService } from "../net/connection.service";
import { op_client } from "pixelpai_proto";
import { ElementDisplay } from "./display/element.display";
import { IPosition45Obj, Position45 } from "../utils/position45";
import { Point3, IPoint3 } from "../utils/point3";
import { CamerasManager, ICameraService } from "./cameras/cameras.manager";

export interface IRoomService {
  readonly id: number;
  readonly terrainManager: TerrainManager;
  readonly elementManager: ElementManager;
  readonly playerManager: PlayerManager;
  readonly layerManager: LayerManager;
  readonly cameraService: ICameraService;

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
      offset: new Phaser.Geom.Point(room.rows * room.tileWidth >> 1, 0),
    };

    if (this.scene) {
      this.mCameraService.setCameras(this.scene.cameras.main);
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

  public get terrainManager(): TerrainManager {
    return this.mTerainManager || undefined;
  }

  public get elementManager(): ElementManager {
    return this.mElementManager || undefined;
  }

  public get playerManager(): PlayerManager {
    return this.mPlayerManager || undefined;
  }

  public get layerManager(): LayerManager {
    return this.mLayManager || undefined;
  }

  public get cameraService(): ICameraService {
    return this.mCameraService || undefined;
  }

  public get id(): number {
    return this.mID;
  }

  public get connection(): ConnectionService | undefined {
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
}
