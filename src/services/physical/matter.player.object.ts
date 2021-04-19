import { PlayerState, LogicPos } from "structure";
import { PhysicalPeer } from "../physical.worker";
import { MatterObject } from "./matter.object";

export class MatterPlayerObject extends MatterObject {
    constructor(public peer: PhysicalPeer, public id: number) {
        super(peer, id);
    }

    public addBody() {
        this._sensor = false;
        this._offsetOrigin.y = 0;
    }

    public setExistingBody(body: Body, addToWorld?: boolean) {
    }

    public changeState(val?: string, times?: number) {
        if (this.mCurState === val) return;
        // if (!val) val = PlayerState.IDLE;
        if (!val) {
            val = PlayerState.IDLE;
        }
        this.mCurState = val;
        // this.mModel.currentAnimationName = this.mCurState;
        this.mModel.setAnimationName(this.mCurState, times);
        const id = this.mModel.id;
        this.peer.render.playAnimation(id, this.mModel.currentAnimation, undefined, times);
        // (this.mDisplay as DragonbonesDisplay).play(this.mModel.currentAnimation);
    }

    protected get offsetY(): number {
        if (this.mOffsetY === undefined) {
            if (!this.peer.world.size) {
                return 0;
            }
            // this.mOffsetY = 0;
            this.mOffsetY = this.peer.world.size.tileHeight >> 2;
        }
        return this.mOffsetY;
    }
}

export interface MoveData {
    destPos?: LogicPos;
    posPath?: MovePath[];
    arrivalTime?: number;
    tweenAnim?: any;
    tweenLineAnim?: any;
    tweenLastUpdate?: number;
    onCompleteParams?: any;
    // onComplete?: Function;
    step?: number;
    path?: any[];
}

export interface MovePos {
    x: number;
    y: number;
    stopDir?: number;
}

export interface MovePath {
    x: number;
    y: number;
    direction: number;
    duration?: number;
    onStartParams?: any;
    // onStart?: Function;
    // onComplete?: Function;
}
export interface IMoveTarget extends MoveData {
    targetId?: number;
}
