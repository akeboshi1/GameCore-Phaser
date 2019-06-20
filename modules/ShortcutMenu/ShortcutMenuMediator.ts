import {MediatorBase} from "../../base/module/core/MediatorBase";
import {ShortcutMenuView} from "./view/ShortcutMenuView";
import Globals from "../../Globals";
import {MessageType} from "../../common/const/MessageType";
import {op_gameconfig, op_virtual_world} from "pixelpai_proto";
import {ShortcutMenuListItem} from "./view/item/ShortcutMenuListItem";
import {ModuleTypeEnum} from "../../base/module/base/ModuleType";
import {UIEvents} from "../../base/component/event/UIEvents";
import {IDragable} from "../../base/drag/interfaces/IDragable";
import {IDropable} from "../../base/drag/interfaces/IDropable";
import {Log} from "../../Log";
import {Const} from "../../common/const/Const";
import DropType = Const.DropType;
import DragType = Const.DragType;
import {PBpacket} from "net-socket-packet";
import OP_CLIENT_REQ_VIRTUAL_WORLD_TARGET_UI = op_virtual_world.OP_CLIENT_REQ_VIRTUAL_WORLD_TARGET_UI;

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
        Globals.MessageCenter.on(MessageType.SCENE_SYNCHRO_PACKAGE, this.handleSynchroPackage, this);
        this.view.m_List.on(UIEvents.LIST_ITEM_DOWN, this.onListItemDown, this);
        this.view.m_List.on(UIEvents.LIST_ITEM_UP, this.onListItemUp, this);
        this.view.m_BagBt.events.onInputDown.add(this.onBagClick, this);
    }

    private handleSynchroPackage(): void {
        this.initView();
    }

    private onListItemDown(item: ShortcutMenuListItem): void {
        Globals.DragManager.startDrag(item.icon);
    }

    private onListItemUp(item: ShortcutMenuListItem): void {
        let pack: op_gameconfig.IPackage = Globals.DataCenter.PlayerData.mainPlayerInfo.package[0];

        let pkt: PBpacket = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_TARGET_UI);
        let content: OP_CLIENT_REQ_VIRTUAL_WORLD_TARGET_UI = pkt.content;
        content.uiId = pack.id;
        content.componentId = item.data.id;

        Globals.SocketManager.send(pkt);
    }

    private handleInit(): void {
        this.initView();
    }

    private initView(): void {
        let packs: op_gameconfig.IPackage[] = Globals.DataCenter.PlayerData.mainPlayerInfo.package;
        if (packs == null || packs.length === 0) {
            return;
        }
        if (this.view.m_List) this.onRemove();
        let pack: op_gameconfig.IPackage = packs[0];
        let item: ShortcutMenuListItem;
        let temps = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "="];
        let len = packs[0].items.length < temps.length ? packs[0].items.length : temps.length;
        for (let i = 0; i < len; i++) {
            item = new ShortcutMenuListItem(Globals.game);
            item.setEnable(true);
            item.data = pack.items[i];
            this.view.m_List.addItem(item);
            Globals.DragManager.registerDrop(item.icon);
            if (i < temps.length) {
                item.setShortCut(temps[i]);
            }
        }
    }

    private onBagClick(): void {
        Globals.ModuleManager.openModule(ModuleTypeEnum.BAG);
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
        this.view.m_List.onClear();
    }
}
