import {op_client} from "pixelpai_proto";
import {Element} from "../element/element";
import {IElementManager} from "../element/element.manager";
import {IFramesModel} from "../display/frames.model";
import {Tweens} from "phaser";
import {DragonbonesDisplay} from "../display/dragonbones.display";

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
    private mCurState: string;

    private mTw: Tweens.Tween;

    constructor(protected mElementManager: IElementManager) {
        super(mElementManager);
    }

    public load(display: IFramesModel, callBack?: () => void) {
        super.load(display, callBack);
    }

    public setPosition(x: number, y: number, z?: number) {
        super.setPosition(x, y, z);
    }

    public changeState(val: string) {
        if (this.mCheckStateHandle(val)) {
            this.mCurState = val;
            (this.mDisplay as DragonbonesDisplay).play = val;
        }
    }

    public move(moveData: op_client.IMoveData) {
        if (!this.mElementManager) {
            throw new Error(`Player::move - Empty element-manager.`);
        }

        const time: number = moveData.timeSpan
            , toX: number = moveData.destinationPoint3f.x
            , toY: number = moveData.destinationPoint3f.y;

        console.log(`${time}: ${toX},${toY}`);
        const tw = this.mElementManager.scene.tweens.add({
            targets: this.mDisplay,
            duration: time,
            ease: "Linear",
            props: {
                x: {value: toX},
                y: {value: toY},
            },
            onComplete: (tween, targets, play) => {
                console.log("complete moveF");
                // todo 通信服務端到達目的地
                play.setPosition(moveData.destinationPoint3f.x, moveData.destinationPoint3f.y, moveData.destinationPoint3f.z);
            },
            onUpdate: (tween, targets, play) => {
                targets.depth = targets.x + targets.y;
            },
            onCompleteParams: [this],
        });

        if (this.mTw) this.mTw.stop();
        this.mTw = tw;
    }

    public disopse() {
        (this.mDisplay as DragonbonesDisplay).getDisplay().removeListener(dragonBones.EventObject.COMPLETE, this.dragonBonesFrameComplete, this);
        super.dispose();
    }

    private mCheckStateHandle(val: string): boolean {
        const dragonBonesDisplay: DragonbonesDisplay = this.mDisplay as DragonbonesDisplay;
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
