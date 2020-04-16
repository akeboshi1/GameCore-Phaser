import { IRoomManager } from "./room.manager";
import { ElementManager } from "./element/element.manager";
import { PlayerManager } from "./player/player.manager";
import { LayerManager } from "./layer/layer.manager";
import { TerrainManager } from "./terrain/terrain.manager";
import { ConnectionService } from "../net/connection.service";
import { op_client, op_def, op_virtual_world } from "pixelpai_proto";
import { IPosition45Obj, Position45 } from "../utils/position45";
import { ICameraService, CamerasManager } from "./cameras/cameras.manager";
import { PacketHandler, PBpacket } from "net-socket-packet";
import { WorldService } from "../game/world.service";
import { PlayScene } from "../scenes/play";
import { ElementDisplay } from "./display/element.display";
import { ViewblockManager, ViewblockService } from "./cameras/viewblock.manager";
import { Pos } from "../utils/pos";
import { LoadingScene } from "../scenes/loading";
import { ClockReadyListener } from "./clock";
import IActor = op_client.IActor;
import { Map } from "./map/map";
import { PlayerModel } from "./player/player.model";
import { Element } from "./element/element";
import { IBlockObject } from "./cameras/block.object";
import { Size } from "../utils/size";
import { MessageType } from "../const/MessageType";
import { DisplayObject } from "./display/display.object";
import { ReferenceArea } from "./editor/reference.area";
import { FallEffectContainer } from "./fall.effect/fall.effect.container";
import { FallEffect } from "./fall.effect/fall.effect";
import { IPoint } from "game-capsule/lib/helpers";
import { Logger } from "../utils/log";
import { WallManager } from "./wall/wall.manager";
import { BackgroundManager } from "./sky.box/background.manager";
import { SoundManager, SoundField } from "../game/sound.manager";
import { Url } from "../utils/resUtil";
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
    readonly miniSize: IPosition45Obj;
    readonly blocks: ViewblockService;
    readonly world: WorldService;
    readonly map?: Map;
    readonly enableEdit: boolean;
    readonly sceneType: op_def.SceneTypeEnum;

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

    transformToMini45(p: Pos): Pos;

    transformToMini90(p: Pos): Pos;

    addBlockObject(object: IBlockObject);

    removeBlockObject(object: IBlockObject);

    updateBlockObject(object: IBlockObject);

    addToGround(element: ElementDisplay | ElementDisplay[], index?: number);

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
    protected mWallManager: WallManager;
    protected mLayManager: LayerManager;
    protected mScene: Phaser.Scene | undefined;
    protected mSize: IPosition45Obj;
    protected mMiniSize: IPosition45Obj;
    protected mCameraService: ICameraService;
    protected mBlocks: ViewblockService;
    protected mEnableEdit: boolean = false;
    protected mScaleRatio: number;
    protected mBackgrounds: BackgroundManager[];
    private readonly moveStyle: op_def.MoveStyle;
    private mActorData: IActor;
    private mFallEffectContainer: FallEffectContainer;
    constructor(protected manager: IRoomManager) {
        super();
        this.mWorld = this.manager.world;
        this.moveStyle = this.mWorld.moveStyle;
        this.mScaleRatio = this.mWorld.scaleRatio;
        if (this.mWorld) {
            if (this.connection) {
                this.connection.addPacketListener(this);
                this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_ENABLE_EDIT_MODE, this.onEnableEditModeHandler);
                this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_UNWALKABLE_BIT_MAP, this.onShowMapTitle);
                this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_MOVE_SPRITE_BY_PATH, this.onMovePathHandler);
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

        this.mMiniSize = {
            cols: data.cols * 2,
            rows: data.rows * 2,
            tileWidth: data.tileWidth / 2,
            tileHeight: data.tileHeight / 2
        };
        this.mMap = new Map(this.mWorld);
        this.mMap.setMapInfo(data);
        if (!this.mWorld.game.scene.getScene(LoadingScene.name))
            this.mWorld.game.scene.add(LoadingScene.name, LoadingScene);
        this.mWorld.game.scene.start(LoadingScene.name, {
            world: this.world,
            room: this
        });

        this.mCameraService = new CamerasManager(this);
    }

    public onFullPacketReceived(sprite_t: op_def.NodeType): void {
        if (sprite_t !== op_def.NodeType.TerrainNodeType) {
            return;
        }
    }

    public onClockReady(): void {
        // TODO: Unload loading-scene
    }

    public startLoad() { }

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
        this.mWallManager = new WallManager(this);
        this.mBlocks = new ViewblockManager(this.mCameraService);
        this.mLayManager = new LayerManager(this);
        if (this.scene) {
            const camera = this.scene.cameras.main;
            this.mCameraService.camera = camera;
            this.mCameraService.setBounds(-camera.width >> 1, -camera.height >> 1, this.mSize.sceneWidth * this.mScaleRatio + camera.width, this.mSize.sceneHeight * this.mScaleRatio + camera.height);
            // init block
            this.mBlocks.int(this.mSize);

            if (this.mWorld.moveStyle !== op_def.MoveStyle.DIRECTION_MOVE_STYLE) {
                this.mFallEffectContainer = new FallEffectContainer(this.mScene, this);
            }
        }
        this.mPlayerManager.createActor(new PlayerModel(this.mActorData));
        const loadingScene: LoadingScene = this.mWorld.game.scene.getScene(LoadingScene.name) as LoadingScene;
        this.world.emitter.on(MessageType.PRESS_ELEMENT, this.onPressElementHandler, this);
        if (loadingScene) loadingScene.sleep();
        this.world.changeRoom(this);
        if (this.world.uiManager) this.world.uiManager.showMainUI();

        if (this.connection) {
            this.cameraService.syncCamera();
            this.connection.send(new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_SCENE_CREATED));
        }

        this.scene.input.on("pointerdown", this.onPointerDownHandler, this);
        this.scene.input.on("pointerup", this.onPointerUpHandler, this);
        this.world.emitter.on("Tap", this.onTapHandler, this);

        // if (this.mWorld.getConfig().game_id === "5e719a0a68196e416ecf7aad") {
        //     this.mBackgrounds = [];
        //     this.mBackgrounds.push(new BackgroundManager(this, "close", this.mCameraService));
        //     // const close = new BackgroundManager(this, "close", this.mCameraService);
        // }
        if (this.mWorld.getConfig().game_id === "5e719a0a68196e416ecf7aad") {
            this.mBackgrounds = [];
            if (this.id === 926312429) {
                this.mBackgrounds.push(new BackgroundManager(this, "close", {
                    key: "skybox/mine/mine",
                    width: 1120,
                    height: 684
                }, this.mCameraService));
            } else {
                this.mBackgrounds.push(new BackgroundManager(this, "close", {
                    key: "skybox/bh/bh",
                    width: 3400,
                    height: 1900,
                    gridW: 256,
                    gridH: 256
                }, this.mCameraService));
            }
            // const close = new BackgroundManager(this, "close", this.mCameraService);
        }
        const list = ["forestBgm1.mp3", "mineBgm1.mp3", "fisheryBgm1.mp3", "generalBgm1.mp3"];
        this.world.playSound({
            urls: "https://osd.tooqing.com/b4368e3b7aea51d106044127f9cae95e",
            field: SoundField.Element,
            soundConfig: { loop: true }
        });

        import(/*  */ "../module/template/main.js").then(({Template}) => {
            const tmp = new Template();
            tmp.init(this.world);
        //   Logger.getInstance().log("module: ", Template);
        });
    }

    public pause() {
        if (this.mScene) this.mScene.scene.pause();
        if (this.mWorld && this.mWorld.inputManager) this.mWorld.inputManager.enable = false;
    }

    public resume(name: string) {
        if (this.mScene) this.mScene.scene.resume(name);
        if (this.mWorld && this.mWorld.inputManager) this.mWorld.inputManager.enable = true;
        // this.mClock.sync(-1);
    }

    public addActor(data: IActor): void {
        this.mActorData = data;
    }

    public addBlockObject(object: IBlockObject) {
        if (this.blocks) {
            this.blocks.add(object);
        }
    }

    public removeBlockObject(object: IBlockObject) {
        if (this.blocks) {
            this.blocks.remove(object);
        }
    }

    public updateBlockObject(object: IBlockObject) {
        if (this.blocks) {
            this.blocks.check(object);
        }
    }

    public addToGround(element: ElementDisplay | ElementDisplay[], index?: number) {
        this.layerManager.addToGround(element, index);
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

    public transformToMini90(p: Pos) {
        if (!this.mMiniSize) {
            return;
        }
        return Position45.transformTo90(p, this.miniSize);
    }

    public transformToMini45(p: Pos) {
        if (!this.mMiniSize) {
            return;
        }
        return Position45.transformTo45(p, this.mMiniSize);
    }

    public addMouseListen() {
        this.layerManager.addMouseListen();
    }

    public moveable(pos: Pos): boolean {
        const pos45 = this.transformToMini45(pos);
        const map = this.mElementManager.map;
        if (pos45.x < 0 || pos45.x > map.length || pos45.y < 0 || pos45.y > map[0].length) {
            return false;
        }
        if (map[pos45.y][pos45.x] === 0) {
            return false;
        }
        return true;
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
        this.world.emitter.off("Tap", this.onTapHandler, this);
        if (this.connection) this.connection.removePacketListener(this);
        this.mWorld.game.scene.remove(PlayScene.name);
        this.world.emitter.off(MessageType.PRESS_ELEMENT, this.onPressElementHandler, this);
        if (this.mBackgrounds) {
            for (const background of this.mBackgrounds) {
                background.destroy();
            }
        }
        // if (this.mScene) {
        //   this.mScene = null;
        // }
    }

    protected onPointerDownHandler(pointer: Phaser.Input.Pointer) {
        this.addPointerMoveHandler();
    }

    protected onPointerUpHandler(pointer: Phaser.Input.Pointer) {
        this.removePointerMoveHandler();
    }

    protected addPointerMoveHandler() {
        this.mScene.input.on("pointermove", this.onPointerMoveHandler, this);
        this.mScene.input.on("gameout", this.onGameOutHandler, this);
    }

    protected removePointerMoveHandler() {
        this.mScene.input.off("pointermove", this.onPointerMoveHandler, this);
        this.mScene.input.off("gameout", this.onGameOutHandler, this);
        if (this.cameraService.moving) {
            this.cameraService.syncCameraScroll();
            this.cameraService.moving = false;
        }
    }

    protected onPointerMoveHandler(pointer: Phaser.Input.Pointer) {
        if (!this.mCameraService.targetFollow) {
            this.cameraService.offsetScroll(pointer.prevPosition.x - pointer.position.x, pointer.prevPosition.y - pointer.position.y);
        }
    }

    protected onGameOutHandler() {
        this.removePointerMoveHandler();
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

    get miniSize(): IPosition45Obj | undefined {
        return this.mMiniSize;
    }

    get blocks(): ViewblockService {
        return this.mBlocks;
    }

    get world(): WorldService | undefined {
        return this.mWorld;
    }

    get enableEdit() {
        return this.mEnableEdit;
    }

    get connection(): ConnectionService | undefined {
        if (this.manager) {
            return this.manager.connection;
        }
    }

    get sceneType(): op_def.SceneTypeEnum {
        return op_def.SceneTypeEnum.NORMAL_SCENE_TYPE;
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
        // if (this.world) {
        //     this.world.emitter.emit(MessageType.ADD_ICON_TO_TOP, {
        //         key: "Turn_Btn_Top",
        //         name: "EnterDecorate",
        //         bgResKey: "baseView",
        //         bgTextures: ["btnGroup_yellow_normal.png", "btnGroup_yellow_light.png", "btnGroup_yellow_select.png"],
        //         iconResKey: "",
        //         iconTexture: "btnGroup_top_expand.png",
        //         pngUrl: "ui/baseView/mainui_mobile.png", jsonUrl: "ui/baseView/mainui_mobile.json",
        //         scale: 1
        //     });
        // }
    }

    private onShowMapTitle(packet: PBpacket) {
        if (!this.scene) {
            return;
        }
        const content: op_client.IOP_VIRTUAL_WORLD_REQ_CLIENT_UNWALKABLE_BIT_MAP = packet.content;
        const area = new ReferenceArea(this.scene, this);
        const num = [];
        const intArray: op_def.IIntArray[] = content.intArray;
        for (let i = 0; i < intArray.length; i++) {
            num[i] = [];
            for (let j = 0; j < intArray[i].value.length; j++) {
                num[i][j] = intArray[i].value[j];
            }
            // num[i] = intArray[i];
        }
        area.draw(num, new Phaser.Geom.Point(0, 0));
        area.setAlpha(0.1);
        if (area.size) {
            area.setPosition(area.size.sceneWidth / 2, 0);
            this.mLayManager.addToMiddle(area);
        }
    }

    private addFillEffect(pos: IPoint, status: op_def.PathReachableStatus) {
        if (!this.scene) {
            Logger.getInstance().log("Room scene  does not exist");
            return;
        }
        const fall = new FallEffect(this.scene, this.mScaleRatio);
        fall.show(status);
        fall.setPosition(pos.x * this.mScaleRatio, pos.y * this.mScaleRatio);
        this.addToSceneUI(fall);
        // test
        // const content = new op_client.OP_VIRTUAL_WORLD_REQ_CLIENT_SHOW_INTERACTIVE_BUBBLE();
        // content.duration = 2000;
        // this.playerManager.actor.showInteractionBubble(content);
    }

    private onMovePathHandler(packet: PBpacket) {
        const content: op_client.IOP_VIRTUAL_WORLD_REQ_CLIENT_MOVE_SPRITE_BY_PATH = packet.content;
        const status = content.pathStatus;
        if (!status) {
            return;
        }
        const pos = content.targetPos;
        this.addFillEffect({ x: pos.x, y: pos.y }, status);
    }

    private move(x: number, y: number, gameObject: Phaser.GameObjects.GameObject) {
        if (this.moveStyle !== op_def.MoveStyle.PATH_MOVE_STYLE) {
            return;
        }
        if (!this.mPlayerManager) {
            return;
        }
        const actor = this.mPlayerManager.actor;
        if (!actor) {
            return;
        }
        const pos45 = actor.getPosition45();
        const click45 = this.transformTo45(new Pos(x, y));
        if (Math.abs(pos45.x - click45.x) > 20 || Math.abs(pos45.y - click45.y) > 20) {
            this.addFillEffect({ x, y }, op_def.PathReachableStatus.PATH_UNREACHABLE_AREA);
            return;
        }

        const pkt: PBpacket = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_MOVE_TO_TARGET_BY_PATH);
        const content: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_MOVE_TO_TARGET_BY_PATH = pkt.content;
        // const pkt: PBpacket = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_MOUSE_EVENT);
        // const content: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_MOUSE_EVENT = pkt.content;

        if (gameObject) {
            const displsy = gameObject.parentContainer;
            if (displsy && displsy instanceof DisplayObject) {
                const ele = displsy.element;
                if (ele && ele.model) {
                    content.id = ele.model.id;
                    content.nodeType = ele.model.nodeType;
                }
            }
        }
        // content.mouseEvent = [9];
        content.point3f = { x, y };
        this.connection.send(pkt);

        this.tryMove();
    }

    private tryMove() {
        const player = this.mPlayerManager.actor;
        if (!player) {
            return;
        }
        const moveData = player.moveData;
        const pos = moveData.posPath;
        if (!pos || pos.length < 0) {
            return;
        }

        const step = moveData.step;
        if (step >= pos.length) {
            return;
        }

        const playerPosition = player.getPosition();
        const position = op_def.PBPoint3f.create();
        position.x = playerPosition.x;
        position.y = playerPosition.y;

        const nextPosition = op_def.PBPoint3f.create();
        nextPosition.x = pos[step].x;
        nextPosition.y = pos[step].y;

        const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_CHECK_MOVE_PATH_NEXT_POINT);
        const conten: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_CHECK_MOVE_PATH_NEXT_POINT = packet.content;
        conten.timestemp = this.now();
        conten.position = position;
        conten.nextPoint = nextPosition;
        this.connection.send(packet);
    }

    // Move through the location returned by the server
    private onTapHandler(pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.GameObject) {
        this.move(pointer.worldX / this.mScaleRatio, pointer.worldY / this.mScaleRatio, gameObject);
    }

    private enterRoom() {
        this.mWorld.game.scene.run(PlayScene.name, {
            room: this
        });
    }
}
