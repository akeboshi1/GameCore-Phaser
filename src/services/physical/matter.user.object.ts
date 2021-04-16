import { delayTime, PhysicalPeer } from "../physical.worker";
import { IMoveTarget, MatterPlayerObject, MovePos } from "./matter.player.object";
import { op_def } from "pixelpai_proto";
import { IPoint } from "game-capsule";
import { Vector, Body } from "tooqingmatter-js";
import { DirectionChecker, IPos, Logger, LogicPos, Tool } from "utils";
export class MatterUserObject extends MatterPlayerObject {
    public stopBoxMove: boolean = false;
    private mTargetPoint: IMoveTarget;
    private mSyncDirty: boolean = false;
    private mSyncTime: number = 0;
    private mTargetID: number;
    constructor(public peer: PhysicalPeer, public id: number) {
        super(peer, id);
        this._offsetOrigin.y = 0;
    }

    update(time?: number, delta?: number) {
        if ((this.mDirty === false && this.mMoving === false) || !this.peer) return;
        this._doMove(time, delta);
        this.mDirty = false;
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
            this.addBody();
            this.mDirty = true;
        }
    }

    public addBody() {
        this._sensor = false;
        this.setBody();

        this.setStatic(false);
    }

    public async moveMotion(x: number, y: number, targetId?: number) {
        const pos = new LogicPos(x, y);
        if (this.mRootMount) {
            await this.mRootMount.removeMount(this, pos);
        }
        this._tempVec.x = x;
        this._tempVec.y = y;
        this.mTargetPoint = { path: [pos], targetId };
        this.mSyncDirty = true;
        this.matterWorld.setSensor(this.body, false);
        this.startMove();
        this.checkDirection();
    }

    public async findPath(targets: IPos[], targetId?: number, toReverse: boolean = false) {
        if (!targets) {
            return;
        }
        if (this.mRootMount) {
            await this.mRootMount.removeMount(this, targets[0]);
        }

        const pos = this.mModel.pos;
        const miniSize = this.matterWorld.miniSize;
        for (const target of targets) {
            // findPath坐标转换后存在误差
            if (Tool.twoPointDistance(target, pos) <= miniSize.tileWidth / 2) {
                this.mTargetPoint = { targetId };
                this.tryStopMove(pos);
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
        this.matterWorld.setSensor(this.body, false);
        this.mTargetPoint = { path, targetId };
        this.addFillEffect({ x: firstPos.x, y: firstPos.y }, op_def.PathReachableStatus.PATH_REACHABLE_AREA);
        this.startMove();
        this.checkDirection();
    }

    public setExistingBody(body: Body, addToWorld?: boolean) {
        if (addToWorld === undefined) {
            addToWorld = true;
        }

        if (this.body) {
            // ====todo no remove
            this.matterWorld.remove(this.body, true);
        }
        this.body = body;
        body.isSensor = this._sensor;
        if (addToWorld) {
            this.matterWorld.add(body, this._sensor, this);
        }
    }

    public startMove() {
        const path = this.mTargetPoint.path;
        if (path.length < 1) {
            return;
        }
        this.mMoving = true;
        this.peer.mainPeer.selfStartMove();
        const pos = this.getPosition();
        Logger.getInstance().log("setPostion usr move ===>", { x: this._tempVec.x * this._scale + this._offset.x, y: this._tempVec.y * this._scale + this._offset.y }, this.body);
        const angle = Math.atan2((path[0].y - pos.y), (path[0].x - pos.x));
        const speed = this.mModel.speed * delayTime;
        this.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
    }

    public stopMove() {
        if (!this.mMoving) return;
        this.mMoving = false;
        this.peer.mainPeer.stopMove(this.id);
        if (this.mMoveData && this.mMoveData.posPath) {
            delete this.mMoveData.posPath;
            if (this.mMoveData.arrivalTime) this.mMoveData.arrivalTime = 0;
            if (this.mMoveData.tweenLineAnim) {
                this.mMoveData.tweenLineAnim.stop();
                this.mMoveData.tweenLineAnim.destroy();
            }
        }
        if (!this.body) return;
        const _pos = this.body.position;
        this._tempVec.x = (_pos.x - this._offset.x) / this._scale;
        this._tempVec.y = (_pos.y - this._offset.y) / this._scale;
        this.setVelocity(0, 0);
    }

    public tryStopMove(pos?: IPos) {
        // if (!this.mMoving) return;
        // 点击移动
        if (this.mTargetPoint) {
            this.mMoving = false;
            if (this.mMoveData && this.mMoveData.posPath) {
                delete this.mMoveData.posPath;
                if (this.mMoveData.arrivalTime) this.mMoveData.arrivalTime = 0;
                if (this.mMoveData.tweenLineAnim) {
                    this.mMoveData.tweenLineAnim.stop();
                    this.mMoveData.tweenLineAnim.destroy();
                }
            }
            if (!this.body) return;
            this.setVelocity(0, 0);
            let interactiveBoo = false;
            if (pos) {
                interactiveBoo = true;
                // 检查是否在碰撞区域内
                if (this.mTargetID !== undefined) {
                    const matterObj = this.peer.getMatterObj(this.mTargetID);
                    if (matterObj) {
                        const list = matterObj.getInteractivePositionList();
                        if (list.indexOf(pos) === -1) interactiveBoo = false;
                    }
                }
                this.mModel.setPosition(pos.x, pos.y);
                this._tempVec.x = pos.x;
                this._tempVec.y = pos.y;
                Body.setPosition(this.body, Vector.create(this._tempVec.x * this._scale + this._offset.x, this._tempVec.y * this._scale + this._offset.y));
            } else {
                const _pos = this.body.position;
                this._tempVec.x = (_pos.x - this._offset.x) / this._scale;
                this._tempVec.y = (_pos.y - this._offset.y) / this._scale;
            }
            this.peer.mainPeer.tryStopMove(this.id, interactiveBoo, this.mTargetPoint.targetId, pos);
            this.mTargetPoint = null;
            this.mTargetID = undefined;
        } else {
            this.stopMove();
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
        if (!this.mMoving || !this.mTargetPoint || !this.body) return;
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
        if (distboo) {
            if (path.length > 1) {
                path.shift();
                this.startMove();
                this.checkDirection();
            } else {
                this.tryStopMove(path[0]);
                return;
            }
        } else {
            // 只要路径结果存在，每一帧都更新vec
            this.startMove();
        }
        if (delta === undefined) delta = 0;
        this.mSyncTime += delta;
        if (this.mSyncTime > 400) {
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
        const dir = DirectionChecker.check(prePos, pos);
        this.mModel.setDirection(dir);
        this.peer.mainPeer.setDirection(this.id, dir);
    }

    private addFillEffect(pos: IPoint, status: op_def.PathReachableStatus) {
        this.peer.render.addFillEffect(pos.x * this.peer.scaleRatio, pos.y * this.peer.scaleRatio, status);
    }
}
