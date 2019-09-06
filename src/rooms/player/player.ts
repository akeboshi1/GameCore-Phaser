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

    // public getDirection(): number {
    //     return this.mDisplayInfo.avatarDir;
    // }

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

    public stopMove() {
        super.stopMove();
    }

    public removeDisplay() {
        super.removeDisplay();
    }

    private mCheckStateHandle(val: string): boolean {
        if (this.mCurState === val) return false;
        this.mCurState = val;
        return true;
    }

    private dragonBonesFrameComplete(e: Event) {
        // todo  state change
        // this.mElementManager.connection.send()
        // 动作完成后发送协议给服务器告诉后端角色动作已经完成了，需要改变状态了
        this.changeState(PlayerState.IDLE);
    }
}
