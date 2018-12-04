import {BasicSceneEntity} from "../../../base/BasicSceneEntity";
import Globals from "../../../Globals";
import {Const} from "../../../common/const/Const";
import Point = Phaser.Point;
import {op_client, op_virtual_world} from "../../../../protocol/protocols";
import Direction = op_client.Direction;
import {Log} from "../../../Log";
import KeyCode = op_virtual_world.KeyCode;

export default class SceneEntity extends BasicSceneEntity {
    public mouseEnable: boolean = true;
    public isCanShow: boolean = true;
    // moving
    protected mySpeed: number = 4; //
    protected mAngleIndex: number = 0;
    protected mWalkAngleIndex: number = 0; //走路
    protected mTarget: op_client.IPBPoint3f;
    protected mTimeSpan: number;

    protected myIsWalking: boolean = false;

    public constructor() {
        super();
    }

    public get walkAngleIndex(): number {
        return this.mWalkAngleIndex;
    }

    public set walkAngleIndex(value: number) {
        this.mWalkAngleIndex = value;
    }

    // Moving
    public get angleIndex(): number {
        return this.mAngleIndex;
    }

    public get isWalking(): boolean {
        return this.myIsWalking;
    }

    public dispose(): void {
        if (this.mouseEnable) {
            this.mouseEnable = false;
        }
        super.dispose();
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
        this.mTarget = value.destinationPoint3f;
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

    protected resumeWalk(): void {
        if (!this.myIsWalking) {
            this.myIsWalking = true;
            this.onStartMove();
        }
    }

    protected onInitializeCompleted(): void {
        if (this.mouseEnable) {
            this.display.touchEnabled = true;
        }
        else {
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
        this.doPathMoving(deltaTime);
    }

    protected doPathMoving(deltaTime: number): void {
        let actualSpeed = this.mySpeed * deltaTime ;
        this.onMove(actualSpeed);
    }

    protected onMove(actualSpeed: number): void {

        let atanAngle: number = Globals.Tool.caculateDirectionRadianByTwoPoint2(this.ox, this.oy, this.mTarget.x, this.mTarget.y);
        // Log.trace("moveAngle-->", moveAngle);

        let _x = this.ox + actualSpeed * Math.cos(atanAngle);
        let _y = this.oy + actualSpeed * Math.sin(atanAngle);
        let _z = this.oz;

        this.setPosition(_x, _y, _z);
    }

    protected checkIsValidDisplayAvatar(): void {
        this.isValidDisplay = this.isCanShow && this.isInScreen();
    }
}
