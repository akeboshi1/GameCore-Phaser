import {Render} from "../../render";
import {ChatCommandInterface, IPosition45Obj, LogicPos, Position45} from "utils";
import {PlayScene} from "../../scenes/play.scene";

export class GridsDebugger implements ChatCommandInterface {
    public isDebug: boolean = false;

    private mGraphic: Phaser.GameObjects.Graphics;
    private mRoomSize: IPosition45Obj;

    constructor(private render: Render) {

    }

    public destroy() {
        if (this.mGraphic) this.mGraphic.destroy();
        this.mRoomSize = null;
    }

    public setData(posObj: IPosition45Obj) {
        this.mRoomSize = posObj;

        if (this.isDebug) {
            this.show();
        } else {
            this.hide();
        }
    }

    public show() {
        if (!this.mRoomSize) return;
        const scene = this.render.sceneManager.getMainScene();
        if (!scene || !(scene instanceof PlayScene)) {
            return;
        }
        if (this.mGraphic) this.mGraphic.destroy();
        this.mGraphic = scene.make.graphics(undefined, false);
        this.mGraphic.clear();
        this.mGraphic.lineStyle(1, 0x00FF00);
        this.mGraphic.beginPath();
        for (let i = 0; i <= this.mRoomSize.rows; i++) {
            this.drawLine(this.mRoomSize, this.mGraphic, 0, i, this.mRoomSize.cols, i);
        }
        for (let i = 0; i <= this.mRoomSize.cols; i++) {
            this.drawLine(this.mRoomSize, this.mGraphic, i, 0, i, this.mRoomSize.rows);
        }
        this.mGraphic.closePath();
        this.mGraphic.strokePath();
        scene.layerManager.addToLayer("middleLayer", this.mGraphic);
    }

    public hide() {
        if (this.mGraphic) this.mGraphic.destroy();
    }

    public q() {
        this.isDebug = false;
        this.hide();
    }

    public v() {
        if (!this.isDebug) {
            this.show();
        }

        this.isDebug = true;
    }

    private drawLine(
        posObj: IPosition45Obj,
        graphics: Phaser.GameObjects.Graphics,
        startX: number,
        endX: number,
        startY: number,
        endY: number
    ) {
        let point = new LogicPos(startX, endX);
        point = Position45.transformTo90(point, posObj);
        graphics.moveTo(point.x, point.y);
        point = new LogicPos(startY, endY);
        point = Position45.transformTo90(point, posObj);
        graphics.lineTo(point.x, point.y);
    }

}
