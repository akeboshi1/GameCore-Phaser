import {BasicSceneEntity} from "../../../base/BasicSceneEntity";
import Globals from "../../../Globals";
import {Const} from "../../../common/const/Const";
import Point = Phaser.Point;
import {op_client, op_virtual_world} from "../../../../protocol/protocols";
import Direction = op_client.Direction;
import {Log} from "../../../Log";
import KeyCode = op_virtual_world.KeyCode;
import {GameConfig} from "../../../GameConfig";

export default class SceneEntity extends BasicSceneEntity {
    public mouseEnable = true;
    public isCanShow = true;
    // moving
    protected mySpeed = 4; //
    protected mAngleIndex = 0;
    protected mWalkAngleIndex = 0; // 走路
    protected mTarget: Phaser.Point;
    protected mTimeSpan: number;

    protected myIsWalking = false;

    public constructor() {
        super();
    }

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
        this.mTimeSpan = 0;
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
        this.mTarget.set(value.destinationPoint3f.x >> 0, value.destinationPoint3f.y >> 0);
        this.mTimeSpan = value.timeSpan;

        let distance = Phaser.Math.distance(this.ox, this.oy, this.mTarget.x, this.mTarget.y);

        this.mySpeed = distance / this.mTimeSpan;

        // Log.trace("行走: distance-->", distance, "direction-->", value.direction, "timeSpan-->", value.timeSpan, "speed-->", this.mySpeed);

        this.resumeWalk();
    }

    public moveStopTarget(value: op_client.IMovePosition): void {
        this.stopWalk();
        this.setPosition(value.destinationPoint3f.x, value.destinationPoint3f.y, value.destinationPoint3f.z);
    }

    protected onInitialize(): void {
        super.onInitialize();
        this.mTarget = new Phaser.Point();
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
    }

    protected onUpdatingPosition(deltaTime: number): void {
        switch (this.walkAngleIndex) {
            case Direction.UP:
                if (this.oy < this.mTarget.y) {
                    this.stopWalk();
                    return;
                }
                break;
            case Direction.DOWN:
                if (this.oy > this.mTarget.y) {
                    this.stopWalk();
                    return;
                }
                break;
            case Direction.LEFT:
                if (this.ox < this.mTarget.x) {
                    this.stopWalk();
                    return;
                }
                break;
            case Direction.RIGHT:
                if (this.ox > this.mTarget.x) {
                    this.stopWalk();
                    return;
                }
                break;
            case Direction.UPPER_LEFT:
                if (this.oy < this.mTarget.y) {
                    this.stopWalk();
                    return;
                }
                if (this.ox < this.mTarget.x) {
                    this.stopWalk();
                    return;
                }
                break;
            case Direction.UPPER_RIGHT:
                if (this.oy < this.mTarget.y) {
                    this.stopWalk();
                    return;
                }
                if (this.ox > this.mTarget.x) {
                    this.stopWalk();
                    return;
                }
                break;
            case Direction.LOWER_LEFT:
                if (this.oy > this.mTarget.y) {
                    this.stopWalk();
                    return;
                }
                if (this.ox < this.mTarget.x) {
                    this.stopWalk();
                    return;
                }
                break;
            case Direction.LOWER_RIGHT:
                if (this.oy > this.mTarget.y) {
                    this.stopWalk();
                    return;
                }
                if (this.ox > this.mTarget.x) {
                    this.stopWalk();
                    return;
                }
                break;
        }
        if (this.ox === this.mTarget.x && this.oy === this.mTarget.y) {
            this.stopWalk();
        } else {
            this.doPathMoving(deltaTime);
        }
    }

    protected doPathMoving(deltaTime: number): void {
        let actualSpeed = this.mySpeed * deltaTime;
        this.onMove(actualSpeed);
    }

    protected onMove(actualSpeed: number): void {

        let atanAngle: number = Globals.Tool.caculateDirectionRadianByTwoPoint2(this.ox, this.oy, this.mTarget.x, this.mTarget.y);
        let targetX: number = this.ox + actualSpeed * Math.cos(atanAngle);
        let targetY: number = this.oy + actualSpeed * Math.sin(atanAngle);
        switch (this.walkAngleIndex) {
            case Direction.UP:
                if (targetY < this.mTarget.y) {
                    targetY = this.mTarget.y;
                }
                break;
            case Direction.DOWN:
                if (targetY > this.mTarget.y) {
                    targetY = this.mTarget.y;
                }
                break;
            case Direction.LEFT:
                if (targetX < this.mTarget.x) {
                    targetX = this.mTarget.x;
                }
                break;
            case Direction.RIGHT:
                if (targetX > this.mTarget.x) {
                    targetX = this.mTarget.x;
                }
                break;
            case Direction.UPPER_LEFT:
                if (targetY < this.mTarget.y) {
                    targetY = this.mTarget.y;
                }
                if (targetX < this.mTarget.x) {
                    targetX = this.mTarget.x;
                }
                break;
            case Direction.UPPER_RIGHT:
                if (targetY < this.mTarget.y) {
                    targetY = this.mTarget.y;
                }
                if (targetX > this.mTarget.x) {
                    targetX = this.mTarget.x;
                }
                break;
            case Direction.LOWER_LEFT:
                if (targetY > this.mTarget.y) {
                    targetY = this.mTarget.y;
                }
                if (targetX < this.mTarget.x) {
                    targetX = this.mTarget.x;
                }
                break;
            case Direction.LOWER_RIGHT:
                if (targetY > this.mTarget.y) {
                    targetY = this.mTarget.y;
                }
                if (targetX > this.mTarget.x) {
                    targetX = this.mTarget.x;
                }
                break;
        }

        // Log.trace("moveAngle-->", moveAngle);

        let _x = targetX;
        let _y = targetY;
        let _z = this.oz;

        this.setPosition(_x, _y, _z);
    }

    protected checkIsValidDisplayAvatar(): void {
        this.isValidDisplay = GameConfig.isEditor || (this.isCanShow && this.isInScreen());
    }
}
