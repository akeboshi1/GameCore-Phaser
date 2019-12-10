import { IRoomManager } from "./room.manager";
import { ElementManager } from "./element/element.manager";
import { PlayerManager } from "./player/player.manager";
import { LayerManager } from "./layer/layer.manager";
import { TerrainManager } from "./terrain/terrain.manager";
import { ConnectionService } from "../net/connection.service";
import { op_client, op_def, op_virtual_world } from "pixelpai_proto";
import { IPosition45Obj, Position45 } from "../utils/position45";
import { CamerasManager, ICameraService } from "./cameras/cameras.manager";
import { PacketHandler, PBpacket } from "net-socket-packet";
import { WorldService } from "../game/world.service";
import { PlayScene } from "../scenes/play";
import { ElementDisplay } from "./display/element.display";
import { Logger } from "../utils/log";
import { ViewblockManager, ViewblockService } from "./cameras/viewblock.manager";
import { Pos } from "../utils/pos";
import { LoadingScene } from "../scenes/loading";
import { Clock, ClockReadyListener } from "./clock";
import IActor = op_client.IActor;
import { Map } from "./map/map";
import { Actor } from "./player/Actor";
import { PlayerModel } from "./player/player.model";
import { IElement } from "./element/element";
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
  readonly actor: Actor;
  readonly world: WorldService;
  readonly map: Map;

  readonly scene: Phaser.Scene | undefined;

  readonly connection: ConnectionService | undefined;

  // blockCheckWorker: BlockCheckWorker;
  clockSyncComplete: boolean;

  now(): number;

  startLoad();

  completeLoad();

  startPlay();

  // startCheckBlock();

  updateClock(time: number, delta: number): void;

  enter(room: op_client.IScene): void;

  pause(): void;

  resume(name: string | string[]): void;

  transformTo45(p: Pos): Pos;

  transformTo90(p: Pos): Pos;

  addBlockObject(object: IElement);

  removeBlockObject(object: IElement);

  addToGround(element: ElementDisplay | ElementDisplay[]);

  addToSurface(element: ElementDisplay | ElementDisplay[]);

  addToSceneUI(element: Phaser.GameObjects.GameObject | Phaser.GameObjects.GameObject[]);

  addToUI(element: Phaser.GameObjects.Container | Phaser.GameObjects.Container[]);

  addMouseListen();

  requestActorMove(d: number, key: number[]);

  update(time: number, delta: number): void;

  destroy();
}

// 这一层管理数据和Phaser之间的逻辑衔接
// 消息处理让上层[RoomManager]处理
export class Room extends PacketHandler implements IRoomService, SpriteAddCompletedListener, ClockReadyListener {
  public clockSyncComplete: boolean = false;
  // public blockCheckWorker: BlockCheckWorker;
  protected mWorld: WorldService;
  protected mMap: Map;
  protected mID: number;
  protected mTerainManager: TerrainManager;
  protected mElementManager: ElementManager;
  protected mPlayerManager: PlayerManager;
  protected mLayManager: LayerManager;
  protected mScene: Phaser.Scene | undefined;
  protected mSize: IPosition45Obj;
  protected mCameraService: ICameraService;
  protected mBlocks: ViewblockService;
  protected mClock: Clock;

  private mActor: Actor;
  private mActorData: IActor;
  private mCheckBlock: boolean = false;

