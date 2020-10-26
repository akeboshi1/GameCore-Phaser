import { op_client, op_def, op_virtual_world } from "pixelpai_proto";
import IActor = op_client.IActor;
import { IPoint } from "game-capsule";
import { PacketHandler, PBpacket } from "net-socket-packet";
import { IPosition45Obj, Position45, IPos, LogicPos, Logger } from "utils";
import { Game } from "../../game";
import { IBlockObject } from "../block/iblock.object";
import { ClockReadyListener } from "../../loop/clock/clock";
import { State } from "../state/state.group";
import { IRoomManager } from "../room.manager";
import { ConnectionService } from "../../../../lib/net/connection.service";
import { EffectManager } from "../effect/effect.manager";
import { CamerasManager, ICameraService } from "../camera/cameras.manager";
import { ViewblockManager } from "../viewblock/viewblock.manager";
import { PlayerManager } from "../player/player.manager";
import { ElementManager } from "../element/element.manager";
import { IElement } from "../element/element";
import { IViewBlockManager } from "../viewblock/iviewblock.manager";
import { TerrainManager } from "../terrain/terrain.manager";
import { SkyBoxManager } from "../sky.box/sky.box.manager";
import { IScenery } from "src/structureinterface/scenery";
import { Scenery } from "../sky.box/scenery";
export interface SpriteAddCompletedListener {
    onFullPacketReceived(sprite_t: op_def.NodeType): void;
}

export interface IRoomService {
    readonly id: number;
    readonly terrainManager: TerrainManager;
    readonly elementManager: ElementManager;
    readonly playerManager: PlayerManager;
    readonly cameraService: ICameraService;
    // readonly layerManager: LayerManager;
    // readonly effectManager: EffectManager;
    // readonly handlerManager: HandlerManager;
    readonly roomSize: IPosition45Obj;
    readonly miniSize: IPosition45Obj;
    readonly game: Game;
    readonly enableEdit: boolean;
    readonly sceneType: op_def.SceneTypeEnum;

    now(): number;

    startLoad();

    enter(room: op_client.IScene): void;

    pause(): void;

    resume(name: string | string[]): void;

    transformTo45(p: IPos): IPos;

    transformTo90(p: IPos): IPos;

    transformToMini45(p: IPos): IPos;

    transformToMini90(p: IPos): IPos;

    addBlockObject(object: IBlockObject);

    removeBlockObject(object: IBlockObject);

    updateBlockObject(object: IBlockObject);

    // addToGround(element: ElementDisplay | ElementDisplay[], index?: number);

    // addToSurface(element: ElementDisplay | ElementDisplay[]);

    // addToSceneUI(element: Phaser.GameObjects.GameObject | Phaser.GameObjects.GameObject[]);

    getElement(id: number): IElement;

    update(time: number, delta: number): void;

    initUI(): void;

    destroy();
}

