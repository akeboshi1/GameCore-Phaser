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
import {BagListItem} from "../Bag/view/item/BagListItem";
import {IDragable} from "../../base/drag/interfaces/IDragable";
import {IDropable} from "../../base/drag/interfaces/IDropable";
import {Log} from "../../Log";
import {Const} from "../../common/const/Const";
import DropType = Const.DropType;
import DragType = Const.DragType;

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

    protected handleDrop(value: any): void {
        let drag: IDragable = value[0];
        let drop: IDropable = value[1];
        if (drop.getDropType() === DropType.DROP_TYPE_SHORTCUT && drag.getDragType() === DragType.DRAG_TYPE_BAG) {
            Log.trace("快捷栏拖到背包了！！！");
        }
    }

    private addEvent(): void {
        Globals.MessageCenter.on(MessageType.DRAG_TO_DROP, this.handleDrop);
        this.view.m_List.on(UIEvents.LIST_ITEM_DOWN, this.onListItemDown, this);
        this.view.m_List.on(UIEvents.LIST_ITEM_UP, this.onListItemUp, this);
        this.view.m_BagBt.events.onInputDown.add(this.onBagClick, this);
    }

    private onListItemDown(item: ShortcutMenuListItem): void {
        Globals.DragManager.startDrag(item.icon);
    }

    private onListItemUp(item: ShortcutMenuListItem): void {
        if (Phaser.Rectangle.contains(item.icon.getBound(), Globals.game.input.activePointer.x, Globals.game.input.activePointer.y)){
            // Globals.ModuleManager.openModule(ModuleTypeEnum.ITEMDETAIL, {}, item.data);
        }
    }

    private handleInit(): void {
        this.initView();
    }

    private initView(): void {
        let packs: op_gameconfig.IPackage[] = Globals.DataCenter.PlayerData.mainPlayerInfo.package;
        if (packs == null || packs.length === 0) {
            return;
        }
        let pack: op_gameconfig.IPackage = packs[0];
        let item: ShortcutMenuListItem;
        let temps = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "="];
        let len = packs.length < temps.length ? packs.length : temps.length;
        for (let i = 0; i < len; i++) {
            item = new ShortcutMenuListItem(Globals.game);
            item.setEnable(true);
            let animation: op_gameconfig.Animation = new op_gameconfig.Animation();
            animation.baseLoc = "-102,-149";
            animation.collisionArea = "1,1,1,1&1,1,1,1&1,1,1,1&1,1,1,1";
            animation.frame = [0];
            animation.frameRate = 12;
            animation.id = 11095928;
            animation.name = "idle";
            animation.originPoint = [3, 3];
            animation.walkOriginPoint = [3, 3];
            animation.walkableArea = "1,0,0,1&0,0,0,0&0,0,0,0&0,0,0,1";
            pack.items[i].animations = [animation];
            pack.items[i].display = {texturePath: "lainson/elements/fce84fe9db16315e04be8be0b0f2c4cfdf5d8c0d/4/fce84fe9db16315e04be8be0b0f2c4cfdf5d8c0d.png",
                 dataPath: "lainson/elements/fce84fe9db16315e04be8be0b0f2c4cfdf5d8c0d/4/fce84fe9db16315e04be8be0b0f2c4cfdf5d8c0d.json"};
            item.data = pack.items[i];
            this.view.m_List.addItem(item);
            Globals.DragManager.registerDrop(item.icon);
            if (i < temps.length) {
                item.setShortCut(temps[i]);
            }
        }
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
    }

    public onRemove(): void {
        super.onRemove();
        let len = this.view.m_List.getLength();
        let item: ShortcutMenuListItem;
        for (let i = 0; i < len; i++) {
            item = this.view.m_List.getItem(i) as ShortcutMenuListItem;
            item.setEnable(false);
            Globals.DragManager.unRegisterDrop(item.icon);
            item.onDispose();
        }
    }
}
