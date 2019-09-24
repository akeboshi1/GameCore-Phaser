
import { MessageType } from "../../const/MessageType";
import { IMediator } from "../baseMediator";
import { IAbstractPanel } from "../abstractPanel";
import { WorldService } from "../../game/world.service";
import { Logger } from "../../utils/log";
import { IDragable } from "./idragable";
import { IDropable } from "./idropable";
import { op_gameconfig } from "pixelpai_proto";
import { IBaseModel } from "../../service/baseModel";
import { BagPanel } from "./bagPanel";
import { World } from "../../game/world";

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
    private mView: BagPanel;
    constructor(mworld: WorldService) {
        this.world = mworld;
        this.world.modelManager.on(MessageType.DRAG_TO_DROP, this.handleDrop);
        this.world.modelManager.on(MessageType.SCENE_SYNCHRO_PACKAGE, this.handleSynchroPackage);
        this.world.modelManager.on(MessageType.UPDATED_CHARACTER_PACKAGE, this.onUpdatePackageHandler);

    }

    public getView(): IAbstractPanel {
        return this.mView;
    }

    public showUI(param: any) {
        this.mView.showUI(param);
    }

    public update(param: any) {
        this.mView.update(param);
    }

    public hideUI() {
        this.world.modelManager.off(MessageType.DRAG_TO_DROP, this.handleDrop);
        this.world.modelManager.off(MessageType.SCENE_SYNCHRO_PACKAGE, this.handleSynchroPackage);
        this.world.modelManager.off(MessageType.UPDATED_CHARACTER_PACKAGE, this.onUpdatePackageHandler);
        this.mView.hideUI();
    }

    protected handleDrop(value: any): void {
        const drag: IDragable = value[0];
        const drop: IDropable = value[1];
        if (drop.getDropType() === DropType.DROP_TYPE_BAG && drag.getDragType() === DragType.DRAG_TYPE_SHORTCUT) {
            Logger.debug("背包拖到快捷栏了！！！");
        }
    }

    private refrehView(): void {
        // let packs: op_gameconfig.IPackage[] = Globals.DataCenter.PlayerData.mainPlayerInfo.package;
        // if (packs == null || packs.length === 0) {
        //     return;
        // }
        // this.mView.m_Page.setMaxIndex(Math.ceil(packs[0].items.length / this.pageNum));
        // this.renderList(packs[0].items);
    }

    private handleSynchroPackage(): void {
        this.refrehView();
    }

    private onUpdatePackageHandler() {
        this.refrehView();
    }

}
