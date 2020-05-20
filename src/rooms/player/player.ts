import { Element, PlayerState, MovePath, IElementManager } from "../element";
import { DragonbonesDisplay } from "../display/dragonbones.display";
import { op_client, op_def, op_virtual_world } from "pixelpai_proto";
import { ISprite } from "../element";
import { Pos } from "../../utils/pos";
import { PBpacket } from "net-socket-packet";

export class Player extends Element {
    protected nodeType: number = op_def.NodeType.CharacterNodeType;
    protected mOffsetY: number = undefined;
    constructor(sprite: ISprite, protected mElementManager: IElementManager) {
        super(sprite, mElementManager);
        if (this.mDisplay) {
            if (sprite.displayBadgeCards && sprite.displayBadgeCards.length > 0) this.mDisplay.setDisplayBadges(sprite.displayBadgeCards);
        }
    }

    setModel(val: ISprite) {
        super.setModel(val);
        this.showNickName();
    }

    public move(moveData: op_client.IMoveData) {
        if (this.getDirection() !== moveData.direction) {
            if (this.roomService.world.moveStyle === op_def.MoveStyle.DIRECTION_MOVE_STYLE) {
                if (this.mId !== this.roomService.playerManager.actor.id) {
                    this.setDirection(moveData.direction);
                }
            } else {
                this.setDirection(moveData.direction);
            }
        }
        moveData.destinationPoint3f.y += this.offsetY;
        super.move(moveData);
    }

    public movePath(movePath: op_client.IOP_VIRTUAL_WORLD_REQ_CLIENT_MOVE_SPRITE_BY_PATH) {
        if (!this.mDisplay) {
            return;
        }
        const tmpPath = movePath.path;
        if (!tmpPath) {
            return;
        }
        let lastPos = new Pos(this.mDisplay.x, this.mDisplay.y - this.offsetY);
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
                angle = Math.atan2(point.y - lastPos.y, point.x - lastPos.x) * (180 / Math.PI);
            }
            now += duration;
            duration = path.timestemp - now;
            paths.push({
                x: point.x,
                y: point.y + this.offsetY,
                duration,
                onStartParams: angle,
                onStart: (tween, target, params) => {
                    this.onCheckDirection(params);
                },
                onCompleteParams: { duration, index },
                onComplete: (tween, targets, params) => {
                    this.onMovePathPointComplete(params);
                }
            });
            lastPos = new Pos(point.x, point.y);
            index++;
        }
        this.mMoveData.posPath = paths;
        this.mMoveData.onCompleteParams = point;
        this.mMoveData.onComplete = this.mMovePathPointFinished;
        this._doMove();
    }

    public setDirection(dir: number) {
        if (dir !== this.mDisplayInfo.avatarDir) {
            this.mDisplayInfo.avatarDir = dir;
            this.mModel.direction = dir;
            // if (this.mDisplay) this.mDisplay.play({ animationName: this.mCurState, flip: false });
            if (this.mDisplay) {
                this.mDisplay.play(this.mModel.currentAnimation);
            }
        }
    }

    public changeState(val?: string) {
        if (!this.mDisplay) {
            return;
        }
        if (this.mCurState === val) return;
        // if (!val) val = PlayerState.IDLE;
        if (!val) {
            val = PlayerState.IDLE;
        }
        if (this.mCheckStateHandle(val)) {
            this.mCurState = val;
            this.mModel.currentAnimationName = this.mCurState;
            (this.mDisplay as DragonbonesDisplay).play(this.mModel.currentAnimation);
        }
    }

    public setPosition(pos: Pos) {
        pos.y += this.offsetY;
        super.setPosition(pos);
    }

    public getPosition() {
        const pos = super.getPosition();
        pos.y -= this.offsetY;
        return pos;
    }

    protected onCheckDirection(params: any) {
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

    protected onMoveStart() {
        this.changeState(PlayerState.WALK);
        if (this.mMoveData) {
            this.mMoveData.step = 0;
        }
        super.onMoveStart();
    }

    protected onMoveComplete() {
        this.preMoveComplete();
        super.onMoveComplete();
        this.changeState(PlayerState.IDLE);
    }

    protected preMoveComplete() {
        if (this.mMoveData && this.mMoveData.posPath) {
            const complete = this.mMoveData.onComplete;
            if (complete) {
                complete.call(this, this.mMoveData.onCompleteParams);
                delete this.mMoveData.onComplete;
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
        content.timestemp = this.mRoomService.world.clock.unixTime;
        this.mRoomService.connection.send(pkt);
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

    private mCheckStateHandle(val: string): boolean {
        // if (this.mCurState === val) return false;
        return true;
    }
}
