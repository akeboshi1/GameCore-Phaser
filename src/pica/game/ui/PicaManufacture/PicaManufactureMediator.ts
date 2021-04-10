import { op_client, op_def, op_gameconfig, op_pkt_def } from "pixelpai_proto";
import { BasicMediator, CacheDataManager, DataMgrType, Game } from "gamecore";
import { ConnectState, EventType, ModuleName } from "structure";
import { BaseDataConfigManager } from "picaWorker";
import { ObjectAssign } from "utils";
import { PicaManufacture } from "./PicaManufacture";

export class PicaManufactureMediator extends BasicMediator {
    protected mModel: PicaManufacture;
    private mScneType: op_def.SceneTypeEnum;
    constructor(game: Game) {
        super(ModuleName.PICAMANUFACTURE_NAME, game);
        this.mScneType = op_def.SceneTypeEnum.NORMAL_SCENE_TYPE;
        this.mModel = new PicaManufacture(game, this.mScneType);
        this.addLisenter();
    }

    show(param?: any) {
        super.show(param);
        this.game.emitter.on(this.key + "_retcomposeresult", this.onRetComposeHandler, this);
        this.game.emitter.on(this.key + "_close", this.onCloseHandler, this);
        this.game.emitter.on(this.key + "_queryfuricompose", this.queryFuriCompose, this);
        this.game.emitter.on(this.key + "_queryfuripackage", this.queryFuriPackageByStar, this);
        this.game.emitter.on(this.key + "_retrecasteresult", this.onRetRescateHandler, this);
        this.game.emitter.on(this.key + "_retrecastelistresult", this.onRetRescateListHandler, this);
        this.game.emitter.on(this.key + "_close", this.onCloseHandler, this);
        this.game.emitter.on(this.key + "_queryrecaste", this.queryRecaste, this);
        this.game.emitter.on(this.key + "_queryrecastelist", this.queryFuriListByStar, this);
        this.game.emitter.on(this.key + "_queryPackage", this.onQueryPackage, this);
        this.game.emitter.on(this.key + "_queryRecastCategories", this.queryRecastCategories, this);
    }

    hide() {
        this.game.emitter.off(this.key + "_retcomposeresult", this.onRetComposeHandler, this);
        this.game.emitter.off(this.key + "_close", this.onCloseHandler, this);
        this.game.emitter.off(this.key + "_queryfuricompose", this.queryFuriCompose, this);
        this.game.emitter.off(this.key + "_queryfuripackage", this.queryFuriPackageByStar, this);
        this.game.emitter.off(this.key + "_retrecasteresult", this.onRetRescateHandler, this);
        this.game.emitter.off(this.key + "_retrecastelistresult", this.onRetRescateListHandler, this);
        this.game.emitter.off(this.key + "_close", this.onCloseHandler, this);
        this.game.emitter.off(this.key + "_queryrecaste", this.queryRecaste, this);
        this.game.emitter.off(this.key + "_queryrecastelist", this.queryFuriListByStar, this);
        this.game.emitter.off(this.key + "_queryPackage", this.onQueryPackage, this);
        this.game.emitter.off(this.key + "_queryRecastCategories", this.queryRecastCategories, this);
        super.hide();
    }

    destroy() {
        super.destroy();
        this.removeLisenter();
    }

    get bag() {
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
        if (this.panelInit) {
            if (this.mView) {
                this.onUpdatePlayerInfoHandler();
                if (this.mShowData) this.setRecasteCategories(op_pkt_def.PKT_PackageType.FurniturePackage);
                else this.mView.setCategories();

            }
        }
    }

    private onCloseHandler() {
        this.hide();
    }

    private addLisenter() {
        if (!this.userData) return;
        this.game.emitter.on(EventType.PACKAGE_SYNC_FINISH, this.onSyncFinishHandler, this);
        this.game.emitter.on(EventType.PACKAGE_UPDATE, this.onUpdateHandler, this);
        this.game.emitter.on(EventType.UPDATE_PLAYER_INFO, this.onUpdatePlayerInfoHandler, this);
    }

    private removeLisenter() {
        if (!this.userData) return;
        this.game.emitter.off(EventType.PACKAGE_SYNC_FINISH, this.onSyncFinishHandler, this);
        this.game.emitter.off(EventType.PACKAGE_UPDATE, this.onUpdateHandler, this);
        this.game.emitter.off(EventType.UPDATE_PLAYER_INFO, this.onUpdatePlayerInfoHandler, this);
    }

