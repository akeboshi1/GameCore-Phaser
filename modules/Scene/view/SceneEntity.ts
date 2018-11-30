import {BasicSceneEntity} from "../../../base/BasicSceneEntity";
import Globals from "../../../Globals";
import {Const} from "../../../common/const/Const";
import Point = Phaser.Point;
import {op_client} from "../../../../protocol/protocols";
import Direction = op_client.Direction;
import {Log} from "../../../Log";

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

        this.stopWalk();

        this.walkAngleIndex = value.direction;
        this.setAngleIndex(3);
        this.mTarget = value.destinationPoint3f;
        this.mTimeSpan = value.timeSpan;

        let distance = Phaser.Math.distance(this.ox, this.oy, this.mTarget.x, this.mTarget.y);
        this.mySpeed = distance / this.mTimeSpan;

        this.resumeWalk();
    }

    public moveStopTarget(value: op_client.IMovePosition): void {
        this.stopWalk();
        this.setAngleIndex(3);
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
        this.mTimeSpan -= deltaTime;
        this.doPathMoving(deltaTime);
    }

    protected doPathMoving(deltaTime: number): void {
        let actualSpeed = this.mySpeed * deltaTime;
        this.onMove(actualSpeed);
    }

    protected onMove(actualSpeed: number): void {
        if (actualSpeed <= 0) return;

        let startP: Point = Globals.Room45Util.tileToPixelCoords(1, 1);
        let endP: Point;
        let moveAngle: number;
        if (this.walkAngleIndex === Direction.UP) {
            endP = Globals.Room45Util.tileToPixelCoords(0, 0);
        } else if (this.walkAngleIndex === Direction.UPPER_RIGHT) {
            endP = Globals.Room45Util.tileToPixelCoords(1, 0);
        } else if (this.walkAngleIndex === Direction.RIGHT) {
            endP = Globals.Room45Util.tileToPixelCoords(2, 0);
        } else if (this.walkAngleIndex === Direction.LOWER_RIGHT) {
            endP = Globals.Room45Util.tileToPixelCoords(2, 1);
        } else if (this.walkAngleIndex === Direction.DOWN) {
            endP = Globals.Room45Util.tileToPixelCoords(2, 2);
        } else if (this.walkAngleIndex === Direction.LOWER_LEFT) {
            endP = Globals.Room45Util.tileToPixelCoords(1, 2);
        } else if (this.walkAngleIndex === Direction.LEFT) {
            endP = Globals.Room45Util.tileToPixelCoords(0, 2);
        } else if (this.walkAngleIndex === Direction.UPPER_LEFT) {
            endP = Globals.Room45Util.tileToPixelCoords(0, 1);
        }
        moveAngle = Globals.Tool.caculateDirectionRadianByTwoPoint2(startP.x, startP.y, endP.x, endP.y);

        let _x = this.ox + actualSpeed * Math.cos(moveAngle);
        let _y = this.oy + actualSpeed * Math.sin(moveAngle);
        let _z = this.oz;

        let stopFlag: boolean = false;
        if (this.walkAngleIndex === Direction.UP && _y <= this.mTarget.y) {
            _y = this.mTarget.y;
            stopFlag = true;
        } else if (this.walkAngleIndex === Direction.UPPER_LEFT) {
            if (_y <= this.mTarget.y) {
                _y = this.mTarget.y;
                stopFlag = true;
            }
            if (_x <= this.mTarget.x) {
                _x = this.mTarget.x;
                stopFlag = true;
            }
        } else if (this.walkAngleIndex === Direction.LEFT && _x <= this.mTarget.x) {
            _x = this.mTarget.x;
            stopFlag = true;
        } else if (this.walkAngleIndex === Direction.LOWER_LEFT) {
            if (_y >= this.mTarget.y) {
                _y = this.mTarget.y;
                stopFlag = true;
            }
            if (_x <= this.mTarget.x) {
                _x = this.mTarget.x;
                stopFlag = true;
            }
        } else if (this.walkAngleIndex === Direction.DOWN && _y >= this.mTarget.y) {
            _y = this.mTarget.y;
            stopFlag = true;
        } else if (this.walkAngleIndex === Direction.LOWER_RIGHT) {
            if (_y >= this.mTarget.y) {
                _y = this.mTarget.y;
                stopFlag = true;
            }
            if (_x >= this.mTarget.x) {
                _x = this.mTarget.x;
                stopFlag = true;
            }
        } else if (this.walkAngleIndex === Direction.RIGHT && _x >= this.mTarget.x) {
            _x = this.mTarget.x;
            stopFlag = true;
        } else if (this.walkAngleIndex === Direction.UPPER_RIGHT) {
            if (_y <= this.mTarget.y) {
                _y = this.mTarget.y;
                stopFlag = true;
            }
            if (_x >= this.mTarget.x) {
                _x = this.mTarget.x;
                stopFlag = true;
            }
        }

        this.setPosition(_x, _y, _z);
        if (stopFlag) {
            this.stopWalk();
        }
    }

    protected checkIsValidDisplayAvatar(): void {
        this.isValidDisplay = this.isCanShow && this.isInScreen();
    }
}
