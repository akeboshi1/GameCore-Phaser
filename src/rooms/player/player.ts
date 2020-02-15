import { Element, PlayerState } from "../element/element";
import { IElementManager } from "../element/element.manager";
import { DragonbonesDisplay } from "../display/dragonbones.display";
import { op_client, op_def } from "pixelpai_proto";
import { ISprite } from "../element/sprite";
import { Pos } from "../../utils/pos";

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
        let lastPos = new Pos(this.mDisplay.x, this.mDisplay.y);
        const paths = [];
        this.mMoveData.arrivalTime = movePath.timestemp;
        // this.setPosition(new Pos(tmpPath[0].x, tmpPath[1].y));
        for (const path of tmpPath) {
            const angle = Math.atan2(path.y - lastPos.y, path.x - lastPos.x);
            paths.push({
                x: path.x,
                y: path.y + this.offsetY,
                onStartParams: angle * (180 / Math.PI),
                onStart: (tween, target, param) => {
                    this.onCheckDirection(param);
                }
            });
            lastPos = new Pos(path.x, path.y);
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

    protected onCheckDirection(param: any) {
        if (typeof param !== "number") {
            return;
        }
        if (param > 90) {
            this.setDirection(3);
        } else  if (param > 0) {
            this.setDirection(5);
        } else  if (param > -90) {
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

    protected get offsetY(): number {
        if (this.mOffsetY === undefined) {
            if (!this.mElementManager || !this.mElementManager.roomService || !this.mElementManager.roomService.roomSize) {
                return 0;
            }
            this.mOffsetY = this.mElementManager.roomService.roomSize.tileHeight >> 2;
        }
        return this.mOffsetY;
    }

    private mCheckStateHandle(val: string): boolean {
        // if (this.mCurState === val) return false;
        return true;
    }
}