    private onSyncFinishHandler() {
        if (this.mView) this.mView.queryRefreshPackage();
    }

    private onUpdateHandler() {
        if (this.mView) this.mView.queryRefreshPackage(true);
    }
    private onUpdatePlayerInfoHandler() {
        if (this.mView) {
            const value = this.userData.playerProperty.picaStar ? this.userData.playerProperty.picaStar.value : 0;
            this.mView.setStarData(value);
        }
    }

    private onRetComposeHandler(reward: op_client.ICountablePackageItem) {
        if (this.mView) {
            const configMgr = <BaseDataConfigManager>this.game.configManager;
            const temp = configMgr.getItemBaseByID(reward.id);
            ObjectAssign.excludeTagAssign(reward, temp);
            this.mView.setComposeResult(reward);
            const uimgr = this.game.uiManager;
            uimgr.showMed(ModuleName.PICATREASURE_NAME, { data: [reward], type: "open" });
        }
    }

    private queryFuriCompose(ids: string[]) {
        this.mModel.queryFuriCompose(ids);
    }

    private queryFuriPackageByStar(obj: { type: number, update: boolean }) {
        const furibag = this.bag.furniBag;
        const list = furibag.list;
        const configMgr = <BaseDataConfigManager>this.game.configManager;
        configMgr.getBatchItemDatas(list);
        const tempArr = [];
        for (const data of list) {
            if (data.grade === obj.type && data.rarity === 1) {
                tempArr.push(data);
            }
        }
        if (!obj.update) {
            this.mView.setGridProp(tempArr);
        } else {
            this.mView.updateGridProp(tempArr);
        }
    }

    private onRetRescateHandler(reward: op_client.ICountablePackageItem) {
        if (this.mView) {
            const configMgr = <BaseDataConfigManager>this.game.configManager;
            const temp = configMgr.getItemBaseByID(reward.id);
            ObjectAssign.excludeTagAssign(reward, temp);
            this.mView.setRecasteResult(reward);
            const uimgr = this.game.uiManager;
            uimgr.showMed(ModuleName.PICATREASURE_NAME, { data: [reward], type: "open" });
        }
    }
    private onRetRescateListHandler(list: op_client.ICountablePackageItem[]) {
        const configMgr = <BaseDataConfigManager>this.game.configManager;
        configMgr.getBatchItemDatas(list);
        this.cacheMgr.setRecasteList(list);
        if (this.mView) this.mView.queryRecasteList();
    }

    private queryRecaste(data: { consumedId: string, targetId: string }) {
        this.mModel.queryRecaste(data.consumedId, data.targetId);
    }

    private queryFuriListByStar(data: { type: string, star: number }) {
        const tempArr = this.cacheMgr.getRecasteList(data.type, data.star);
        if (tempArr) {
            this.mView.setGridProp(tempArr);
        } else {
            // this.mModel.queryRecasteList();
            const configMgr = <BaseDataConfigManager>this.game.configManager;
            const list = configMgr.getRecastItemBases();
            this.cacheMgr.setRecasteList(list);
            const temp = this.cacheMgr.getRecasteList(data.type, data.star);
            this.mView.setGridProp(temp);
        }
    }
    private queryRecastCategories() {
        this.setRecasteCategories(op_pkt_def.PKT_PackageType.FurniturePackage);
    }
    private setRecasteCategories(categoryType: number) {
        if (this.mView) {
            const data = this.cacheMgr.getBagCategory(categoryType);
            if (data) {
                this.mView.setCategories(data.subcategory);
            } else {
                const configMgr = <BaseDataConfigManager>this.game.configManager;
                const subcategory = configMgr.getItemSubCategory(categoryType);
                this.mView.setCategories(subcategory);
                this.cacheMgr.setBagCategory({ category: categoryType, subcategory });
            }
        }
    }
    private onQueryPackage(subCategoryType) {
        if (this.bag) {
            const packType = op_pkt_def.PKT_PackageType.FurniturePackage;
            const items = this.bag.getItemsByCategory(packType, subCategoryType);
            if (items) {
                const configMgr = <BaseDataConfigManager>this.game.configManager;
                configMgr.getBatchItemDatas(items);
                const temps = [];
                for (const item of items) {
                    if (item.rarity < 5) {
                        temps.push(item);
                    }
                }
                this.mView.setGridProp(temps);
            } else {
                this.mView.setGridProp(undefined);
            }
        }
    }
    private get cacheMgr() {
        const mgr = this.game.getDataMgr<CacheDataManager>(DataMgrType.CacheMgr);
        return mgr;
    }
}
