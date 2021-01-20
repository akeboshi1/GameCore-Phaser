import {Render} from "../../render";
import {PlayScene} from "../../scenes/play.scene";
import {ChatCommandInterface, IPosition45Obj, Logger, LogicPos, Position45} from "utils";

export class Astar {
    private mGraphics: Map<LogicPos, Phaser.GameObjects.Graphics> =
        new Map<LogicPos, Phaser.GameObjects.Graphics>();
    private mAstarSize: IPosition45Obj;

    constructor(private render: Render) {
        AstarDebugger.getInstance().setDebugger(this);
    }

    public destroy() {
        this.hide();
        if (this.mAstarSize) this.mAstarSize = null;
        AstarDebugger.getInstance().setDebugger(null);
    }

    public initData(map: number[][], size: IPosition45Obj) {
        this.mAstarSize = size;

        if (AstarDebugger.getInstance().isDebug) {
            this.show();
        } else {
            this.hide();
        }
    }

    public updateData(x: number, y: number, val: boolean) {
        if (!this.mAstarSize) return;

        if (AstarDebugger.getInstance().isDebug) {
            this.show();
        } else {
            this.hide();
        }
    }

    public show() {
        if (!this.mAstarSize) return;
        const scene = this.render.sceneManager.getMainScene();
        if (!scene || !(scene instanceof PlayScene)) {
            return;
        }
        this.hide();

        for (let y = 0; y < this.mAstarSize.rows; y++) {
            for (let x = 0; x < this.mAstarSize.cols; x++) {
                this.render.physicalPeer.isWalkableAt(x, y)
                    .then((walkable: boolean) => {
                        const newGraphics = this.drawCircle(scene, x, y, walkable);
                        this.mGraphics.set(new LogicPos(x, y), newGraphics);
                    });
            }
        }
    }

    public hide() {
        this.mGraphics.forEach((value) => {
            value.destroy();
        });
        this.mGraphics.clear();
    }

    private drawCircle(scene: PlayScene, x: number, y: number, val: boolean): Phaser.GameObjects.Graphics {
        let pos = new LogicPos(x, y);
        pos = Position45.transformTo90(pos, this.mAstarSize);
        pos.y += this.mAstarSize.tileHeight / 2;
        const graphics = scene.make.graphics(undefined, false);
        graphics.clear();
        graphics.fillStyle(this.getColorByValue(val), 1);
        graphics.fillCircle(pos.x, pos.y, 2);
        scene.layerManager.addToLayer("middleLayer", graphics);
        return graphics;
    }

    private getColorByValue(val: boolean) {
        return val ? 0x00FF00 : 0xFF0000;
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
            this.mAstar.hide();
        }
    }

    public v() {
        this.isDebug = true;
        if (this.mAstar) {
            this.mAstar.show();
        }
    }

}