// 这一层管理数据和Phaser之间的逻辑衔接
// 消息处理让上层[RoomManager]处理
export class Room extends PacketHandler implements IRoomService, SpriteAddCompletedListener, ClockReadyListener {
    protected mGame: Game;
    // protected mMap: Map;
    protected mID: number;
    protected mTerrainManager: TerrainManager;
    protected mElementManager: ElementManager;
    protected mPlayerManager: PlayerManager;
    // protected mWallManager: WallManager;
    // protected mLayManager: LayerManager;
    // protected mGroupManager: GroupManager;
    // protected mHandlerManager: HandlerManager;
    protected mSkyboxManager: SkyBoxManager;
    // protected mEffectManager: EffectManager;
    protected mSize: IPosition45Obj;
    protected mMiniSize: IPosition45Obj;
    protected mCameraService: ICameraService;
    protected mBlocks: IViewBlockManager;
    protected mEnableEdit: boolean = false;
    protected mScaleRatio: number;
    protected mStateMap: Map<string, State>;
    private readonly moveStyle: op_def.MoveStyle;
    private mActorData: IActor;
    constructor(protected manager: IRoomManager) {
        super();
        this.mGame = this.manager.game;
        this.moveStyle = this.mGame.moveStyle;
        this.mScaleRatio = this.mGame.getGameConfig().scale_ratio;
        if (this.mGame) {
            if (this.connection) {
                this.connection.addPacketListener(this);
                this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_ENABLE_EDIT_MODE, this.onEnableEditModeHandler);
                this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_UNWALKABLE_BIT_MAP, this.onShowMapTitle);
                this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_MOVE_SPRITE_BY_PATH, this.onMovePathHandler);
                this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_SET_CAMERA_FOLLOW, this.onCameraFollowHandler);
                this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_SYNC_STATE, this.onSyncStateHandler);
            }
        }
    }

    public enter(data: op_client.IScene): void {
        if (!data) {
            return;
        }
        Logger.getInstance().log("room====enter");
        this.mID = data.id;
        this.mSize = {
            cols: data.cols,
            rows: data.rows,
            tileHeight: data.tileHeight,
            tileWidth: data.tileWidth,
            sceneWidth: (data.rows + data.cols) * (data.tileWidth / 2),
            sceneHeight: (data.rows + data.cols) * (data.tileHeight / 2),
        };

        this.mMiniSize = {
            cols: data.cols * 2,
            rows: data.rows * 2,
            tileWidth: data.tileWidth / 2,
            tileHeight: data.tileHeight / 2,
        };
        // create render scene
        this.mGame.showLoading({
            "dpr": this.mScaleRatio,
            "sceneName": "PlayScene"
        });
    }

    // public completeLoad() {
    //     this.mGame.peer.render.
    //         if(this.mGame.scene.getScene(PlayScene.name)) {
    //         // const loadingScene: LoadingScene = this.mWorld.game.scene.getScene(LoadingScene.name) as LoadingScene;
    //         // if (loadingScene) loadingScene.sleep();
    //         return;
    //     }
    //     this.mGame.scene.add(PlayScene.name, PlayScene, true, {
    //         room: this,
    //     });
    // }

    public onFullPacketReceived(sprite_t: op_def.NodeType): void {
        if (sprite_t !== op_def.NodeType.TerrainNodeType) {
            return;
        }
    }

    public onClockReady(): void {
        // TODO: Unload loading-scene
    }

    public startLoad() { }

    public pause() {
        this.mGame.roomPause(this.mID);
    }

    public resume() {
        this.mGame.roomResume(this.mID);
    }

    public addActor(data: IActor): void {
        this.mActorData = data;
    }

    public addBlockObject(object: IBlockObject) {
        Logger.getInstance().log("rooms add");
        if (this.blocks) {
            this.blocks.add(object);
        }
    }

    public removeBlockObject(object: IBlockObject) {
        Logger.getInstance().log("rooms remove");
        if (this.blocks) {
            this.blocks.remove(object);
        }
    }

    public updateBlockObject(object: IBlockObject) {
        Logger.getInstance().log("rooms update");
        if (this.blocks) {
            this.blocks.check(object);
        }
    }

    public transformTo90(p: LogicPos): IPos {
        if (!this.mSize) {
            return;
        }
        return Position45.transformTo90(p, this.mSize);
    }

    public transformTo45(p: LogicPos): IPos {
        if (!this.mSize) {
            return;
        }
        return Position45.transformTo45(p, this.mSize);
    }

    public transformToMini90(p: LogicPos): IPos {
        if (!this.mMiniSize) {
            return;
        }
        return Position45.transformTo90(p, this.miniSize);
    }

    public transformToMini45(p: LogicPos): IPos {
        if (!this.mMiniSize) {
            return;
        }
        return Position45.transformTo45(p, this.mMiniSize);
    }

    public getElement(id: number): IElement {
        let ele = null;
        if (this.mPlayerManager) {
            ele = this.mPlayerManager.get(id);
        }
        if (!ele && this.mElementManager) {
            ele = this.mElementManager.get(id);
        }
        if (!ele && this.mTerrainManager) {
            ele = this.mTerrainManager.get(id);
        }
        return ele;
    }

    public update(time: number, delta: number) {
        this.updateClock(time, delta);
        this.mBlocks.update(time, delta);
        // this.mViewBlockManager.update(time, delta);
        // if (this.layerManager) this.layerManager.update(time, delta);
        if (this.mElementManager) this.mElementManager.update(time, delta);
        // if (this.mHandlerManager) this.handlerManager.update(time, delta);
        if (this.mGame.httpClock) this.mGame.httpClock.update(time, delta);
        const eles = this.mElementManager.getElements();
        for (const ele of eles) {
            ele.update();
        }
        const players = this.mPlayerManager.getElements();
        for (const player of players) {
            player.update();
        }
    }

    public updateClock(time: number, delta: number) {
        // 客户端自己通过delta来更新游戏时间戳
        if (this.mGame.clock) this.mGame.clock.update(time, delta);
    }

    public now(): number {
        return this.mGame.clock.unixTime;
    }

    public getMaxScene() {
        if (!this.mSize) {
            return;
        }
        const w = this.mSize.sceneWidth;
        const h = this.mSize.sceneHeight;
        // const blocks = this.mSkyboxManager.scenery;
        // for (const block of blocks) {
        //     if (block.scenery) {
        //         if (block.scenery.width > w) {
        //             w = block.scenery.width;
        //         }
        //         if (block.scenery.height > h) {
        //             h = block.scenery.height;
        //         }
        //     }
        // }
        return { width: w, height: h };
    }

    public startPlay() {
        // if (this.mLayManager) {
        //     this.layerManager.destroy();
        // }
        Logger.getInstance().log("roomstartPlay");
        this.mCameraService = new CamerasManager(this.mGame, this);
        // this.mScene = this.world.game.scene.getScene(PlayScene.name);
        this.mTerrainManager = new TerrainManager(this, this);
        this.mElementManager = new ElementManager(this);
        this.mPlayerManager = new PlayerManager(this);
        // this.mWallManager = new WallManager(this);
        this.mBlocks = new ViewblockManager(this.mCameraService);
        // this.mLayManager = new LayerManager(this);
        // this.mGroupManager = new GroupManager(this);
        // this.mFrameManager = new FrameManager();
        this.mSkyboxManager = new SkyBoxManager(this);
        // this.mEffectManager = new EffectManager(this);
        // if (this.scene) {
        //     const camera = this.scene.cameras.main;
        //     this.mCameraService.camera = camera;
        const padding = 199 * this.mScaleRatio;
        this.mGame.peer.render.roomstartPlay();
        this.mGame.peer.render.setCamerasBounds(-padding, -padding, this.mSize.sceneWidth * this.mScaleRatio + padding * 2, this.mSize.sceneHeight * this.mScaleRatio + padding * 2);
        //     // init block
        this.mBlocks.int(this.mSize);

        //     if (this.mWorld.moveStyle !== op_def.MoveStyle.DIRECTION_MOVE_STYLE) {
        //         this.mFallEffectContainer = new FallEffectContainer(this.mScene, this);
        //     }
        // }
        // // this.mPlayerManager.createActor(new PlayerModel(this.mActorData));
        // // this.mPlayerManager.createActor(this.mActorData);
        this.mGame.user.enterScene(this, this.mActorData);
        // const loadingScene: LoadingScene = this.mWorld.game.scene.getScene(LoadingScene.name) as LoadingScene;
        // this.world.emitter.on(MessageType.PRESS_ELEMENT, this.onPressElementHandler, this);
        // // if (loadingScene) loadingScene.sleep();
        // this.world.changeRoom(this);
        // // if (this.world.uiManager) this.world.uiManager.showMainUI();

        if (this.connection) {
            this.cameraService.syncCamera();
            this.connection.send(new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_SCENE_CREATED));
        }

        // this.scene.input.on("pointerdown", this.onPointerDownHandler, this);
        // this.scene.input.on("pointerup", this.onPointerUpHandler, this);
        // this.world.emitter.on(ClickEvent.Tap, this.onTapHandler, this);

        // this.mLoadState = [];
        // this.mWorld.showLoading(LoadingTips.loadingResources());
        // this.scene.load.on(Phaser.Loader.Events.COMPLETE, this.onLoadCompleteHandler, this);

        this.initSkyBox();
    }

    public setState(states: op_def.IState[]) {
        // if (!this.mStateMap) this.mStateMap = new Map();
        // let state: State;
        // for (const sta of states) {
        //     switch (sta.execCode) {
        //         case op_def.ExecCode.EXEC_CODE_ADD:
        //         case op_def.ExecCode.EXEC_CODE_UPDATE:
        //             state = new State(sta);
        //             this.mStateMap.set(sta.name, new State(sta));
        //             this.handlerState(state);
        //             break;
        //         case op_def.ExecCode.EXEC_CODE_DELETE:
        //             this.mStateMap.delete(sta.name);
        //             break;
        //     }
        // }
    }

    public initUI() {
        if (this.game.uiManager) this.game.uiManager.showMainUI();
    }

    public clear() {
        // if (this.mLayManager) this.mLayManager.destroy();
        if (this.mTerrainManager) this.mTerrainManager.destroy();
        if (this.mElementManager) this.mElementManager.destroy();
        if (this.mPlayerManager) this.mPlayerManager.destroy();
        if (this.mBlocks) this.mBlocks.destroy();
        // if (this.mSkyboxManager) this.mSkyboxManager.destroy();
        // if (this.mWallManager) this.mWallManager.destroy();
        if (this.mActorData) {
            this.mActorData = null;
        }
        if (this.mStateMap) this.mStateMap = null;
        this.mGame.peer.render.clearGame();
        // if (this.mEffectManager) this.mEffectManager.destroy();
    }

    public destroy() {
        this.mGame.peer.destroy();
        if (this.connection) this.connection.removePacketListener(this);
        this.clear();
        // if (this.mScene) {
        //   this.mScene = null;
        // }
    }

    protected initSkyBox() {
        const scenerys = this.game.elementStorage.getScenerys();
        if (scenerys) {
            for (const scenery of scenerys) {
                this.addSkyBox({
                    id: scenery.id,
                    uris: scenery.uris,
                    depth: scenery.depth,
                    width: scenery.width,
                    height: scenery.height,
                    speed: scenery.speed,
                    offset: scenery.offset,
                    fit: scenery.fit
                });
            }
        }
    }

    protected addSkyBox(scenery: IScenery) {
        this.mSkyboxManager.add(scenery);
    }

    // protected handlerState(state: State) {
    //     switch (state.name) {
    //         case "skyBoxAnimation":
    //             this.mSkyboxManager.setState(state);
    //             break;
    //         case "setCameraBounds":
    //             const bounds = state.packet;
    //             if (!bounds || !bounds.width || !bounds.height) {
    //                 Logger.getInstance().log("setCameraBounds error", bounds);
    //                 return;
    //             }
    //             let { x, y, width, height } = bounds;
    //             if (x === null || y === null) {
    //                 x = (this.mSize.sceneWidth - width) * 0.5;
    //                 y = (this.mSize.sceneHeight - height) * 0.5;
    //             }
    //             x *= this.mScaleRatio;
    //             y *= this.mScaleRatio;
    //             width *= this.mScaleRatio;
    //             height *= this.mScaleRatio;
    //             this.mGame.setCameraBounds(x, y, width, height);
    //             break;
    //     }
    // }

    get terrainManager(): TerrainManager {
        return this.mTerrainManager || undefined;
    }

    get elementManager(): ElementManager {
        return this.mElementManager || undefined;
    }

    get playerManager(): PlayerManager {
        return this.mPlayerManager || undefined;
    }

    // get layerManager(): LayerManager {
    //     return this.mLayManager || undefined;
    // }

    // get groupManager(): GroupManager {
    //     return this.mGroupManager || undefined;
    // }

    // get handlerManager(): HandlerManager {
    //     return this.mHandlerManager || undefined;
    // }

    get cameraService(): ICameraService {
        return this.mCameraService || undefined;
    }

    // get effectManager(): EffectManager {
    //     return this.mEffectManager;
    // }

    get id(): number {
        return this.mID;
    }

    get roomSize(): IPosition45Obj | undefined {
        return this.mSize || undefined;
    }

    get miniSize(): IPosition45Obj | undefined {
        return this.mMiniSize;
    }

    get blocks(): IViewBlockManager {
        return this.mBlocks;
    }

    get game(): Game | undefined {
        return this.mGame;
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

    private onEnableEditModeHandler(packet: PBpacket) {
        this.mEnableEdit = true;
    }

    private onShowMapTitle(packet: PBpacket) {
        // if (!this.scene) {
        //     return;
        // }
        // const content: op_client.IOP_VIRTUAL_WORLD_REQ_CLIENT_UNWALKABLE_BIT_MAP = packet.content;
        // const area = new ReferenceArea(this.scene, this);
        // const num = [];
        // const intArray: op_def.IIntArray[] = content.intArray;
        // for (let i = 0; i < intArray.length; i++) {
        //     num[i] = [];
        //     for (let j = 0; j < intArray[i].value.length; j++) {
        //         num[i][j] = intArray[i].value[j];
        //     }
        //     // num[i] = intArray[i];
        // }
        // area.draw(num, new Phaser.Geom.Point(0, 0));
        // area.setAlpha(0.1);
        // if (area.size) {
        //     area.setPosition(area.size.sceneWidth / 2, 0);
        //     this.mLayManager.addToMiddle(area);
        // }
    }

    private addFillEffect(pos: IPoint, status: op_def.PathReachableStatus) {
        // if (!this.scene) {
        //     Logger.getInstance().log("Room scene  does not exist");
        //     return;
        // }
        // const fall = new FallEffect(this.scene, this.mScaleRatio);
        // fall.show(status);
        // fall.setPosition(pos.x * this.mScaleRatio, pos.y * this.mScaleRatio);
        // this.addToSceneUI(fall);
        this.mGame.addFillEffect(pos, status);
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

    private onCameraFollowHandler(packet: PBpacket) {
        const content: op_client.IOP_VIRTUAL_WORLD_REQ_CLIENT_SET_CAMERA_FOLLOW = packet.content;
        const target = this.getElement(content.id);
        if (!this.mCameraService) return;
        if (target) {
            Logger.getInstance().log("followHandler====room");
            if (content.effect === "liner") {
                this.mCameraService.pan();
                // const position = target.getPosition();
                // this.mCameraService.pan(position.x, position.y, 300).then(() => {
                //     this.mCameraService.startFollow(target);
                // });
            } else {
                this.game.peer.render.startFollow(content.id);
            }
        } else {
            if (this.mCameraService) this.game.peer.render.stopFollow();
            // this.mCameraService.stopFollow();
        }
    }

    private onSyncStateHandler(packet: PBpacket) {
        // const content: op_client.IOP_VIRTUAL_WORLD_REQ_CLIENT_SYNC_STATE = packet.content;
        // const group = content.stateGroup;
        // for (const states of group) {
        //     switch (states.owner.type) {
        //         case op_def.NodeType.SceneNodeType:
        //             this.setState(states.state);
        //             break;
        //         case op_def.NodeType.ElementNodeType:
        //             this.elementManager.setState(states);
        //             break;
        //     }
        // }
    }
}
