import { PicaBag } from "./PicaBag";
import { op_client, op_def, op_gameconfig, op_pkt_def } from "pixelpai_proto";
import { BasicMediator, CacheDataManager, DataMgrType, Game } from "gamecore";
import { EventType, ModuleName, RENDER_PEER } from "structure";
import { BaseDataConfigManager } from "../../data";
import { ObjectAssign } from "utils";

export class PicaBagMediator extends BasicMediator {
    private mScneType: op_def.SceneTypeEnum;
    private timeID: any;
    constructor(game: Game) {
        super(ModuleName.PICABAG_NAME, game);
        if (this.game && this.game.roomManager && this.game.roomManager.currentRoom) {
            this.mScneType = this.game.roomManager.currentRoom.sceneType;
        } else {
            this.mScneType = op_def.SceneTypeEnum.NORMAL_SCENE_TYPE;
        }
        this.mModel = new PicaBag(game, this.mScneType);
        this.addLisenter();
    }

    show(param?: any) {
        super.show(param);
        this.game.emitter.on(this.key + "_retpackageCategory", this.onPackageCategoryHandler, this);
        this.game.emitter.on(this.key + "_retPackage", this.onQueryPackageHandler, this);
        this.game.emitter.on(this.key + "_retCommodityResource", this.onQueryCommodityResourceHandler, this);

        this.game.emitter.on(this.key + "_getCategories", this.onGetCategoriesHandler, this);
        this.game.emitter.on(this.key + "_queryPackage", this.onQueryPackage, this);
        this.game.emitter.on(this.key + "_close", this.onCloseHandler, this);
        this.game.emitter.on(this.key + "_queryPropResource", this.onQueryPropResourceHandler, this);
        this.game.emitter.on(this.key + "_seachPackage", this.onSeachPackageHandler, this);
        this.game.emitter.on(this.key + "_addFurniToScene", this.onAddFurniHandler, this);
        this.game.emitter.on(this.key + "_sellProps", this.onSellPropsHandler, this);
        this.game.emitter.on(this.key + "_useprops", this.onUsePropsHandler, this);
    }

    hide() {
        this.game.emitter.off(this.key + "_retpackageCategory", this.onPackageCategoryHandler, this);
        this.game.emitter.off(this.key + "_retPackage", this.onQueryPackageHandler, this);
        this.game.emitter.off(this.key + "_retCommodityResource", this.onQueryCommodityResourceHandler, this);

        this.game.emitter.off(this.key + "_getCategories", this.onGetCategoriesHandler, this);
        this.game.emitter.off(this.key + "_queryPackage", this.onQueryPackage, this);
        this.game.emitter.off(this.key + "_close", this.onCloseHandler, this);
        this.game.emitter.off(this.key + "_queryPropResource", this.onQueryPropResourceHandler, this);
        this.game.emitter.off(this.key + "_seachPackage", this.onSeachPackageHandler, this);
        this.game.emitter.off(this.key + "_addFurniToScene", this.onAddFurniHandler, this);
        this.game.emitter.off(this.key + "_sellProps", this.onSellPropsHandler, this);
        this.game.emitter.off(this.key + "_useprops", this.onUsePropsHandler, this);
        super.hide();
    }

    destroy() {
        super.destroy();
        this.removeLisenter();
    }

    get bagData() {
        const bag = this.userData;
        if (!bag) {
            return;
        }
        return this.userData.playerBag;
    }

    get userData() {
        if (!this.game.user || !this.game.user.userData) {
            return;
        }
        return this.game.user.userData;
    }

    protected _show() {
    }

    protected panelInit() {
        super.panelInit();
        if (this.mPanelInit) {
            this.mView.setSceneData(this.mScneType, this.game.roomManager.currentRoom.enableEdit);
            this.mView.setMoneyData(this.userData.money, this.userData.diamond);
        }
    }

    protected mediatorExport() {
    }

    private onCloseHandler() {
        this.hide();
    }

