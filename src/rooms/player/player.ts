import { Element, PlayerState } from "../element/element";
import { IElementManager } from "../element/element.manager";
import { DragonbonesDisplay } from "../display/dragonbones.display";
import { op_client, op_def } from "pixelpai_proto";
import { ISprite } from "../element/sprite";
import { Logger } from "../../utils/log";

export class Player extends Element {
    protected nodeType: number = op_def.NodeType.CharacterNodeType;
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
        if (this.getDirection() !== moveData.direction && this.mId !== this.roomService.actor.id) {
            this.setDirection(moveData.direction);
        }
        Logger.getInstance().log("dir0:" + moveData.direction);
        super.move(moveData);
    }

    public setDirection(dir: number) {
        if (dir !== this.mDisplayInfo.avatarDir) {
            this.mDisplayInfo.avatarDir = dir;
            if (this.mDisplay) this.mDisplay.play(this.mCurState);
        }
        // Logger.log("dir1:" + dir);
    }

    public changeState(val?: string) {
        if (this.mCurState === val) return;
        if (!val) val = "idle";
        if (this.mCheckStateHandle(val)) {
            this.mCurState = val;
            (this.mDisplay as DragonbonesDisplay).play(val);
        }
    }

    protected onMoveStart() {
        this.changeState(PlayerState.WALK);
    }

    private mCheckStateHandle(val: string): boolean {
        // if (this.mCurState === val) return false;
        return true;
    }
}
