import { IRoomManager } from "./room.manager";
import { ElementManager, IElementManager } from "./element/element.manager";
import { PlayerManager } from "./player/player.mamager";
import { LayerManager } from "./layer/layer.manager";
import { TerrainManager } from "./terrain/terrain.manager";
import { ConnectionService } from "../net/connection.service";
import { op_client } from "pixelpai_proto";
import { Position45Manager } from "./terrain/position45.manager";
import { ElementDisplay } from "./display/element.display";
import { IPosition45Obj, Position45 } from "../utils/position45";
import { Point3, IPoint3 } from "../utils/point3";

export interface RoomService {
  enter(room: op_client.IScene, cb?: Function): void;
  addToGround(element);
  addToSurface(element);
  transformTo45(point3: IPoint3): Phaser.Geom.Point;
  transformTo90(point3: Phaser.Geom.Point): Point3;

  addMouseListen(callback?: Function);
  readonly id: number;
  readonly cols: number;
  readonly rows: number;
  readonly tileWidth: number;
  readonly tileHeight: number;

  readonly terrainManager: TerrainManager;
  readonly elementManager: ElementManager;
  readonly playerManager: PlayerManager;
  readonly layerManager: LayerManager;

  readonly scene: Phaser.Scene | undefined;

  readonly connection: ConnectionService | undefined;
}

// 这一层管理数据和Phaser之间的逻辑衔接
// 消息处理让上层[RoomManager]处理
export class Room implements RoomService {
  private mID: number;
  private mCols: number;
  private mRows: number;
  private mTileWidth: number;
  private mTileHeight: number;

  private mTerainManager: TerrainManager;
  private mElementManager: ElementManager;
  private mPlayerManager: PlayerManager;
  private mLayManager: LayerManager;
  private mScene: Phaser.Scene | undefined;
  private mPosition45Object: IPosition45Obj;

  constructor(private manager: IRoomManager, scene: Phaser.Scene) {
    this.mScene = scene;
    this.mTerainManager = new TerrainManager(this);
    this.mElementManager = new ElementManager(this);
    this.mPlayerManager = new PlayerManager(this);
    this.mLayManager = new LayerManager(manager, scene);
  }


  enter(room: op_client.IScene, cb?: Function): void {
    if (!room) {
      console.error("wrong room");
      return;
    }
    this.mID = room.id;
    this.mCols = room.cols;
    this.mRows = room.rows;
    this.mTileWidth = room.tileWidth;
    this.mTileHeight = room.tileHeight;
    this.mTerainManager.init();
    this.mElementManager.init();
    this.mPlayerManager.init();
    this.mPosition45Object = {
      rows: room.cols,
      cols: room.cols,
      tileWidth: room.tileWidth,
      tileHeight: room.tileHeight,
      offset: new Phaser.Geom.Point(room.rows * room.tileWidth >> 1, 0)
    }

    if (cb) cb();
  }

  public setMainRoleInfo(obj: op_client.IActor) {
    this.playerManager.setMainRoleInfo(obj);
  }

  public addToGround(element: ElementDisplay) {
    this.layerManager.addGround(element);
  }

  public addToSurface(element: ElementDisplay) {
    this.layerManager.addSurface(element);
  }

  public removeElement(element: ElementDisplay) {
    if (element && element.parentContainer) {
      element.parentContainer.remove(element);
    }
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
  
  public addMouseListen(callback?: Function) {
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

  public get id(): number {
    return this.mID;
  }

  public get cols(): number {
    return this.mCols;
  }

  public get rows(): number {
    return this.mRows;
  }

  public get tileWidth(): number {
    return this.mTileWidth;
  }

  public get tileHeight(): number {
    return this.mTileHeight;
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
    //this.mTerainManager.dispose();
    this.mPlayerManager.dispose();
    this.mLayManager.dispose();
    // this.mElementManager.dispose();


  }
}
