import { Bodies, Body, Vector } from "matter-js";
import { PlayerState } from "structure";
import { LogicPos } from "utils";
import { PhysicalPeer } from "../physical.worker";
import { MatterObject } from "./matter.object";

export class MatterPlayerObject extends MatterObject {
    constructor(public peer: PhysicalPeer, public id: number) {
        super(peer, id);
    }

    // public setExistingBody(body: Body, addToWorld?: boolean) {
    //     if (addToWorld === undefined) {
    //         addToWorld = true;
    //     }

    //     if (this.body) {
    //         // ====todo no remove
    //         this.matterWorld.remove(this.body, true);
    //     }
    //     const sensor = this.getSensor();
    //     this.body = body;
    //     body.isSensor = this._sensor;
    //     if (this.hasPos) {
    //         this.hasPos = false;
    //         Body.setPosition(this.body, Vector.create(this._tempVec.x + this._offset.x, this._tempVec.y + this._offset.y));
    //     }
    //     if (addToWorld) {
    //         this.matterWorld.add(body, this._sensor, this);
    //     }
    // }

    public addBody(radio: number) {
        this._sensor = true;
        this._offsetOrigin.y = 0;
        super.addBody(radio);
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
    path?: MovePos[];
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
