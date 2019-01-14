import {DisplaySortableSceneLayer} from "./DisplaySortableSceneLayer";
import {GameConfig} from "../../../GameConfig";

export class TerrainSortableSceneLayer extends DisplaySortableSceneLayer {
  /**
   * Indicates this layer is dirty and needs to resort.
   */
  public markDirty(x: number, y: number, w: number, h: number): void {
    if (this.mSortRectangle === undefined || this.mSortRectangle == null) {
      this.mSortRectangle = new Phaser.Rectangle(x, y, w, h);
      this.mDepthSortDirtyFlag = true;
      return;
    }

    if ((x > this.game.camera.x + GameConfig.GameWidth) || ((x + w) < this.game.camera.x)) {
      return;
    }
    if ((y > this.game.camera.y + GameConfig.GameHeight) || ((y + h) < this.game.camera.y)) {
      return;
    }

    this.mSortRectangle.x = this.game.camera.x;
    this.mSortRectangle.y = this.game.camera.y;
    this.mSortRectangle.width = GameConfig.GameWidth;
    this.mSortRectangle.height = GameConfig.GameHeight;

    this.mDepthSortDirtyFlag = true;
  }
}
