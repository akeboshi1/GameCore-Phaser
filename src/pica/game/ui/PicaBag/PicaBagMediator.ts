import { PicaBag } from "./PicaBag";
import { op_client, op_def, op_gameconfig, op_pkt_def } from "pixelpai_proto";
import { BasicMediator, Game } from "gamecore";
import { EventType, ModuleName, RENDER_PEER } from "structure";

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
        this.game.emitter.on(this.key + "_packageCategory", this.onPackageCategoryHandler, this);
        this.game.emitter.on(this.key + "_queryPackage", this.onQueryPackageHandler, this);
        this.game.emitter.on(this.key + "_queryCommodityResource", this.onQueryCommodityResourceHandler, this);
        this.game.emitter.on(this.key + "_queryResetAvatar", this.onResetAvatar, this);
        this.game.emitter.on(this.key + "_avatarIDs", this.onDressAvatarIDS, this);

        this.game.emitter.on(this.key + "_getCategories", this.onGetCategoriesHandler, this);
        this.game.emitter.on(this.key + "_queryPackage", this.onQueryPackage, this);
        this.game.emitter.on(this.key + "_close", this.onCloseHandler, this);
        this.game.emitter.on(this.key + "_queryPropResource", this.onQueryPropResourceHandler, this);
        this.game.emitter.on(this.key + "_seachPackage", this.onSeachPackageHandler, this);
        this.game.emitter.on(this.key + "_addFurniToScene", this.onAddFurniHandler, this);
        this.game.emitter.on(this.key + "_sellProps", this.onSellPropsHandler, this);
        this.game.emitter.on(this.key + "_querySaveAvatar", this.onQuerySaveAvatar, this);
        this.game.emitter.on(this.key + "_queryResetAvatar", this.onQueryResetAvatar, this);
        this.game.emitter.on(this.key + "_queryDressAvatarIDS", this.queryDressAvatarIDS, this);
        this.game.emitter.on(this.key + "_useprops", this.onUsePropsHandler, this);
    }

    hide() {
        this.game.emitter.off(this.key + "_packageCategory", this.onPackageCategoryHandler, this);
        this.game.emitter.off(this.key + "_queryPackage", this.onQueryPackageHandler, this);
        this.game.emitter.off(this.key + "_queryCommodityResource", this.onQueryCommodityResourceHandler, this);
        this.game.emitter.off(this.key + "_queryResetAvatar", this.onResetAvatar, this);
        this.game.emitter.off(this.key + "_avatarIDs", this.onDressAvatarIDS, this);

        this.game.emitter.off(this.key + "_getCategories", this.onGetCategoriesHandler, this);
        this.game.emitter.off(this.key + "_queryPackage", this.onQueryPackage, this);
        this.game.emitter.off(this.key + "_close", this.onCloseHandler, this);
        this.game.emitter.off(this.key + "_queryPropResource", this.onQueryPropResourceHandler, this);
        this.game.emitter.off(this.key + "_seachPackage", this.onSeachPackageHandler, this);
        this.game.emitter.off(this.key + "_addFurniToScene", this.onAddFurniHandler, this);
        this.game.emitter.off(this.key + "_sellProps", this.onSellPropsHandler, this);
        this.game.emitter.off(this.key + "_querySaveAvatar", this.onQuerySaveAvatar, this);
        this.game.emitter.off(this.key + "_queryResetAvatar", this.onQueryResetAvatar, this);
        this.game.emitter.off(this.key + "_queryDressAvatarIDS", this.queryDressAvatarIDS, this);
        this.game.emitter.off(this.key + "_useprops", this.onUsePropsHandler, this);
        super.hide();
    }

    destroy() {
        this.game.emitter.off("packageCategory", this.onPackageCategoryHandler, this);
        this.game.emitter.off("queryPackage", this.onQueryPackageHandler, this);
        this.game.emitter.off("queryCommodityResource", this.onQueryCommodityResourceHandler, this);
        this.game.emitter.off("queryResetAvatar", this.onResetAvatar, this);
        this.game.emitter.off("avatarIDs", this.onDressAvatarIDS, this);
        super.destroy();
        this.removeLisenter();
    }

    get playerData() {
        const bag = this.bag;
        if (!bag) {
            return;
        }
        return this.bag.playerBag;
    }

    get bag() {
        if (!this.game.user || !this.game.user.userData) {
            return;
        }
        return this.game.user.userData;
    }

    protected _show() {
    }

    protected panelInit() {
    }

    protected mediatorExport() {
    }

    private onCloseHandler() {
        this.hide();
    }

    private addLisenter() {
        if (!this.bag) return;
        this.game.emitter.on(EventType.PACKAGE_SYNC_FINISH, this.onSyncFinishHandler, this);
        this.game.emitter.on(EventType.PACKAGE_UPDATE, this.onUpdateHandler, this);
    }

    private removeLisenter() {
        if (!this.bag) return;
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
        if (!this.mView) {
            return;
        }
        this.mView.setCategories(subcategory);
    }

    private onQueryCommodityResourceHandler(
        content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_MARKET_QUERY_PACKAGE_ITEM_RESOURCE
    ) {
        this.mView.setSelectedResource(content);
    }

    private onGetCategoriesHandler(categoryType: number) {
        if (this.model) {
            this.model.getCategories(categoryType);
        }
    }

    private onQueryPackageHandler(content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_EDIT_MODE_QUERY_EDIT_PACKAGE) {
        this.mView.setProp(content.items);
    }

    private onQueryPackage(data: { packType: op_pkt_def.PKT_PackageType, key: string, isupdate: boolean }) {
        if (this.playerData) {
            const items = this.playerData.getItemsByCategory(data.packType, data.key);
            if (data.packType === op_pkt_def.PKT_PackageType.AvatarPackage && items) {
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
        this.model.querySaveAvatar(avatarids);
    }

    private onQueryResetAvatar(avatar: op_gameconfig.Avatar) {
        this.model.queryResetAvatar(avatar);
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
    private onResetAvatar(content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_PKT_RESET_AVATAR) {
        this.mView.resetAvatar(content);
    }

    private onDressAvatarIDS(ids: string[]) {
        this.mView.setDressAvatarIds(ids);
    }

    private queryDressAvatarIDS() {
        this.model.queryDressAvatarItemIDs();
    }

    private get model(): PicaBag {
        return (<PicaBag>this.mModel);
    }
}
