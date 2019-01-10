import {BasicSceneLayer} from "../../../base/BasicSceneLayer";
import Globals from "../../../Globals";
import {SceneInfo} from "../../../common/struct/SceneInfo";

export class TerrainGridLayer extends BasicSceneLayer {
    protected graphicsGrid: Phaser.Graphics;
    public graphicsArea: Phaser.Graphics;
    public constructor(game: Phaser.Game) {
        super(game);
    }

    public initializeMap(value: SceneInfo): void {
        let cols: number = value.cols;
        let rows: number = value.rows;
        let n: number = cols * rows;
        this.graphicsGrid = this.game.make.graphics();
        this.graphicsGrid.clear();
        this.graphicsGrid.lineStyle(1, 0xffffff, 1);
        for (let i = 0; i < n; i++) {
            let colIndex: number = Math.floor(i % cols);
            let rowIndex: number = Math.floor(i / cols);
            let p = Globals.Room45Util.tileToPixelCoords(colIndex, rowIndex);
            this.graphicsGrid.moveTo(p.x, p.y);
            this.graphicsGrid.lineTo(p.x - value.tileWidth / 2, p.y + value.tileHeight / 2);
            this.graphicsGrid.lineTo(p.x, p.y + value.tileHeight);
            this.graphicsGrid.lineTo(p.x + value.tileWidth / 2, p.y + value.tileHeight / 2);
            this.graphicsGrid.lineTo(p.x, p.y);
            this.graphicsGrid.endFill();
        }
        this.graphicsGrid.cacheAsBitmap = true;
        this.addChild(this.graphicsGrid);

        this.graphicsArea = this.game.make.graphics();
        this.graphicsArea.lineStyle(0);
        this.graphicsArea.beginFill(0xff0000, 0);
        let p1 = Globals.Room45Util.tileToPixelCoords(0, 0);
        let p2 = Globals.Room45Util.tileToPixelCoords(cols, 0);
        let p3 = Globals.Room45Util.tileToPixelCoords(cols, rows);
        let p4 = Globals.Room45Util.tileToPixelCoords(0, rows);
        let poly: Phaser.Polygon = new Phaser.Polygon([p1, p2, p3, p4]);
        this.graphicsArea.drawPolygon(poly.points);
        this.graphicsArea.endFill();
        this.addChild(this.graphicsArea);
    }
}
