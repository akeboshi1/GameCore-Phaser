import { BasicScene } from "baseRender";
import { IPosition45Obj, Position45, LogicPos, IPos } from "utils";
import { Render } from "gamecoreRender";
import { LayerName } from "structure";

/**
 * 房间布置显示网格
 */
export class TerrainGrid {
    private graphics: Phaser.GameObjects.Graphics;
    private dirty = false;
    private map: number[][];
    private deltaTime = 500;
    private curDelta = 0;
    constructor(private render: Render, private miniSize: IPosition45Obj) {
    }

    setMap(map: number[][]) {
        this.map = map;
        this.dirty = true;
    }

    public update(time: number, delta: number) {
        this.curDelta += delta;
        if (this.curDelta >= this.deltaTime) {
            if (this.dirty) {
                this.dirty = false;
                this.drawGrid();
            }
        }
    }

    destroy() {
        if (this.graphics) {
            this.graphics.destroy();
            this.graphics = undefined;
        }
        this.dirty = false;
        this.map = null;
    }

    private drawGrid() {
        if (!this.map) {
            return;
        }
        if (!this.graphics) {
            const scene = <BasicScene>this.render.sceneManager.getMainScene();
            if (!scene) {
                return;
            }
            this.graphics = scene.make.graphics(undefined, false);
            scene.layerManager.addToLayer(LayerName.MIDDLE, this.graphics);
        }
        this.graphics.clear();
        this.graphics.lineStyle(1, 0xffffff, 0.5);
        const cols = this.map[0].length;
        const rows = this.map.length;
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                if (this.map[i][j] !== -1) {
                    this.draw(j, i);
                }
            }
        }
        this.graphics.strokePath();
    }

    private draw(x: number, y: number) {
        const pos = Position45.transformTo90({ x, y }, this.miniSize);
        this.graphics.moveTo(pos.x, pos.y);
        this.graphics.lineTo(pos.x + this.miniSize.tileWidth * 0.5, pos.y + this.miniSize.tileHeight * 0.5);
        this.graphics.lineTo(pos.x, pos.y + this.miniSize.tileHeight);
        this.graphics.lineTo(pos.x - this.miniSize.tileWidth * 0.5, pos.y + this.miniSize.tileHeight * 0.5);
        this.graphics.closePath();
    }

    private drawLine(
        graphics: Phaser.GameObjects.Graphics,
        startX: number,
        endX: number,
        startY: number,
        endY: number,
        size: IPosition45Obj
    ) {
        let point = new LogicPos(startX, endX);
        point = Position45.transformTo90(point, size);
        graphics.moveTo(point.x, point.y);
        point = new LogicPos(startY, endY);
        point = Position45.transformTo90(point, size);
        graphics.lineTo(point.x, point.y);
    }
}
