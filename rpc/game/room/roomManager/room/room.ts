import { op_client, op_def, op_virtual_world } from "pixelpai_proto";
import IActor = op_client.IActor;
import { PacketHandler, PBpacket } from "net-socket-packet";
import { IPoint } from "game-capsule";
import { PlayerManager } from "../../displayManager/playerManager/player/player.manager";
import { ElementManager } from "../../displayManager/elementManager/element/element.manager";
import { IPosition45Obj, Position45 } from "../../../../utils/position45";
import { IPos, LogicPos } from "../../../../utils/logic.pos";
import { IBlockObject } from "../../blockManager/block/iblock.object";
import { IElement } from "../../displayManager/elementManager/element/element";
import { IRoomManager } from "../room.manager";
import { IScenery } from "../../skyboxManager/scenery";
import { Logger } from "../../../../utils/log";
import { ConnectionService } from "../../../../../lib/net/connection.service";
import { Game } from "../../../game";
import { ClockReadyListener } from "../../../loop/clock/clock";
import { State } from "../../state/state.group";
import { GroupManager } from "../../../../pica/groupManager/group.manager";
import { HandlerManager } from "../../../../pica/handlerManager/handler.manager";
import { EffectManager } from "../../effectManager/effect.manager";
export interface SpriteAddCompletedListener {
    onFullPacketReceived(sprite_t: op_def.NodeType): void;
}

export interface IRoomService {
    readonly id: number;
    // readonly terrainManager: TerrainManager;
    readonly elementManager: ElementManager;
    readonly playerManager: PlayerManager;
    // readonly layerManager: LayerManager;
    readonly effectManager: EffectManager;
    readonly handlerManager: HandlerManager;
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
    protected mWallManager: WallManager;
    protected mLayManager: LayerManager;
    protected mGroupManager: GroupManager;
    protected mHandlerManager: HandlerManager;
    protected mSkyboxManager: SkyBoxManager;
    protected mEffectManager: EffectManager;
    protected mSize: IPosition45Obj;
    protected mMiniSize: IPosition45Obj;
    // protected mCameraService: ICameraService;
    protected mBlocks: ViewblockService;
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
        this.mGame.showLoading();
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
            ele = this.elementManager.get(id);
        }
        return ele;
    }

    public update(time: number, delta: number) {
        this.updateClock(time, delta);
        this.mBlocks.update(time, delta);
        if (this.layerManager) this.layerManager.update(time, delta);
        if (this.elementManager) this.elementManager.update(time, delta);
        if (this.mHandlerManager) this.handlerManager.update(time, delta);
        if (this.mGame.httpClock) this.mGame.httpClock.update(time, delta);
        const eles = this.elementManager.getElements();
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
        let w = this.mSize.sceneWidth;
        let h = this.mSize.sceneHeight;
        const blocks = this.mSkyboxManager.scenery;
        for (const block of blocks) {
            if (block.scenery) {
                if (block.scenery.width > w) {
                    w = block.scenery.width;
                }
                if (block.scenery.height > h) {
                    h = block.scenery.height;
                }
            }
        }
        return { width: w, height: h };
    }

    public setState(states: op_def.IState[]) {
        if (!this.mStateMap) this.mStateMap = new Map();
        let state: State;
        for (const sta of states) {
            switch (sta.execCode) {
                case op_def.ExecCode.EXEC_CODE_ADD:
                case op_def.ExecCode.EXEC_CODE_UPDATE:
                    state = new State(sta);
                    this.mStateMap.set(sta.name, new State(sta));
                    this.handlerState(state);
                    break;
                case op_def.ExecCode.EXEC_CODE_DELETE:
                    this.mStateMap.delete(sta.name);
                    break;
            }
        }
    }

    public initUI() {
        if (this.game.uiManager) this.game.uiManager.showMainUI();
    }

    public clear() {
        if (this.mLayManager) this.mLayManager.destroy();
        if (this.mTerrainManager) this.mTerrainManager.destroy();
        if (this.mElementManager) this.mElementManager.destroy();
        if (this.mPlayerManager) this.mPlayerManager.destroy();
        if (this.mBlocks) this.mBlocks.destroy();
        if (this.mSkyboxManager) this.mSkyboxManager.destroy();
        if (this.mWallManager) this.mWallManager.destroy();
        if (this.mActorData) {
            this.mActorData = null;
        }
        if (this.mStateMap) this.mStateMap = null;
        this.mGame.peer.render.clearGame();
        if (this.mEffectManager) this.mEffectManager.destroy();
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
                this.addSkyBox(scenery);
            }
        }
    }

    protected addSkyBox(scenery: IScenery) {
        this.mSkyboxManager.add(scenery);
    }

    protected handlerState(state: State) {
        switch (state.name) {
            case "skyBoxAnimation":
                this.mSkyboxManager.setState(state);
                break;
            case "setCameraBounds":
                const bounds = state.packet;
                if (!bounds || !bounds.width || !bounds.height) {
                    Logger.getInstance().log("setCameraBounds error", bounds);
                    return;
                }
                let { x, y, width, height } = bounds;
                if (x === null || y === null) {
                    x = (this.mSize.sceneWidth - width) * 0.5;
                    y = (this.mSize.sceneHeight - height) * 0.5;
                }
                x *= this.mScaleRatio;
                y *= this.mScaleRatio;
                width *= this.mScaleRatio;
                height *= this.mScaleRatio;
                this.mGame.setCameraBounds(x, y, width, height);
                break;
        }
    }

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

    get groupManager(): GroupManager {
        return this.mGroupManager || undefined;
    }

    get handlerManager(): HandlerManager {
        return this.mHandlerManager || undefined;
    }

    get cameraService(): ICameraService {
        return this.mCameraService || undefined;
    }

    get effectManager(): EffectManager {
        return this.mEffectManager;
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
        if (target) {
            if (this.mCameraService) this.mCameraService.startFollow(target.getDisplay());
        } else {
            if (this.mCameraService) this.mCameraService.stopFollow();
        }
    }

    private onSyncStateHandler(packet: PBpacket) {
        const content: op_client.IOP_VIRTUAL_WORLD_REQ_CLIENT_SYNC_STATE = packet.content;
        const group = content.stateGroup;
        for (const states of group) {
            switch (states.owner.type) {
                case op_def.NodeType.SceneNodeType:
                    this.setState(states.state);
                    break;
                case op_def.NodeType.ElementNodeType:
                    this.elementManager.setState(states);
                    break;
            }
        }
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
        const click45 = this.transformTo45(new LogicPos(x, y));
        if (Math.abs(pos45.x - click45.x) > 20 || Math.abs(pos45.y - click45.y) > 20) {
            this.addFillEffect({ x, y }, op_def.PathReachableStatus.PATH_UNREACHABLE_AREA);
            return;
        }

        const pkt: PBpacket = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_MOVE_TO_TARGET_BY_PATH);
        const content: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_MOVE_TO_TARGET_BY_PATH = pkt.content;
        // const pkt: PBpacket = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_MOUSE_EVENT);
        // const content: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_MOUSE_EVENT = pkt.content;

        if (gameObject) {
            const displsy = gameObject.parentContainer.parentContainer || gameObject.parentContainer;
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

        const step = moveData.step || 0;
        if (step >= pos.length) {
            return;
        }

        const playerPosition = player.getPosition();
        const position = op_def.PBPoint3f.create();
        position.x = playerPosition.x;
        position.y = playerPosition.y;

        if (pos[step] === undefined) {
            Logger.getInstance().log("move error", pos, step);
        }
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
}
