import {ModuleViewBase} from "../../../common/view/ModuleViewBase";
import {UI} from "../../../Assets";
import {PhaserNineSlice} from "../../../lib/nineSlice/Plugin";

export class ChatView extends ModuleViewBase {
  constructor(game: Phaser.Game) {
    super(game);
  }

  public onResize(): void {
    this.x = this.game.camera.x;
    this.y = this.game.camera.y;
  }

  protected init(): void {
    let ns: PhaserNineSlice.NineSlice = this.game.add.nineSlice(0, 0, UI.DialogBg.getName(), null, 200 , 100);
    this.add(ns);
  }
}
