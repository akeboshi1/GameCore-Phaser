import { Element } from "../element/element";
import { IElementManager } from "../element/element.manager";
import { DragonbonesDisplay } from "../display/dragonbones.display";
import { op_client, op_virtual_world, op_def } from "pixelpai_proto";
import { PBpacket } from "net-socket-packet";
import { Pos } from "../../utils/pos";

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
    protected mCurState: string;
    protected nodeType: number = op_def.NodeType.CharacterNodeType;
    constructor(id: number, pos: Pos, protected mElementManager: IElementManager) {
        super(id, pos, mElementManager);
    }

    public move(moveData: op_client.IMoveData) {
        if (this.getDirection() !== moveData.direction) {
            this.setDirection(moveData.direction);
        }
        if (this.mCurState !== "walk") {
            this.changeState("walk");
        }
        super.move(moveData);
    }

    public setDirection(dir: number) {
        this.mDisplayInfo.avatarDir = dir;
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
        if (this.mCurState === val) return false;
        this.mCurState = val;
        return true;
    }
}
