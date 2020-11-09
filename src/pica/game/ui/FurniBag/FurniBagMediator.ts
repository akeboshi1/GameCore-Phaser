import { FurniBag } from "./FurniBag";
import { op_client, op_def, op_gameconfig, op_pkt_def } from "pixelpai_proto";
import { BasicMediator, Game } from "gamecore";
import { EventType, ModuleName } from "structure";

export class FurniBagMediator extends BasicMediator {
    public static NAME: string = ModuleName.FURNIBAG_NAME;
    private mScneType: op_def.SceneTypeEnum;
    private timeID: any;
    constructor(game: Game) {
        super(game);
        if (this.game && this.game.roomManager && this.game.roomManager.currentRoom) {
            this.mScneType = this.game.roomManager.currentRoom.sceneType;
        } else {
            this.mScneType = op_def.SceneTypeEnum.NORMAL_SCENE_TYPE;
        }
        this.mModel = new FurniBag(game, this.mScneType);
    }

    show(param?: any) {
        if (this.mPanelInit || this.mShow) {
            this.addLisenter();
            return;
        }

        this.game.emitter.on("packageCategory", this.onPackageCategoryHandler, this);
        this.game.emitter.on("queryPackage", this.onQueryPackageHandler, this);
        this.game.emitter.on("queryCommodityResource", this.onQueryCommodityResourceHandler, this);
        this.game.emitter.on("queryResetAvatar", this.onResetAvatar, this);
        this.game.emitter.on("avatarIDs", this.onDressAvatarIDS, this);

        this.__exportProperty(() => {
            this.game.peer.render.showPanel(FurniBagMediator.NAME, param).then(() => {
                this.mView = this.game.peer.render[FurniBagMediator.NAME];
            });
            this.game.emitter.on(EventType.PANEL_INIT, this.onPanelInitCallBack, this);
            this.game.emitter.on("getCategories", this.onGetCategoriesHandler, this);
            this.game.emitter.on("queryPackage", this.onQueryPackage, this);
            this.game.emitter.on("close", this.onCloseHandler, this);
            this.game.emitter.on("queryPropResource", this.onQueryPropResourceHandler, this);
            this.game.emitter.on("seachPackage", this.onSeachPackageHandler, this);
            this.game.emitter.on("addFurniToScene", this.onAddFurniHandler, this);
            this.game.emitter.on("sellProps", this.onSellPropsHandler, this);
            this.game.emitter.on("querySaveAvatar", this.onQuerySaveAvatar, this);
            this.game.emitter.on("queryResetAvatar", this.onQueryResetAvatar, this);
            this.game.emitter.on("queryDressAvatarIDS", this.queryDressAvatarIDS, this);
            this.game.emitter.on("useprops", this.onUsePropsHandler, this);
        });

        this.addLisenter();
    }

    destroy() {
        if (this.mModel) {
            this.mModel.destroy();
            this.mModel = undefined;
        }
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

    private onCloseHandler() {
        this.destroy();
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
        if (this.mModel) {
            (<FurniBag>this.mModel).getCategories(categoryType);
        }
    }

    private onQueryPackageHandler(content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_EDIT_MODE_QUERY_EDIT_PACKAGE) {
        this.mView.setProp(content.items);
    }

    private onQueryPackage(packType: op_pkt_def.PKT_PackageType, key: string, isupdate: boolean) {
        if (this.playerData) {
            const items = this.playerData.getItemsByCategory(packType, key);
            this.mView.setProp(items, isupdate);
        }
    }

    private onQueryPropResourceHandler(prop: op_client.IMarketCommodity) {
        (<FurniBag>this.mModel).queryCommodityResource(prop.id);
    }

    private onQuerySaveAvatar(avatarids: string[]) {
        (<FurniBag>this.mModel).querySaveAvatar(avatarids);
    }

    private onQueryResetAvatar(avatar: op_gameconfig.Avatar) {
        (<FurniBag>this.mModel).queryResetAvatar(avatar);
    }
    private onSeachPackageHandler(query: string, categories: string) {
        (<FurniBag>this.mModel).seachPackage(query, categories);
    }

    private onAddFurniHandler(id: string) {
        if (this.mView.enableEdit) {
            (<FurniBag>this.mModel).enterEditAndSelectedSprite(id);
        } else {
            (<FurniBag>this.mModel).addFurniToScene(id);
        }
        this.destroy();
    }

    private onSellPropsHandler(prop: op_client.CountablePackageItem, count: number, category: number) {
        (<FurniBag>this.mModel).sellProps(prop, count, category);
    }

    private onUsePropsHandler(itemid: string, count: number) {
        (<FurniBag>this.mModel).useProps(itemid, count);
    }
    private onResetAvatar(content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_PKT_RESET_AVATAR) {
        this.mView.resetAvatar(content);
    }

    private onDressAvatarIDS(ids: string[]) {
        this.mView.setDressAvatarIds(ids);
    }

    private queryDressAvatarIDS() {
        (<FurniBag>this.mModel).queryDressAvatarItemIDs();
    }
}
