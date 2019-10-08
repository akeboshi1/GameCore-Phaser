import { MessageType } from "../../../const/MessageType";
import { IMediator } from "../../baseMediator";
import { IAbstractPanel } from "../../abstractPanel";
import { WorldService } from "../../../game/world.service";
import { Logger } from "../../../utils/log";
import { IDragable } from "../idragable";
import { IDropable } from "../idropable";
import { op_gameconfig, op_virtual_world, op_client } from "pixelpai_proto";
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
        this.world.modelManager.on(MessageType.SCENE_SYNCHRO_PACKAGE, this.handleSynchroPackage, this);
        this.world.modelManager.on(MessageType.UPDATED_CHARACTER_PACKAGE, this.onUpdatePackageHandler, this);
        this.world.modelManager.on(MessageType.QUERY_PACKAGE, this.handleSynchroPackage, this);
        this.mView.show(param);

        const packs: op_gameconfig.IPackage[] = this.mPlayerModel.mainPlayerInfo.package;
        this.mBagModel.requestVirtualWorldQueryPackage(packs[0].id, this.mView.getCurPageIndex(), this.mView.getPageNum());
    }

    public update(param: any) {
        if (!this.mView) return;
        this.mView.update(param);
    }

    public hide() {
        this.world.modelManager.off(MessageType.DRAG_TO_DROP, this.handleDrop, this);
        this.world.modelManager.off(MessageType.SCENE_SYNCHRO_PACKAGE, this.handleSynchroPackage, this);
        this.world.modelManager.off(MessageType.UPDATED_CHARACTER_PACKAGE, this.onUpdatePackageHandler, this);
        this.world.modelManager.off(MessageType.QUERY_PACKAGE, this.handleSynchroPackage, this);
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
        this.mView.setDataList(value);
    }

    private handleSynchroPackage(data: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_QUERY_PACKAGE): void {
        this.refrehView();
    }

    private onUpdatePackageHandler(data) {
        this.refrehView();
    }

}
