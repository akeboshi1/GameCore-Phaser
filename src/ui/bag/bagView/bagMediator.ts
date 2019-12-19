import { MessageType } from "../../../const/MessageType";
import { BaseMediator } from "../../baseMediator";
import { IAbstractPanel } from "../../abstractPanel";
import { WorldService } from "../../../game/world.service";
import { Logger } from "../../../utils/log";
import { IDragable } from "../idragable";
import { IDropable } from "../idropable";
import { op_gameconfig, op_client } from "pixelpai_proto";
import { BagPanel } from "./bagPanel";
import { ILayerManager } from "../../layer.manager";
import InputText from "../../../../lib/rexui/plugins/gameobjects/inputtext/InputText";

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
    private mLayerManager;
    constructor(layerManager: ILayerManager, mworld: WorldService, scene: Phaser.Scene) {
        super(mworld);
        this.mLayerManager = layerManager;
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
        if (!this.mView) {
            this.mView = new BagPanel(this.mScene, this.world);
        }
        this.world.emitter.on(MessageType.SCENE_SYNCHRO_PACKAGE, this.handleSynchroPackage, this);
        this.world.emitter.on(MessageType.UPDATED_CHARACTER_PACKAGE, this.onUpdatePackageHandler, this);
        this.world.emitter.on(MessageType.QUERY_PACKAGE, this.handleSynchroPackage, this);
        this.mScene.input.on("gameobjectdown", this.onBtnHandler, this);
        if (param) {
            this.world.roomManager.currentRoom.getHero().getBag().requestVirtualWorldQueryPackage(param[0].id, 1, BagPanel.PageMaxCount);
        } else {
            this.world.roomManager.currentRoom.getHero().getBag().requestVirtualWorldQueryPackage(this.world.roomManager.currentRoom.getHero().package.id, 1, BagPanel.PageMaxCount);
        }
        this.mView.show(param);
        this.mLayerManager.addToUILayer(this.mView);
        this.refrehView();
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
        this.mScene.input.off("gameobjectdown", this.onBtnHandler, this);
        if (!this.mView) return;
        this.mView.hide();
        this.mView = null;
    }

    public destroy() {
        this.world.emitter.off(MessageType.DRAG_TO_DROP, this.handleDrop, this);
        this.world.emitter.off(MessageType.SCENE_SYNCHRO_PACKAGE, this.handleSynchroPackage, this);
        this.world.emitter.off(MessageType.UPDATED_CHARACTER_PACKAGE, this.onUpdatePackageHandler, this);
        this.world.emitter.off(MessageType.QUERY_PACKAGE, this.handleSynchroPackage, this);
        this.mScene.input.off("gameobjectdown", this.onBtnHandler, this);
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
            const packs: op_gameconfig.IPackage = this.world.roomManager.currentRoom.getHero().package;
            if (packs == null) {
                return;
            }
            items = packs.items;
        } else {
            items = mItems;
        }
        this.setListData(items);
    }

    private onBtnHandler(pointer, gameobject) {
        if (gameobject instanceof InputText) return;
        if (this.mView) (this.mView as BagPanel).setBlur();
    }

    private setListData(value: any[]) {
        (this.mView as BagPanel).setDataList();
    }

    private handleSynchroPackage(): void {
        const itemList: op_gameconfig.IItem[] = this.world.roomManager.currentRoom.getHero().package.items;
        this.refrehView(itemList);
    }

    private onUpdatePackageHandler() {
        const itemList: op_gameconfig.IItem[] = this.world.roomManager.currentRoom.getHero().package.items;
        this.refrehView(itemList);
    }

}