  constructor(protected manager: IRoomManager) {
    super();
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

    this.mSize = {
      cols: data.cols,
      rows: data.rows,
      tileHeight: data.tileHeight,
      tileWidth: data.tileWidth,
      sceneWidth: (data.rows + data.cols) * (data.tileWidth / 2),
      sceneHeight: (data.rows + data.cols) * (data.tileHeight / 2)
    };
    // this.blockCheckWorker = new BlockCheckWorker();
    // this.mScene = this.mWorld.game.scene.getScene(PlayScene.name);
    this.mMap = new Map(this.mWorld);
    this.mMap.setMapInfo(data);
    this.mClock = new Clock(this.mWorld.connection, this);
    // if (this.mScene.scene.isActive()) {
    //   this.mWorld.game.scene.sleep(PlayScene.name);
    // }
    if (!this.mWorld.game.scene.getScene(LoadingScene.name))
      this.mWorld.game.scene.add(LoadingScene.name, LoadingScene);
    this.mWorld.game.scene.start(LoadingScene.name, {
      world: this.world,
      room: this
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

  public startLoad() {
    this.mClock.sync(-1);
  }

  public completeLoad() {
    // const dragonboneName = "bones_human01";
    // if (!this.mScene.textures.exists(dragonboneName)) {
    //   this.mScene.load.once(
    //     Phaser.Loader.Events.COMPLETE,
    //     () => {
    //       this.enterRoom();
    //     },
    //     this
    //   );
    //   const res = "./resources/dragonbones";
    //   this.mScene.load.dragonbone(
    //     dragonboneName,
    //     `${res}/${dragonboneName}_tex.png`,
    //     `${res}/${dragonboneName}_tex.json`,
    //     `${res}/${dragonboneName}_ske.dbbin`,
    //     null,
    //     null,
    //     { responseType: "arraybuffer" }
    //   );
    //   this.mScene.load.start();
    // } else {
    //   this.enterRoom();
    // }
    this.mWorld.game.scene.add(PlayScene.name, PlayScene, true, {
      room: this
    });
  }

  public startPlay() {
    if (this.connection) {
      this.connection.send(new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_SCENE_CREATED));
    }
    if (this.mLayManager) {
      this.layerManager.destroy();
    }
    this.mScene = this.world.game.scene.getScene(PlayScene.name);
    this.mTerainManager = new TerrainManager(this, this);
    this.mElementManager = new ElementManager(this);
    this.mPlayerManager = new PlayerManager(this);
    this.mBlocks = new ViewblockManager(this.mCameraService);
    this.mLayManager = new LayerManager(this);
    if (this.scene) {
      this.mCameraService.camera = this.scene.cameras.main;
      // init block
      this.mBlocks.int(this.mSize);
    }
    this.mActor = new Actor(new PlayerModel(this.mActorData), this.mPlayerManager);
    const loadingScene: LoadingScene = this.mWorld.game.scene.getScene(LoadingScene.name) as LoadingScene;
    if (loadingScene) loadingScene.sleep();
    this.world.changeRoom(this);

    // this.mWorld.inputManager.enable = true;
  }

  public pause() {
    this.mScene.scene.pause();
    this.mWorld.inputManager.enable = false;
    this.clockSyncComplete = false;
    // todo launch
  }

  public resume(name: string) {
    this.mScene.scene.resume(name);
    this.mWorld.inputManager.enable = true;
    this.mClock.sync(-1);
  }

  public getHero(): Actor {
    return this.mActor;
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

  public addBlockObject(object: IElement) {
    if (this.blocks) {
      this.blocks.add(object);
    }
  }

  public removeBlockObject(object: IElement) {
    if (this.blocks) {
      this.blocks.remove(object);
    }
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
    if (this.mWorld.inputManager.enable === false && this.world.game.loop.actualFps >= 20 && this.clockSyncComplete) {
      this.mWorld.inputManager.enable = true;
    }
    this.updateClock(time, delta);
    this.mBlocks.update(time, delta);
    // this.startCheckBlock();
    if (this.layerManager) this.layerManager.update(time, delta);
  }

  // public startCheckBlock() {
  //     if (!this.mCheckBlock) {
  //         this.mCheckBlock = true;
  //         this.blockCheckWorker.onmessage = (event: any) => {
  //             const type: string = event.data.method;
  //             switch (type) {
  //                 case "startCheckBlockCallBack":
  //                     this.mBlocks.check(event.data.list);
  //                     break;
  //             }
  //             Logger.getInstance().debug(event.method);
  //         };
  //         this.blockCheckWorker.postMessage({ "method": "startCheckBlock" });
  //     }
  // }

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

  get map(): Map {
    return this.mMap;
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
    if (this.mActor) this.mActor.destroy();
    if (this.mLayManager) this.mLayManager.destroy();
    if (this.mClock) this.mClock.destroy();
    if (this.mTerainManager) this.mTerainManager.destroy();
    if (this.mElementManager) this.mElementManager.destroy();
    if (this.mPlayerManager) this.mPlayerManager.destroy();
    if (this.mBlocks) this.mBlocks.destroy();
    //  if (this.mCheckBlock && this.blockCheckWorker) this.blockCheckWorker.postMessage({ method: "endCheckBlock" });
    if (this.mActorData) {
      this.mActorData = null;
    }
  }

  public destroy() {
    this.clear();
    if (this.mActor) {
      this.mActor.destroy();
    }
    this.mWorld.game.scene.remove(PlayScene.name);
    if (this.mScene) {
      // this.mScene.scene.stop();
      this.mScene = null;
      // this.mScene.scene.stop();
      // this.mWorld.game.scene.stop(PlayScene.name);
      // this.mWorld.game.scene.stop(MainUIScene.name);
      // this.mScene = null;
    }
  }

  private enterRoom() {
    // if (this.mScene.scene.isActive()) {
    //     this.mWorld.changeScene();
    //     return;
    // }
    // if (this.mScene.scene.isActive() || this.mScene.scene.isSleeping()) {
    //   this.mWorld.game.scene.wake(PlayScene.name, {
    //     room: this
    //   });
    //   return;
      // this.startPlay();
    // }
    this.mWorld.game.scene.run(PlayScene.name, {
      room: this
    });
  }
}
