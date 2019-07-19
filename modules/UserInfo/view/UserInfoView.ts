import { ModuleViewBase } from "../../../common/view/ModuleViewBase";
import { UI } from "../../../Assets";
import { NiceSliceButton } from "../../../base/component/button/NiceSliceButton";

export class UserInfoView extends ModuleViewBase {
  private background: PhaserNineSlice.NineSlice;
  constructor(game: Phaser.Game) {
    super(game);
  }

  init() {
    this.background = this.game.add.nineSlice(0, 0, UI.BagBg.getName(), null, 360, 200, this);
  }
}