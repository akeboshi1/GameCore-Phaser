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
    this.graphicsGrid = this.game.make.graphics();
    this.graphicsGrid.clear();
    this.graphicsGrid.lineStyle(1, 0xffffff, 1);

    let i = 0;
    for (; i <= cols; i++) {
      this.drawLine(this.graphicsGrid, i, 0, i, rows);
    }
    for (i = 0; i <= rows; i++) {
      this.drawLine(this.graphicsGrid, 0, i, cols, i);
    }

    // this.graphicsGrid.cacheAsBitmap = true;
    this.addChild(this.graphicsGrid);
  }

  private drawLine(graphics: Phaser.Graphics, x1: number, y1: number, x2: number, y2: number): void {
    let p = Globals.Room45Util.tileToPixelCoords(x1, y1);
    graphics.moveTo(p.x, p.y);
    p = Globals.Room45Util.tileToPixelCoords(x2, y2);
    graphics.lineTo(p.x, p.y);
  }

  public clear(): void {
    if (this.graphicsGrid) {
        this.graphicsGrid.clear();
    }
  }
}
