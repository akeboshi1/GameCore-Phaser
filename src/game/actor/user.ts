import { op_def, op_client, op_gameconfig, op_virtual_world } from "pixelpai_proto";
import { PBpacket } from "net-socket-packet";
import { Game } from "../game";
import { Player } from "../room/player/player";
import { IRoomService } from "../room/room/room";
import { PlayerModel } from "../room/player/player.model";
import { i18n, IPos, Logger } from "utils";
import { UserDataManager } from "./data/user.dataManager";
import { AvatarSuitType, EventType, IDragonbonesModel, IFramesModel, PlayerState, ISprite, ModuleName } from "structure";
import { LayerEnum } from "game-capsule";
// import * as _ from "lodash";

export class User extends Player {
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
    constructor(private game: Game) {
        super(undefined, undefined);
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
        if (!room || !actor) {
            return;
        }
        this.mId = actor.id;
        this.mRoomService = room;
        this.mElementManager = room.playerManager;
        this.game.peer.physicalPeer.createMatterUserObject(this.id);
        if (this.game.avatarType === op_def.AvatarStyle.SuitType) {
            if (!AvatarSuitType.hasAvatarSuit(actor["attrs"])) {
                if (!actor.avatar) actor.avatar = <any>(AvatarSuitType.createBaseAvatar());
            }
        }
        this.model = new PlayerModel(actor);
        this.mRoomService.playerManager.setMe(this);
        // todo render setScroll
        Logger.getInstance().debug("setCameraScroller");
        this.game.renderPeer.setCameraScroller(actor.x, actor.y);
    }

    update() {
    }

    public unmount(targetPos?: IPos): Promise<this> {
        const mountID = this.mRootMount.id;
        this.mRootMount = null;
        this.unmountSprite(mountID, targetPos);
        return Promise.resolve(this);
    }

    public syncPosition(targetPoint: any) {
        const target = op_def.PBPoint3f.create();
        target.x = targetPoint.path[0].x / this.game.scaleRatio;
        target.y = targetPoint.path[0].y / this.game.scaleRatio;

        const userPos = this.getPosition();
        const pos = op_def.PBPoint3f.create();
        pos.x = userPos.x;
        pos.y = userPos.y;

        const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_MOVE_SELF);
        const content: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_MOVE_SELF = packet.content;
        content.goal = target;
        content.position = pos;
        content.targetId = targetPoint.targetId;
        this.game.connection.send(packet);
    }

    public startMove() {
        this.changeState(PlayerState.WALK);
        this.mMoving = true;
    }

    public stopMove() {
        this.changeState(PlayerState.IDLE);
        this.mMoving = false;
        if (this.mRoomService && this.mRoomService.game.moveStyle === op_def.MoveStyle.DIRECTION_MOVE_STYLE) {
            const pkt: PBpacket = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_STOP_SPRITE);
            const ct: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_STOP_SPRITE = pkt.content;
            ct.nodeType = this.nodeType;
            const pos = this.getPosition();
            ct.spritePositions = {
                id: this.id,
                point3f: {
                    x: pos.x,
                    y: pos.y,
                    z: pos.z,
                },
                direction: this.dir
            };
            this.mElementManager.connection.send(pkt);
        }
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

    public tryStopMove(data: { targetId: number, needBroadcast?: boolean, interactiveBoo: boolean, stopPos?: IPos }) {
        this.stopMove();
        if (data.stopPos) {
            this.setPosition(data.stopPos);
        }
        const pos = this.getPosition();
        const position = op_def.PBPoint3f.create();
        position.x = pos.x;
        position.y = pos.y;
        position.z = pos.z;
        const packet: PBpacket = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_STOP_SELF);
        const content: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_STOP_SELF = packet.content;
        content.position = position;
        this.game.connection.send(packet);
        Logger.getInstance().debug("send stop move==========>>>", pos);
        if (data.interactiveBoo) {
            this.activeSprite(data.targetId, undefined, data.needBroadcast);
            // this.game.emitter.emit(EventType.SCENE_INTERACTION_ELEMENT, data.targetId, this.id);
        }
    }

    public tryActiveAction(targetId: number, param?: any, needBroadcast?: boolean) {
        this.activeSprite(targetId, param, needBroadcast);
        this.game.emitter.emit(EventType.SCENE_PLAYER_ACTION, this.game.user.id, param);
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

    public setPosition(pos: IPos) {
        super.setPosition(pos);
        const now = new Date().getTime();
        if (now - this.mSetPostionTime > 1000) {
            this.mSetPostionTime = now;
            this.syncCameraPosition();
        }
    }

    protected async activeSprite(targetId: number, param?: any, needBroadcast?: boolean) {
        if (!targetId) {
            this.mPreTargetID = 0;
            return;
        }
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
        this.game.peer.physicalPeer.addBody(this.id, false);
    }

    protected syncCameraPosition() {
        this.roomService.cameraService.syncCameraScroll();
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
            const obj = { id: val.id, pos: val.pos, alpha: val.alpha, titleMask: val.titleMask | 0x00010000 };
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
            this.game.physicalPeer.setModel(obj1);
            this.setPosition(this.mModel.pos);
        }
        // todo change display alpha
        Logger.getInstance().debug("showNickname===use", this.mModel.direction);
        if (this.mModel.nickname) this.showNickname();
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
}
