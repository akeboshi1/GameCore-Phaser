import {BasicSceneEntity} from "../../../base/BasicSceneEntity";
import {op_client} from "pixelpai_proto";
import Direction = op_client.Direction;
import Globals from "../../../Globals";

export default class SceneEntity extends BasicSceneEntity {
    public mouseEnable = true;
    public isCanShow = true;
    // moving
    protected mAngleIndex = 3;
    protected mWalkAngleIndex = 0; // 走路
    protected mStart: Phaser.Point = new Phaser.Point;
    protected mTarget: Phaser.Point = new Phaser.Point;
    protected mTimeSpan: number;
    protected mWalkTime: number;

    protected myIsWalking = false;

    public get walkAngleIndex(): number {
        return this.mWalkAngleIndex;
    }

    public set walkAngleIndex(value: number) {
        this.mWalkAngleIndex = value;
    }

    public get angleIndex(): number {
        return this.mAngleIndex;
    }

    public get isWalking(): boolean {
        return this.myIsWalking;
    }

    public onDispose(): void {
        if (this.mouseEnable) {
            this.mouseEnable = false;
        }
        super.onDispose();
    }

    // 弧度
    public setAngleIndex(value: number): void {
        this.mAngleIndex = value;
    }

    public stopWalk(): void {
        this.pauseWalk();
        this.doPauseMove();
        this.mWalkTime = this.mTimeSpan = 0;
    }

    public pauseWalk(): void {
        if (this.isWalking) {
            this.myIsWalking = false;
            this.onPauseMove();
        }
    }

    public moveToTarget(value: op_client.IMoveData): void {
        this.walkAngleIndex = value.direction.valueOf();
        let angle;
        switch (this.walkAngleIndex) {
            case Direction.UP:
                if (this.angleIndex === 1 || this.angleIndex === 3)
                    angle = 1;
                else
                    angle = 7;
                break;
            case Direction.DOWN:
                if (this.angleIndex === 1 || this.angleIndex === 3)
                    angle = 3;
                else
                    angle = 5;
                break;
            case Direction.LEFT:
                if (this.angleIndex === 1 || this.angleIndex === 7)
                    angle = 1;
                else
                    angle = 3;
                break;
            case Direction.RIGHT:
                if (this.angleIndex === 1 || this.angleIndex === 7)
                    angle = 7;
                else
                    angle = 5;
                break;
            case Direction.UPPER_RIGHT:
                angle = 7;
                break;
            case Direction.UPPER_LEFT:
                angle = 1;
                break;
            case Direction.LOWER_RIGHT:
                angle = 5;
                break;
            case Direction.LOWER_LEFT:
                angle = 3;
                break;
        }

        this.setAngleIndex(angle);

        this.mTarget.set(value.destinationPoint3f.x, value.destinationPoint3f.y);
        this.mTimeSpan = value.timeSpan;
        this.mWalkTime = 0;

        this.resumeWalk();
        this.doMove();
    }

    public moveStopTarget(value: op_client.IMovePosition): void {
        this.stopWalk();
        this.setPosition(value.destinationPoint3f.x, value.destinationPoint3f.y, value.destinationPoint3f.z);
    }

    protected resumeWalk(): void {
        if (!this.myIsWalking) {
            this.myIsWalking = true;
            this.onStartMove();
        }
    }

    protected onInitializeCompleted(): void {
        if (this.mouseEnable) {
            this.display.touchEnabled = true;
        } else {
            this.display.touchEnabled = false;
        }
    }

    protected onStartMove(): void {
    }

    protected onPauseMove(): void {
    }

    protected mMovementTween: Phaser.Tween | null;
    protected doMove() {
        // by 7
        this.doPauseMove();

        this.myIsWalking = true;
        this.mMovementTween = Globals.game.add.tween(this).to({ox: this.mTarget.x, oy: this.mTarget.y},
            this.mTimeSpan, Phaser.Easing.Linear.None, true);

        this.mMovementTween.onComplete.add((target, tween) => {
            target.stopWalk();
        }, this);
        this.mMovementTween.onUpdateCallback((tween, value, tweenData) => {
        });
    }

    protected doPauseMove() {
        if (this.mMovementTween) {
            this.mMovementTween.stop();
        }
        this.myIsWalking = false;
    }

    protected checkIsValidDisplayAvatar(): void {
        this.isValidDisplay = this.isCanShow && this.isInScreen();
    }
}
