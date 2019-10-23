import {IPosition45Obj} from "../../utils/position45";
import {IRoomService} from "../room";
import { Pos } from "../../utils/pos";

export class GridLayer extends Phaser.GameObjects.Graphics {
    constructor(scene: Phaser.Scene) {
        super(scene);
    }

    public draw(room: IRoomService) {
        this.clear();
        if (!room || !room.roomSize) return;
        this.lineStyle(1, 0xFFFFFF);
        const rows = room.roomSize.rows;
        const cols = room.roomSize.cols;
        const transformTo90 = room.transformTo90;
        for (let i = 0; i < rows; i++) {
            this.drawLine(transformTo90(new Pos(i, 0)), transformTo90(new Pos(i, rows)));
        }

        for (let i = 0; i < cols; i++) {
            this.drawLine(transformTo90(new Pos(0, i)), transformTo90(new Pos(cols, i)));
        }

    }

    private drawLine(startPos: Pos, endPos: Pos) {
        this.moveTo(startPos.x, startPos.y);
        this.lineTo(endPos.x, endPos.y);
    }
}
