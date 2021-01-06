import { PlayerState } from "structure";
import { IPos, Logger, LogicPos, Tool } from "utils";
import { delayTime, PhysicalPeer } from "../physical.worker";
import { IMoveTarget, MatterPlayerObject, MovePos } from "./matter.player.object";
import { op_def } from "pixelpai_proto";
import { IPoint } from "game-capsule";
export class MatterUserObject extends MatterPlayerObject {
    private mTargetPoint: IMoveTarget;
    private mSyncDirty: boolean = false;
    private mSyncTime: number = 0;
    constructor(public peer: PhysicalPeer, public id: number) {
        super(peer, id);
    }

    public async unmount(targetPos?: IPos) {
        if (this.mRootMount) {
            let landingPos: IPos;
            const pos = await this.mRootMount.getInteractivePositionList();
            if (pos.length === 0) {
                return;
            }
            const mountID = this.mRootMount.id;
            this.mRootMount = null;
            if (targetPos != null) {
                const path = this.peer.world.getPath(targetPos, pos, true);
                if (path.length > 0) {
                    landingPos = path[0];
                } else {
                    landingPos = pos[0];
                }
            } else {
                landingPos = pos[0];
            }
            this.setPosition(landingPos);
            // this.unmountSprite(mountID, landingPos);
            this.addBody();
            // this.enableBlock();
            this.mDirty = true;
        }
    }

    public addBody() {
        this._sensor = false;
        this._offsetOrigin.y = 0;
        this.setBody();
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

    public async findPath(targets: IPos[], targetId?: number, toReverse: boolean = false) {
        if (!targets) {
            return;
        }
        if (this.mRootMount) {
            await this.mRootMount.removeMount(this, targets[0]);
        }
        // this.peer.mainPeer.removePartMount(this.id, targets[0], path);
        const pos = this.mModel.pos;
        for (const target of targets) {
            if (target.x === pos.x && target.y === pos.y) {
                this.mTargetPoint = { targetId };
                this.tryStopMove();
                return;
            }
        }
        const path = this.peer.world.getPath(pos, targets, toReverse);
        if (!path) {
            return;
        }
        const firstPos = targets[0];
        if (path.length < 1) {
            this.addFillEffect({ x: firstPos.x, y: firstPos.y }, op_def.PathReachableStatus.PATH_UNREACHABLE_AREA);
            return;
        }
        this.matterWorld.setSensor(this.body, true);
        this.mTargetPoint = { path, targetId };
        this.addFillEffect({ x: firstPos.x, y: firstPos.y }, op_def.PathReachableStatus.PATH_REACHABLE_AREA);
        this.startMove();
    }

    public startMove() {
        this.checkDirection();
        const path = this.mTargetPoint.path;
        if (path.length < 1) {
            return;
        }

        // this.peer.mainPeer.changePlayerState(this.id, PlayerState.WALK);
        this.peer.mainPeer.selfStartMove();
        this.mMoving = true;
        this.setStatic(false);

        const pos = this.getPosition();
        const angle = Math.atan2((path[0].y - pos.y), (path[0].x - pos.x));
        const speed = this.mModel.speed * delayTime;
        this.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
    }

    public stopMove() {
        Logger.getInstance().log("stopMatterMove");
        this.peer.mainPeer.stopMove(this.id);
        this.mMoving = false;
        if (this.mMoveData && this.mMoveData.posPath) {
            delete this.mMoveData.posPath;
            if (this.mMoveData.arrivalTime) this.mMoveData.arrivalTime = 0;
            if (this.mMoveData.tweenLineAnim) {
                this.mMoveData.tweenLineAnim.stop();
                this.mMoveData.tweenLineAnim.destroy();
            }
        }
        // this.peer.mainPeer.changePlayerState(this.id, PlayerState.IDLE);
        if (!this.body) return;
        this.setVelocity(0, 0);
        this.setStatic(true);
    }

    public tryStopMove(pos?: IPos) {
        this.stopMove();
        if (this.mTargetPoint) {
            this.peer.mainPeer.tryStopMove(this.id, pos, this.mTargetPoint.targetId);
        }
    }

    public move(moveData: MovePos[]) {
        this.peer.render.drawServerPosition(moveData[0].x, moveData[0].y);
    }

    public syncPosition() {
        if (!this.mTargetPoint) {
            return;
        }
        this.peer.mainPeer.syncPosition(this.mTargetPoint);
    }

    public _doMove(time?: number, delta?: number) {
        if (!this.mMoving || !this.mTargetPoint) return;
        const path = this.mTargetPoint.path;
        const _pos = this.body.position;
        const pos = new LogicPos(Math.round(_pos.x / this.peer.scaleRatio), Math.round(_pos.y / this.peer.scaleRatio));
        this.mModel.pos = pos;

        // 通知render主角移动
        this.peer.render.setPosition(this.id, pos.x, pos.y);
        // 通知mainworker同步主角位置
        this.peer.mainPeer.setPosition(this.id, true, pos.x, pos.y);
        const dist = this.mModel.speed * delta;
        this.peer.mainPeer.setSyncDirty(true);
        const distboo = Tool.twoPointDistance(pos, path[0]) <= dist;
        // if (Math.abs(pos.x - path[0].x) <= speed && Math.abs(pos.y - path[0].y) <= speed) {
        if (distboo) {
            if (path.length > 1) {
                path.shift();
                this.startMove();
            } else {
                this.tryStopMove(path[0]);
                return;
            }
        }
        if (delta === undefined) delta = 0;
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

    public checkDirection() {
        if (!this.body) return;
        const prePos = (<any>this.body).positionPrev;
        const pos = this.body.position;
        const angle = Math.atan2((pos.y - prePos.y), (pos.x - prePos.x));
        const dir = this.onCheckDirection(angle * (180 / Math.PI));
        this.peer.mainPeer.setDirection(this.id, dir);
    }

    private addFillEffect(pos: IPoint, status: op_def.PathReachableStatus) {
        this.peer.render.addFillEffect(pos.x * this.peer.scaleRatio, pos.y * this.peer.scaleRatio, status);
    }
}
