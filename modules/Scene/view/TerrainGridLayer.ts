import {BasicSceneLayer} from "../../../base/BasicSceneLayer";
import Globals from "../../../Globals";
import {MapInfo} from "../../../common/struct/MapInfo";

export class TerrainGridLayer extends BasicSceneLayer {
    public constructor(game: Phaser.Game) {
        super(game);
    }

    public initializeMap(value: MapInfo): void {
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
            graphics.lineTo(p.x - value.tilewidth / 2, p.y + value.tileheight / 2);
            graphics.lineTo(p.x, p.y + value.tileheight);
            graphics.lineTo(p.x + value.tilewidth / 2, p.y + value.tileheight / 2);
            graphics.lineTo(p.x, p.y);
            graphics.endFill();
        }
        graphics.beginFill(0xff0000, 0);
        let poly: Phaser.Polygon = new Phaser.Polygon([new Phaser.Point(value.mapTotalWidth >> 1, 0), new Phaser.Point(value.mapTotalWidth, value.mapTotalHeight >> 1)
            , new Phaser.Point(value.mapTotalWidth >> 1, value.mapTotalHeight), new Phaser.Point(0, value.mapTotalHeight >> 1)]);
        graphics.drawPolygon(poly.points);
        graphics.endFill();
        this.addChild(graphics);
    }
}