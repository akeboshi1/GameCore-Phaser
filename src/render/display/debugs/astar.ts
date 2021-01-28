import {Render} from "../../render";
import {PlayScene} from "../../scenes/play.scene";
import {ChatCommandInterface, IPos, IPosition45Obj, Logger, LogicPos, Position45} from "utils";

export class Astar {
    private readonly CIRCLE_RADIUS_POINTS = 2;
    private readonly CIRCLE_RADIUS_START_POSITION = 4;
    private readonly CIRCLE_RADIUS_TARGET_POSITION = 4;
    private readonly CIRCLE_COLOR_POINTS_PASS = 0x00FF00;
    private readonly CIRCLE_COLOR_POINTS_NOTPASS = 0xFF0000;
    private readonly CIRCLE_COLOR_START_POSITION = 0xFFFF00;
    private readonly CIRCLE_COLOR_TARGET_POSITION = 0xFFFF00;
    private readonly LINE_COLOR_PATH = 0xFFFF00;

    private mPoints: Map<LogicPos, Phaser.GameObjects.Graphics> =
        new Map<LogicPos, Phaser.GameObjects.Graphics>();
    private mStartPos: Phaser.GameObjects.Graphics = null;
    private mTargetPos: Phaser.GameObjects.Graphics = null;
    private mPath: Phaser.GameObjects.Graphics = null;
    private mAstarSize: IPosition45Obj;

    constructor(private render: Render) {
        AstarDebugger.getInstance().setDebugger(this);
    }

    public destroy() {
        this.clearAll();
        if (this.mAstarSize) this.mAstarSize = null;
        AstarDebugger.getInstance().setDebugger(null);
    }

    public initData(map: number[][], size: IPosition45Obj) {
        this.mAstarSize = size;

        if (AstarDebugger.getInstance().isDebug) {
            this.drawPoints();
        } else {
            this.clearAll();
        }
    }

    public updateData(x: number, y: number, val: boolean) {
        if (!this.mAstarSize) return;

        if (AstarDebugger.getInstance().isDebug) {
            this.drawPoints();
        } else {
            this.clearAll();
        }
    }

    public showPath(start: IPos, tar: IPos, path: IPos[]) {
        if (!this.mAstarSize) return;

        if (AstarDebugger.getInstance().isDebug) {
            this.drawPath(start, tar, path);
        } else {
            this.clearPath();
        }
    }

    public drawPoints() {
        if (!this.mAstarSize) return;
        const scene = this.render.sceneManager.getMainScene();
        if (!scene || !(scene instanceof PlayScene)) {
            return;
        }
        this.clearAll();

        for (let y = 0; y < this.mAstarSize.rows; y++) {
            for (let x = 0; x < this.mAstarSize.cols; x++) {
                this.render.physicalPeer.isWalkableAt(x, y)
                    .then((walkable: boolean) => {
                        const color = this.getColorByValue(walkable);
                        let pos = new LogicPos(x, y);
                        pos = Position45.transformTo90(pos, this.mAstarSize);
                        pos.y += this.mAstarSize.tileHeight / 2;
                        const newGraphics = this.drawCircle(scene, pos, color, this.CIRCLE_RADIUS_POINTS);
                        this.mPoints.set(new LogicPos(x, y), newGraphics);
                    });
            }
        }
    }

    public clearAll() {
        this.mPoints.forEach((value) => {
            value.destroy();
        });
        this.mPoints.clear();

        this.clearPath();
    }

    private clearPath() {
        if (this.mStartPos) {
            this.mStartPos.destroy();
            this.mStartPos = null;
        }
        if (this.mTargetPos) {
            this.mTargetPos.destroy();
            this.mTargetPos = null;
        }
        if (this.mPath) {
            this.mPath.destroy();
            this.mPath = null;
        }
    }

    private drawPath(start: IPos, tar: IPos, path: IPos[]) {
        if (!this.mAstarSize) return;
        const scene = this.render.sceneManager.getMainScene();
        if (!scene || !(scene instanceof PlayScene)) {
            return;
        }
        this.clearPath();

        this.mStartPos = this.drawCircle(scene, start, this.CIRCLE_COLOR_START_POSITION, this.CIRCLE_RADIUS_START_POSITION);
        this.mTargetPos = this.drawCircle(scene, tar, this.CIRCLE_COLOR_TARGET_POSITION, this.CIRCLE_RADIUS_TARGET_POSITION);

        if (path.length > 1) {
            this.mPath = this.drawLine(scene, path, this.LINE_COLOR_PATH);
        }
    }

    private drawCircle(scene: PlayScene, pos: IPos, color: number, radius: number): Phaser.GameObjects.Graphics {
        const graphics = scene.make.graphics(undefined, false);
        graphics.clear();
        graphics.fillStyle(color, 1);
        graphics.fillCircle(pos.x, pos.y, radius);
        scene.layerManager.addToLayer("middleLayer", graphics);
        return graphics;
    }

    private drawLine(scene: PlayScene, path: IPos[], color: number): Phaser.GameObjects.Graphics {
        const graphics = scene.make.graphics(undefined, false);
        graphics.lineStyle(1, color);
        graphics.beginPath();

        for (let i = 0; i < path.length - 1; i++) {
            let iPo = path[i];
            let point = new LogicPos(iPo.x, iPo.y);
            graphics.moveTo(point.x, point.y);
            iPo = path[i + 1];
            point = new LogicPos(iPo.x, iPo.y);
            graphics.lineTo(point.x, point.y);
        }

        graphics.closePath();
        graphics.strokePath();
        scene.layerManager.addToLayer("middleLayer", graphics);
        return graphics;
    }

    private getColorByValue(val: boolean) {
        return val ? this.CIRCLE_COLOR_POINTS_PASS : this.CIRCLE_COLOR_POINTS_NOTPASS;
    }
}

export class AstarDebugger implements ChatCommandInterface {

    public static getInstance(): AstarDebugger {
        if (!AstarDebugger._instance) AstarDebugger._instance = new AstarDebugger();
        return AstarDebugger._instance;
    }

    private static _instance: AstarDebugger;

    public isDebug: boolean = false;
    private mAstar: Astar;

    constructor() {
        this.mAstar = null;
    }

    public setDebugger(grids: Astar) {
        this.mAstar = grids;
    }

    public q() {
        this.isDebug = false;
        if (this.mAstar) {
            this.mAstar.clearAll();
        }
    }

    public v() {
        this.isDebug = true;
        if (this.mAstar) {
            this.mAstar.drawPoints();
        }
    }

}
