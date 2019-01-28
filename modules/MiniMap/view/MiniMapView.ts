import {ModuleViewBase} from "../../../common/view/ModuleViewBase";

export class MiniMapView extends ModuleViewBase {
  public mapRect: Phaser.Graphics;
  public curRect: Phaser.Graphics;
  constructor(game: Phaser.Game) {
    super(game);
  }

  protected init(): void {
    this.mapRect = this.game.make.graphics();
    this.add(this.mapRect);
    this.curRect = this.game.make.graphics();
    this.add(this.curRect);
  }
}
