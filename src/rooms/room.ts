import { IRoomManager } from "./room.manager";
import { ElementManager } from "./element/element.manager";
import { PlayerManager } from "./player/player.mamager";
import { LayerManager } from "./layer/layer.manager";
import { TerrainManager } from "./terrain/terrain.manager";
import { ConnectionService } from "../net/connection.service";

export interface RoomService {
  enter(): void;
}

// 这一层管理数据和Phaser之间的逻辑衔接
// 消息处理让上层[RoomManager]处理
export class Room implements RoomService {
  private mTerainManager: TerrainManager;
  private mElementManager: ElementManager;
  private mPlayerManager: PlayerManager;
  private mLayManager: LayerManager;
  private mScene: Phaser.Scene | undefined;
  constructor(private manager: IRoomManager, scene: Phaser.Scene) {
    this.mScene = scene;
    this.mTerainManager = new TerrainManager(manager, this);
    this.mElementManager = new ElementManager(manager);
    this.mPlayerManager = new PlayerManager(manager, this);
    this.mLayManager = new LayerManager(manager, scene);
  }

  enter(): void {
    // TODO
  }

  get scene() {
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
