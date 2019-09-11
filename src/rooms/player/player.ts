import { Element } from "../element/element";
import { IElementManager } from "../element/element.manager";
import { DragonbonesDisplay } from "../display/dragonbones.display";
import { op_client, op_def } from "pixelpai_proto";
import { ISprite } from "../element/sprite";
import { Logger } from "../../utils/log";

export enum PlayerState {
    IDLE = "idle",
    WALK = "walk",
    RUN = "run",
    ATTACK = "attack",
    JUMP = "jump",
    INJURED = "injured",
    FAILED = "failed",
    DANCE01 = "dance01",
    DANCE02 = "dance02",
    FISHING = "fishing",
    GREET01 = "greet01",
    SIT = "sit",
    LIE = "lit",
    EMOTION01 = "emotion01",
}

export class Player extends Element {
    protected nodeType: number = op_def.NodeType.CharacterNodeType;
    constructor(sprite: ISprite, protected mElementManager: IElementManager) {
        super(sprite, mElementManager);
    }

    public move(moveData: op_client.IMoveData) {
        if (this.getDirection() !== moveData.direction) {
            this.setDirection(moveData.direction);
        }
        Logger.log("dir0:" + moveData.direction);
        super.move(moveData);
    }

    public setDirection(dir: number) {
        this.mDisplayInfo.avatarDir = dir;
        Logger.log("dir1:" + dir);
    }

    public changeState(val?: string) {
        if (!val) val = "idle";
        if (this.mCheckStateHandle(val)) {
            this.mCurState = val;
            (this.mDisplay as DragonbonesDisplay).play(val);
        }
    }

    public removeDisplay() {
        super.removeDisplay();
    }

    private mCheckStateHandle(val: string): boolean {
        // if (this.mCurState === val) return false;
        this.mCurState = val;
        return true;
    }
}
