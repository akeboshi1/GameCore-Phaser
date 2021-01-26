import {IDisplayObject} from "./display.object";
import {Render} from "../render";
import {Logger} from "utils";

/**
 * Render层平滑移动
 */
export class DisplayMovement {
    private moveData: any;

    constructor(private scene: Phaser.Scene, private display: IDisplayObject, private render: Render) {
    }

    public destroy() {

    }

    public doMove(moveData: any) {
        if (!moveData.posPath) {
            return;
        }
        this.moveData = moveData;
        const line = moveData.tweenLineAnim;
        if (line) {
            line.stop();
            line.destroy();
        }
        const paths = [];
        const posPath = moveData.posPath;
        let index = 0;
        for (const path of posPath) {
            const duration = path.duration;
            const direction = path.direction;
            paths.push({
                x: path.x,
                y: path.y,
                direction,
                duration,
                onStartParams: direction,
                onCompleteParams: {duration, index},
                onStart: (tween, target, params) => {
                    this.onCheckDirection(params);
                },
                onComplete: (tween, targets, params) => {
                    this.onMovePathPointComplete(params);
                }

            });
            index++;
        }
        moveData.tweenLineAnim = this.scene.tweens.timeline({
            targets: this,
            ease: "Linear",
            tweens: paths,
            onStart: () => {
                this.onMoveStart();
            },
            onComplete: () => {
                this.onMoveComplete();
            },
            onUpdate: () => {
                this.onMoving();
            },
            onCompleteParams: [this.display],
        });
    }

    public onCheckDirection(dir: number) {
        if (typeof dir !== "number") {
            return this.display.direction;
        }
        Logger.getInstance().debug("dir:====", dir);
        if (dir !== this.display.displayInfo.avatarDir) {
            // this.display.displayInfo.avatarDir = dir; // 和direction set方法中重复
            this.display.direction = dir;
            Logger.getInstance().debug("renderSetDirection:=====", dir);
            this.render.setDirection(this.display.id, dir);
        }
    }

    private onMovePathPointComplete(params) {
        if (!this.moveData) {
            return;
        }
        this.moveData.step += 1;
    }

    private onMoveStart() {
        this.render.mainPeer.displayStartMove(this.display.id);
    }

    private onMoveComplete() {
        if (this.moveData.tweenLineAnim) this.moveData.tweenLineAnim.stop();
        this.render.mainPeer.displayCompleteMove(this.display.id);
        this.stopMove();
    }

    private onMoving() {
        const now = this.render.mainPeer.now();
        if (now - (this.moveData.tweenLastUpdate || 0) >= 50) {
            this.display.setDepth(0);
            this.moveData.tweenLastUpdate = now;
        }
        this.display.updateTopDisplay();
    }

    private stopMove() {
        if (this.moveData && this.moveData.posPath) {
            delete this.moveData.posPath;
            if (this.moveData.arrivalTime) this.moveData.arrivalTime = 0;
            if (this.moveData.tweenLineAnim) {
                this.moveData.tweenLineAnim.stop();
                this.moveData.tweenLineAnim.destroy();
            }
        }
        this.render.mainPeer.displayStopMove(this.display.id);
    }
}
