import { ILayerManager } from "../layer.manager";
import { WorldService } from "../../game/world.service";
import { FurniBagPanel } from "./FurniBagPanel";
import { FurniBag } from "./FurniBag";
import { op_client, op_def, op_gameconfig } from "pixelpai_proto";
import { BaseMediator } from "../../ui/components";

export class FurniBagMediator extends BaseMediator {
    protected mView: FurniBagPanel;
    private scene: Phaser.Scene;
    private mFurniBag: FurniBag;
    private mScneType: op_def.SceneTypeEnum;
    private world: WorldService;
    constructor(private layerManager: ILayerManager, scene: Phaser.Scene, worldService: WorldService) {
        super();
        this.world = worldService;
        this.scene = this.layerManager.scene;
        if (this.world && this.world.roomManager && this.world.roomManager.currentRoom) {
            this.mScneType = this.world.roomManager.currentRoom.sceneType;
        } else {
            this.mScneType = op_def.SceneTypeEnum.NORMAL_SCENE_TYPE;
        }
    }

    show() {
        if ((this.mView && this.mView.isShow()) || this.mShow) {
            this.layerManager.addToUILayer(this.mView);
            return;
        }

        if (!this.mFurniBag) {
            this.mFurniBag = new FurniBag(this.world, this.mScneType);
            this.mFurniBag.register();
            this.mFurniBag.on("packageCategory", this.onPackageCategoryHandler, this);
            this.mFurniBag.on("queryPackage", this.onQueryPackageHandler, this);
            this.mFurniBag.on("queryCommodityResource", this.onQueryCommodityResourceHandler, this);
            this.mFurniBag.on("queryResetAvatar", this.onResetAvatar, this);
            this.mFurniBag.on("avatarIDs", this.onDressAvatarIDS, this);
        }
        if (!this.mView) {
            this.mView = new FurniBagPanel(this.scene, this.world, this.mScneType);
            this.mView.on("getCategories", this.onGetCategoriesHandler, this);
            this.mView.on("queryPackage", this.onQueryPackage, this);
            this.mView.on("close", this.onCloseHandler, this);
            this.mView.on("queryPropResource", this.onQueryPropResourceHandler, this);
            this.mView.on("seachPackage", this.onSeachPackageHandler, this);
            this.mView.on("addFurniToScene", this.onAddFurniHandler, this);
            this.mView.on("sellProps", this.onSellPropsHandler, this);
            this.mView.on("querySaveAvatar", this.onQuerySaveAvatar, this);
            this.mView.on("queryResetAvatar", this.onQueryResetAvatar, this);
            this.mView.on("queryDressAvatarIDS", this.queryDressAvatarIDS, this);
            this.mView.on("useprops", this.onUsePropsHandler, this);
        }
        this.mView.show();
        this.layerManager.addToUILayer(this.mView);
    }

    destroy() {
        if (this.mFurniBag) {
            this.mFurniBag.destroy();
            this.mFurniBag = undefined;
        }
        super.destroy();
    }

    private onCloseHandler() {
        this.destroy();
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
        if (this.mFurniBag) {
            this.mFurniBag.getCategories(categoryType);
        }
    }

    private onQueryPackageHandler(content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_EDIT_MODE_QUERY_EDIT_PACKAGE) {
        this.mView.setProp(content.items);
    }

    private onQueryPackage(key: string) {
        this.mFurniBag.queryPackage(key);
    }

    private onQueryPropResourceHandler(prop: op_client.IMarketCommodity) {
        this.mFurniBag.queryCommodityResource(prop.id);
    }

    private onQuerySaveAvatar(avatarids: string[]) {
        this.mFurniBag.querySaveAvatar(avatarids);
    }

    private onQueryResetAvatar(avatar: op_gameconfig.Avatar) {
        this.mFurniBag.queryResetAvatar(avatar);
    }
    private onSeachPackageHandler(query: string, categories: string) {
        this.mFurniBag.seachPackage(query, categories);
    }

    private onAddFurniHandler(id: string) {
        if (this.mView.enableEdit) {
            this.mFurniBag.enterEditAndSelectedSprite(id);
        } else {
            this.mFurniBag.addFurniToScene(id);
        }
        this.destroy();
    }

    private onSellPropsHandler(prop: op_client.CountablePackageItem, count: number, category: number) {
        this.mFurniBag.sellProps(prop, count, category);
    }

    private onUsePropsHandler(itemid: string, count: number) {
        this.mFurniBag.useProps(itemid, count);
    }
    private onResetAvatar(content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_PKT_RESET_AVATAR) {
        this.mView.resetAvatar(content);
    }

    private onDressAvatarIDS(ids: string[]) {
        this.mView.setDressAvatarIds(ids);
    }

    private queryDressAvatarIDS() {
        this.mFurniBag.queryDressAvatarItemIDs();
    }
}
