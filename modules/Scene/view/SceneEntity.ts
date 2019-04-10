import {BasicSceneEntity} from "../../../base/BasicSceneEntity";
import {op_client} from "pixelpai_proto";
import Direction = op_client.Direction;

export default class SceneEntity extends BasicSceneEntity {
    public mouseEnable = true;
    public isCanShow = true;
    // moving
    protected mAngleIndex = 0;
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
        this.mWalkTime = this.mTimeSpan = 0;
    }

    public pauseWalk(): void {
        if (this.myIsWalking) {
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

    protected onUpdating(deltaTime: number): void {
        if (this.myIsWalking) this.onUpdatingPosition(deltaTime);
        super.onUpdating(deltaTime);
    }

    protected onUpdatingPosition(deltaTime: number): void {
        if (this.mWalkTime === 0) {
            this.mStart.set(this.ox, this.oy);
        }
        this.mWalkTime += deltaTime;

        if (this.mWalkTime >= this.mTimeSpan) {
            this.doPathMoving(this.mTarget.x, this.mTarget.y);
            this.stopWalk();
        } else {
            let _x = this.mStart.x + (this.mTarget.x - this.mStart.x) * this.mWalkTime / this.mTimeSpan;
            let _y = this.mStart.y + (this.mTarget.y - this.mStart.y) * this.mWalkTime / this.mTimeSpan;
            this.doPathMoving(_x, _y);
        }
    }

    protected doPathMoving(targetX: number, targetY: number): void {

        let _x = targetX;
        let _y = targetY;
        let _z = this.oz;

        this.setPosition(_x, _y, _z);
    }

    protected checkIsValidDisplayAvatar(): void {
        this.isValidDisplay = this.isCanShow && this.isInScreen();
    }
}
