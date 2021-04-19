import { PicaAvatar } from "./PicaAvatar";
import { op_client, op_def, op_gameconfig, op_pkt_def } from "pixelpai_proto";
import { BasicMediator, Game } from "gamecore";
import { EventType, ModuleName, RENDER_PEER } from "structure";
import { BaseDataConfigManager } from "../../config";

export class PicaAvatarMediator extends BasicMediator {
    private mScneType: op_def.SceneTypeEnum;
    private timeID: any;
    private skinID: string;
    constructor(game: Game) {
        super(ModuleName.PICAAVATAR_NAME, game);
        if (this.game && this.game.roomManager && this.game.roomManager.currentRoom) {
            this.mScneType = this.game.roomManager.currentRoom.sceneType;
        } else {
            this.mScneType = op_def.SceneTypeEnum.NORMAL_SCENE_TYPE;
        }
        this.mModel = new PicaAvatar(game, this.mScneType);
        this.addLisenter();
    }

    show(param?: any) {
        super.show(param);
        this.game.emitter.on(this.key + "_retpackageCategory", this.onPackageCategoryHandler, this);
        this.game.emitter.on(this.key + "_retcommodityresource", this.onQueryCommodityResourceHandler, this);
        this.game.emitter.on(this.key + "_retResetAvatar", this.onResetAvatar, this);

        this.game.emitter.on(this.key + "_getCategories", this.onGetCategoriesHandler, this);
        this.game.emitter.on(this.key + "_queryPackage", this.onQueryPackage, this);
        this.game.emitter.on(this.key + "_close", this.onCloseHandler, this);
        this.game.emitter.on(this.key + "_queryPropResource", this.onQueryPropResourceHandler, this);
        this.game.emitter.on(this.key + "_querySaveAvatar", this.onQuerySaveAvatar, this);
        this.game.emitter.on(this.key + "_queryResetAvatar", this.onQueryResetAvatar, this);
        this.game.emitter.on(this.key + "_queryDressAvatarIDS", this.queryDressAvatarIDS, this);
        this.game.emitter.on(EventType.RETURN_DRESS_AVATAR_IDS, this.onDressAvatarIDS, this);

    }

    hide() {
        this.game.emitter.off(this.key + "_retpackageCategory", this.onPackageCategoryHandler, this);
        this.game.emitter.off(this.key + "_retcommodityresource", this.onQueryCommodityResourceHandler, this);
        this.game.emitter.off(this.key + "_retResetAvatar", this.onResetAvatar, this);

        this.game.emitter.off(this.key + "_getCategories", this.onGetCategoriesHandler, this);
        this.game.emitter.off(this.key + "_queryPackage", this.onQueryPackage, this);
        this.game.emitter.off(this.key + "_close", this.onCloseHandler, this);
        this.game.emitter.off(this.key + "_queryPropResource", this.onQueryPropResourceHandler, this);
        this.game.emitter.off(this.key + "_querySaveAvatar", this.onQuerySaveAvatar, this);
        this.game.emitter.off(this.key + "_queryResetAvatar", this.onQueryResetAvatar, this);
        this.game.emitter.off(this.key + "_queryDressAvatarIDS", this.queryDressAvatarIDS, this);
        this.game.emitter.off(EventType.RETURN_DRESS_AVATAR_IDS, this.onDressAvatarIDS, this);

        super.hide();
        this.skinID = undefined;
    }

    destroy() {
        super.destroy();
        this.removeLisenter();
    }

    get playerData() {
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
            if (this.mView) this.mView.fetchCategory();
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

    private onPackageCategoryHandler(subcategory: op_def.IStrPair[]) {

        if (this.mView) this.mView.setCategories(subcategory);
    }

    private onQueryCommodityResourceHandler(
        content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_MARKET_QUERY_PACKAGE_ITEM_RESOURCE
    ) {
        if (this.mView) this.mView.setSelectedResource(content);
    }

    private onGetCategoriesHandler(categoryType: number) {
        if (this.model) {
            // this.model.getCategories(categoryType);
            const configMgr = <BaseDataConfigManager>this.game.configManager;
            const subcategory = configMgr.getItemSubCategory(categoryType);
            // for (const sub of subcategory) {
            //     sub.value = configMgr.getI18n(sub.key);
            // }
            this.mView.setCategories(subcategory);
        }
    }

    private onQueryPackage(data: { packType: op_pkt_def.PKT_PackageType, key: string, isupdate: boolean }) {
        if (this.playerData) {
            const items = this.playerData.getItemsByCategory(data.packType, data.key);
            if (data.packType === op_pkt_def.PKT_PackageType.AvatarPackage && items) {
                const configMgr = <BaseDataConfigManager>this.game.configManager;
                configMgr.getBatchItemDatas(items);
                let tempitem: op_client.ICountablePackageItem;
                for (let i = items.length - 1; i >= 0; i--) {
                    const tag = items[i].tag;
                    if (tag !== undefined && tag !== "" && JSON.parse(tag).type === "remove") {
                        tempitem = items[i];
                        items.splice(i, 1);
                    }
                }
                if (data.key !== "alltype" && tempitem) {
                    items.unshift(tempitem);
                }
            }
            this.mView.setProp(items, data.isupdate);
        }
    }

    private onQueryPropResourceHandler(prop: op_client.IMarketCommodity) {
        this.model.queryCommodityResource(prop.id);
    }

    private onQuerySaveAvatar(avatarids: string[]) {
        if (avatarids.length === 0) return;
       // if (this.skinID) avatarids.push(this.skinID);
        this.model.querySaveAvatar(avatarids);
    }

    private onQueryResetAvatar(avatar: op_gameconfig.Avatar) {
        this.model.queryResetAvatar(avatar);
    }

    private onResetAvatar(content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_PKT_RESET_AVATAR) {
        if (this.mView) this.mView.resetAvatar(content);
    }

    private onDressAvatarIDS(ids: string[]) {
        //  if (this.mView)
        const avatarDatas = [];
        for (const id of ids) {
            let item: any = this.playerData.avatarBag.getItem(undefined, id);
            item = item || this.config.getItemBaseByID(id);
            // if (item.suitType === "base") {
            //     this.skinID = id;
            // }
            avatarDatas.push(item);
        }
        this.mView.setDressAvatarIds(avatarDatas);
    }

    private queryDressAvatarIDS() {
        // this.model.queryDressAvatarItemIDs();
        this.onDressAvatarIDS(this.userData.avatarIDs);
    }

    private get model(): PicaAvatar {
        return (<PicaAvatar>this.mModel);
    }

    private get config(): BaseDataConfigManager {
        return <BaseDataConfigManager>this.game.configManager;
    }
}
