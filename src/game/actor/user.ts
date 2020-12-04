import { op_def, op_client, op_gameconfig, op_virtual_world } from "pixelpai_proto";
import { PBpacket } from "net-socket-packet";
import { Game, delayTime } from "../game";
import { Player } from "../room/player/player";
import { IRoomService } from "../room/room/room";
import { PlayerModel } from "../room/player/player.model";
import { MoveData, MovePos, PlayerState } from "../room/element/element";
import { ISprite } from "../room/display/sprite/sprite";
import { Logger, LogicPoint, LogicPos, Tool } from "utils";
import { UserDataManager } from "./data/user.dataManager";
import { EventType, IDragonbonesModel, IFramesModel } from "structure";

export class User extends Player {
    private mUserData: UserDataManager;
    private mMoveStyle: number;
    private mTargetPoint: IMoveTarget;
    private mSyncTime: number = 0;
    private mSyncDirty: boolean = false;
    constructor(private game: Game) {
        super(undefined, undefined);
        this.mBlockable = false;
        this.mUserData = new UserDataManager(game);
    }

    public load(displayInfo: IFramesModel | IDragonbonesModel, isUser: boolean = false) {
        super.load(displayInfo, true);
    }

    addPackListener() {
        this.mUserData.addPackListener();
    }

    removePackListener() {
        this.mUserData.removePackListener();
    }

    enterScene(room: IRoomService, actor: op_client.IActor) {
        Logger.getInstance().log("enterScene");
        if (!room || !actor) {
            return;
        }
        this.mId = actor.id;
        this.mRoomService = room;
        this.mElementManager = room.playerManager;
        this.setMatterWorld(room.matterWorld);
        this.model = new PlayerModel(actor);

        // if (room.game.inputManager) room.game.inputManager.addListener(this);
        this.mRoomService.playerManager.setMe(this);
        // todo render setScroll
        Logger.getInstance().log("setCameraScroller");
        this.game.renderPeer.setCameraScroller(actor.x, actor.y);
    }

    // update() {
    //     if (this.mMoving) {
    //         const pos = this.getPosition();
    //         pos.y += this.offsetY;
    //         if (Math.abs(pos.x - this.mTargetPoint.x) <= this.mSpeed && Math.abs(pos.y - this.mTargetPoint.y) <= this.mSpeed) {
    //             this.stopMove();
    //             return;
    //         }
    //         // const angle = Tool.calcAngle(pos, this.mTargetPoint) * (Math.PI / 180);
    //         const angle = Math.atan2((this.mTargetPoint.y - pos.y), (this.mTargetPoint.x - pos.x));
    //         const dir = Tool.calculateDirectionByRadin(angle);
    //         this.setDirection(dir);

    //         pos.x += Math.cos(angle) * this.mSpeed;
    //         pos.y += Math.sin(angle) * this.mSpeed;
    //         this.model.setPosition(pos.x, pos.y);
    //         if (this.mRootMount) {
    //             return;
    //         }
    //         this.game.renderPeer.setPosition(this.id, pos.x, pos.y);
    //     }
    // }

    public unmount() {
        if (this.mRootMount) {
            const pos = this.mRootMount.getInteractivePosition();
            if (!pos) {
                return;
            }
            this.mRootMount = null;
            this.setPosition(pos);
            this.getInteractivePosition();
            this.enableBlock();
            this.mDirty = true;
        }
        return this;
    }

    public moveMotion(x: number, y: number, targetId?: number) {
        if (this.mRootMount) {
            this.mRootMount.removeMount(this);
        }
        this.mTargetPoint = { path: [new LogicPos(x, y)], targetId };
        this.mSyncDirty = true;
        this.matterWorld.setSensor(this.body, false);
        this.startMove();
    }

    public findPath(x: number, y: number, targetId?: number) {
        if (this.mRootMount) {
            this.mRootMount.removeMount(this);
        }
        const path = this.roomService.findPath(this.getPosition(), new LogicPos(x, y));
        if (!path) {
            return;
        }
        if (path.length < 1) {
            return;
        }
        this.matterWorld.setSensor(this.body, true);
        this.mTargetPoint = { path, targetId };
        this.startMove();
    }

