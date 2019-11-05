import { MessageType } from "../../../const/MessageType";
import { BaseMediator } from "../../baseMediator";
import { IAbstractPanel } from "../../abstractPanel";
import { WorldService } from "../../../game/world.service";
import { Logger } from "../../../utils/log";
import { IDragable } from "../idragable";
import { IDropable } from "../idropable";
import { op_gameconfig, op_client } from "pixelpai_proto";
import { BagPanel } from "./bagPanel";

export enum DragType {
    DRAG_TYPE_SHORTCUT = 1,
    DRAG_TYPE_BAG = 2
}
export enum DropType {
    DROP_TYPE_SHORTCUT = 1,
    DROP_TYPE_BAG = 2
}
export class BagMediator extends BaseMediator {
    public static NAME: string = "BagMediator";
    public world: WorldService;
    private mPageNum: number = 0;
    private mScene: Phaser.Scene;
    constructor(mworld: WorldService, scene: Phaser.Scene) {
        super(mworld);
        this.world = mworld;
        this.mScene = scene;
    }

    public isSceneUI(): boolean {
        return false;
    }

    public isShow(): boolean {
        if (this.mView) return this.mView.isShow();
    }

    public getView(): IAbstractPanel {
        return this.mView;
    }

    public show(param: any) {
        if (this.mView && this.mView.isShow()) {
            return;
        }
        this.mView = new BagPanel(this.mScene, this.world);
        this.world.emitter.on(MessageType.SCENE_SYNCHRO_PACKAGE, this.handleSynchroPackage, this);
        this.world.emitter.on(MessageType.UPDATED_CHARACTER_PACKAGE, this.onUpdatePackageHandler, this);
        this.world.emitter.on(MessageType.QUERY_PACKAGE, this.handleSynchroPackage, this);
        if (param) {
            this.world.roomManager.currentRoom.getHeroEntity().getBagEntity().requestVirtualWorldQueryPackage(param[0].id, 1, BagPanel.PageMaxCount);
        } else {
            this.world.roomManager.currentRoom.getHeroEntity().getBagEntity().requestVirtualWorldQueryPackage(this.world.roomManager.currentRoom.getHeroEntity().model.package.id, 1, BagPanel.PageMaxCount);
        }
        this.mView.show(param);
        super.show(param);
    }

    public update(param: any) {
        if (!this.mView) return;
        this.mView.update(param);
    }

    public hide() {
        this.world.emitter.off(MessageType.DRAG_TO_DROP, this.handleDrop, this);
        this.world.emitter.off(MessageType.SCENE_SYNCHRO_PACKAGE, this.handleSynchroPackage, this);
        this.world.emitter.off(MessageType.UPDATED_CHARACTER_PACKAGE, this.onUpdatePackageHandler, this);
        this.world.emitter.off(MessageType.QUERY_PACKAGE, this.handleSynchroPackage, this);
        if (!this.mView) return;
        this.mView.hide();
    }

    public destroy() {
        if (this.mView) {
            this.mView.destroy();
            this.mView = null;
        }
        this.mPageNum = 0;
        this.mScene = null;
        this.world = null;
    }

    protected handleDrop(value: any): void {
        const drag: IDragable = value[0];
        const drop: IDropable = value[1];
        if (drop.getDropType() === DropType.DROP_TYPE_BAG && drag.getDragType() === DragType.DRAG_TYPE_SHORTCUT) {
            Logger.getInstance().debug("背包拖到快捷栏了！！！");
        }
    }

    private refrehView(mItems?: op_gameconfig.IItem[]): void {
        let items: op_gameconfig.IItem[];
        if (!mItems) {
            const packs: op_gameconfig.IPackage = this.world.roomManager.currentRoom.getHeroEntity().model.package;
            if (packs == null) {
                return;
            }
            items = packs.items;
        } else {
            items = mItems;
        }

        this.setListData(items);
    }

    private setListData(value: any[]) {
        (this.mView as BagPanel).setDataList(value);
    }

    private handleSynchroPackage(data: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_QUERY_PACKAGE): void {
        if (data.id !== this.world.roomManager.currentRoom.getHeroEntity().model.package.id) return;
        this.refrehView(data.items);
    }

    private onUpdatePackageHandler(data) {
        if (data.id !== this.world.roomManager.currentRoom.getHeroEntity().model.package.id) return;
        this.refrehView(data.items);
    }

}
