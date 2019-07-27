import { UI } from "../../../Assets";
import { GameConfig } from "../../../GameConfig";
import { BasicRankView } from "../../Rank/view/BasicRankView";

export class ComponentRankView extends BasicRankView {
  private mCloseBtn: Phaser.Button;
  constructor(game: Phaser.Game) {
    super(game);
  }

  init() {
    super.init();
    this.mBg.resize(this.mBg.width, 344);

    this.mCloseBtn = this.game.make.button(this.width - 30, 4, UI.WindowClose.getName(), this.onCloseClick, this, 1, 0, 2);
    this.add(this.mCloseBtn);
  }

  public onResize(): void {
    this.x = (GameConfig.GameWidth - this.width) >> 1;
    this.y = (GameConfig.GameHeight - this.height) >> 1;
  }

  private onCloseClick() {
    this.emit("close");
  }
}