import {BasicSceneLayer} from "../../../base/BasicSceneLayer";
import Globals from "../../../Globals";
import {SceneInfo} from "../../../common/struct/SceneInfo";

export class DrawSceneLayer extends BasicSceneLayer {
    public constructor(game: Phaser.Game) {
        super(game);
    }

    public initializeMap(value: SceneInfo): void {
        let cols: number = value.cols;
        let rows: number = value.rows;
        let i: number = 0;
        let n: number = cols * rows;
        let graphics = this.game.make.graphics();
        graphics.clear();
        graphics.lineStyle(1, 0xffffff, 1);
        for (; i < n; i++) {
            let colIndex: number = Math.floor(i % cols);
            let rowIndex: number = Math.floor(i / cols);
            let p = Globals.Room45Util.tileToPixelCoords(colIndex, rowIndex);
            graphics.moveTo(p.x, p.y);
            graphics.lineTo(p.x - value.tileWidth / 2, p.y + value.tileHeight / 2);
            graphics.lineTo(p.x, p.y + value.tileHeight);
            graphics.lineTo(p.x + value.tileWidth / 2, p.y + value.tileHeight / 2);
            graphics.lineTo(p.x, p.y);
            graphics.endFill();
        }
        graphics.lineStyle(0);
        graphics.beginFill(0xff0000, 0);
        let p1 = Globals.Room45Util.tileToPixelCoords(0, 0);
        let p2 = Globals.Room45Util.tileToPixelCoords(cols, 0);
        let p3 = Globals.Room45Util.tileToPixelCoords(cols, rows);
        let p4 = Globals.Room45Util.tileToPixelCoords(0, rows);
        let poly: Phaser.Polygon = new Phaser.Polygon([p1, p2, p3, p4]);
        graphics.drawPolygon(poly.points);
        graphics.endFill();
        this.addChild(graphics);
    }
}