    public syncPosition() {
        if (!this.mTargetPoint) {
            return;
        }
        const target = op_def.PBPoint3f.create();
        target.x = this.mTargetPoint.path[0].x;
        target.y = this.mTargetPoint.path[0].y;

        const userPos = this.getPosition();
        const pos = op_def.PBPoint3f.create();
        pos.x = userPos.x;
        pos.y = userPos.y;

        const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_MOVE_SELF);
        const content: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_MOVE_SELF = packet.content;
        content.goal = target;
        content.position = pos;
        content.targetId = this.mTargetPoint.targetId;
        this.game.connection.send(packet);
    }

    public startMove() {
        const path = this.mTargetPoint.path;
        if (path.length < 1) {
            return;
        }
        this.changeState(PlayerState.WALK);
        this.mMoving = true;
        this.setStatic(false);

        const pos = this.getPosition();
        // pos.y += this.offsetY;
        const angle = Math.atan2((path[0].y - pos.y), (path[0].x - pos.x));
        // TODO
        const speed = this.mModel.speed * delayTime;
        this.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
    }

    public stopMove() {
        super.stopMove();
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
        // this.mTargetPoint = null;
    }

    // public tryMove(targetPoint: ILogicPoint) {
    //     this.mTargetPoint = targetPoint;
    // }

    // public move(moveData: op_client.IMoveData) {
    //     // TODO 不能仅判断walk, 移动状态可能还有run
    //     if (this.mRoomService.game.moveStyle === op_def.MoveStyle.DIRECTION_MOVE_STYLE) {
    //         if (this.mCurState !== PlayerState.WALK) {
    //             return;
    //         }
    //     } else {
    //         this.startMove();
    //     }
    //     super.move(moveData);
    // }
    public move(moveData: MovePos[]) {
        // this.drawMovePath(moveData[0].x, moveData[0].y);
        this.mRoomService.game.renderPeer.drawServerPosition(moveData[0].x, moveData[0].y);
    }

    public movePath(movePath: op_client.IOP_VIRTUAL_WORLD_REQ_CLIENT_MOVE_SPRITE_BY_PATH) {
        if (this.mRoomService.game.moveStyle === op_def.MoveStyle.DIRECTION_MOVE_STYLE) {
            if (this.mCurState !== PlayerState.WALK) {
                return;
            }
        }
        // movePath.path = [{ x: 885.000000, y: 637.50000}, { x: 915.000000, y: 637.50000}, { x: 945.000000, y: 637.50000}, { x: 975.000000, y: 637.50000}, { x: 1005.00000, y: 637.50000}, { x: 1035.00000, y: 637.50000}, { x: 1065.00000, y: 637.50000}, { x: 1080.00000, y: 645.00000}, { x: 1095.00000, y: 652.50000}, { x: 1110.00000, y: 660.00000}, { x: 1125.00000, y: 667.50000}, { x: 1140.00000, y: 675.00000}, { x: 1155.00000, y: 682.50000}, { x: 1170.00000, y: 690.00000}];
        // movePath.path = [{x: 1140.00000, y: 495.000000}, {x: 1125.00000, y: 502.500000}, {x: 1110.00000, y: 510.000000}, {x: 1095.00000, y: 517.500000}, {x: 1080.00000, y: 525.000000}, {x: 1065.00000, y: 532.500000}, {x: 1050.00000, y: 540.000000}, {x: 1035.00000, y: 547.500000}];
        // movePath.timestemp = 3965;
        let lastPos = new LogicPos(this.mModel.pos.x, this.mModel.pos.y - this.offsetY);
        const path = movePath.path;
        let point = null;
        let now = this.mElementManager.roomService.now();
        let duration = 0;
        let angle = 0;
        const pathAry = path.map((value) => {
            point = value.point3f;
            if (!(point.y === lastPos.y && point.x === lastPos.x)) {
                angle = Math.atan2(point.y - lastPos.y, point.x - lastPos.x) * (180 / Math.PI);
            }
            const direction = this.onCheckDirection(angle);
            now += duration;
            duration = value.timestemp - now;
            return {
                x: value.point3f.x, y: value.point3f.y, duration, timestemp: value.timestemp, direction
            };
            lastPos = new LogicPos(point.x, point.y);
        });
        // this.drawPath(movePath.path);
        super.movePath(movePath);
    }

    // override super's method.
    public setRenderable(isRenderable: boolean): void {
        // do nothing!
        // Actor is always renderable!!!
    }

    public clear() {
        this.removePackListener();
        super.clear();
        if (this.mUserData) this.userData.destroy();
        this.destroy();
    }

    protected tryStopMove() {
        this.stopMove();
        const pos = this.getPosition();
        const position = op_def.PBPoint3f.create();
        position.x = pos.x;
        position.y = pos.y;
        position.z = pos.z;
        const packet: PBpacket = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_STOP_SELF);
        const content: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_STOP_SELF = packet.content;
        content.position = position;
        this.game.connection.send(packet);

        this.activeSprite();
    }

    protected activeSprite() {
        if (!this.mTargetPoint || !this.mTargetPoint.targetId) {
            return;
        }
        const packet: PBpacket = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_ACTIVE_SPRITE);
        const content: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_ACTIVE_SPRITE = packet.content;
        const targetId = this.mTargetPoint.targetId;
        content.spriteId = targetId;
        this.game.connection.send(packet);
        this.game.emitter.emit(EventType.SCENE_INTERACTION_ELEMENT, targetId);
    }

    protected onMoveComplete() {
        this.preMoveComplete();
        if (this.mCurState !== PlayerState.WALK) {
            this.mMoveData.tweenAnim.stop();
            return;
        }
        if (this.mRoomService.game.moveStyle !== op_def.MoveStyle.DIRECTION_MOVE_STYLE) {
            this.changeState(PlayerState.IDLE);
            this.stopMove();
        }
        // this._doMove();
    }

    protected _doMove(time?: number, delta?: number) {
        if (!this.mMoving || !this.mTargetPoint || !this.body) return;
        const path = this.mTargetPoint.path;
        const _pos = this.body.position;
        const pos = new LogicPos(Math.round((_pos.x - this._offset.x) / this.roomService.game.scaleRatio), Math.round((_pos.y - this._offset.y) / this.mElementManager.roomService.game.scaleRatio));
        this.mModel.setPosition(pos.x, pos.y);
        this.mRoomService.game.peer.render.setPosition(this.id, pos.x, pos.y);
        const speed = this.mModel.speed * delta;
        this.checkDirection();

        // if (Math.abs(pos.x - path[0].x) <= speed && Math.abs(pos.y - path[0].y) <= speed) {
        if (Tool.twoPointDistance(pos, path[0]) <= speed) {
            if (path.length > 1) {
                path.shift();
                this.startMove();
            } else {
                this.tryStopMove();
                return;
            }
        }
        this.mSyncTime += delta;
        if (this.mSyncTime > 50) {
            this.mSyncTime = 0;
            this.mSyncDirty = true;
        }
        if (this.mSyncDirty) {
            this.mSyncDirty = false;
            this.syncPosition();
        }
    }

    // protected onMoving() {
    //     if (this.mCurState !== PlayerState.WALK) {
    //         this.mMoveData.tweenLineAnim.stop();
    //         return;
    //     }
    //     super.onMoving();
    // }

    protected addToBlock() {
        this.addDisplay();
    }

    protected addBody() {
        this._sensor = false;
        this.setBody();
    }

    private drawPath(pos: op_client.IMovePoint[]) {
        // if (!pos && pos.length > 0) {
        //     return;
        // }
        // if (!this.mMovePath) {
        //     this.mMovePath = this.mElementManager.scene.make.graphics(undefined, false);
        // }
        // this.mMovePath.clear();
        // this.mMovePath.lineStyle(2, 0xFFFF00);
        // this.mMovePath.moveTo(pos[0].point3f.x, pos[0].point3f.y);
        // let point3f = null;
        // for (const point of pos) {
        //     point3f = point.point3f;
        //     if (point3f) this.mMovePath.lineTo(point3f.x, point3f.y);
        // }
        // this.mMovePath.strokePath();
        // this.mRoom.addToSurface(<any> this.mMovePath);

    }

    private animationChange(data: any) {
        // { id: this.id, direction: this.direction }
        this.game.renderPeer.displayAnimationChange(data);
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
        this.mModel.off("Animation_Change", this.animationChange, this);
        this.mModel.on("Animation_Change", this.animationChange, this);
        if ((val as PlayerModel).package) {
            // this.mPackage = (val as PlayerModel).package;
            // this.mBag = new Bag(this.mElementManager.roomService.world);
            // this.mBag.register();
        }
        this.load(this.mModel.displayInfo, this.isUser);
        if (this.mModel.pos) {
            const obj = { id: val.id, pos: val.pos, alpha: val.alpha };
            this.game.renderPeer.setDisplayData(obj);
            this.setPosition(this.mModel.pos);
        }
        // todo change display alpha
        Logger.getInstance().log("showNickname===use", this.mModel.direction);
        // this.mDisplay.changeAlpha(this.mModel.alpha);
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
        // this.mPackage = value;
    }

    get moveData() {
        return this.mMoveData;
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

interface IMoveTarget extends MoveData {
    targetId?: number;
}
