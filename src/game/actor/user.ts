import { op_def, op_client, op_gameconfig, op_virtual_world } from "pixelpai_proto";
import { PBpacket } from "net-socket-packet";
import { Game } from "../game";
import { Player } from "../room/player/player";
import { IRoomService } from "../room/room/room";
import { PlayerModel } from "../room/player/player.model";
import { IPos, Logger, LogicPos, ResUtils, Url } from "utils";
import { UserDataManager } from "./data/user.dataManager";
import { AvatarSuitType, EventType, IDragonbonesModel, IFramesModel, PlayerState, ISprite, ModuleName, SceneName } from "structure";
import { LayerEnum } from "game-capsule";
import { interval, MoveControll } from "gamecore";
import { Tool } from "utils";
// import * as _ from "lodash";

export class User extends Player {
    public stopBoxMove: boolean = false;
    private mDebugPoint: boolean = false;
    private mUserData: UserDataManager;
    private mMoveStyle: number;
    // private mTargetPoint: IMoveTarget;
    private mSyncTime: number = 0;
    private mSyncDirty: boolean = false;
    private mInputMask: number;
    private mSetPostionTime: number = 0;
    private mPreTargetID: number = 0;
    private holdTime: number = 0;
    private holdDelay: number = 80;
    constructor(game: Game) {
        super(game, undefined, undefined);
        this.mBlockable = false;
        this.mUserData = new UserDataManager(game);
    }

    public set debugPoint(val: boolean) {
        this.mDebugPoint = val;
    }

    public get debugPoint(): boolean {
        return this.mDebugPoint;
    }

    public load(displayInfo: IFramesModel | IDragonbonesModel, isUser: boolean = false): Promise<any> {
        return super.load(displayInfo, true);
    }

    addPackListener() {
        this.mUserData.addPackListener();
    }

    removePackListener() {
        this.mUserData.removePackListener();
    }

    enterScene(room: IRoomService, actor: op_client.IActor) {
        Logger.getInstance().debug("enterScene");
        if (this.moveControll) {
            this.moveControll.destroy();
            this.moveControll = null;
        }
        if (!room || !actor) {
            return;
        }
        this.mId = actor.id;
        this.mRoomService = room;
        this.mElementManager = room.playerManager;
        if (this.game.avatarType === op_def.AvatarStyle.SuitType) {
            if (!AvatarSuitType.hasAvatarSuit(actor["attrs"])) {
                if (!actor.avatar) actor.avatar = <any>(AvatarSuitType.createBaseAvatar());
            }
        }
        this.moveControll = new MoveControll(actor.id, this.mRoomService.collsionManager);
        this.model = new PlayerModel(actor);
        this.mRoomService.playerManager.setMe(this);
        // todo render setScroll
        Logger.getInstance().debug("setCameraScroller");
        this.game.renderPeer.setCameraScroller(actor.x, actor.y);
    }

