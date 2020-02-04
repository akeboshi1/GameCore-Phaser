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
import { ClockReadyListener } from "./clock";
import IActor = op_client.IActor;
import { Map } from "./map/map";
import { PlayerModel } from "./player/player.model";
import { IElement, Element } from "./element/element";
import { Size } from "../utils/size";
import { MessageType } from "../const/MessageType";
import { DisplayObject } from "./display/display.object";
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
    readonly world: WorldService;
    readonly map?: Map;

    readonly scene: Phaser.Scene | undefined;

    readonly connection: ConnectionService | undefined;

    now(): number;

    startLoad();

    completeLoad();

    startPlay();

    enter(room: op_client.IScene): void;

    pause(): void;

    resume(name: string | string[]): void;

    transformTo45(p: Pos): Pos;

    transformTo90(p: Pos): Pos;

    addBlockObject(object: IElement);

    removeBlockObject(object: IElement);

    updateBlockObject(object: IElement);

    addToGround(element: ElementDisplay | ElementDisplay[]);

    addToSurface(element: ElementDisplay | ElementDisplay[]);

    addToSceneUI(element: Phaser.GameObjects.GameObject | Phaser.GameObjects.GameObject[]);

    addToUI(element: Phaser.GameObjects.Container | Phaser.GameObjects.Container[]);

    addMouseListen();

    update(time: number, delta: number): void;

    destroy();
}

// 这一层管理数据和Phaser之间的逻辑衔接
// 消息处理让上层[RoomManager]处理
export class Room extends PacketHandler implements IRoomService, SpriteAddCompletedListener, ClockReadyListener {
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
    protected mEnableEdit: boolean = false;
    private mActorData: IActor;
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

            if (this.connection) {
                this.connection.addPacketListener(this);
                this.addHandlerFun(
                    op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_ENABLE_EDIT_MODE,
                    this.onEnableEditModeHandler
                );
            }
        }
    }

    public enter(data: op_client.IScene): void {
        const size: Size = this.mWorld.getSize();
        if (!data) {
            // Logger.getInstance().error("wrong room");
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
        this.mMap = new Map(this.mWorld);
        this.mMap.setMapInfo(data);
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
    }

    public onClockReady(): void {
        // TODO: Unload loading-scene
    }

    public startLoad() {}

    public completeLoad() {
        this.mWorld.game.scene.add(PlayScene.name, PlayScene, true, {
            room: this
        });
    }

    public startPlay() {
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
        this.mPlayerManager.createActor(new PlayerModel(this.mActorData));
        // this.mActor = new Actor(, this.mPlayerManager);
        const loadingScene: LoadingScene = this.mWorld.game.scene.getScene(LoadingScene.name) as LoadingScene;
        this.world.emitter.on(MessageType.PRESS_ELEMENT, this.onPressElementHandler, this);
        if (loadingScene) loadingScene.sleep();
        this.world.changeRoom(this);
        if (this.world.uiManager) this.world.uiManager.showMainUI();

        if (this.connection) {
            this.connection.send(new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_SCENE_CREATED));
        }
        // this.mWorld.inputManager.enable = true;
    }

    public pause() {
        if (this.mScene) this.mScene.scene.pause();
        if (this.mWorld && this.mWorld.inputManager) this.mWorld.inputManager.enable = false;
        // this.clockSyncComplete = false;
        // todo launch
    }

    public resume(name: string) {
        if (this.mScene) this.mScene.scene.resume(name);
        if (this.mWorld && this.mWorld.inputManager) this.mWorld.inputManager.enable = true;
        // this.mClock.sync(-1);
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

    public updateBlockObject(object: IElement) {
        if (this.blocks) {
            this.blocks.check(object);
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
        if (this.layerManager) this.layerManager.resize(width, height);
        if (this.mCameraService) this.mCameraService.resize(width, height);
    }

    public transformTo90(p: Pos) {
        if (!this.mSize) {
            // Logger.getInstance().error("position object is undefined");
            return;
        }
        return Position45.transformTo90(p, this.mSize);
    }

    public transformTo45(p: Pos) {
        if (!this.mSize) {
            // Logger.getInstance().error("position object is undefined");
            return;
        }
        return Position45.transformTo45(p, this.mSize);
    }

    public addMouseListen() {
        this.layerManager.addMouseListen();
    }

    public update(time: number, delta: number) {
        // 角色管理器和地块，物件管理器中在登陆时，add_sprite完成后，把交互管理器的交互开放
        // if (this.mPlayerManager.hasAddComplete && this.mTerainManager.hasAddComplete && this.mElementManager.hasAddComplete) {
        //   if (this.mWorld.inputManager.enable === false && this.world.game.loop.actualFps >= 20) {
        //     this.mWorld.inputManager.enable = true;
        //   }
        // }
        this.updateClock(time, delta);
        this.mBlocks.update(time, delta);
        // this.startCheckBlock();
        if (this.layerManager) this.layerManager.update(time, delta);
    }

    public updateClock(time: number, delta: number) {
        // 客户端自己通过delta来更新游戏时间戳
        if (this.mWorld.clock) this.mWorld.clock.update(time, delta);
    }

    public now(): number {
        return this.mWorld.clock.unixTime;
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

    get world(): WorldService | undefined {
        return this.mWorld;
    }

    get connection(): ConnectionService | undefined {
        if (this.manager) {
            return this.manager.connection;
        }
    }

    public clear() {
        if (this.mLayManager) this.mLayManager.destroy();
        if (this.mTerainManager) this.mTerainManager.destroy();
        if (this.mElementManager) this.mElementManager.destroy();
        if (this.mPlayerManager) this.mPlayerManager.destroy();
        if (this.mBlocks) this.mBlocks.destroy();
        if (this.mActorData) {
            this.mActorData = null;
        }
    }

    public destroy() {
        this.clear();
        if (this.connection) this.connection.removePacketListener(this);
        this.mWorld.game.scene.remove(PlayScene.name);
        this.world.emitter.off(MessageType.PRESS_ELEMENT, this.onPressElementHandler, this);
        // if (this.mScene) {
        //   this.mScene = null;
        // }
    }

    private onPressElementHandler(pointer, gameObject) {
        if (!gameObject || !gameObject.parentContainer) {
            return;
        }
        const com = gameObject.parentContainer;
        if (!(com instanceof DisplayObject)) {
            return;
        }
        const ele = com.element;
        if (!(ele instanceof Element)) {
            return;
        }

        if (this.mEnableEdit) {
            const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_EDIT_MODE_ENTER);
            this.connection.send(packet);
        }
    }

    private onEnableEditModeHandler(packet: PBpacket) {
        this.mEnableEdit = true;
        if (this.world) {
            this.world.emitter.emit(MessageType.ADD_ICON_TO_TOP, {
                key: "Turn_Btn_Top",
                name: "EnterDecorate",
                bgResKey: "baseView",
                bgTextures: ["btnGroup_yellow_normal.png", "btnGroup_yellow_light.png", "btnGroup_yellow_select.png"],
                iconResKey: "",
                iconTexture: "btnGroup_top_expand.png",
                scale: 1
            });
        }
    }

    private enterRoom() {
        this.mWorld.game.scene.run(PlayScene.name, {
            room: this
        });
    }
}
