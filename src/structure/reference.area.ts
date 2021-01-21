import { Render } from "gamecoreRender";
import { Pos, Logger, IPosition45Obj, Position45, IPos } from "utils";

export class ReferenceArea extends Phaser.GameObjects.Graphics {
    private mSize: IPosition45Obj;
    private mOrigin: IPos;
    constructor(scene: Phaser.Scene) {
        super(scene);
    }

    async draw(area: number[][], origin: IPos, tileWidth: number, tileHeight: number) {
        this.clear();
        if (area.length === 0 || area[0].length === 0) {
            return;
        }
        let p1: Pos;
        let p2: Pos;
        let p3: Pos;
        let p4: Pos;
        const rows = area.length;
        const cols = area[0].length;
        this.mOrigin = origin;
        this.mSize = {
            rows,
            cols,
            tileWidth,
            tileHeight,
            sceneWidth: (rows + cols) * (tileWidth / 2),
            sceneHeight: (rows + cols) * (tileHeight / 2)
        };
        this.beginPath();
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                this.lineStyle(2, 0);
                p1 = Position45.transformTo90(new Pos(x, y), this.mSize);
                p2 = Position45.transformTo90(new Pos(x + 1, y), this.mSize);
                p3 = Position45.transformTo90(new Pos(x + 1, y + 1), this.mSize);
                p4 = Position45.transformTo90(new Pos(x, y + 1), this.mSize);
                this.beginPath();
                this.fillStyle(area[y][x] === 1 ? 0x00FF00 : 0xFF0000);
                this.strokePoints([p1.toPoint(), p2.toPoint(), p3.toPoint(), p4.toPoint()], true, true);
                this.fillPath();
            }
        }
        this.setPosition(0, 0);
    }

    setPosition(x?: number, y?: number, z?: number, w?: number): this {
        if (!this.mSize) return;
        // const _x = x - this.mSize.rows * (this.mSize.tileWidth >> 1) - (this.mOrigin.x - this.mOrigin.y) * (this.mSize.tileWidth >> 1);
        const _x = x - (this.mOrigin.x - this.mOrigin.y) * (this.mSize.tileWidth >> 1);
        const _y = y - (this.mOrigin.x + this.mOrigin.y + 0.5) * (this.mSize.tileHeight >> 1);
        return super.setPosition(_x, _y, z, w);
    }

    get size(): IPosition45Obj {
        return this.mSize;
    }
}
