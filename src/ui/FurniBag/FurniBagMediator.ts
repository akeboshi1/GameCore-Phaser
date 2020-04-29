import { ILayerManager } from "../layer.manager";
import { WorldService } from "../../game/world.service";
import { FurniBagPanel } from "./FurniBagPanel";
import { FurniBag } from "./FurniBag";
import { op_client, op_def } from "pixelpai_proto";
import { BaseMediator } from "../../../lib/rexui/lib/ui/baseUI/BaseMediator";

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
            this.layerManager.addToUILayer(this.mView.view);
            return;
        }

        if (!this.mFurniBag) {
            this.mFurniBag = new FurniBag(this.world, this.mScneType);
            this.mFurniBag.register();
            this.mFurniBag.on("packageCategory", this.onPackageCategoryHandler, this);
            this.mFurniBag.on("queryPackage", this.onQueryPackageHandler, this);
            this.mFurniBag.on("queryCommodityResource", this.onQueryCommodityResourceHandler, this);
        }
        if (!this.mView) {
            this.mView = new FurniBagPanel(this.scene, this.world, this.mScneType);
            this.mView.on("getCategories", this.onGetCategoriesHandler, this);
            this.mView.on("queryPackage", this.onQueryPackage, this);
            this.mView.on("close", this.onCloseHandler, this);
            this.mView.on("queryPropResource", this.onQueryPropResourceHandler, this);
            this.mView.on("seachPackage", this.onSeachPackageHandler, this);
            this.mView.on("addFurniToScene", this.onAddFurniHandler, this);
        }
        this.mView.show();
        this.layerManager.addToUILayer(this.mView.view);
    }

    destroy() {
        if (this.mFurniBag) {
            this.mFurniBag.destroy();
            this.mFurniBag = undefined;
        }
        if (this.mView) {
            this.mView.destroy();
            this.mView = undefined;
        }
        super.destroy();
    }

    private onCloseHandler() {
        // if (this.mView) {
        //     this.layerManager.removeToUILayer(this.mView);
        // }
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

    private onGetCategoriesHandler() {
        if (this.mFurniBag) {
            this.mFurniBag.getCategories();
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
}
