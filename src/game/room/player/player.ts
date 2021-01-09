import { op_def } from "pixelpai_proto";
import { op_client, op_virtual_world } from "pixelpai_proto";
import { PBpacket } from "net-socket-packet";
import { IElementManager } from "../element/element.manager";
import { ISprite } from "../display/sprite/sprite";
import { IPos, LogicPos } from "../../../utils/logic.pos";
import { Element, IElement, MovePath } from "../element/element";
import { PlayerState } from "structure";

export class Player extends Element implements IElement {
    protected nodeType: number = op_def.NodeType.CharacterNodeType;
    protected mOffsetY: number = undefined;
    constructor(sprite: ISprite, protected mElementManager: IElementManager) {
        super(sprite, mElementManager);
    }

    setModel(val: ISprite): Promise<any> {
        return super.setModel(val);
    }

    // public move(moveData: op_client.IMoveData) {
    //     if (this.getDirection() !== moveData.direction) {
    //         if (this.roomService.game.moveStyle === op_def.MoveStyle.DIRECTION_MOVE_STYLE) {
    //             if (this.mId !== this.roomService.playerManager.actor.id) {
    //                 this.setDirection(moveData.direction);
    //             }
    //         } else {
    //             this.setDirection(moveData.direction);
    //         }
    //     }
    //     moveData.destinationPoint3f.y += this.offsetY;
    //     super.move(moveData);
    // }

    public movePath(movePath: op_client.IOP_VIRTUAL_WORLD_REQ_CLIENT_MOVE_SPRITE_BY_PATH) {
        const tmpPath = movePath.path;
        if (!tmpPath) {
            return;
        }
        let lastPos = new LogicPos(this.mModel.pos.x, this.mModel.pos.y - this.offsetY);
        const paths = [];
        this.mMoveData.arrivalTime = movePath.timestemp;
        let angle = null;
        let point = null;
        let now = this.mElementManager.roomService.now();
        let duration = 0;
        let index = 0;
        for (const path of tmpPath) {
            point = path.point3f;
            if (!(point.y === lastPos.y && point.x === lastPos.x)) {
                angle = index === 0 ? Math.atan2(lastPos.y - point.y, lastPos.x - point.x) * (180 / Math.PI)
                    : Math.atan2(point.y - lastPos.y, point.x - lastPos.x) * (180 / Math.PI);
            }
            const dir = this.onCheckDirection(angle);
            now += duration;
            duration = path.timestemp - now;
            paths.push({
                x: point.x,
                y: point.y + this.offsetY,
                direction: dir,
                duration,
                onStartParams: angle,
                onCompleteParams: { duration, index },
                // onStart: (tween, target, params) => {
                //     this.onCheckDirection(params);
                // },
                // onComplete: (tween, targets, params) => {
                //     this.onMovePathPointComplete(params);
                // }
            });
            lastPos = new LogicPos(point.x, point.y);
            index++;
        }
        this.mMoveData.posPath = paths;
        this.mMoveData.onCompleteParams = point;
        // this.mMoveData.onComplete = this.mMovePathPointFinished;
        this._doMove();
    }

    public setDirection(dir: number) {
        if (dir !== this.mDisplayInfo.avatarDir) {
            this.mDisplayInfo.avatarDir = dir;
            const id = this.mModel.id;
            if (!this.mModel.currentAnimationName) {
                this.mModel.currentAnimationName = PlayerState.IDLE;
            }
            this.mModel.setDirection(dir);
            this.mElementManager.roomService.game.renderPeer.playAnimation(id, this.mModel.currentAnimation);
        }
    }

    public changeState(val?: string, times?: number) {
        if (this.mCurState === val) return;
        // if (!val) val = PlayerState.IDLE;
        if (!val) {
            val = PlayerState.IDLE;
        }
        if (this.mCheckStateHandle(val)) {
            this.mCurState = val;
            // this.mModel.currentAnimationName = this.mCurState;
            this.mModel.setAnimationName(this.mCurState, times);
            const id = this.mModel.id;
            this.mElementManager.roomService.game.renderPeer.playAnimation(id, this.mModel.currentAnimation, undefined, times);
            // (this.mDisplay as BaseDragonbonesDisplay).play(this.mModel.currentAnimation);
        }
    }