    private addLisenter() {
        if (!this.userData) return;
        this.game.emitter.on(EventType.PACKAGE_SYNC_FINISH, this.onSyncFinishHandler, this);
        this.game.emitter.on(EventType.PACKAGE_UPDATE, this.onUpdateHandler, this);
    }

    private removeLisenter() {
        if (!this.userData) return;
        this.game.emitter.off(EventType.PACKAGE_SYNC_FINISH, this.onSyncFinishHandler, this);
        this.game.emitter.off(EventType.PACKAGE_UPDATE, this.onUpdateHandler, this);
    }

    private onSyncFinishHandler() {
        if (this.mView) this.mView.queryRefreshPackage();
    }

    private onUpdateHandler() {
        if (this.mView) this.mView.queryRefreshPackage(true);
    }

    private onPackageCategoryHandler(content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_EDIT_MODE_GET_PACKAGE_CATEGORIES) {
        if (!this.mView) {
            return;
        }
        const configMgr = <BaseDataConfigManager>this.game.configManager;
        const subcategory = content.subcategory;
        for (const sub of subcategory) {
            sub.value = configMgr.getI18n(sub.key);
        }
        this.mView.setCategories(subcategory);
        this.cacheMgr.setBagCategory(content);
    }

    private onQueryCommodityResourceHandler(
        content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_MARKET_QUERY_PACKAGE_ITEM_RESOURCE
    ) {
        this.mView.setSelectedResource(content);
    }

    private onGetCategoriesHandler(categoryType: number) {
        if (this.model) {
            // const data = this.cacheMgr.getBagCategory(categoryType);
            // if (!data) {
            //     this.model.getCategories(categoryType);
            // } else {
            //     const configMgr = <BaseDataConfigManager>this.game.configManager;
            //     const subcategory = data.subcategory;
            //     for (const sub of subcategory) {
            //         sub.value = configMgr.getI18n(sub.key);
            //     }
            //     this.mView.setCategories(subcategory);
            // }
            const configMgr = <BaseDataConfigManager>this.game.configManager;
            const subcategory = configMgr.getItemSubCategory(categoryType);
            // for (const sub of subcategory) {
            //     sub.value = configMgr.getI18n(sub.key);
            // }
            this.mView.setCategories(subcategory);
            this.cacheMgr.setBagCategory({ category: categoryType, subcategory });
        }
    }

    private onQueryPackageHandler(content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_EDIT_MODE_QUERY_EDIT_PACKAGE) {
        this.mView.setProp(content.items);
    }

    private onQueryPackage(data: { packType: op_pkt_def.PKT_PackageType, key: string, isupdate: boolean }) {
        if (this.bagData) {
            const items = this.bagData.getItemsByCategory(data.packType, "alltype");
            const configMgr = <BaseDataConfigManager>this.game.configManager;
            configMgr.getBatchItemDatas(items);
            this.mView.setProp(items, data.isupdate);
        }
    }

    private onQueryPropResourceHandler(prop: op_client.IMarketCommodity) {
        this.model.queryCommodityResource(prop.id);
    }

    private onSeachPackageHandler(data: { query: string, categories: string }) {
        this.model.seachPackage(data.query, data.categories);
    }

    private onAddFurniHandler(id: string) {
        const enable = this.game.roomManager.currentRoom.enableEdit;
        if (enable) {
            this.model.enterEditAndSelectedSprite(id);
        } else {
            this.model.addFurniToScene(id);
        }
        this.hide();
    }

    private onSellPropsHandler(data: { prop: op_client.CountablePackageItem, count: number, category: number }) {
        this.model.sellProps(data.prop, data.count, data.category);
    }

    private onUsePropsHandler(data: { itemid: string, count: number }) {
        this.model.useProps(data.itemid, data.count);
    }

    private get model(): PicaBag {
        return (<PicaBag>this.mModel);
    }

    private get cacheMgr(): CacheDataManager {
        const mgr = this.game.getDataMgr<CacheDataManager>(DataMgrType.CacheMgr);
        return mgr;
    }
}
