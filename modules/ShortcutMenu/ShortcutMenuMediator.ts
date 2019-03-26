import {MediatorBase} from "../../base/module/core/MediatorBase";
import {ShortcutMenuView} from "./view/ShortcutMenuView";
import Globals from "../../Globals";
import {MessageType} from "../../common/const/MessageType";
import {op_gameconfig} from "../../../protocol/protocols";
import {ShortcutMenuListItem} from "./view/item/ShortcutMenuListItem";
import {IImageResource, INineSliceImageResource, ISheetResource} from "../../interface/IPhaserLoadList";
import {UI} from "../../Assets";
import {ModuleTypeEnum} from "../../base/module/base/ModuleType";
import {UIEvents} from "../../base/component/event/UIEvents";
import {ComboTextItem} from "../../base/component/combobox/item/ComboTextItem";

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
        this.view.m_List.on(UIEvents.LIST_ITEM_DOWN, this.onListItemDown, this);
        this.view.m_List.on(UIEvents.LIST_ITEM_UP, this.onListItemUp, this);
    }

    private onListItemDown(item: ShortcutMenuListItem): void {
        Globals.DragManager.startDrag(item.icon);
    }

    private onListItemUp(item: ShortcutMenuListItem): void {
    }

    private handleInit(): void {
        this.initView();
    }

    private initView(): void {
        let packs: op_gameconfig.IPackage[] = Globals.DataCenter.PlayerData.mainPlayerInfo.package;
        if (packs == null || packs.length === 0) {
            return;
        }
        // let pack: op_gameconfig.IPackage = packs[0];
        // let item: ShortcutMenuListItem;
        // let temps = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "="];
        // let len = temps.length;
        // for (let i = 0; i < len; i++) {
        //     item = new ShortcutMenuListItem(Globals.game);
        //     item.data = pack.items[i];
        //     this.view.m_List.addItem(item);
        //     if (i < temps.length) {
        //         item.setShortCut(temps[i]);
        //     }
        // }
        // this.view.m_BagBt.events.onInputDown.add(this.onBagClick, this);
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
        Globals.ModuleManager.openModule(ModuleTypeEnum.BAG, {nineslices: nineslices, images: images, sheets: sheets});

        // Globals.ModuleManager.openModule(ModuleTypeEnum.ITEMDETAIL, {sheets: sheets});
    }
}