    public setPosition(pos: IPos) {
        // pos.y += this.offsetY;
        super.setPosition(pos);
    }

    public completeMove() {
        this.onMovePathPointComplete(this.mMoveData.onCompleteParams);
        this.mMovePathPointFinished(this.mMoveData.onCompleteParams);
    }
    public setWeapon(weaponid: string) {
        if (!this.mModel || !this.mModel.avatar) return;
        const avatar: any = { farmWeapId: weaponid, barmWeapId: weaponid };
        this.model.setTempAvatar(avatar);
        this.load(this.mModel.displayInfo);
    }

    public removeWeapon() {
        if (!this.mModel) return;
        if (this.mModel.suits) {
            this.mModel.updateAvatarSuits(this.mModel.suits);
            this.model.updateAvatar(this.mModel.avatar);
            this.load(this.mModel.displayInfo);
        } else if (this.mModel.avatar) {
            this.model.updateAvatar(this.mModel.avatar);
            this.load(this.mModel.displayInfo);
        }

    }
    protected checkDirection() {
        if (!this.body) {
            return;
        }
        const prePos = (<any>this.body).positionPrev;
        const pos = this.body.position;
        const angle = Math.atan2((pos.y - prePos.y), (pos.x - prePos.x));
        this.onCheckDirection(angle * (180 / Math.PI));
    }

    protected onCheckDirection(params: any): number {
        if (typeof params !== "number") {
            return;
        }
        // 重叠
        if (params > 90) {
            this.setDirection(3);
        } else if (params >= 0) {
            this.setDirection(5);
        } else if (params >= -90) {
            this.setDirection(7);
        } else {
            this.setDirection(1);
        }
    }

    // protected onMoveStart() {
    //     this.changeState(PlayerState.WALK);
    //     if (this.mMoveData) {
    //         this.mMoveData.step = 0;
    //     }
    //     super.onMoveStart();
    // }

    // protected onMoveComplete() {
    //     this.preMoveComplete();
    //     super.onMoveComplete();
    //     this.changeState(PlayerState.IDLE);
    // }

    protected preMoveComplete() {
        if (this.mMoveData && this.mMoveData.posPath) {
            const complete = this.mMoveData.onCompleteParams;
            if (complete) {
                this.mMovePathPointFinished(this.mMoveData.onCompleteParams);
                // complete.call(this, this.mMoveData.onCompleteParams);
                delete this.mMoveData.onCompleteParams;
            }
        }
    }

    protected onMovePathPointComplete(params) {
        if (!this.mMoveData) {
            return;
        }
        this.mMoveData.step += 1;
        // if (!this.mMoveData.posPath) {
        //     return;
        // }
        // const posPath = this.mMoveData.posPath;
        // posPath.shift();
    }

    protected mMovePathPointFinished(path: MovePath) {
        if (!path || !this.mRoomService) {
            return;
        }
        const pkt: PBpacket = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_MOVE_PATH_POINT_FINISHED);
        const content: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_MOVE_PATH_POINT_FINISHED = pkt.content;
        const currentPoint = op_def.PBPoint3f.create();
        const pos = this.getPosition();
        currentPoint.x = pos.x;
        currentPoint.y = pos.y;
        currentPoint.z = pos.z;

        const targetPoint = op_def.PBPoint3f.create();
        targetPoint.x = path.x;
        targetPoint.y = path.y;
        content.currentPoint = currentPoint;
        content.lastTargetPoint = targetPoint;
        content.timestemp = this.mRoomService.game.clock.unixTime;
        this.mRoomService.game.peer.send(pkt.Serialization());
    }

    protected get offsetY(): number {
        if (this.mOffsetY === undefined) {
            if (!this.mElementManager || !this.mElementManager.roomService || !this.mElementManager.roomService.roomSize) {
                return 0;
            }
            // this.mOffsetY = 0;
            this.mOffsetY = this.mElementManager.roomService.roomSize.tileHeight >> 2;
        }
        return this.mOffsetY;
    }

    protected addBody() {
        this._sensor = true;
        this._offsetOrigin.y = 0;
        this.setBody();
    }

    private mCheckStateHandle(val: string): boolean {
        // if (this.mCurState === val) return false;
        return true;
    }
}
