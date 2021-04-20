import { Render } from "../../render";
import { PlayScene } from "../../scenes/play.scene";
import { ChatCommandInterface, IPos, IPosition45Obj, LogicPos, Position45 } from "structure";

enum PointsShowType {
    None,// 全部不显示
    All,// 全部显示（性能消耗巨大）
    OnlyWalkable,// 只显示可行走区域（绿点）
    OnlyNotWalkable// 只显示不可行走区域（红点）
}

export class Astar {
    private readonly CIRCLE_RADIUS_POINTS = 2;
    private readonly CIRCLE_RADIUS_START_POSITION = 4;
    private readonly CIRCLE_RADIUS_TARGET_POSITION = 4;
    private readonly CIRCLE_COLOR_POINTS_PASS = 0x00FF00;
    private readonly CIRCLE_COLOR_POINTS_NOTPASS = 0xFF0000;
    private readonly CIRCLE_COLOR_START_POSITION = 0xFFFF00;
    private readonly CIRCLE_COLOR_TARGET_POSITION = 0xFFFF00;
    private readonly LINE_COLOR_PATH = 0xFFFF00;

    // 是否显示所有可行经点。如果打开会非常消耗性能
    private mPointsShowType: PointsShowType = PointsShowType.None;

    private mPoints_Walkable: Phaser.GameObjects.Graphics = null;
    private mPoints_NotWalkable: Phaser.GameObjects.Graphics = null;
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

    public async drawPoints() {
        if (this.mPointsShowType === PointsShowType.None) return;
        if (!this.mAstarSize) return;
        const scene = this.render.sceneManager.getMainScene();
        if (!scene || !(scene instanceof PlayScene)) {
            return;
        }
        this.clearAll();

        const walkablePoses: IPos[] = [];
        const notWalkablePoses: IPos[] = [];
        for (let y = 0; y < this.mAstarSize.rows; y++) {
            for (let x = 0; x < this.mAstarSize.cols; x++) {
                const walkable = await this.render.physicalPeer.isWalkableAt(x, y);
                if (this.mPointsShowType === PointsShowType.OnlyWalkable && !walkable) continue;
                if (this.mPointsShowType === PointsShowType.OnlyNotWalkable && walkable) continue;

                let pos = new LogicPos(x, y);
                pos = Position45.transformTo90(pos, this.mAstarSize);
                pos.y += this.mAstarSize.tileHeight / 2;

                if (walkable) {
                    walkablePoses.push(pos);
                } else {
                    notWalkablePoses.push(pos);
                }
            }
        }

        if (walkablePoses.length > 0) {
            this.mPoints_Walkable = scene.make.graphics(undefined, false);
            this.mPoints_Walkable.clear();
            this.mPoints_Walkable.fillStyle(this.CIRCLE_COLOR_POINTS_PASS, 1);

            for (const pos of walkablePoses) {
                this.mPoints_Walkable.fillCircle(pos.x, pos.y, this.CIRCLE_RADIUS_POINTS);
            }

            scene.layerManager.addToLayer("middleLayer", this.mPoints_Walkable);
        }

        if (notWalkablePoses.length > 0) {
            this.mPoints_NotWalkable = scene.make.graphics(undefined, false);
            this.mPoints_NotWalkable.clear();
            this.mPoints_NotWalkable.fillStyle(this.CIRCLE_COLOR_POINTS_NOTPASS, 1);

            for (const pos of notWalkablePoses) {
                this.mPoints_NotWalkable.fillCircle(pos.x, pos.y, this.CIRCLE_RADIUS_POINTS);
            }

            scene.layerManager.addToLayer("middleLayer", this.mPoints_NotWalkable);
        }
    }

    public clearAll() {
        if (this.mPoints_Walkable) {
            this.mPoints_Walkable.destroy();
            this.mPoints_Walkable = null;
        }
        if (this.mPoints_NotWalkable) {
            this.mPoints_NotWalkable.destroy();
            this.mPoints_NotWalkable = null;
        }

        this.clearPath();
    }

    private clearPath() {
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

        this.mPath = scene.make.graphics(undefined, false);
        this.mPath.clear();
        this.mPath.fillStyle(this.CIRCLE_COLOR_START_POSITION, 1);
        this.mPath.fillCircle(start.x, start.y, this.CIRCLE_RADIUS_START_POSITION);
        this.mPath.fillStyle(this.CIRCLE_COLOR_TARGET_POSITION, 1);
        this.mPath.fillCircle(tar.x, tar.y, this.CIRCLE_RADIUS_TARGET_POSITION);
        if (path.length > 1) {
            this.mPath.lineStyle(1, this.LINE_COLOR_PATH);
            this.mPath.beginPath();

            for (let i = 0; i < path.length - 1; i++) {
                let iPo = path[i];
                let point = new LogicPos(iPo.x, iPo.y);
                this.mPath.moveTo(point.x, point.y);
                iPo = path[i + 1];
                point = new LogicPos(iPo.x, iPo.y);
                this.mPath.lineTo(point.x, point.y);
            }

            this.mPath.closePath();
            this.mPath.strokePath();
        }
        scene.layerManager.addToLayer("middleLayer", this.mPath);
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
