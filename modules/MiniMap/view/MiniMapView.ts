import {ModuleViewBase} from "../../../common/view/ModuleViewBase";

export class MiniMapView extends ModuleViewBase {
  constructor(game: Phaser.Game) {
    super(game);
  }

  public onResize(): void {
    this.x = this.game.camera.x;
    this.y = this.game.camera.y;
  }

  protected init(): void {

  }
}
