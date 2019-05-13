import {MediatorBase} from "../../base/module/core/MediatorBase";
import {BagView} from "./view/BagView";
import {BagListItem} from "./view/item/BagListItem";
import Globals from "../../Globals";
import {MessageType} from "../../common/const/MessageType";
import {IDragable} from "../../base/drag/interfaces/IDragable";
import {IDropable} from "../../base/drag/interfaces/IDropable";
import {Const} from "../../common/const/Const";
import {Log} from "../../Log";
import {op_gameconfig} from "pixelpai_proto";
import {UIEvents} from "../../base/component/event/UIEvents";
import DropType = Const.DropType;
import DragType = Const.DragType;

export class BagMediator extends MediatorBase {

    protected pageNum = 36;
    private get view(): BagView {
        return this.viewComponent as BagView;
    }

    public onRegister(): void {
        super.onRegister();
        this.initView();
        Globals.MessageCenter.on(MessageType.DRAG_TO_DROP, this.handleDrop);
        Globals.MessageCenter.on(MessageType.SCENE_SYNCHRO_PACKAGE, this.handleSynchroPackage);
        this.view.m_List.on(UIEvents.LIST_ITEM_DOWN, this.onListItemDown, this);
        this.view.m_List.on(UIEvents.LIST_ITEM_UP, this.onListItemUp, this);
        this.view.m_Page.on("change", this.handlePageChange);
    }

    private handleSynchroPackage(): void {
        this.initView();
    }

    private onListItemDown(item: BagListItem): void {
        Globals.DragManager.startDrag(item.icon);
    }

    private onListItemUp(item: BagListItem): void {
        if (Phaser.Rectangle.contains(item.icon.getBound(), Globals.game.input.activePointer.x, Globals.game.input.activePointer.y)){
            // Globals.ModuleManager.openModule(ModuleTypeEnum.ITEMDETAIL, {}, item.data);
        }
    }

    private handlePageChange(curPage: number): void {
        let packs: op_gameconfig.IPackage[] = Globals.DataCenter.PlayerData.mainPlayerInfo.package;
        if (packs == null || packs.length === 0) {
            return;
        }
        this.renderList(packs[0].items);
    }

    private initView(): void {
        let packs: op_gameconfig.IPackage[] = Globals.DataCenter.PlayerData.mainPlayerInfo.package;
        if (packs == null || packs.length === 0) {
            return;
        }
        this.view.m_Page.setMaxIndex(Math.ceil(packs[0].items.length / this.pageNum));
        this.renderList(packs[0].items);
    }

    private renderList(value: any[]): void {
        this.view.m_List.onClear();
        let items = value.slice((this.view.m_Page.curIndex - 1) * this.pageNum, this.view.m_Page.curIndex * this.pageNum)
        let len = items.length;
        let item: BagListItem;
        for (let i = 0; i < len; i++) {
            item = new BagListItem(Globals.game);
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
            items[i].animations = [animation];
            items[i].display = {texturePath: "lainson/elements/fce84fe9db16315e04be8be0b0f2c4cfdf5d8c0d/4/fce84fe9db16315e04be8be0b0f2c4cfdf5d8c0d.png",
                dataPath: "lainson/elements/fce84fe9db16315e04be8be0b0f2c4cfdf5d8c0d/4/fce84fe9db16315e04be8be0b0f2c4cfdf5d8c0d.json"};
            item.data = items[i];
            this.view.m_List.addItem(item);
            Globals.DragManager.registerDrop(item.icon);
        }
    }

    protected handleDrop(value: any): void {
        let drag: IDragable = value[0];
        let drop: IDropable = value[1];
        if (drop.getDropType() === DropType.DROP_TYPE_BAG && drag.getDragType() === DragType.DRAG_TYPE_SHORTCUT) {
            Log.trace("背包拖到快捷栏了！！！");
        }
    }

    public onRemove(): void {
        super.onRemove();
        let len = this.view.m_List.getLength();
        let item: BagListItem;
        for (let i = 0; i < len; i++) {
            item = this.view.m_List.getItem(i) as BagListItem;
            item.setEnable(false);
            Globals.DragManager.unRegisterDrop(item.icon);
            item.onDispose();
        }
    }
}
