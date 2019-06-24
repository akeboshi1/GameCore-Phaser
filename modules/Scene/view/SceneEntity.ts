import {BasicSceneEntity} from "../../../base/BasicSceneEntity";
import {op_client, op_def} from "pixelpai_proto";
import Direction = op_def.Direction;
import { BasicAvatar } from "../../../base/BasicAvatar";

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
        this.mWalkTime = this.mTimeSpan = 0;
    }

    public pauseWalk(): void {
        if (this.isWalking) {
            this.myIsWalking = false;
            this.onPauseMove();
        }
    }

    private newMoveTarget: op_client.IMoveData;
    private newMoveTime = 0;
    public moveToTarget(value: op_client.IMoveData): void {
        if (this.isWalking) {
            this.newMoveTarget = value;
            this.newMoveTime = Date.now();
            return;
        }

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

        let temp = 0;
        if (this.mWalkTime >= this.mTimeSpan) {
            this.doPathMoving(this.mTarget.x, this.mTarget.y, this.angleIndex);

            if (this.newMoveTarget) {
                this.mTarget.set(this.newMoveTarget.destinationPoint3f.x, this.newMoveTarget.destinationPoint3f.y);
                temp = 0; // Date.now() - this.newMoveTime;
                this.mTimeSpan = this.newMoveTarget.timeSpan - temp;
                this.mWalkTime = 0;
                this.newMoveTime = 0;
                this.newMoveTarget = null;
            } else {
                this.stopWalk();
            }
        } else {
            let _x = this.mStart.x + (this.mTarget.x - this.mStart.x) * this.mWalkTime / this.mTimeSpan;
            let _y = this.mStart.y + (this.mTarget.y - this.mStart.y) * this.mWalkTime / this.mTimeSpan;
            this.doPathMoving(_x, _y);

            if (this.newMoveTarget) {
                this.mTarget.set(this.newMoveTarget.destinationPoint3f.x, this.newMoveTarget.destinationPoint3f.y);
                temp = 0; // Date.now() - this.newMoveTime;
                this.mTimeSpan = this.newMoveTarget.timeSpan - temp;
                this.mWalkTime = 0;
                this.newMoveTime = 0;
                this.newMoveTarget = null;
            }
        }
    }

    protected doPathMoving(targetX: number, targetY: number, angleIndex?: number): void {

        let _x = targetX;
        let _y = targetY;
        let _z = this.oz;

        if (angleIndex) {
            this.setAngleIndex(angleIndex);
        } else {
            let dirX = _x - this.ox;
            let dirY = _y - this.oy;

            if (dirX === 0 && dirY < 0) {
                if (this.angleIndex === 1 || this.angleIndex === 3) {
                    this.setAngleIndex(1);
                } else {
                    this.setAngleIndex(7);
                }
            } else if (dirX < 0 && dirY < 0) {
                this.setAngleIndex(1);
            } else if (dirX < 0 && dirY === 0) {
                if (this.angleIndex === 1 || this.angleIndex === 7) {
                    this.setAngleIndex(1);
                } else {
                    this.setAngleIndex(3);
                }
            } else if (dirX < 0 && dirY > 0) {
                this.setAngleIndex(3);
            } else if (dirX === 0 && dirY > 0) {
                if (this.angleIndex === 3 || this.angleIndex === 1) {
                    this.setAngleIndex(3);
                } else {
                    this.setAngleIndex(5);
                }
            } else if (dirX > 0 && dirY > 0) {
                this.setAngleIndex(5);
            } else if (dirX > 0 && dirY === 0) {
                if (this.angleIndex === 3 || this.angleIndex === 5) {
                    this.setAngleIndex(5);
                } else {
                    this.setAngleIndex(7);
                }
            } else if (dirX > 0 && dirY < 0) {
                this.setAngleIndex(7);
            }
        }

        this.setPosition(_x, _y, _z);
    }

    public addBubble(text: string, bubble: op_client.IChat_Setting, offsetX?: number, offsetY?: number) {
        (<BasicAvatar>this.display).addBubble(text, bubble, offsetX, offsetY);
    }

    public removeBubble() {
        (<BasicAvatar>this.display).removeBubble();
    }

    protected checkIsValidDisplayAvatar(): void {
        this.isValidDisplay = this.isCanShow && this.isInScreen();
    }
}
