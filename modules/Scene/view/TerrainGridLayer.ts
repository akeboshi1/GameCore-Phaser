import {BasicSceneLayer} from "../../../base/BasicSceneLayer";
import Globals from "../../../Globals";
import {SceneInfo} from "../../../common/struct/SceneInfo";

export class TerrainGridLayer extends BasicSceneLayer {
    protected graphicsGrid: Phaser.Graphics;
    public constructor(game: Phaser.Game) {
        super(game);
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
        }
        this.graphicsGrid.cacheAsBitmap = true;
        this.addChild(this.graphicsGrid);
    }
}
