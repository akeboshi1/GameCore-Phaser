import {MediatorBase} from "../../base/module/core/MediatorBase";
import {ShortcutMenuView} from "./view/ShortcutMenuView";
import Globals from "../../Globals";
import {MessageType} from "../../common/const/MessageType";
import {op_gameconfig} from "../../../protocol/protocols";
import {ShortcutMenuListItem} from "./view/item/ShortcutMenuListItem";
import {IImageResource, INineSliceImageResource, ISheetResource} from "../../interface/IPhaserLoadList";
import {UI} from "../../Assets";
import {ModuleTypeEnum} from "../../base/module/base/ModuleType";

export class ShortcutMenuMediator extends MediatorBase {

  private get view(): ShortcutMenuView {
    return this.viewComponent as ShortcutMenuView;
  }

  public onRegister(): void {
      super.onRegister();
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
        let temps = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "="];
        for (let i = 0; i < len; i++) {
            item = new ShortcutMenuListItem(Globals.game);
            item.data = pack.items[i];
            this.view.m_List.addItem(item);
            if (i < temps.length) {
                item.setShortCut(temps[i]);
            }
        }
        this.view.m_BagBt.events.onInputDown.add(this.onBagClick, this);
    }

    private onBagClick(): void {
        let nineslices: INineSliceImageResource[] = [{
            key: UI.BagBg.getName(),
            png: UI.BagBg.getPNG(),
            top: 29,
            left: 13,
            right: 13,
            bottom: 7
        }];
        let images: IImageResource[] = [{
            key: UI.BagItemBg.getName(),
            png: UI.BagItemBg.getPNG()
        }, {
            key: UI.BagBg.getName(),
            png: UI.BagBg.getPNG()
        }, {
            key: UI.BagTitle.getName(),
            png: UI.BagTitle.getPNG()
        }, {
            key: UI.PageBt.getName(),
            png: UI.PageBt.getPNG()
        }];
        let sheets: ISheetResource[] = [{
            key: UI.PageBt.getName(),
            png: UI.PageBt.getPNG(),
            frameWidth: UI.PageBt.getWidth(),
            frameHeight: UI.PageBt.getHeight()
        }];
        // Globals.ModuleManager.openModule(ModuleTypeEnum.BAG, {nineslices: nineslices, images: images, sheets: sheets});

        Globals.ModuleManager.openModule(ModuleTypeEnum.ITEMDETAIL, {sheets: sheets});
    }
}
