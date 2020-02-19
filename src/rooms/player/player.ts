import { Element, PlayerState } from "../element/element";
import { IElementManager } from "../element/element.manager";
import { DragonbonesDisplay } from "../display/dragonbones.display";
import { op_client, op_def, op_virtual_world } from "pixelpai_proto";
import { ISprite } from "../element/sprite";
import { Pos } from "../../utils/pos";
import { PBpacket } from "net-socket-packet";
import { Logger } from "../../utils/log";

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
                onStart: (tween, target, param) => {
                    this.onCheckDirection(param);
                },
                onCompleteParams: duration,
                onComplete: (tween, targets, param) => {
                    this.onMovePathPointComplete(param);
                }
            });
            lastPos = new Pos(point.x, point.y);
        }
        this.mMoveData.posPath = paths;
        this._doMove();
    }

    public setDirection(dir: number) {
        if (dir !== this.mDisplayInfo.avatarDir) {
            this.mDisplayInfo.avatarDir = dir;
            if (this.mDisplay) this.mDisplay.play(this.mCurState);
        }
    }

    public changeState(val?: string) {
        if (!this.mDisplay) {
            return;
        }
        if (this.mCurState === val) return;
        if (!val) val = PlayerState.IDLE;
        if (this.mCheckStateHandle(val)) {
            this.mCurState = val;
            (this.mDisplay as DragonbonesDisplay).play(val);
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

    protected onCheckDirection(param: any) {
        if (typeof param !== "number") {
            return;
        }
        // 重叠
        if (param > 90) {
            this.setDirection(3);
        } else  if (param >= 0) {
            this.setDirection(5);
        } else  if (param >= -90) {
            this.setDirection(7);
        } else {
            this.setDirection(1);
        }
    }

    protected onMoveStart() {
        this.changeState(PlayerState.WALK);
    }

    protected onMoveComplete() {
        super.onMoveComplete();
        this.changeState(PlayerState.IDLE);
    }

    protected onMovePathPointComplete(param) {
        if (!this.mElementManager || !this.mElementManager.connection) {
            return;
        }
        const position = this.getPosition();
        Logger.getInstance().log("astar move to: ", position, " duration: ", param, " timestemp: ", this.mElementManager.roomService.now());
        const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_MOVE_PATH_POINT_FINISHED);
        const content: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_MOVE_PATH_POINT_FINISHED = packet.content;
        const point = op_def.PBPoint3f.create();
        point.x = position.x;
        point.y = position.y;
        point.z = position.z;
        content.point = point;
        content.timestemp = this.mElementManager.roomService.now();
        this.mElementManager.connection.send(packet);
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
