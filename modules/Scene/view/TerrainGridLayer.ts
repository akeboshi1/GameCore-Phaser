import {BasicSceneLayer} from "../../../base/BasicSceneLayer";
import Globals from "../../../Globals";
import {SceneInfo} from "../../../common/struct/SceneInfo";

export class TerrainGridLayer extends BasicSceneLayer {
    public graphics: Phaser.Graphics;
    public constructor(game: Phaser.Game) {
        super(game);
    }

    public initializeMap(value: SceneInfo): void {
        let cols: number = value.cols;
        let rows: number = value.rows;
        let n: number = cols * rows;
        this.graphics = this.game.make.graphics();
        this.graphics.clear();
        this.graphics.lineStyle(1, 0xffffff, 1);
        for (let i = 0; i < n; i++) {
            let colIndex: number = Math.floor(i % cols);
            let rowIndex: number = Math.floor(i / cols);
            let p = Globals.Room45Util.tileToPixelCoords(colIndex, rowIndex);
            this.graphics.moveTo(p.x, p.y);
            this.graphics.lineTo(p.x - value.tileWidth / 2, p.y + value.tileHeight / 2);
            this.graphics.lineTo(p.x, p.y + value.tileHeight);
            this.graphics.lineTo(p.x + value.tileWidth / 2, p.y + value.tileHeight / 2);
            this.graphics.lineTo(p.x, p.y);
            this.graphics.endFill();
        }
        this.graphics.lineStyle(0);
        this.graphics.beginFill(0xff0000, 0);
        let p1 = Globals.Room45Util.tileToPixelCoords(0, 0);
        let p2 = Globals.Room45Util.tileToPixelCoords(cols, 0);
        let p3 = Globals.Room45Util.tileToPixelCoords(cols, rows);
        let p4 = Globals.Room45Util.tileToPixelCoords(0, rows);
        let poly: Phaser.Polygon = new Phaser.Polygon([p1, p2, p3, p4]);
        this.graphics.drawPolygon(poly.points);
        this.graphics.endFill();
        this.addChild(this.graphics);
        this.graphics.cacheAsBitmap = true;
    }
}
