import {Render} from "../../render";
import {PlayScene} from "../../scenes/play.scene";
import {ChatCommandInterface, IPosition45Obj, LogicPos, Position45} from "utils";

export class Astar {
    private mGraphics: Map<LogicPos, Phaser.GameObjects.Graphics> =
        new Map<LogicPos, Phaser.GameObjects.Graphics>();
    private mAstarMap: number[][];
    private mAstarSize: IPosition45Obj;

    constructor(private render: Render) {
        AstarDebugger.getInstance().setDebugger(this);
    }

    public destroy() {
        this.hide();
        if (this.mAstarMap) this.mAstarMap.length = 0;
        if (this.mAstarSize) this.mAstarSize = null;
        AstarDebugger.getInstance().setDebugger(null);
    }

    public initData(map: number[][], size: IPosition45Obj) {
        this.mAstarSize = size;
        this.mAstarMap = map;

        if (AstarDebugger.getInstance().isDebug) {
            this.show();
        } else {
            this.hide();
        }
    }

    public updateData(x: number, y: number, val: boolean) {
        if (!this.mAstarMap) return;
        if (!this.mAstarSize) return;
        if (this.mAstarMap.length <= y) return;
        if (this.mAstarMap[y].length <= x) return;
        const newVal = val ? 1 : 0;
        if (this.mAstarMap[y][x] === newVal) return;
        this.mAstarMap[y][x] = newVal;

        if (AstarDebugger.getInstance().isDebug) {
            this.show();
        } else {
            this.hide();
        }
    }

    public show() {
        if (!this.mAstarMap) return;
        if (!this.mAstarSize) return;
        const scene = this.render.sceneManager.getMainScene();
        if (!scene || !(scene instanceof PlayScene)) {
            return;
        }
        this.hide();

        for (let y = 0; y < this.mAstarMap.length; y++) {
            for (let x = 0; x < this.mAstarMap[y].length; x++) {
                const newGraphics = this.drawCircle(scene, y, x, this.mAstarMap[y][x]);
                this.mGraphics.set(new LogicPos(x, y), newGraphics);
            }
        }
    }

    public hide() {
        this.mGraphics.forEach((value) => {
            value.destroy();
        });
        this.mGraphics.clear();
    }

    private drawCircle(scene: PlayScene, x: number, y: number, val: number): Phaser.GameObjects.Graphics {
        let pos = new LogicPos(x, y);
        pos = Position45.transformTo90(pos, this.mAstarSize);
        const graphics = scene.make.graphics(undefined, false);
        graphics.clear();
        graphics.fillStyle(this.getColorByValue(val), 1);
        graphics.fillCircle(pos.x, pos.y, 2);
        scene.layerManager.addToLayer("middleLayer", graphics);
        return graphics;
    }

    private getColorByValue(val: number) {
        if (val === 1) {
            return 0x00FF00;
        }

        return 0xFF0000;
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
