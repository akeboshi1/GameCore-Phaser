import {ChatCommandInterface, IPosition45Obj, Logger, LogicPoint, LogicPos, Position45} from "utils";
import {Render} from "../../render";
import {PlayScene} from "../../scenes";

export class SortDebugger implements ChatCommandInterface {
    public static getInstance(): SortDebugger {
        if (!SortDebugger._instance) {
            Logger.getInstance().error("SortDebugger not created");
        }
        return SortDebugger._instance;
    }

    private static _instance: SortDebugger;

    public isDebug: boolean = true;

    private readonly RECT_COLOR: number = 0x00ff00;

    private mData: Map<number, Rect>;
    private mGraphics: Map<number, Phaser.GameObjects.Graphics>;

    constructor(private render: Render) {
        SortDebugger._instance = this;
        this.mData = new Map<number, Rect>();
        this.mGraphics = new Map<number, Phaser.GameObjects.Graphics>();
    }

    public q() {
        this.isDebug = false;

        this.clear();
    }

    public v() {
        if (!this.isDebug) {
            this.redraw();
        }

        this.isDebug = true;
    }

    public clear() {
        this.mGraphics.forEach((graphics) => {
            graphics.destroy();
        });
        this.mGraphics.clear();
    }

    public addDisplayObject(id: number, x: number, y: number, w: number, h: number) {
        const rect = new Rect(x, y, w, h);
        this.mData.set(id, rect);

        if (!this.isDebug) return;
        const scene = this.render.sceneManager.getMainScene();
        if (!scene || !(scene instanceof PlayScene)) {
            return;
        }
        this.render.mainPeer.getCurrentRoomSize()
            .then((size) => {
                if (this.mGraphics.get(id)) {
                    this.mGraphics.get(id).destroy();
                }
                this.mGraphics.set(id, this.drawObj(scene, this.RECT_COLOR, rect, size));
            });
    }

    private redraw() {
        this.clear();

        const scene = this.render.sceneManager.getMainScene();
        if (!scene || !(scene instanceof PlayScene)) {
            return;
        }
        this.render.mainPeer.getCurrentRoomSize()
            .then((size) => {
                this.mData.forEach((rect, id) => {
                    this.mGraphics.set(id, this.drawObj(scene, this.RECT_COLOR, rect, size));
                });
            });
    }

    private drawObj(scene: PlayScene, color: number, rect: Rect, posObj: IPosition45Obj): Phaser.GameObjects.Graphics {
        Logger.getInstance().debug("#sort drawRect: ", rect);

        let pos1 = new LogicPos(rect.x, rect.y);
        pos1 = Position45.transformTo90(pos1, posObj);
        let pos2 = new LogicPos(rect.x + rect.w, rect.y);
        pos2 = Position45.transformTo90(pos2, posObj);
        let pos3 = new LogicPos(rect.x + rect.w, rect.y + rect.h);
        pos3 = Position45.transformTo90(pos3, posObj);
        let pos4 = new LogicPos(rect.x, rect.y + rect.h);
        pos4 = Position45.transformTo90(pos4, posObj);


        const graphics = scene.make.graphics(undefined, false);
        graphics.lineStyle(1, color);
        graphics.fillStyle(color, 1);
        graphics.moveTo(pos1.x, pos1.y);
        graphics.lineTo(pos2.x, pos2.y);
        graphics.lineTo(pos3.x, pos3.y);
        graphics.lineTo(pos4.x, pos4.y);
        graphics.lineTo(pos1.x, pos1.y);
        graphics.fillPath();
        scene.layerManager.addToLayer("middleLayer", graphics);
        return graphics;
    }
}

class Rect {
    constructor(public x: number, public y: number, public w: number, public h: number) {
    }
}
