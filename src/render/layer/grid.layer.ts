import {IRoomService} from "../room";
import {Pos} from "../../game/core/utils/pos";
import {Logger} from "../../game/core/utils/log";

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
        for (let i = 0; i <= rows; i++) {
            this.drawLine(room.transformTo90(new Pos(0, i)), room.transformTo90(new Pos(cols, i)));
        }
        for (let i = 0; i <= cols; i++) {
            this.drawLine(room.transformTo90(new Pos(i, 0)), room.transformTo90(new Pos(i, rows)));
        }

    }

    private drawLine(startPos: Pos, endPos: Pos) {
        // this.moveTo(startPos.x, startPos.y);
        // this.lineTo(endPos.x, endPos.y);
        this.lineBetween(startPos.x, startPos.y, endPos.x, endPos.y);
    }
}
