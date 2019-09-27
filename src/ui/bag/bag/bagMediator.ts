import { MessageType } from "../../../const/MessageType";
import { IMediator } from "../../baseMediator";
import { IAbstractPanel } from "../../abstractPanel";
import { WorldService } from "../../../game/world.service";
import { Logger } from "../../../utils/log";
import { IDragable } from "../idragable";
import { IDropable } from "../idropable";
import { op_gameconfig } from "pixelpai_proto";
import { BagPanel } from "./bagPanel";
import { PlayerDataModel } from "../../../service/player/playerDataModel";
import { BagModel } from "../../../service/bag/bagModel";

export enum DragType {
    DRAG_TYPE_SHORTCUT = 1,
    DRAG_TYPE_BAG = 2
}
export enum DropType {
    DROP_TYPE_SHORTCUT = 1,
    DROP_TYPE_BAG = 2
}
export class BagMediator implements IMediator {
    public world: WorldService;
    private mPageNum: number = 0;
    private mName: string;
    private mView: BagPanel;
    private mPlayerModel: PlayerDataModel;
    private mBagModel: BagModel;
    constructor(mworld: WorldService, scene: Phaser.Scene) {
        this.world = mworld;
        this.mPlayerModel = this.world.modelManager.getModel(PlayerDataModel.NAME) as PlayerDataModel;
        this.mBagModel = this.world.modelManager.getModel(BagModel.NAME) as BagModel;
        this.mView = new BagPanel(scene, mworld);
    }

    public isSceneUI(): boolean {
        return false;
    }

    public isShow(): boolean {
        if (this.mView) return this.mView.isShow();
    }

    public resize() {
        if (this.mView) return this.mView.resize();
    }

    public setName(val: string) {
        this.mName = val;
    }

    public getName(): string {
        return this.mName;
    }

    public getView(): IAbstractPanel {
        return this.mView;
    }

    public show(param: any) {
        if (!this.mView) return;
        this.world.modelManager.on(MessageType.DRAG_TO_DROP, this.handleDrop);
        this.world.modelManager.on(MessageType.SCENE_SYNCHRO_PACKAGE, this.handleSynchroPackage);
        this.world.modelManager.on(MessageType.UPDATED_CHARACTER_PACKAGE, this.onUpdatePackageHandler);
        this.world.modelManager.on(MessageType.QUERY_PACKAGE, this.handleSynchroPackage);
        this.mView.show(param);
    }

    public update(param: any) {
        if (!this.mView) return;
        this.mView.update(param);
    }

    public hide() {
        this.world.modelManager.off(MessageType.DRAG_TO_DROP, this.handleDrop);
        this.world.modelManager.off(MessageType.SCENE_SYNCHRO_PACKAGE, this.handleSynchroPackage);
        this.world.modelManager.off(MessageType.UPDATED_CHARACTER_PACKAGE, this.onUpdatePackageHandler);
        if (!this.mView) return;
        this.mView.hide();
    }

    protected handleDrop(value: any): void {
        const drag: IDragable = value[0];
        const drop: IDropable = value[1];
        if (drop.getDropType() === DropType.DROP_TYPE_BAG && drag.getDragType() === DragType.DRAG_TYPE_SHORTCUT) {
            Logger.debug("背包拖到快捷栏了！！！");
        }
    }

    private refrehView(): void {
        const packs: op_gameconfig.IPackage[] = this.mPlayerModel.mainPlayerInfo.package;
        if (packs == null || packs.length === 0) {
            return;
        }
        this.setListData(packs[0].items);
    }

    private setListData(value: any[]) {
        const pageNum: number = Math.ceil(value.length / this.mPageNum);
        this.mView.setDataList(value);
        // if (this.mView.m_List) this.onRemove();
        // let items = value.slice((this.view.m_Page.curIndex - 1) * this.pageNum, this.view.m_Page.curIndex * this.pageNum);
        // const len = this.mView.update.length;
        // let item: ItemSlot;
        // for (let i = 0; i < len; i++) {
        //     item = new ItemSlot(this.mS);
        //     item.setEnable(true);
        //     item.data = items[i];
        //     this.mView.m_List.addItem(item);
        //     // Globals.DragManager.registerDrop(item.icon);
        // }
    }

    private handleSynchroPackage(): void {
        this.refrehView();
    }

    private onUpdatePackageHandler() {
        this.refrehView();
    }

}
