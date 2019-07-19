import Globals from "../../../Globals";
import { Point } from "phaser-ce";
import { NiceSliceButton } from "../../../base/component/button/NiceSliceButton";
import { UI } from "../../../Assets";
import { op_client, op_gameconfig_01 } from "pixelpai_proto";
import { CommWindowModuleView } from "../../../common/view/CommWindowModuleView ";
import { ModuleViewBase } from "../../../common/view/ModuleViewBase";

export class UserMenuView extends ModuleViewBase {
  private background: PhaserNineSlice.NineSlice;
  private btnList: NiceSliceButton[] = [];

  public up: Phaser.Signal = new Phaser.Signal();
  constructor(game: Phaser.Game) {
    super(game);
  }

  protected init() {
    this.background = new PhaserNineSlice.NineSlice(this.game, 0, 0, "", "", 0, 0);
    this.add(this.background);
  }

  public addItem(params: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_SHOW_UI) {
    this.clear();
    const menu: op_gameconfig_01.IMenuItem[] = params.menuItem;
    for (let i = 0; i < menu.length; i++) {
      let button = new NiceSliceButton(this.game, 0, i * 32, UI.ButtonChat.getName(), "button_over.png", "button_out.png", "button_down.png", 60, 29, {
        top: 4,
        bottom: 4,
        left: 4,
        right: 4}, menu[i].text, 14);
      this.add(button);
      button.node = menu[i].node;
      button.on("up", this.onClickButton, this);
      this.btnList.push(button);
    }

    let layer = Globals.LayerManager.sceneLayer;
    const p = layer.toLocal(new Point(this.game.input.activePointer.x, this.game.input.activePointer.y), this.game.stage);
    this.x = p.x;
    this.y = p.y;
  }

  private onClickButton(target: NiceSliceButton) {
    // this.emit("close");
    this.up.dispatch(target.node);
    // this.onCloseClick();
  }

  private clear() {
    for (const btn of this.btnList) {
      this.remove(btn);
      btn.destroy();
    }
    this.btnList.length = 0;
  }

}