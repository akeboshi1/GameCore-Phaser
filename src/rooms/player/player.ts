import {Element} from "../element/element";
import {IElementManager} from "../element/element.manager";
import {DragonbonesDisplay} from "../display/dragonbones.display";
import { op_client } from "pixelpai_proto";

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

    constructor(protected mElementManager: IElementManager) {
        super(undefined, mElementManager);
    }

    public move(moveData: op_client.IMoveData) {
        if (this.mCurState !== "walk") {
            this.changeState("run");
        }
        super.move(moveData);
    }

    public changeState(val: string) {
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

    get x(): number {
        return this.mDisplay.x;
    }

    get y(): number {
        return this.mDisplay.y;
    }

    get z(): number {
        return this.mDisplay.z;
    }

    private dragonBonesFrameComplete(e: Event) {
        // todo  state change
        // this.mElementManager.connection.send()
        // 动作完成后发送协议给服务器告诉后端角色动作已经完成了，需要改变状态了
        this.changeState(PlayerState.IDLE);
    }
}
