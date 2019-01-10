import {BasicSceneLayer} from "../../../base/BasicSceneLayer";
import Globals from "../../../Globals";
import {SceneInfo} from "../../../common/struct/SceneInfo";

export class TerrainGridLayer extends BasicSceneLayer {
    protected graphicsGrid: Phaser.Graphics;
    public constructor(game: Phaser.Game) {
        super(game);
    }

    public get clickArea(): Phaser.Graphics {
      return this.graphicsGrid;
    }

    public initializeMap(value: SceneInfo): void {
        let cols: number = value.cols;
        let rows: number = value.rows;
        let n: number = cols * rows;
        this.graphicsGrid = this.game.make.graphics();
        this.graphicsGrid.clear();
        for (let i = 0; i < n; i++) {
            let colIndex: number = Math.floor(i % cols);
            let rowIndex: number = Math.floor(i / cols);
            let p = Globals.Room45Util.tileToPixelCoords(colIndex, rowIndex);
            this.graphicsGrid.lineStyle(1, 0xffffff, 1);
            this.graphicsGrid.moveTo(p.x, p.y);
            this.graphicsGrid.lineTo(p.x - value.tileWidth / 2, p.y + value.tileHeight / 2);
            this.graphicsGrid.lineTo(p.x, p.y + value.tileHeight);
            this.graphicsGrid.lineTo(p.x + value.tileWidth / 2, p.y + value.tileHeight / 2);
            this.graphicsGrid.lineTo(p.x, p.y);
            this.graphicsGrid.endFill();

            this.graphicsGrid.lineStyle(0);
            this.graphicsGrid.beginFill(0x00ffff, 0);
            let p1 = Globals.Room45Util.tileToPixelCoords(colIndex, rowIndex);
            let p2 = Globals.Room45Util.tileToPixelCoords(colIndex + 1, rowIndex);
            let p3 = Globals.Room45Util.tileToPixelCoords(colIndex + 1, rowIndex + 1);
            let p4 = Globals.Room45Util.tileToPixelCoords(colIndex, rowIndex + 1);
            let poly: Phaser.Polygon = new Phaser.Polygon([p1, p2, p3, p4]);
            this.graphicsGrid.drawPolygon(poly.points);
            this.graphicsGrid.endFill();
        }
        this.graphicsGrid.cacheAsBitmap = true;
        this.addChild(this.graphicsGrid);
    }
}
