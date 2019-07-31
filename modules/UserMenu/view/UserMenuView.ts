import { NiceSliceButton } from "../../../base/component/button/NiceSliceButton";
import { UI } from "../../../Assets";
import { op_client, op_gameconfig_01 } from "pixelpai_proto";
import { ModuleViewBase } from "../../../common/view/ModuleViewBase";
import { MenuItem } from "./menu/MenuItem";

export class UserMenuView extends ModuleViewBase {
  private background: PhaserNineSlice.NineSlice;
  private menus: MenuItem[] = [];

  public up: Phaser.Signal = new Phaser.Signal();
  constructor(game: Phaser.Game) {
    super(game);
  }

  protected init() {
    super.init();
    this.background = new PhaserNineSlice.NineSlice(this.game, 0, 0, UI.Background.getName(), null, 0, 0);
    this.add(this.background);
  }

  public addItem(params: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_SHOW_UI) {
    this.clear();
    const menu: op_gameconfig_01.IMenuItem[] = params.menuItem;
    for (let i = 0; i < menu.length; i++) {
      const btn = this.appendItem(menu[i], 0, i * 32);
      this.add(btn);
      this.menus.push(btn);
    }

    this.resize(this.width, this.menus.length * 30);

    // let layer = Globals.LayerManager.sceneLayer;
    // const p = layer.toLocal(new Point(this.game.input.activePointer.x, this.game.input.activePointer.y), this.game.stage);
  }

  public updateItem(params: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_UPDATE_UI) {
    const menus: op_gameconfig_01.IMenuItem[] = params.menuItem;
    for (const menu of menus) {
      let btn = this.menus.find(m => m.node.id === menu.node.id);
      if (btn) {
        btn.setText(menu.text);
      }
    }
  }

  public updatePosition() {
    this.x = this.game.input.activePointer.x;
    this.y = this.game.input.activePointer.y;
  }

  private appendItem(menu: op_gameconfig_01.IMenuItem, x: number, y: number): MenuItem {
    let button = new MenuItem(this.game, x, y, UI.ButtonTransparent.getName(), "button_over.png", "button_out.png", "button_down.png", 70, 29, {
      top: 4,
      bottom: 4,
      left: 4,
      right: 4}, menu.text, 14);
    button.node = menu.node;
    button.on("up", this.onClickButton, this);
    if (menu.child.length > 0) {
      const menuChild = menu.child;
      for (const child of menuChild) {
        let btn = this.appendItem(child, 0, button.menus.length * 32);
        button.appendItem(btn);
      }
    }
    return button;
  }

  private onClickButton(target: MenuItem) {
    if (target.menus.length > 0) {
      target.show();
    } else {
      this.up.dispatch(target.node);
      this.emit("close");
    }
  }

  private clear() {
    for (const btn of this.menus) {
      this.remove(btn);
      btn.destroy();
    }
    this.menus.length = 0;
  }

  private resize(width: number, height: number) {
    if (this.background) {
      this.background.resize(width, height);
    }
  }

}