import { IRoomManager } from "./room.manager";
import { ElementManager, IElementManager } from "./element/element.manager";
import { PlayerManager } from "./player/player.mamager";
import { LayerManager } from "./layer/layer.manager";
import { TerrainManager } from "./terrain/terrain.manager";
import { ConnectionService } from "../net/connection.service";
import { op_client } from "pixelpai_proto";
import { Position45Manager } from "./terrain/position45.manager";

export interface RoomService {
  enter(room: op_client.IScene): void;

  readonly id: number;
  readonly cols: number;
  readonly rows: number;
  readonly tileWidth: number;
  readonly tileHeight: number;

  readonly terrainManager: TerrainManager;
  readonly elementManager: ElementManager;
  readonly playerManager: PlayerManager;
  readonly layerManager: LayerManager;
  readonly position45Manager: Position45Manager;

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
  private mPosition45: Position45Manager;
  constructor(private manager: IRoomManager, scene: Phaser.Scene) {
    this.mScene = scene;
    this.mTerainManager = new TerrainManager(manager, this);
    this.mElementManager = new ElementManager(manager, this);
    this.mPlayerManager = new PlayerManager(manager, this);
    this.mLayManager = new LayerManager(manager, scene);
    this.mPosition45 = new Position45Manager();
  }

  enter(room: op_client.IScene): void {
    this.mID = room.id;
    this.mCols = room.cols;
    this.mRows = room.rows;
    this.mTileWidth = room.tileWidth;
    this.mTileHeight = room.tileHeight;
    this.mTerainManager.init();
    this.mElementManager.init();
    this.mPosition45.settings(this.mRows, this.mCols, this.tileWidth, this.tileHeight);
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

  public get position45Manager(): Position45Manager {
    return this.mPosition45 || undefined;
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
