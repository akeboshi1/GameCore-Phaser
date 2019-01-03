import {MediatorBase} from "../../base/module/core/MediatorBase";
import {ShortcutMenuView} from "./view/ShortcutMenuView";
import Globals from "../../Globals";
import {MessageType} from "../../common/const/MessageType";
import {op_gameconfig} from "../../../protocol/protocols";
import {ShortcutMenuListItem} from "./view/item/ShortcutMenuListItem";

export class ShortcutMenuMediator extends MediatorBase {

  private get view(): ShortcutMenuView {
    return this.viewComponent as ShortcutMenuView;
  }

  public onRegister(): void {
      if (Globals.DataCenter.PlayerData.initialize) {
          this.initView();
      } else {
          Globals.MessageCenter.on(MessageType.PLAYER_DATA_INITIALIZE, this.handleInit, this);
      }
      this.addEvent();
  }

    private addEvent(): void {
        // Globals.MessageCenter.on(MessageType.SCENE_UPDATE_PLAYER, this.handleUpdate, this);
    }

    private handleInit(): void {
        this.initView();
    }

    // private handleUpdate(player: PlayerInfo): void {
    //
    // }

    private initView(): void {
        let packs: op_gameconfig.IPackage[] = Globals.DataCenter.PlayerData.mainPlayerInfo.package;
        if (packs == null || packs.length === 0) {
            return;
        }
        let pack: op_gameconfig.IPackage = packs[0];
        let len = pack.maxIndex;
        let item: ShortcutMenuListItem;
        let temps = ["1", "2", "3", "4"];
        let icons = [1, 2, 3, 4];
        for (let i = 0; i < len; i++) {
            item = new ShortcutMenuListItem(Globals.game);
            item.data = pack.items[i];
            if (i < temps.length) {
                item.setShortCut(temps[i]);
                item.setIcon(icons[i]);
            }
            this.view.m_List.addItem(item);
        }
    }
}
