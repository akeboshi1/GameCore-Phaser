// import { op_gameconfig } from "pixelpai_proto";
// import { BaseMediator, UIType, InputText } from "apowophaserui";
// import { op_client } from "pixelpai_proto";
// import { Game } from "src/game/game";
// import { MessageType } from "structure";

// export enum DragType {
//     DRAG_TYPE_SHORTCUT = 1,
//     DRAG_TYPE_BAG = 2
// }
// export enum DropType {
//     DROP_TYPE_SHORTCUT = 1,
//     DROP_TYPE_BAG = 2
// }
// export class BagMediator extends BaseMediator {
//     public static NAME: string = "BagMediator";
//     public world: WorldService;
//     private mPageNum: number = 0;
//     private mScene: Phaser.Scene;
//     private bag: Bag;
//     private mLayerManager;
//     constructor(game: Game) {
//         super();
//         this.mUIType = UIType.Normal;
//     }

//     public resize(width, height) {
//         if (this.mView) this.mView.resize(width, height);
//     }

//     public isSceneUI(): boolean {
//         return false;
//     }

//     public isShow(): boolean {
//         if (this.mView) return this.mView.isShow();
//     }

//     public show(param: any) {
//         super.show(param ?: any);
//         if (this.mView && this.mView.isShow()) {
//             return;
//         }
//         if (!this.mView) {
//             this.mView = new BagPanel(this.mScene, this.world);
//         }
//         if (!this.bag) {
//             this.bag = new Bag(this.world);
//             this.bag.register();
//         }
//         this.world.emitter.on(MessageType.SCENE_SYNCHRO_PACKAGE, this.handleSynchroPackage, this);
//         this.world.emitter.on(MessageType.UPDATED_CHARACTER_PACKAGE, this.onUpdatePackageHandler, this);
//         this.world.emitter.on(MessageType.QUERY_PACKAGE, this.handleSynchroPackage, this);
//         this.mScene.input.on("gameobjectdown", this.onBtnHandler, this);
//         if (param) {
//             // this.world.user.userData.playerBag
//             // this.world.roomManager.currentRoom.playerManager.actor.getBag().requestVirtualWorldQueryPackage(param[0].id, 1, BagPanel.PageMaxCount);
//             this.bag.requestVirtualWorldQueryPackage(param[0].id, 1, BagPanel.PageMaxCount);
//         } else {
//             this.bag.requestVirtualWorldQueryPackage((<PlayerModel>this.world.user.model).package.id, 1, BagPanel.PageMaxCount);
//             // this.world.roomManager.currentRoom.playerManager.actor.getBag().requestVirtualWorldQueryPackage(this.world.roomManager.currentRoom.playerManager.actor.package.id, 1, BagPanel.PageMaxCount);
//         }
//         this.mView.show(param);
//         this.mLayerManager.addToUILayer(this.mView);
//         this.world.uiManager.checkUIState(BagMediator.NAME, false);
//         this.refrehView();
//         super.show(param);
//     }

//     public update(param: any) {
//         if (!this.mView) return;
//         this.mView.update(param);
//     }

//     public hide() {
//         this.world.emitter.off(MessageType.DRAG_TO_DROP, this.handleDrop, this);
//         this.world.emitter.off(MessageType.SCENE_SYNCHRO_PACKAGE, this.handleSynchroPackage, this);
//         this.world.emitter.off(MessageType.UPDATED_CHARACTER_PACKAGE, this.onUpdatePackageHandler, this);
//         this.world.emitter.off(MessageType.QUERY_PACKAGE, this.handleSynchroPackage, this);
//         this.mScene.input.off("gameobjectdown", this.onBtnHandler, this);
//         if (!this.mView) return;
//         this.mView.hide();
//         this.mView = null;
//         this.world.uiManager.checkUIState(BagMediator.NAME, true);
//     }

//     public destroy() {
//         this.world.emitter.off(MessageType.DRAG_TO_DROP, this.handleDrop, this);
//         this.world.emitter.off(MessageType.SCENE_SYNCHRO_PACKAGE, this.handleSynchroPackage, this);
//         this.world.emitter.off(MessageType.UPDATED_CHARACTER_PACKAGE, this.onUpdatePackageHandler, this);
//         this.world.emitter.off(MessageType.QUERY_PACKAGE, this.handleSynchroPackage, this);
//         this.mScene.input.off("gameobjectdown", this.onBtnHandler, this);
//         if (this.mView) {
//             this.mView.destroy();
//             this.mView = null;
//         }
//         this.mPageNum = 0;
//         this.mScene = null;
//         this.world = null;
//     }

//     protected handleDrop(value: any): void {
//         const drag: IDragable = value[0];
//         const drop: IDropable = value[1];
//         if (drop.getDropType() === DropType.DROP_TYPE_BAG && drag.getDragType() === DragType.DRAG_TYPE_SHORTCUT) {
//             Logger.getInstance().debug("背包拖到快捷栏了！！！");
//         }
//     }

//     private refrehView(mItems?: op_gameconfig.IItem[]): void {
//         let items: op_gameconfig.IItem[];
//         if (!mItems) {
//             const packs: op_gameconfig.IPackage = this.world.roomManager.currentRoom.playerManager.actor.package;
//             if (packs == null) {
//                 return;
//             }
//             items = packs.items;
//         } else {
//             items = mItems;
//         }
//         this.setListData(items);
//     }

//     private onBtnHandler(pointer, gameobject) {
//         if (gameobject instanceof InputText) return;
//         if (this.mView) (<any>this.mView).setBlur();
//     }

//     private setListData(value: any[]) {
//         if (this.mView) (<any>this.mView).setDataList(value);
//     }

//     private handleSynchroPackage(items: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_QUERY_PACKAGE): void {
//         const itemList = items.items;
//         // const itemList: op_gameconfig.IItem[] = this.world.roomManager.currentRoom.playerManager.actor.package.items;
//         this.refrehView(itemList);
//     }

//     private onUpdatePackageHandler() {
//         const itemList: op_gameconfig.IItem[] = this.world.roomManager.currentRoom.playerManager.actor.package.items;
//         this.refrehView(itemList);
//     }

// }
