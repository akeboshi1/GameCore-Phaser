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
        if (this.mDisplay) this.mDisplay.play(PlayerState.WALK);
        const paths = movePath.path;
        for (const path of paths) {
            path.y += this.offsetY;
        }
        super.movePath(movePath);
    }

    public setDirection(dir: number) {
        if (dir !== this.mDisplayInfo.avatarDir) {
            this.mDisplayInfo.avatarDir = dir;
            if (this.mDisplay) this.mDisplay.play(this.mCurState);
        }
    }

    public changeState(val?: string) {
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
