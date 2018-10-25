import {BasicSceneEntity} from "../base/BasicSceneEntity";
import Globals from "../Globals";
import {Const} from "../const/Const";
import Point = Phaser.Point;

export default class SceneEntity extends BasicSceneEntity {
    public mouseEnable: boolean = true;
    public isCanShow: boolean = true;
    // moving
    protected mySpeed: number = 4;//
    protected mAngleIndex: number = 0;
    protected mWalkAngleIndex: number = 0;//走路
    protected myIsWalking: boolean = false;
    protected myCurrentPathStepIndex: number = 0;
    protected myCurrentPathPoints: Array<any> = null;
    protected myCurrentMoveInterval: number = 0;
    private newMovePath: Array<any>;

    public constructor() {
        super();
    }

    // Moving
    public get angleIndex(): number {
        return this.mAngleIndex;
    }

    public get walkAngleIndex(): number {
        return this.mWalkAngleIndex
    }

    public set walkAngleIndex(value: number) {
        this.mWalkAngleIndex = value;
    }

    public get movingTarget(): Phaser.Point {
        let result: Phaser.Point = null;
        if (this.newMovePath && this.newMovePath.length > 0) {
            result = this.newMovePath[Globals.Tool.clamp(this.newMovePath.length, 0, this.newMovePath.length - 1)];
        } else if (this.myCurrentPathPoints && this.myCurrentPathPoints.length) {
            result = this.myCurrentPathPoints[Globals.Tool.clamp(this.myCurrentPathPoints.length, 0, this.myCurrentPathPoints.length - 1)];
        }
        return result ? new Phaser.Point(result.x, result.y) : null;
    }

    public get isWalking(): boolean {
        return this.myIsWalking;
    }

    public get gridPos(): Point {
        return this.myIsWalking ? this.myCurrentPathPoints[Globals.Tool.clamp(this.myCurrentPathStepIndex + 1, 0, this.myCurrentPathPoints.length - 1)] : this.gridPos;
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

    public setCols(value: number) {
        this._cols = value;
    }

    public setRows(value: number) {
        this._rows = value;
    }

    public resumeWalk(): void {
        if (!this.myIsWalking) {
            this.myIsWalking = true;
            this.onStartMove();
        }
    }

    public stopWalk(): void {
        this.pauseWalk();
        this.clearMovingData();
    }

    public pauseWalk(): void {
        if (this.myIsWalking) {
            this.myIsWalking = false;
            this.onPauseMove();
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

    protected clearMovingData(): void {
        this.myCurrentPathStepIndex = 1;
        this.myCurrentMoveInterval = 0;
        this.myCurrentPathPoints = null;
    }

    protected innerMoveToByPath(path: Array<any>): void {

        if (this.myIsWalking) {
            this.newMovePath = path;
            return;
        }

        this.myCurrentPathStepIndex = 1;
        this.myCurrentMoveInterval = 0;
        this.myCurrentPathPoints = path;

        // this._topPoint = Game.Room45Util.pixelToTileCoords(this.iosX,this.iosY);

        this.resumeWalk();
    }

    protected onUpdating(deltaTime: number): void {
        if (this.myIsWalking) this.onUpdatingPosition(deltaTime);
    }

    protected onUpdatingPosition(deltaTime: number): void {
        this.doPathMoving();
    }

    protected doPathMoving(): void {
        let targetPathPonints: any = this.myCurrentPathPoints[this.myCurrentPathStepIndex];
        this.onMove(targetPathPonints);

        if (++this.myCurrentMoveInterval >= this.mySpeed)//到了该点了
        {
            this.myCurrentMoveInterval = 0;

            if (this.newMovePath) {
                this.myCurrentPathStepIndex = 0;
                this.myCurrentPathPoints.splice(this.myCurrentPathStepIndex + 1);
                this.myCurrentPathPoints = this.myCurrentPathPoints.concat(this.newMovePath);
                this.newMovePath = null;
            }

            if (++this.myCurrentPathStepIndex >= this.myCurrentPathPoints.length) {
                this.stopWalk();
            }
        }
    }

    protected onMove(targetPathPoints: any): void {
        if (this.myCurrentPathStepIndex >= this.myCurrentPathPoints.length) return;

        let dirX = targetPathPoints.x - this.gridPos.x;
        let dirY = targetPathPoints.y - this.gridPos.y;

        this.iosX += (dirX - dirY) * (Const.GameConst.HALF_MAP_TILE_WIDTH / this.mySpeed);
        this.iosY += (dirX + dirY) * (Const.GameConst.HALF_MAP_TILE_HEIGHT / this.mySpeed);

        if (dirX === 1) {
            if (dirY === 1) {
                // down;
            } else if (dirY === 0) {
                // rightDown
                this.setAngleIndex(5);
            } else if (dirY === -1) {
                // right
            }
        } else if (dirX === 0) {
            if (dirY === 1) {
                // leftDown
                this.setAngleIndex(3);
            } else if (dirY === -1) {
                // rightUpAssets
                this.setAngleIndex(7);
            }
        } else if (dirX === -1) {
            if (dirY === 1) {
                // left
            } else if (dirY === 0) {
                // leftUp
                this.setAngleIndex(1);
            } else if (dirY === -1) {
                // up;
            }
        }
    }

    protected checkIsValidDisplayAvatar(): void {
        this.isValidDisplay = this.isCanShow && this.isInScreen();
    }
}