    update(time?: number, delta?: number) {
        if (this.mMoving === false) return;
        this._doMove(time, delta);
        this.mDirty = false;
        this.mRoomService.cameraService.syncDirty = true;
        const now = Date.now();
        this.mMoveSyncTime += delta;
        if (this.mMoveSyncTime >= this.mMoveSyncDelay) {
            this.mMoveSyncTime = 0;
            this.syncPosition();
        }
        if (!this.mMovePoints || this.mMovePoints.length < 1) {
            this.mMoveTime = now;
            return;
        }
        if (now - this.mMoveTime > this.mMoveDelayTime) {
            const movePath = op_def.MovePath.create();
            movePath.id = this.id;
            movePath.movePos = this.mMovePoints;
            const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_MOVE_SPRITE);
            const content: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_MOVE_SPRITE = packet.content;
            content.movePath = movePath;
            this.game.connection.send(packet);
            this.mMovePoints.length = 0;
            this.mMovePoints = [];
            this.mMoveTime = now;
        }
    }

    public async findPath(targets: IPos[], targetId?: number, toReverse: boolean = false) {
        if (!targets) {
            return;
        }
        if (this.mRootMount) {
            await this.mRootMount.removeMount(this, targets[0]);
        }

        const pos = this.mModel.pos;
        const miniSize = this.roomService.miniSize;
        for (const target of targets) {
            // findPath坐标转换后存在误差
            if (Tool.twoPointDistance(target, pos) <= miniSize.tileWidth / 2) {
                this.mMoveData = { targetId };
                this.stopMove();
                return;
            }
        }
        const findResult = this.roomService.findPath(pos, targets, toReverse);
        if (!findResult) {
            return;
        }
        const firstPos = targets[0];
        if (findResult.length < 1) {
            this.addFillEffect({ x: firstPos.x, y: firstPos.y }, op_def.PathReachableStatus.PATH_UNREACHABLE_AREA);
            return;
        }
        // this.matterWorld.setSensor(this.body, true);
        const path = [];
        for (const p of findResult) {
            path.push({ pos: p });
        }
        this.mMoveData = { path, targetId };
        this.addFillEffect({ x: firstPos.x, y: firstPos.y }, op_def.PathReachableStatus.PATH_REACHABLE_AREA);
        this.moveControll.setIgnoreCollsion(true);
        this.startMove();
        this.checkDirection();
    }

    moveMotion(x: number, y: number) {
        if (this.mRootMount) {
            this.mRootMount.removeMount(this, { x, y });
        }
        this.mMoveData = { path: [{ pos: new LogicPos(x, y) }] };
        this.mSyncDirty = true;
        // this.body.isSensor = false;
        this.moveControll.setIgnoreCollsion(false);
        this.startMove();
    }

    public unmount(targetPos?: IPos): Promise<this> {
        const mountID = this.mRootMount.id;
        this.mRootMount = null;
        this.addBody();
        this.unmountSprite(mountID, targetPos);
        return Promise.resolve(this);
    }

    public syncPosition() {
        const userPos = this.getPosition();
        const pos = op_def.PBPoint3f.create();
        pos.x = userPos.x;
        pos.y = userPos.y;
        const movePoint = op_def.MovePoint.create();
        movePoint.pos = pos;
        // 给每个同步点时间戳
        movePoint.timestamp = Date.now();
        if (!this.mMovePoints) this.mMovePoints = [];
        this.mMovePoints.push(movePoint);
    }

    public startMove() {
        const path = this.mMoveData.path;
        if (path.length < 1) {
            return;
        }
        this.changeState(PlayerState.WALK);
        this.mMoving = true;

        const pos = this.getPosition();
        const angle = Math.atan2((path[0].pos.y - pos.y), (path[0].pos.x - pos.x));
        const speed = this.mModel.speed * interval;
        this.moveControll.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
    }

    public stopMove(stopPos?: IPos) {
        if (!this.mMovePoints) this.mMovePoints = [];
        this.changeState(PlayerState.IDLE);
        this.moveControll.setVelocity(0, 0);
        this.mMoving = false;
        const pos = stopPos ? stopPos : this.mModel.pos;
        const position = op_def.PBPoint3f.create();
        position.x = pos.x;
        position.y = pos.y;
        const pkt: PBpacket = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_STOP_SELF);
        const ct: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_STOP_SELF = pkt.content;
        ct.position = pos;
        // ct.movePath = movePath;
        this.mElementManager.connection.send(pkt);
        this.mMovePoints = [];

        this.stopActiveSprite();
    }

    public move(moveData: any) {
        if (!this.mDebugPoint) {
            this.mRoomService.game.renderPeer.hideServerPosition();
            return;
        }
        this.mRoomService.game.renderPeer.drawServerPosition(moveData[0].x, moveData[0].y);
    }

    public setQueue(animations: op_client.IChangeAnimation[]) {
        if (this.mMoving) {
            return;
        }
        super.setQueue(animations);
    }

    public requestPushBox(targetId: number) {
        const pkt: PBpacket = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_UPDATE_CLIENT_HIT_SPRITE);
        const ct: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_UPDATE_CLIENT_HIT_SPRITE = pkt.content;
        ct.targetId = targetId;
        ct.timestamp = new Date().getTime();
        ct.dir = this.mModel.direction;
        this.mElementManager.connection.send(pkt);
    }

    // override super's method.
    public setRenderable(isRenderable: boolean): Promise<any> {
        // do nothing!
        // Actor is always renderable!!!
        return Promise.resolve();
    }

    public clear() {
        this.holdTime = 0;
        this.removePackListener();
        super.clear();
        if (this.mUserData) this.userData.destroy();
        this.destroy();
    }

    public stopActiveSprite(pos?: IPos) {
        if (!this.mMoveData) return;
        const targetId = this.mMoveData.targetId;
        if (!targetId) {
            return;
        }
        this.mRoomService.elementManager.checkElementAction(targetId);
        const needBroadcast = this.mRoomService.elementManager.checkActionNeedBroadcast(targetId);
        this.activeSprite(targetId, undefined, needBroadcast);
        delete this.mMoveData.targetId;
    }

    public tryActiveAction(targetId: number, param?: any, needBroadcast?: boolean) {
        this.activeSprite(targetId, param, needBroadcast);
        this.game.emitter.emit(EventType.SCENE_PLAYER_ACTION, this.game.user.id, targetId, param);
    }

    public updateModel(model: op_client.IActor) {
        if (model.hasOwnProperty("inputMask")) {
            this.mInputMask = model.inputMask;
            this.game.renderPeer.updateInput(this.mInputMask);
        }
        super.updateModel(model, this.game.avatarType);
    }

    public destroy() {
        this.mSetPostionTime = 0;
        super.destroy();
    }

    public setPosition(pos: IPos, syncPos: boolean = false) {
        super.setPosition(pos);
        const now = new Date().getTime();
        if (now - this.mSetPostionTime > 1000) {
            this.mSetPostionTime = now;
            this.syncCameraPosition();
        }
        // 向服务器同步位置
        if (syncPos) {
            this.syncPosition();
            const movePath = op_def.MovePath.create();
            movePath.id = this.id;
            movePath.movePos = this.mMovePoints;
            const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_MOVE_SPRITE);
            const content: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_MOVE_SPRITE = packet.content;
            content.movePath = movePath;
            this.game.connection.send(packet);
            this.mMovePoints.length = 0;
            this.mMovePoints = [];
            this.mMoveTime = now;
        }
    }

    public async activeSprite(targetId: number, param?: any, needBroadcast?: boolean) {
        if (!targetId) {
            this.mPreTargetID = 0;
            return;
        }
        // ====== 推箱子
        const ele = this.mRoomService.getElement(targetId);
        if (ele) {
            if (ele.model && ele.model.sound) {
                const key = Url.getSound(ele.model.sound);
                this.mRoomService.game.renderPeer.playSoundByKey(key);
            }
            // this.mTarget = ele;
            // this.addMount(ele, 0);
        }
        // 有element交互事件的发送推箱子协议
        // if (ele.model && ele.model.displayInfo && ele.model.displayInfo.eventName) {
        //     this.requestPushBox(targetId);
        //     return;
        // }
        const now = new Date().getTime();
        // 防止由于网络波动导致多次点击传送点后无法收到房间信息，场景ui无法显示
        if (this.mPreTargetID === targetId) {
            if (now - this.holdTime < this.holdDelay) {
                this.holdTime = now;
                const txt = await this.game.renderPeer.i18nString("noticeTips.quickclick");
                const tempdata = {
                    text: [{ text: txt, node: undefined }]
                };
                this.game.peer.showMediator(ModuleName.PICANOTICE_NAME, true, tempdata);
                return;
            }
        }
        this.mPreTargetID = targetId;
        const packet: PBpacket = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_ACTIVE_SPRITE);
        const content: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_ACTIVE_SPRITE = packet.content;
        content.spriteId = targetId;
        content.param = param ? JSON.stringify(param) : "";
        content.needBroadcast = needBroadcast;
        this.game.connection.send(packet);
    }

    protected unmountSprite(id: number, pos: IPos) {
        const packet: PBpacket = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_UMOUNT_SPRITE);
        const content: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_UMOUNT_SPRITE = packet.content;
        if (!pos) pos = this.getPosition();
        const pos3f = op_def.PBPoint3f.create();
        pos3f.x = pos.x;
        pos3f.y = pos.y;
        pos3f.z = pos.z;
        content.pos = pos;
        content.spriteId = id;
        this.game.connection.send(packet);
    }

    protected addToBlock(): Promise<any> {
        return this.addDisplay();
    }

    protected addBody() {
        // if (this.mRootMount) return;
        this.drawBody();
    }

    protected syncCameraPosition() {
        this.roomService.cameraFollowHandler();
    }

    set model(val: ISprite) {
        if (!val) {
            return;
        }
        if (!this.mModel) {
            this.mModel = val;
        } else {
            Object.assign(this.mModel, val);
        }
        (<any>this.mModel).off("Animation_Change", this.animationChanged, this);
        (<any>this.mModel).on("Animation_Change", this.animationChanged, this);
        if (!this.mModel.layer) {
            this.mModel.layer = LayerEnum.Surface;
        }
        this.load(this.mModel.displayInfo, this.isUser);
        if (this.mModel.pos) {
            const obj = { id: val.id, pos: val.pos, nickname: this.model.nickname, alpha: val.alpha, titleMask: val.titleMask | 0x00010000, hasInteractive: true };
            this.game.renderPeer.setModel(obj);
            const obj1 = {
                id: val.id,
                point3f: val.pos,
                currentAnimationName: val.currentAnimationName,
                direction: val.direction,
                mountSprites: val.mountSprites,
                speed: val.speed,
                displayInfo: this.model.displayInfo
            };
            this.setPosition(this.mModel.pos);
        }
        // todo change display alpha
        this.setDirection(this.mModel.direction);
    }

    get model(): ISprite {
        return this.mModel;
    }

    get package(): op_gameconfig.IPackage {
        return undefined;
    }

    set package(value: op_gameconfig.IPackage) {
    }

    get userData() {
        return this.mUserData;
    }

    set moveStyle(val: number) {
        this.mMoveStyle = val;
    }

    get moveStyle() {
        return this.mMoveStyle;
    }

    private addFillEffect(pos: IPos, status: op_def.PathReachableStatus) {
        const scaleRatio = this.roomService.game.scaleRatio;
        this.roomService.game.renderPeer.addFillEffect(pos.x * scaleRatio, pos.y * scaleRatio, status);
    }
}
